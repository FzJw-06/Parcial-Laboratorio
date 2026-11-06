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

// GET /api/v1/registros-horas -> listar todos los registros con su cálculo
router.get("/", obtenerRegistros);

// GET /api/v1/registros-horas/:id -> obtener un registro con su cálculo
router.get("/:id", obtenerRegistro);

// POST /api/v1/registros-horas -> crear un registro (primero valida el cuerpo con Zod)
router.post("/", validarSchema(registroHorasSchema), crearRegistro);

// PUT /api/v1/registros-horas/:id -> reemplazar un registro (primero valida el cuerpo con Zod)
router.put("/:id", validarSchema(registroHorasSchema), modificarRegistro);

// DELETE /api/v1/registros-horas/:id -> eliminar un registro por su ID
router.delete("/:id", borrarRegistro);

export default router;
