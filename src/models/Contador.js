import mongoose from "mongoose";

// Colección auxiliar que guarda el último ID usado por cada colección.
// Cada documento tiene como _id el nombre de la colección (ej: "roles")
// y en "secuencia" el último número entregado.
const contadorSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    secuencia: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const Contador = mongoose.model("Contador", contadorSchema, "contadores");

// Devuelve el siguiente número de la secuencia indicada (1, 2, 3, ...).
// $inc es atómico, así que dos peticiones simultáneas nunca reciben el mismo ID.
export async function siguienteId(nombre) {
  const contador = await Contador.findByIdAndUpdate(
    nombre,
    { $inc: { secuencia: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  return contador.secuencia;
}

export default Contador;
