// Middlewares de error. Se registran al final de app.js, después de todas las rutas.
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

// Responde 404 cuando ninguna ruta de la API coincidió con la URL pedida.
export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    status: "error",
    message: "El recurso o endpoint solicitado no existe",
    errors: [],
  });
}

// Middleware central de errores. Express lo reconoce porque tiene 4 parámetros
// (error, req, res, next), aunque "next" no se use.
export function manejarErrores(error, req, res, next) {
  // Errores que lanzamos nosotros a propósito desde los servicios (400, 404, etc.)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      errors: error.errores, // detalle opcional que trae AppError
    });
  }

  // Falló una validación del esquema de Mongoose (campo obligatorio, mínimo, etc.)
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Error de validación",
      // Convierte el objeto de errores de Mongoose en una lista { campo, mensaje }
      errors: Object.values(error.errors).map((e) => ({
        campo: e.path,
        mensaje: e.message,
      })),
    });
  }

  // El ID recibido no se pudo convertir al tipo esperado
  // (por ejemplo, un texto en un _id numérico)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "error",
      message: "El identificador enviado no es válido",
      errors: [],
    });
  }

  // Valor duplicado en un campo único (nombre de rol o DNI)
  if (error.code === 11000) {
    return res.status(400).json({
      status: "error",
      message: "Ya existe un registro con ese valor",
      // keyValue trae el campo duplicado; se usa para indicarlo en la respuesta
      errors: Object.keys(error.keyValue || {}).map((campo) => ({
        campo,
        mensaje: "Ya existe un registro con ese valor",
      })),
    });
  }

  // El cliente mandó un JSON mal formado (por ejemplo, una coma de más)
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "El cuerpo de la petición no es un JSON válido",
      errors: [],
    });
  }

  // Cualquier otro error inesperado: se registra en el servidor, pero no se expone al cliente
  console.error(error);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    errors: [],
  });
}
