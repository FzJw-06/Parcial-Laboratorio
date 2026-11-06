// Middleware que valida req.body con un esquema de Zod.
// Se usa en las rutas POST y PUT: si los datos son inválidos, responde 400
// y el controlador no llega a ejecutarse.
export function validarSchema(schema) {
  // Devuelve el middleware configurado con el esquema recibido
  return (req, res, next) => {
    // safeParse valida sin lanzar excepción:
    // devuelve { success: true, data } o { success: false, error }
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      // Arma la lista de errores con el campo y el mensaje de cada uno
      return res.status(400).json({
        status: "error",
        message: "Error de validación",
        errors: resultado.error.issues.map((error) => ({
          campo: error.path.join("."),
          mensaje: error.message,
        })),
      });
    }

    // Reemplaza el cuerpo original por los datos ya validados y transformados
    // (por ejemplo, empleadoId como número y fecha a las 00:00 UTC)
    req.body = resultado.data;
    next(); // continúa hacia el controlador
  };
}
