// Punto de entrada de la aplicación: configura Express, registra las rutas y arranca el servidor.
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Carga las variables del archivo .env (PORT, MONGO_URI) dentro de process.env
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { conectarMongo } from "./config/dbMongo.js";
import rolRoutes from "./routes/rolRoutes.js";
import empleadoRoutes from "./routes/empleadoRoutes.js";
import registroHorasRoutes from "./routes/registroHorasRoutes.js";
import {
  rutaNoEncontrada,
  manejarErrores,
} from "./middlewares/manejarErrores.js";

const app = express();
// Usa el puerto del .env; si no está definido, usa el 3000
const PORT = process.env.PORT || 3000;

// Documentación interactiva (Swagger UI) a partir del archivo OpenAPI
// Documentación interactiva (Swagger UI) a partir del archivo OpenAPI
const swaggerDocument = YAML.load(
  path.join(import.meta.dirname, "docs", "swagger.yaml"),
);
const swaggerCss = fs.readFileSync(
  path.join(import.meta.dirname, "docs", "swagger.css"),
  "utf8",
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: swaggerCss,
    customSiteTitle: "API Horas Pagas",
    swaggerOptions: {
      docExpansion: "none", // los endpoints arrancan cerrados
      defaultModelsExpandDepth: -1, // oculta la sección "Schemas" del final
      //tagsSorter: "alpha",
    },
  }),
);

// Middleware que convierte el cuerpo JSON de las peticiones en un objeto (req.body)
app.use(express.json());

// Ruta raíz: sirve para comprobar rápido que la API está viva
app.get("/", (req, res) => {
  res.json({
    status: "success",
    data: {
      mensaje: "API del Sistema de Cálculo de Horas Pagas",
    },
  });
});

// Montaje de las rutas de cada recurso, con versionado de API (v1)
app.use("/api/v1/roles", rolRoutes);
app.use("/api/v1/empleados", empleadoRoutes);
app.use("/api/v1/registros-horas", registroHorasRoutes);

// Estos dos van SIEMPRE al final y en este orden:
// 1) rutaNoEncontrada responde 404 si ninguna ruta anterior coincidió
// 2) manejarErrores atrapa cualquier error lanzado y arma la respuesta de error
app.use(rutaNoEncontrada);
app.use(manejarErrores);

// Primero conecta con MongoDB y, recién cuando está listo, levanta el servidor
async function iniciarServidor() {
  await conectarMongo();

  app.listen(PORT, (error) => {
    // Si el puerto está ocupado u ocurre otro problema al arrancar, lo informa y corta
    if (error) {
      console.error("No se pudo iniciar el servidor:", error.message);
      process.exit(1);
    }
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

iniciarServidor();
