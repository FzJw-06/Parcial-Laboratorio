// Rutas de roles: conectan cada método HTTP + URL con su función del controlador.
// Este router se monta en app.js bajo el prefijo /api/v1/roles.
import { Router } from "express";
import {
  obtenerRoles,
  obtenerRol,
  crearNuevoRol,
  modificarRol,
  borrarRol,
} from "../controllers/rolController.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { rolSchema } from "../schemas/rolSchema.js";

const router = Router();

// GET /api/v1/roles -> listar todos los roles
router.get("/", obtenerRoles);

// GET /api/v1/roles/:id -> obtener un rol por su ID
router.get("/:id", obtenerRol);

// POST /api/v1/roles -> crear un rol (primero valida el cuerpo con Zod)
router.post("/", validarSchema(rolSchema), crearNuevoRol);

// PUT /api/v1/roles/:id -> reemplazar un rol (primero valida el cuerpo con Zod)
router.put("/:id", validarSchema(rolSchema), modificarRol);

// DELETE /api/v1/roles/:id -> eliminar un rol por su ID
router.delete("/:id", borrarRol);

export default router;
