import "dotenv/config";
import express from "express";
import { conectarMongo } from "./config/dbMongo.js";
import rolRoutes from "./routes/rolRoutes.js";
import registroHorasRoutes from "./routes/registroHorasRoutes.js";
import {
  rutaNoEncontrada,
  manejarErrores,
} from "./middlewares/manejarErrores.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    data: {
      mensaje: "API del Sistema de Cálculo de Horas Pagas",
    },
  });
});

app.use("/api/v1/roles", rolRoutes);
app.use("/api/v1/registros-horas", registroHorasRoutes);

// Siempre al final: primero 404 para rutas inexistentes, después el manejador de errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

async function iniciarServidor() {
  await conectarMongo();

  app.listen(PORT, (error) => {
    if (error) {
      console.error("No se pudo iniciar el servidor:", error.message);
      process.exit(1);
    }
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

iniciarServidor();
