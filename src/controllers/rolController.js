import {
  listarRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol,
} from "../services/rolService.js";

export async function obtenerRoles(req, res) {
  const roles = await listarRoles();

  res.status(200).json({ status: "success", data: roles });
}

export async function obtenerRol(req, res) {
  const rol = await obtenerRolPorId(req.params.id);

  res.status(200).json({ status: "success", data: rol });
}

export async function crearNuevoRol(req, res) {
  const rol = await crearRol(req.body);

  res.status(201).json({ status: "success", data: rol });
}

export async function modificarRol(req, res) {
  const rol = await actualizarRol(req.params.id, req.body);

  res.status(200).json({ status: "success", data: rol });
}

export async function borrarRol(req, res) {
  const rol = await eliminarRol(req.params.id);

  res.status(200).json({ status: "success", data: rol });
}
