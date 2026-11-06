// Capa de servicio de empleados: acá vive la lógica de negocio.
// No sabe nada de HTTP (req/res): solo habla con los modelos y lanza errores con AppError.
import Empleado from "../models/Empleado.js";
import Rol from "../models/Rol.js";
import RegistroHoras from "../models/RegistroHoras.js";
import { AppError } from "../utils/AppError.js";

// Función auxiliar (no se exporta): comprueba que el rol indicado exista en la base.
// Si no existe, corta con un error 400 para no guardar un empleado con un rol inválido.
async function verificarQueExisteElRol(rolId) {
  // exists() solo comprueba si hay un documento con ese ID (no lo trae completo)
  const existe = await Rol.exists({ _id: rolId });

  if (!existe) {
    throw new AppError("El rol indicado no existe", 400);
  }
}

// Devuelve todos los empleados.
// populate("rolId") reemplaza el ID del rol por el documento completo del rol.
// sort() los ordena por apellido y, si coinciden, por nombre.
export async function listarEmpleados() {
  // find() trae todos los empleados; populate y sort se explican arriba
  return await Empleado.find()
    .populate("rolId")
    .sort({ apellido: 1, nombre: 1 });
}

// Busca un empleado por su ID. Si no existe, lanza un error 404.
export async function obtenerEmpleadoPorId(id) {
  const empleado = await Empleado.findById(id).populate("rolId");

  if (!empleado) {
    throw new AppError("No se encontró el empleado", 404);
  }

  return empleado;
}

// Crea un empleado nuevo.
export async function crearEmpleado(datos) {
  // 1. Primero verificamos que el rol exista (si falla, no se guarda nada)
  await verificarQueExisteElRol(datos.rolId);

  // 2. Guardamos el empleado en la base
  const empleado = await Empleado.create(datos);

  // 3. Devolvemos el empleado con el rol completo cargado
  return await empleado.populate("rolId");
}

// Reemplaza los datos de un empleado existente (PUT).
export async function actualizarEmpleado(id, datos) {
  // Verificamos que el nuevo rol exista antes de tocar nada
  await verificarQueExisteElRol(datos.rolId);

  // findByIdAndUpdate busca y actualiza en un solo paso.
  // returnDocument: "after" devuelve el documento ya actualizado (no el viejo).
  // runValidators: true aplica también las validaciones del modelo de Mongoose.
  // populate("rolId") devuelve el empleado con el rol completo en la respuesta.
  const empleado = await Empleado.findByIdAndUpdate(id, datos, {
    returnDocument: "after",
    runValidators: true,
  }).populate("rolId");

  // Si no encontró ningún empleado con ese ID, devuelve null: avisamos con un 404
  if (!empleado) {
    throw new AppError("No se encontró el empleado", 404);
  }

  return empleado;
}

// Elimina un empleado.
export async function eliminarEmpleado(id) {
  // Busca el empleado para comprobar que exista antes de borrar
  const empleado = await Empleado.findById(id);

  if (!empleado) {
    throw new AppError("No se encontró el empleado", 404);
  }

  // Regla de integridad: no se puede borrar un empleado que tenga registros de horas,
  // porque esos registros quedarían apuntando a un empleado que ya no existe.
  const registros = await RegistroHoras.countDocuments({ empleadoId: id });

  if (registros > 0) {
    throw new AppError(
      "No se puede eliminar el empleado porque tiene registros de horas asociados",
      400,
    );
  }

  // Todo en orden: lo borramos y devolvemos lo que se eliminó
  await empleado.deleteOne();

  return empleado;
}
