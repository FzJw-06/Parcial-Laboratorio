// Modelo de Rol: define cuánto vale la hora de un empleado.
import mongoose from "mongoose";
import { siguienteId } from "./Contador.js";

const rolSchema = new mongoose.Schema(
  {
    // ID numérico autoincremental (1, 2, 3, ...) en lugar del ObjectId de MongoDB
    _id: { type: Number },
    nombre: {
      type: String,
      required: [true, "El nombre del rol es obligatorio"],
      trim: true, // elimina espacios al inicio y al final
      unique: true, // no puede haber dos roles con el mismo nombre
    },
    valorHora: {
      type: Number,
      required: [true, "El valor por hora es obligatorio"],
      min: [0, "El valor por hora no puede ser negativo"],
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  },
);

// Antes de validar un documento nuevo, le asigna el siguiente ID de la secuencia
rolSchema.pre("validate", async function () {
  // Solo genera ID si el documento es nuevo y todavía no tiene uno
  if (this.isNew && this._id == null) {
    this._id = await siguienteId("roles");
  }
});

// Crea el modelo "Rol" y lo asocia a la colección "roles"
const Rol = mongoose.model("Rol", rolSchema, "roles");

export default Rol;
