// Capa de servicio de roles: contiene las reglas de negocio y habla con los modelos.
// No sabe nada de HTTP (req/res): solo devuelve datos o lanza errores con AppError.
import Rol from "../models/Rol.js";
import Empleado from "../models/Empleado.js";
import { AppError } from "../utils/AppError.js";

// Devuelve todos los roles ordenados alfabéticamente por nombre.
export async function listarRoles() {
  return await Rol.find().sort({ nombre: 1 });
}

// Busca un rol por su ID. Si no existe, lanza un error 404.
export async function obtenerRolPorId(id) {
  const rol = await Rol.findById(id);

  if (!rol) {
    throw new AppError("No se encontró el rol", 404);
  }

  return rol;
}

// Crea un rol nuevo. El ID se asigna automáticamente en el hook del modelo.
export async function crearRol(datos) {
  return await Rol.create(datos);
}

// Reemplaza los datos de un rol existente (PUT).
export async function actualizarRol(id, datos) {
  const rol = await Rol.findByIdAndUpdate(id, datos, {
    returnDocument: "after", // devuelve el documento ya actualizado
    runValidators: true, // aplica las validaciones del modelo
  });

  // Si no encontró ningún rol con ese ID, avisa con 404
  if (!rol) {
    throw new AppError("No se encontró el rol", 404);
  }

  return rol;
}

// Elimina un rol, pero solo si no tiene empleados asignados.
export async function eliminarRol(id) {
  const rol = await Rol.findById(id);

  // Si el rol no existe, no hay nada que borrar: 404
  if (!rol) {
    throw new AppError("No se encontró el rol", 404);
  }

  // Evitamos dejar empleados apuntando a un rol que ya no existe
  const empleadosConEseRol = await Empleado.countDocuments({ rolId: id });

  if (empleadosConEseRol > 0) {
    throw new AppError(
      "No se puede eliminar el rol porque hay empleados que lo tienen asignado",
      400,
    );
  }

  // Todo en orden: se borra el rol
  await rol.deleteOne();

  return rol;
}
