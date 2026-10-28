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

router.get("/", obtenerRoles);
router.get("/:id", obtenerRol);
router.post("/", validarSchema(rolSchema), crearNuevoRol);
router.put("/:id", validarSchema(rolSchema), modificarRol);
router.delete("/:id", borrarRol);

export default router;
