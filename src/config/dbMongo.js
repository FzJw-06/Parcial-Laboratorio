// Conexión a MongoDB usando Mongoose.
// Se llama una sola vez al arrancar la aplicación.
import mongoose from "mongoose";

export async function conectarMongo() {
  try {
    // MONGO_URI viene del archivo .env
    // (por ejemplo: mongodb://127.0.0.1:27017/sistema_horas_pagas)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    // Sin base de datos la API no puede funcionar: se informa y se corta el proceso
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
}
