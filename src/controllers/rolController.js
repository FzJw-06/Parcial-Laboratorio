// Capa de controlador de roles: maneja solo la parte HTTP (req, res y códigos de estado).
// La lógica real está en rolService.js. No hay try/catch: en Express 5, si una función
// async lanza un error, se envía solo al manejador de errores (manejarErrores.js).
import {
  listarRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
} from "../services/rolService.js";

// GET /api/v1/roles -> devuelve todos los roles
export async function obtenerRoles(req, res) {
  // El servicio trae la lista ordenada por nombre
  const roles = await listarRoles();

  // Formato estándar de respuesta exitosa: { status, data }
  res.status(200).json({ status: "success", data: roles });
}

// GET /api/v1/roles/:id -> devuelve un rol (el ID viene en la URL: req.params.id)
export async function obtenerRol(req, res) {
  const rol = await obtenerRolPorId(req.params.id);

  res.status(200).json({ status: "success", data: rol });
}

// POST /api/v1/roles -> crea un rol con los datos del cuerpo (req.body, ya validado por Zod)
export async function crearNuevoRol(req, res) {
  const rol = await crearRol(req.body);

  // 201 (Created) porque se creó un recurso nuevo
  res.status(201).json({ status: "success", data: rol });
}

// PUT /api/v1/roles/:id -> reemplaza los datos del rol indicado en la URL
export async function modificarRol(req, res) {
  const rol = await actualizarRol(req.params.id, req.body);

  res.status(200).json({ status: "success", data: rol });
}

// DELETE /api/v1/roles/:id -> elimina el rol y devuelve lo que se borró
export async function borrarRol(req, res) {
  const rol = await eliminarRol(req.params.id);

  res.status(200).json({ status: "success", data: rol });
}
