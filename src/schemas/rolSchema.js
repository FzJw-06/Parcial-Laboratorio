import { z } from "zod";

export const rolSchema = z.object({
  nombre: z
    .string({ error: "El nombre del rol es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El nombre del rol no puede estar vacío"),

  valorHora: z
    .number({ error: "El valor por hora es obligatorio y debe ser un número" })
    .min(0, "El valor por hora no puede ser negativo"),
});
