export class AppError extends Error {
  constructor(mensaje, statusCode = 400, errores = []) {
    super(mensaje);
    this.statusCode = statusCode;
    this.errores = errores;
  }
}
