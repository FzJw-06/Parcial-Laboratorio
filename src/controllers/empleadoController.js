// Capa de controlador de empleados: maneja solo la parte HTTP (req, res y códigos de estado).
// La lógica real está en el servicio. No hay try/catch: en Express 5, si una función async
// lanza un error, se envía solo al manejador de errores (manejarErrores.js).
import {
  listarEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} from "../services/empleadoService.js";

// GET /api/v1/empleados -> lista todos los empleados
export async function obtenerEmpleados(req, res) {
  const empleados = await listarEmpleados();

  res.status(200).json({ status: "success", data: empleados });
}

// GET /api/v1/empleados/:id -> devuelve un empleado (el ID viene en la URL: req.params.id)
export async function obtenerEmpleado(req, res) {
  const empleado = await obtenerEmpleadoPorId(req.params.id);

  res.status(200).json({ status: "success", data: empleado });
}

// POST /api/v1/empleados -> crea un empleado con los datos del cuerpo (req.body, ya validado por Zod)
// Responde 201 (Created) porque se creó un recurso nuevo.
export async function crearNuevoEmpleado(req, res) {
  const empleado = await crearEmpleado(req.body);

  res.status(201).json({ status: "success", data: empleado });
}

// PUT /api/v1/empleados/:id -> reemplaza los datos del empleado indicado en la URL
export async function modificarEmpleado(req, res) {
  const empleado = await actualizarEmpleado(req.params.id, req.body);

  res.status(200).json({ status: "success", data: empleado });
}

// DELETE /api/v1/empleados/:id -> elimina el empleado y devuelve lo que se borró
export async function borrarEmpleado(req, res) {
  const empleado = await eliminarEmpleado(req.params.id);

  res.status(200).json({ status: "success", data: empleado });
}
