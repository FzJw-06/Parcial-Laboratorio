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

// Listar todos y consultar uno por ID (no necesitan validar cuerpo)
router.get("/", obtenerEmpleados);
router.get("/:id", obtenerEmpleado);

// Crear y actualizar: primero pasa por validarSchema (Zod) y, si los datos son válidos,
// recién ahí llega al controlador.
router.post("/", validarSchema(empleadoSchema), crearNuevoEmpleado);
router.put("/:id", validarSchema(empleadoSchema), modificarEmpleado);

// Eliminar por ID
router.delete("/:id", borrarEmpleado);

export default router;
