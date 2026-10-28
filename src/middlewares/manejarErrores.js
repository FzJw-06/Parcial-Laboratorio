import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    status: "error",
    message: "El recurso o endpoint solicitado no existe",
    errors: [],
  });
}

export function manejarErrores(error, req, res, next) {
  // Errores que lanzamos nosotros a propósito (404, 400, etc.)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      errors: error.errores,
    });
  }

  // Falló una validación del esquema de Mongoose
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Error de validación",
      errors: Object.values(error.errors).map((e) => ({
        campo: e.path,
        mensaje: e.message,
      })),
    });
  }

  // ID de MongoDB con formato inválido
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "error",
      message: "El identificador enviado no es válido",
      errors: [],
    });
  }

  // Valor duplicado en un campo único (nombre de rol, DNI)
  if (error.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Ya existe un registro con ese valor",
      errors: Object.keys(error.keyValue || {}).map((campo) => ({
        campo,
        mensaje: "Ya existe un registro con ese valor",
      })),
    });
  }

  // El cliente mandó un JSON mal formado
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "El cuerpo de la petición no es un JSON válido",
      errors: [],
    });
  }

  // Cualquier otro error: se registra en el servidor, pero no se expone al cliente
  console.error(error);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    errors: [],
  });
}
