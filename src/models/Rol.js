import mongoose from "mongoose";
import { siguienteId } from "./Contador.js";

const rolSchema = new mongoose.Schema(
  {
    // ID numérico autoincremental (1, 2, 3, ...) en lugar del ObjectId de MongoDB
    _id: { type: Number },
    nombre: {
      type: String,
      required: [true, "El nombre del rol es obligatorio"],
      trim: true,
      unique: true,
    },
    valorHora: {
      type: Number,
      required: [true, "El valor por hora es obligatorio"],
      min: [0, "El valor por hora no puede ser negativo"],
    },
  },
  { timestamps: true },
);

// Antes de validar un documento nuevo, le asigna el siguiente ID de la secuencia
rolSchema.pre("validate", async function () {
  if (this.isNew && this._id == null) {
    this._id = await siguienteId("roles");
  }
});

const Rol = mongoose.model("Rol", rolSchema, "roles");

export default Rol;
