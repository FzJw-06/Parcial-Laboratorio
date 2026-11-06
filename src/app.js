// Punto de entrada de la aplicación.
// Configura Express, la documentación, los middlewares, las rutas, el manejo
// de errores y arranca el servidor después de conectar con MongoDB.

// Carga las variables del archivo .env (PORT, MONGO_URI) dentro de process.env
import "dotenv/config";

// Módulos nativos de Node: uno para leer archivos y otro para armar rutas
import fs from "node:fs";
import path from "node:path";

// Dependencias externas
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Módulos internos del proyecto
import { conectarMongo } from "./config/dbMongo.js";
import rolRoutes from "./routes/rolRoutes.js";
import empleadoRoutes from "./routes/empleadoRoutes.js";
import registroHorasRoutes from "./routes/registroHorasRoutes.js";
import {
  rutaNoEncontrada,
  manejarErrores,
} from "./middlewares/manejarErrores.js";

// Crea la aplicación de Express. Sobre "app" se registran middlewares y rutas.
const app = express();

// Puerto del servidor: toma PORT del .env o usa 3000 si no está definido
const PORT = process.env.PORT || 3000;

// ----------------------------- Swagger UI -----------------------------
// Carga el contrato OpenAPI (títulos, endpoints, esquemas y ejemplos)
const swaggerDocument = YAML.load(
  path.join(import.meta.dirname, "docs", "swagger.yaml"),
);

// Carga el CSS propio que se inyecta en Swagger UI para el tema oscuro
const swaggerCss = fs.readFileSync(
  path.join(import.meta.dirname, "docs", "swagger.css"),
  "utf8",
);

// Publica la documentación interactiva en /api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: swaggerCss, // aplica el tema propio
    customSiteTitle: "API Horas Pagas", // título de la pestaña
    swaggerOptions: {
      docExpansion: "list", // muestra la lista de endpoints y deja los cuerpos cerrados
      defaultModelsExpandDepth: -1, // oculta la sección "Schemas" del final
      displayRequestDuration: true, // muestra cuánto tarda cada petición
      filter: true, // habilita el buscador de endpoints
      deepLinking: true, // permite enlazar directamente a un endpoint
      persistAuthorization: true, // conserva la autorización al recargar
      syntaxHighlight: { theme: "obsidian" }, // resaltado acorde al tema oscuro
    },
  }),
);

// ------------------------- Middlewares generales -------------------------
// Convierte el cuerpo JSON de cada petición en un objeto disponible en req.body
app.use(express.json());

// ----------------------------- Rutas -----------------------------
// Ruta raíz: sirve para comprobar rápido que la API está viva
app.get("/", (req, res) => {
  res.json({
    status: "success",
    data: {
      mensaje: "API del Sistema de Cálculo de Horas Pagas",
    },
  });
});

// Monta cada router bajo su prefijo versionado /api/v1
app.use("/api/v1/roles", rolRoutes);
app.use("/api/v1/empleados", empleadoRoutes);
app.use("/api/v1/registros-horas", registroHorasRoutes);

// ------------------------- Manejo de errores -------------------------
// Estos dos middlewares van SIEMPRE al final y en este orden:
// 1) rutaNoEncontrada responde 404 si ninguna ruta anterior coincidió
// 2) manejarErrores atrapa cualquier error lanzado y arma la respuesta de error
app.use(rutaNoEncontrada);
app.use(manejarErrores);

// ----------------------------- Arranque -----------------------------
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

// Ejecuta el arranque de la aplicación
iniciarServidor();
