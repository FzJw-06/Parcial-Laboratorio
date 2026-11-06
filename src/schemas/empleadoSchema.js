// Esquema de Zod para validar los datos de un empleado ANTES de que lleguen al controlador.
// Se usa tanto en el POST (crear) como en el PUT (reemplazar).
import { z } from "zod";

export const empleadoSchema = z.object({
  // Nombre: texto obligatorio. trim() quita espacios de los extremos y min(1) evita un texto vacío.
  nombre: z
    .string({ error: "El nombre es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El nombre no puede estar vacío"),

  // Apellido: mismas reglas que el nombre.
  apellido: z
    .string({ error: "El apellido es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El apellido no puede estar vacío"),

  // DNI: se recibe como texto y tiene que tener 7 u 8 dígitos (solo números).
  dni: z
    .string({ error: "El DNI es obligatorio y debe ser texto" })
    .trim()
    .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"),

  // rolId: el ID numérico y autoincremental del rol asignado (1, 2, 3, ...).
  // Se acepta como número o como texto numérico ("1") y se convierte a número.
  // Acá solo se revisa el formato; que el rol exista realmente se comprueba en el servicio.
  rolId: z.coerce
    .number({ error: "El rol es obligatorio" })
    .int("El ID del rol debe ser un número entero")
    .positive("El ID del rol no es válido"),
});
