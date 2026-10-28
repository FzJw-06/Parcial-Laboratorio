export function validarSchema(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        status: "error",
        message: "Error de validación",
        errors: resultado.error.issues.map((error) => ({
          campo: error.path.join("."),
          mensaje: error.message,
        })),
      });
    }

    req.body = resultado.data;
    next();
  };
}
