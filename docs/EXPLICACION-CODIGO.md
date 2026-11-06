# Explicación del código

Este documento amplía el [README principal](../README.md): explica el flujo de una petición, las capas, qué hace cada archivo y las decisiones de diseño.

## Arquitectura

La aplicación está separada en capas. Cada una tiene una sola responsabilidad y solo conoce a la siguiente:

```
Ruta → Validación (Zod) → Controlador → Servicio → Modelo → MongoDB
```

| Capa | Archivos | Qué hace |
| --- | --- | --- |
| Punto de entrada | `src/app.js` | Configura Express, Swagger, middlewares, rutas y arranque del servidor. |
| Conexión | `src/config/dbMongo.js` | Conecta con MongoDB usando `MONGO_URI`. |
| Rutas | `src/routes/*.js` | Asocian método HTTP + URL con un controlador. |
| Validación | `src/schemas/*.js` y `src/middlewares/validarSchema.js` | Rechazan datos inválidos antes de que lleguen al controlador. |
| Controladores | `src/controllers/*.js` | Leen `req`, llaman al servicio y devuelven `res` con el código HTTP. |
| Servicios | `src/services/*.js` | Aplican las reglas de negocio y la integridad de los datos. |
| Modelos | `src/models/*.js` | Definen los esquemas de Mongoose y hablan con la base. |
| Errores | `src/middlewares/manejarErrores.js` y `src/utils/AppError.js` | Convierten cualquier error en una respuesta JSON uniforme. |
| Documentación | `src/docs/swagger.yaml` y `src/docs/swagger.css` | Definen el contrato OpenAPI y el tema visual de Swagger UI. |
| Datos de prueba | `src/seed.js` | Borra la base local y carga roles, empleados y registros de ejemplo. |
| Tests | `test/calcularPago.test.js` | Comprueban el cálculo de pago sin usar la base de datos. |

### Flujo completo de una petición

Ejemplo con `POST /api/v1/registros-horas`:

```
Cliente
  │  POST /api/v1/registros-horas  { empleadoId, fecha, horasTrabajadas }
  ▼
src/app.js
  │  express.json() convierte el JSON en req.body
  ▼
src/routes/registroHorasRoutes.js
  │  router.post("/", validarSchema(registroHorasSchema), crearRegistro)
  ▼
src/middlewares/validarSchema.js
  │  Zod valida y transforma: empleadoId → número, fecha → 00:00 UTC
  ▼
src/controllers/registroHorasController.js
  │  crearRegistro(req, res)
  ▼
src/services/registroHorasService.js
  │  crearRegistroHoras(req.body)
  ├─ 1. Busca el empleado y su rol: Empleado.findById(...).populate("rolId")
  ├─ 2. Calcula el pago con calcularPago(...)
  └─ 3. Guarda: RegistroHoras.create(...)
          └─ hook pre("validate") pide el próximo ID a Contador
  ▼
Respuesta 201
  { "status": "success", "data": { "registro": ..., "calculo": ... } }
```

Si algo falla en cualquier paso, Express 5 envía el error a `manejarErrores`, que decide si corresponde `400`, `404` o `500`.

### Qué hace cada archivo

#### `src/app.js`

Es el punto de entrada. En orden:

1. Carga las variables del `.env` con `dotenv/config`.
2. Crea la aplicación de Express.
3. Lee `swagger.yaml` y `swagger.css` y monta Swagger UI en `/api-docs`.
4. Activa `express.json()` para leer cuerpos JSON.
5. Define `GET /` como comprobación rápida de que la API está viva.
6. Monta los tres routers bajo `/api/v1`.
7. Registra `rutaNoEncontrada` (404) y `manejarErrores` (errores centralizados).
8. Conecta a MongoDB y, recién cuando la conexión funciona, levanta el servidor.

#### `src/config/dbMongo.js`

Exporta `conectarMongo()`. Llama a `mongoose.connect(process.env.MONGO_URI)` y muestra `Conectado a MongoDB`. Si la conexión falla, informa el error y termina el proceso para no dejar el servidor levantado sin base.

#### `src/models/Contador.js`

Guarda la última secuencia de IDs de cada colección en la colección `contadores`:

```json
{ "_id": "roles", "secuencia": 3 }
```

`siguienteId(nombre)` hace un `$inc` atómico con `upsert`. Eso evita que dos peticiones simultáneas reciban el mismo número.

#### `src/models/Rol.js`

Define el rol: `_id` numérico, `nombre` único y `valorHora` no negativo. Antes de validar un documento nuevo, el hook `pre("validate")` le asigna el próximo ID con `siguienteId("roles")`.

#### `src/models/Empleado.js`

Define el empleado: `_id` numérico, `nombre`, `apellido`, `dni` único de 7 u 8 dígitos y `rolId` numérico que referencia a `Rol`. El hook `pre("validate")` asigna el ID con `siguienteId("empleados")`.

#### `src/models/RegistroHoras.js`

Guarda las horas de un día: `_id` numérico, `empleadoId`, `fecha` y `horasTrabajadas` (entre 0,01 y 24). Tiene dos particularidades:

- Un índice único sobre `{ empleadoId, fecha }` impide dos registros del mismo empleado el mismo día.
- Una transformación de `toJSON`/`toObject` devuelve la fecha como `AAAA-MM-DD`, sin hora ni zona horaria.

El hook `pre("validate")` asigna el ID con `siguienteId("registrosHoras")`.

#### `src/schemas/`

Son los esquemas de Zod que validan la entrada:

- `rolSchema.js`: `nombre` obligatorio y no vacío; `valorHora` numérico y no negativo.
- `empleadoSchema.js`: `nombre` y `apellido` obligatorios; `dni` con 7 u 8 dígitos; `rolId` numérico entero positivo (acepta `1` o `"1"`).
- `registroHorasSchema.js`: `empleadoId` numérico entero positivo; `fecha` válida que se normaliza a las 00:00 UTC; `horasTrabajadas` mayor que 0 y como máximo 24.

Estos esquemas no comprueban que el rol o el empleado existan: solo revisan el formato. La existencia se valida en los servicios.

#### `src/middlewares/validarSchema.js`

Recibe un esquema de Zod y devuelve un middleware. Usa `safeParse` sobre `req.body`. Si falla, responde `400` con el campo y el mensaje de cada error. Si sale bien, reemplaza `req.body` por `resultado.data`, es decir, por los datos ya convertidos y transformados.

#### `src/middlewares/manejarErrores.js`

Tiene dos funciones:

- `rutaNoEncontrada`: responde `404` cuando ninguna ruta coincidió.
- `manejarErrores`: traduce los errores al formato estándar:
  - `AppError` → el código que traiga (400, 404, etc.).
  - Error de validación de Mongoose → `400`.
  - `CastError` (ID con formato inválido) → `400`.
  - Error `11000` (valor duplicado) → `400`.
  - JSON mal formado → `400`.
  - Cualquier otro error → se registra en la consola y se responde `500` sin exponer detalles.

#### `src/routes/`

Cada archivo crea un `Router` de Express y asocia método + ruta con un controlador. En `POST` y `PUT` se intercala `validarSchema` antes del controlador. `GET` y `DELETE` no validan cuerpo porque no lo reciben.

#### `src/controllers/`

Solo manejan HTTP: leen `req.params` o `req.body`, llaman al servicio y responden con `status(...).json(...)`. No tienen reglas de negocio ni `try/catch`: en Express 5 los errores de una función `async` llegan solos al middleware de errores.

#### `src/services/`

Ahí está la lógica real:

- `rolService.js`: listar (ordenado por nombre), obtener, crear, actualizar y eliminar. Antes de eliminar comprueba que no haya empleados con ese rol.
- `empleadoService.js`: listar (con el rol cargado y ordenado por apellido y nombre), obtener, crear, actualizar y eliminar. Verifica que el rol exista y que no haya registros de horas antes de borrar.
- `registroHorasService.js`: calcula el pago, arma la respuesta `{ registro, calculo }`, lista los registros del más reciente al más antiguo y valida empleado y rol antes de guardar o modificar.

#### `src/utils/AppError.js`

Define `AppError`, una clase que extiende `Error` y agrega `statusCode` (por defecto `400`) y un arreglo de errores. Es la forma en que los servicios avisan “esto es un error controlado, responde con este código”.

#### `src/docs/`

- `swagger.yaml`: contrato OpenAPI 3 con la descripción, los tags, los paths, los esquemas y los ejemplos.
- `swagger.css`: tema visual que se inyecta en Swagger UI.

`app.js` lee ambos archivos una sola vez al arrancar. Por eso, después de modificarlos hay que reiniciar el servidor.

#### `src/seed.js`

Carga datos de ejemplo. Primero comprueba que `MONGO_URI` sea local, después borra toda la base, recrea los índices y usa `create()` en bucles (no `insertMany`) para que se ejecuten los hooks que asignan los IDs numéricos. Al final muestra los IDs generados y se desconecta.

#### `test/calcularPago.test.js`

Prueba la función pura `calcularPago` con el runner nativo de Node. No toca MongoDB: le pasa empleados de prueba y comprueba horas normales, extras, decimales, jornada máxima y casos sin empleado o sin rol.

### Qué hace cada recurso

#### Roles

Definen cuánto vale la hora de un empleado. Tienen nombre único y valor por hora.

- `GET /roles` devuelve todos, ordenados por nombre.
- `GET /roles/:id` devuelve uno o `404`.
- `POST /roles` crea y responde `201`.
- `PUT /roles/:id` reemplaza `nombre` y `valorHora`; responde `200` o `404`.
- `DELETE /roles/:id` elimina; si hay empleados con ese rol, responde `400`.

#### Empleados

Son las personas a las que se les paga. Cada una tiene un DNI único y un rol.

- `GET /empleados` devuelve la lista con el rol completo dentro de `rolId`.
- `GET /empleados/:id` devuelve uno con su rol, o `404`.
- `POST /empleados` valida que el rol exista y responde `201`.
- `PUT /empleados/:id` reemplaza los datos; responde `200` o `404`.
- `DELETE /empleados/:id` elimina; si tiene registros de horas, responde `400`.

#### Registros de horas

Guardan las horas trabajadas en un día y devuelven el cálculo del pago.

- `GET /registros-horas` devuelve todos, del más reciente al más antiguo, cada uno con `registro` y `calculo`.
- `GET /registros-horas/:id` devuelve uno o `404`.
- `POST /registros-horas` calcula antes de guardar; si el empleado o su rol no existen, responde `400` y no guarda nada.
- `PUT /registros-horas/:id` recalcula con los datos nuevos y actualiza.
- `DELETE /registros-horas/:id` elimina y devuelve el registro borrado.

### El cálculo del pago, paso a paso

La función `calcularPago(empleado, horasTrabajadas)` es pura: no consulta la base, solo recibe datos y devuelve el detalle.

1. Toma `valorHora` del rol del empleado.
2. Calcula `horasNormales = min(horas, 8)`.
3. Calcula `horasExtra = max(horas - 8, 0)`.
4. Calcula `pagoNormal = horasNormales × valorHora`.
5. Calcula `pagoExtra = horasExtra × valorHora × 1,5`.
6. Suma `totalPagar = pagoNormal + pagoExtra`.

Devuelve:

```json
{
  "empleado": "Juan Pérez",
  "horasTrabajadas": 10,
  "horasNormales": 8,
  "horasExtra": 2,
  "valorHora": 4000,
  "pagoNormal": 32000,
  "pagoExtra": 12000,
  "totalPagar": 44000
}
```

### Decisiones de diseño

- **IDs numéricos:** se usan para que las rutas sean simples (`/empleados/3`) y para no depender del ObjectId de MongoDB. La secuencia se guarda en `contadores` y se incrementa de forma atómica.
- **Un registro por día:** permite calcular las horas extra sobre la jornada completa sin sumar registros parciales. Se garantiza con un índice único en la base.
- **Fechas sin hora:** se normalizan a las 00:00 UTC y se devuelven como `AAAA-MM-DD` para evitar que un cambio de zona horaria muestre el día anterior.
- **Validación en dos niveles:** Zod revisa el formato antes de llegar al controlador; Mongoose vuelve a validar al guardar. Los servicios comprueban las relaciones (rol y empleado existentes).
- **Errores centralizados:** los servicios lanzan `AppError` y un único middleware arma la respuesta. Así todos los errores tienen el mismo formato.
- **`create()` en el seed:** `insertMany` no ejecuta los hooks `pre("validate")`, así que no asignaría los IDs numéricos.

---

Volver al [README principal](../README.md).
