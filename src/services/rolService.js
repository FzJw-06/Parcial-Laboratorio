import Rol from "../models/Rol.js";
import Empleado from "../models/Empleado.js";
import { AppError } from "../utils/AppError.js";

export async function listarRoles() {
  return await Rol.find().sort({ nombre: 1 });
}

export async function obtenerRolPorId(id) {
  const rol = await Rol.findById(id);

  if (!rol) {
    throw new AppError("No se encontró el rol", 404);
  }

  return rol;
}

export async function crearRol(datos) {
  return await Rol.create(datos);
}

export async function actualizarRol(id, datos) {
  const rol = await Rol.findByIdAndUpdate(id, datos, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!rol) {
    throw new AppError("No se encontró el rol", 404);
  }

  return rol;
}

export async function eliminarRol(id) {
  const rol = await Rol.findById(id);

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

  await rol.deleteOne();

  return rol;
}
