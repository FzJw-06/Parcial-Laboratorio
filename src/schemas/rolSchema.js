// Esquema de Zod para validar los datos de un rol antes de llegar al controlador.
import { z } from "zod";

export const rolSchema = z.object({
  // Nombre: texto obligatorio, sin espacios sobrantes y no vacío
  nombre: z
    .string({ error: "El nombre del rol es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El nombre del rol no puede estar vacío"),

  // Valor por hora: número obligatorio y no negativo
  valorHora: z
    .number({ error: "El valor por hora es obligatorio y debe ser un número" })
    .min(0, "El valor por hora no puede ser negativo"),
});
