# Sistema de Cálculo de Horas Pagas

API REST para registrar las horas trabajadas por los empleados y calcular cuánto se les paga, con recargo por horas extra.

Hecha con **Node.js**, **Express 5**, **MongoDB (Mongoose)** y **Zod** para validar los datos de entrada.

## Regla de negocio

El valor por hora sale del **rol** del empleado. Por cada registro diario:

| Horas trabajadas      | Cómo se pagan                     |
| --------------------- | --------------------------------- |
| Las primeras 8        | Al valor normal de la hora        |
| Las que superan las 8 | Al **150 %** del valor de la hora |

Ejemplo: un Administrativo ($4.000 la hora) que trabaja 9 horas cobra
`8 × 4.000 + 1 × 4.000 × 1,5 = $38.000`.

Para que esta regla sea correcta, **un empleado solo puede tener un registro por día**. Si se intenta cargar un segundo registro el mismo día, la API responde `400`.

## Requisitos

- Node.js 20.11 o superior
- [pnpm](https://pnpm.io/)
- MongoDB corriendo localmente (o una URI de MongoDB Atlas)

## Instalación

```bash
pnpm install
```

Copiá el archivo de ejemplo de variables de entorno y ajustalo si hace falta:

```bash
cp .env.example .env
```

| Variable    | Descripción               | Valor por defecto                               |
| ----------- | ------------------------- | ----------------------------------------------- |
| `PORT`      | Puerto del servidor       | `3000`                                          |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://127.0.0.1:27017/sistema_horas_pagas` |

> El archivo `.env` no se sube a Git. Cada entorno tiene el suyo.

## Datos de prueba (seed)

```bash
node src/seed.js
```

Crea 3 roles (Administrativo, Operario, Supervisor), 3 empleados y 3 registros de horas.

> ⚠️ **Borra toda la base de datos** antes de cargar los datos. Por seguridad, solo funciona si `MONGO_URI` apunta a `localhost` o `127.0.0.1`.

## Ejecución

```bash
pnpm dev     # modo desarrollo (se reinicia al guardar)
pnpm start   # modo normal
```

La API queda en `http://localhost:3000`.

## Documentación interactiva

Con el servidor corriendo, abrí **http://localhost:3000/api-docs** (Swagger UI). Ahí se ven todos los endpoints y se pueden probar con el botón **Try it out**.

## Endpoints

Todos bajo el prefijo `/api/v1`.

| Recurso            | Método | Ruta                   | Descripción                                       |
| ------------------ | ------ | ---------------------- | ------------------------------------------------- |
| Roles              | GET    | `/roles`               | Listar roles                                      |
|                    | GET    | `/roles/:id`           | Obtener un rol                                    |
|                    | POST   | `/roles`               | Crear un rol                                      |
|                    | PUT    | `/roles/:id`           | Reemplazar un rol                                 |
|                    | DELETE | `/roles/:id`           | Eliminar un rol                                   |
| Empleados          | GET    | `/empleados`           | Listar empleados (con su rol)                     |
|                    | GET    | `/empleados/:id`       | Obtener un empleado                               |
|                    | POST   | `/empleados`           | Crear un empleado                                 |
|                    | PUT    | `/empleados/:id`       | Reemplazar un empleado                            |
|                    | DELETE | `/empleados/:id`       | Eliminar un empleado                              |
| Registros de horas | GET    | `/registros-horas`     | Listar registros, cada uno con su cálculo de pago |
|                    | GET    | `/registros-horas/:id` | Obtener un registro con su cálculo                |
|                    | POST   | `/registros-horas`     | Crear un registro                                 |
|                    | PUT    | `/registros-horas/:id` | Reemplazar un registro                            |
|                    | DELETE | `/registros-horas/:id` | Eliminar un registro                              |

### Ejemplo: cargar horas

```http
POST /api/v1/registros-horas
Content-Type: application/json

{
  "empleadoId": "6ae188baa9c7c3799346f663",
  "fecha": "2026-10-28",
  "horasTrabajadas": 9
}
```

Respuesta `201`:

```json
{
  "status": "success",
  "data": {
    "registro": {
      "_id": "6ae40d0da2f38e6769024575",
      "empleadoId": "6ae188baa9c7c3799346f663",
      "fecha": "2026-10-28",
      "horasTrabajadas": 9
    },
    "calculo": {
      "empleado": "Juan Pérez",
      "horasTrabajadas": 9,
      "horasNormales": 8,
      "horasExtra": 1,
      "valorHora": 4000,
      "pagoNormal": 32000,
      "pagoExtra": 6000,
      "totalPagar": 38000
    }
  }
}
```

### Formato de las respuestas

Éxito:

```json
{ "status": "success", "data": {} }
```

Error:

```json
{
  "status": "error",
  "message": "Error de validación",
  "errors": [
    {
      "campo": "horasTrabajadas",
      "mensaje": "Las horas deben ser mayores que cero"
    }
  ]
}
```

| Código | Cuándo                                                                 |
| ------ | ---------------------------------------------------------------------- |
| `200`  | Consulta, modificación o eliminación correcta                          |
| `201`  | Recurso creado                                                         |
| `400`  | Datos inválidos, ID mal formado, valor duplicado o regla de integridad |
| `404`  | El recurso o la ruta no existe                                         |
| `500`  | Error interno (el detalle se registra en el servidor, no se expone)    |

### Reglas de integridad

- No se puede eliminar un **rol** que tenga empleados asignados.
- No se puede eliminar un **empleado** que tenga registros de horas.
- El **DNI** (7 u 8 dígitos) y el **nombre del rol** son únicos.
- Las horas de un registro van de más de 0 hasta 24.
- Las fechas se devuelven como `AAAA-MM-DD`, sin hora.

## Tests

```bash
pnpm test
```

Cubren el cálculo de pago (horas normales, extras, decimales, rol sin asignar). No necesitan base de datos.

## Estructura

```
src/
├── app.js            # Punto de entrada: Express, rutas, Swagger
├── seed.js           # Datos de prueba
├── config/           # Conexión a MongoDB
├── routes/           # URL + método HTTP → controlador
├── controllers/      # Manejo de req/res y códigos de estado
├── services/         # Lógica de negocio (incluye el cálculo de pago)
├── models/           # Esquemas de Mongoose
├── schemas/          # Validación de entrada con Zod
├── middlewares/      # Validación y manejo centralizado de errores
├── utils/            # AppError
└── docs/             # swagger.yaml (OpenAPI 3)
test/                 # Tests con el runner nativo de Node
```
