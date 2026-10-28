import { z } from "zod";

export const registroHorasSchema = z.object({
  empleadoId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "El ID del empleado no es válido"),

  fecha: z.string().refine((valor) => !Number.isNaN(Date.parse(valor)), {
    message: "La fecha no es válida",
  }),

  horasTrabajadas: z
    .number()
    .positive("Las horas deben ser mayores que cero")
    .max(24, "No se pueden registrar más de 24 horas por día"),
});
