// Error controlado de la aplicación.
// Los servicios lo lanzan cuando quieren responder con un código HTTP específico.
export class AppError extends Error {
  // mensaje: texto que se muestra al cliente
  // statusCode: código HTTP (400 por defecto)
  // errores: detalle opcional de validaciones
  constructor(mensaje, statusCode = 400, errores = []) {
    super(mensaje); // inicializa la clase Error con el mensaje
    this.statusCode = statusCode; // código que usará el middleware de errores
    this.errores = errores; // arreglo con el detalle de los errores
  }
}
