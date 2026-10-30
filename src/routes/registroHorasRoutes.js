// Rutas de registros de horas: conectan cada método HTTP + URL con su función del controlador.
// Este router se monta en app.js bajo el prefijo /api/v1/registros-horas.
import { Router } from "express";
import {
  obtenerRegistros,
  obtenerRegistro,
  crearRegistro,
  modificarRegistro,
  borrarRegistro,
} from "../controllers/registroHorasController.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { registroHorasSchema } from "../schemas/registroHorasSchema.js";

const router = Router();

// Listar todos y consultar uno por ID (no necesitan validar cuerpo)
router.get("/", obtenerRegistros);
router.get("/:id", obtenerRegistro);

// Crear y actualizar: primero pasa por validarSchema (Zod) y, si los datos son válidos,
// recién ahí llega al controlador.
router.post("/", validarSchema(registroHorasSchema), crearRegistro);
router.put("/:id", validarSchema(registroHorasSchema), modificarRegistro);

// Eliminar por ID
router.delete("/:id", borrarRegistro);

export default router;
