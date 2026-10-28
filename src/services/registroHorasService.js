import Empleado from "../models/Empleado.js";
import RegistroHoras from "../models/RegistroHoras.js";

const HORAS_NORMALES_POR_DIA = 8;
const RECARGO_HORA_EXTRA = 1.5;

export async function calcularPagoHoras(empleadoId, horasTrabajadas) {
  const empleado = await Empleado.findById(empleadoId).populate("rolId");

  if (!empleado) {
    throw new Error("No se encontró el empleado");
  }

  if (!empleado.rolId) {
    throw new Error("El empleado no tiene un rol válido");
  }

  const valorHora = empleado.rolId.valorHora;
  const horasNormales = Math.min(horasTrabajadas, HORAS_NORMALES_POR_DIA);
  const horasExtra = Math.max(horasTrabajadas - HORAS_NORMALES_POR_DIA, 0);

  const pagoNormal = horasNormales * valorHora;
  const pagoExtra = horasExtra * valorHora * RECARGO_HORA_EXTRA;
  const totalPagar = pagoNormal + pagoExtra;

  return {
    empleado: `${empleado.nombre} ${empleado.apellido}`,
    horasTrabajadas,
    horasNormales,
    horasExtra,
    valorHora,
    pagoNormal,
    pagoExtra,
    totalPagar,
  };
}

export async function crearRegistroHoras(datos) {
  // 1. Primero calculamos: si el empleado o su rol no existen, lanza error y no se guarda nada
  const calculo = await calcularPagoHoras(
    datos.empleadoId,
    datos.horasTrabajadas,
  );

  // 2. Recién ahora guardamos el registro
  const registro = await RegistroHoras.create(datos);

  return { registro, calculo };
}
