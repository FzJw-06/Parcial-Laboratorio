// Capa de controlador de registros de horas: maneja solo la parte HTTP (req, res y códigos).
// La lógica real está en el servicio. No hay try/catch: en Express 5, si una función async
// lanza un error, se envía solo al manejador de errores (manejarErrores.js).
import {
  listarRegistros,
  obtenerRegistroPorId,
  crearRegistroHoras,
  actualizarRegistroHoras,
  eliminarRegistroHoras,
} from "../services/registroHorasService.js";

// GET /api/v1/registros-horas -> lista todos los registros, cada uno con su cálculo de pago
export async function obtenerRegistros(req, res) {
  const registros = await listarRegistros();

  res.status(200).json({ status: "success", data: registros });
}

// GET /api/v1/registros-horas/:id -> devuelve un registro con su cálculo (ID en req.params.id)
export async function obtenerRegistro(req, res) {
  const resultado = await obtenerRegistroPorId(req.params.id);

  res.status(200).json({ status: "success", data: resultado });
}

// POST /api/v1/registros-horas -> crea un registro con los datos del cuerpo (req.body, ya validado)
// Responde 201 (Created) con el registro guardado y el cálculo del pago.
export async function crearRegistro(req, res) {
  const { registro, calculo } = await crearRegistroHoras(req.body);

  res.status(201).json({ status: "success", data: { registro, calculo } });
}

// PUT /api/v1/registros-horas/:id -> reemplaza los datos del registro indicado en la URL
export async function modificarRegistro(req, res) {
  const { registro, calculo } = await actualizarRegistroHoras(
    req.params.id,
    req.body,
  );

  res.status(200).json({ status: "success", data: { registro, calculo } });
}

// DELETE /api/v1/registros-horas/:id -> elimina el registro y devuelve lo que se borró
export async function borrarRegistro(req, res) {
  const registro = await eliminarRegistroHoras(req.params.id);

  res.status(200).json({ status: "success", data: registro });
}
