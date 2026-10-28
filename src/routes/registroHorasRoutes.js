import { Router } from "express";
import { crearRegistro } from "../controllers/registroHorasController.js";
import { validarSchema } from "../middlewares/validarSchema.js";
import { registroHorasSchema } from "../schemas/registroHorasSchema.js";

const router = Router();

router.post("/", validarSchema(registroHorasSchema), crearRegistro);

export default router;
