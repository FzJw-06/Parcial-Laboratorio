// Modelo auxiliar para generar IDs numéricos autoincrementales.
import mongoose from "mongoose";

// Cada documento guarda el último número entregado a una colección.
// El _id es el nombre de la colección (por ejemplo, "roles") y "secuencia"
// es el último ID usado.
const contadorSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // nombre de la colección
    secuencia: { type: Number, default: 0 }, // último ID entregado
  },
  { versionKey: false }, // no agrega el campo __v
);

// Se fuerza la colección "contadores" para no depender del pluralizado de Mongoose
const Contador = mongoose.model("Contador", contadorSchema, "contadores");

// Devuelve el siguiente número de la secuencia indicada (1, 2, 3, ...).
// $inc es atómico, así que dos peticiones simultáneas nunca reciben el mismo ID.
export async function siguienteId(nombre) {
  const contador = await Contador.findByIdAndUpdate(
    nombre, // _id del contador: el nombre de la colección
    { $inc: { secuencia: 1 } }, // suma 1 a la secuencia actual
    {
      upsert: true, // si el contador no existe, lo crea
      returnDocument: "after", // devuelve el documento ya actualizado
    },
  );

  return contador.secuencia;
}

export default Contador;
