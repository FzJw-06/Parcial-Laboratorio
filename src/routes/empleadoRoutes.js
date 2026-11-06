// Rutas de empleados: conectan cada método HTTP + URL con su función del controlador.
// Este router se monta en app.js bajo el prefijo /api/v1/empleados.
import { Router } from "express";
import {
  obtenerEmpleados,
  obtenerEmpleado,
  crearNuevoEmpleado,
  modificarEmpleado,
  borrarEmpleado,
} from "../controllers/empleadoController.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { empleadoSchema } from "../schemas/empleadoSchema.js";

const router = Router();

// GET /api/v1/empleados -> listar todos los empleados
router.get("/", obtenerEmpleados);

// GET /api/v1/empleados/:id -> obtener un empleado por su ID
router.get("/:id", obtenerEmpleado);

// POST /api/v1/empleados -> crear un empleado (primero valida el cuerpo con Zod)
router.post("/", validarSchema(empleadoSchema), crearNuevoEmpleado);

// PUT /api/v1/empleados/:id -> reemplazar un empleado (primero valida el cuerpo con Zod)
router.put("/:id", validarSchema(empleadoSchema), modificarEmpleado);

// DELETE /api/v1/empleados/:id -> eliminar un empleado por su ID
router.delete("/:id", borrarEmpleado);

export default router;
