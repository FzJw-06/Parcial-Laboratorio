import { z } from "zod";

export const registroHorasSchema = z.object({
  // ID numérico y autoincremental del empleado (1, 2, 3, ...).
  // Se acepta como número o como texto numérico ("1") y se convierte a número.
  empleadoId: z.coerce
    .number({ error: "El empleado es obligatorio" })
    .int("El ID del empleado debe ser un número entero")
    .positive("El ID del empleado no es válido"),

  fecha: z
    .string()
    .refine((valor) => !Number.isNaN(Date.parse(valor)), {
      message: "La fecha no es válida",
    })
    // Se guarda siempre a las 00:00 UTC del día indicado
    .transform((valor) => {
      const fecha = new Date(valor);
      fecha.setUTCHours(0, 0, 0, 0);
      return fecha;
    }),

  horasTrabajadas: z
    .number()
    .positive("Las horas deben ser mayores que cero")
    .max(24, "No se pueden registrar más de 24 horas por día"),
});
