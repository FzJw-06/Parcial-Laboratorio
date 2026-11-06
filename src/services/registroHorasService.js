// Capa de servicio de registros de horas: acá vive la regla de negocio del cálculo de pago.
// No sabe nada de HTTP (req/res): solo habla con los modelos y lanza errores con AppError.
import Empleado from "../models/Empleado.js";
import RegistroHoras from "../models/RegistroHoras.js";
import { AppError } from "../utils/AppError.js";

// Reglas de negocio, definidas en un solo lugar para poder cambiarlas fácilmente
const HORAS_NORMALES_POR_DIA = 8; // las primeras 8 horas se pagan al valor normal
const RECARGO_HORA_EXTRA = 0.5; // 50 % adicional sobre el valor normal de la hora

// Función PURA de cálculo (no toca la base de datos): recibe un empleado que ya trae su rol
// cargado (populate) y las horas trabajadas, y devuelve el detalle del pago.
// Si el empleado no existe o no tiene rol, devuelve null (sin calcular).
export function calcularPago(empleado, horasTrabajadas) {
  if (!empleado || !empleado.rolId) {
    return null;
  }

  // El valor por hora sale del rol asignado al empleado
  const valorHora = empleado.rolId.valorHora;

  // Math.min toma como máximo 8 horas normales
  const horasNormales = Math.min(horasTrabajadas, HORAS_NORMALES_POR_DIA);
  // Math.max evita números negativos: si trabajó 8 o menos, las horas extra son 0
  const horasExtra = Math.max(horasTrabajadas - HORAS_NORMALES_POR_DIA, 0);

  const pagoNormal = horasNormales * valorHora;
  // La hora extra se paga al valor normal + el 50 % de recargo (es decir, × 1,5)
  const pagoExtra = horasExtra * valorHora * (1 + RECARGO_HORA_EXTRA);
  const totalPagar = pagoNormal + pagoExtra;

  // Detalle del pago que se devuelve al cliente
  return {
    empleado: `${empleado.nombre} ${empleado.apellido}`, // nombre completo
    horasTrabajadas,
    horasNormales, // horas pagadas al valor normal
    horasExtra, // horas pagadas con recargo
    valorHora, // valor sacado del rol
    pagoNormal,
    pagoExtra,
    totalPagar, // suma de ambos pagos
  };
}

// Busca el empleado (con su rol) y calcula el pago. Si el empleado no existe o no tiene
// un rol válido, lanza un error 400 y NO continúa: así no se guarda nada inconsistente.
async function calcularPagoPorEmpleadoId(empleadoId, horasTrabajadas) {
  // populate("rolId") trae el documento completo del rol, de donde sale el valor por hora
  const empleado = await Empleado.findById(empleadoId).populate("rolId");

  if (!empleado) {
    throw new AppError("No se encontró el empleado", 400);
  }

  if (!empleado.rolId) {
    throw new AppError("El empleado no tiene un rol válido", 400);
  }

  return calcularPago(empleado, horasTrabajadas);
}

// Convierte un registro leído de la base (con empleado y rol cargados) en la respuesta
// { registro, calculo } que usan todos los endpoints.
function armarRespuesta(registro) {
  const empleado = registro.empleadoId; // acá es el documento completo del empleado
  const datosRegistro = registro.toObject();

  // En la respuesta devolvemos solo el ID del empleado dentro del registro
  // (los datos del empleado ya van resumidos dentro de "calculo")
  datosRegistro.empleadoId = registro.populated("empleadoId");

  // Forma estándar que usan todos los endpoints de registros
  return {
    registro: datosRegistro,
    calculo: calcularPago(empleado, registro.horasTrabajadas),
  };
}

// Busca registros cargando, en cadena, al empleado y el rol de cada uno (populate anidado)
const cargarEmpleadoYRol = { path: "empleadoId", populate: { path: "rolId" } };

// Lista todos los registros, del más reciente al más antiguo, cada uno con su cálculo.
export async function listarRegistros() {
  // find() trae todos; sort(-1) ordena del más reciente al más antiguo
  const registros = await RegistroHoras.find()
    .sort({ fecha: -1 })
    .populate(cargarEmpleadoYRol);

  // Convierte cada documento en { registro, calculo }
  return registros.map(armarRespuesta);
}

// Busca un registro por ID. Si no existe, lanza un error 404.
export async function obtenerRegistroPorId(id) {
  const registro =
    await RegistroHoras.findById(id).populate(cargarEmpleadoYRol);

  if (!registro) {
    throw new AppError("No se encontró el registro de horas", 404);
  }

  return armarRespuesta(registro);
}

// Crea un registro nuevo.
export async function crearRegistroHoras(datos) {
  // 1. Primero calculamos: si el empleado o su rol no son válidos, lanza error y no se guarda nada
  const calculo = await calcularPagoPorEmpleadoId(
    datos.empleadoId,
    datos.horasTrabajadas,
  );

  // 2. Recién ahora guardamos el registro
  const registro = await RegistroHoras.create(datos);

  return { registro, calculo };
}

// Reemplaza los datos de un registro existente (PUT).
export async function actualizarRegistroHoras(id, datos) {
  // 1. Verificamos que el registro exista (si no, 404)
  const existe = await RegistroHoras.exists({ _id: id });

  if (!existe) {
    throw new AppError("No se encontró el registro de horas", 404);
  }

  // 2. Calculamos con los datos nuevos: valida empleado y rol antes de modificar nada
  const calculo = await calcularPagoPorEmpleadoId(
    datos.empleadoId,
    datos.horasTrabajadas,
  );

  // 3. Actualizamos. returnDocument: "after" devuelve el registro ya modificado y
  // runValidators aplica también las validaciones del modelo de Mongoose
  const registro = await RegistroHoras.findByIdAndUpdate(id, datos, {
    returnDocument: "after",
    runValidators: true,
  });

  return { registro, calculo };
}

// Elimina un registro y devuelve el registro eliminado.
export async function eliminarRegistroHoras(id) {
  // Busca y elimina en una sola operación
  const registro = await RegistroHoras.findByIdAndDelete(id);

  // Si no había ningún registro con ese ID, findByIdAndDelete devuelve null
  if (!registro) {
    throw new AppError("No se encontró el registro de horas", 404);
  }

  return registro;
}
