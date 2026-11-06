import mongoose from "mongoose";
import "./Rol.js";
import { siguienteId } from "./Contador.js";

const empleadoSchema = new mongoose.Schema(
  {
    // ID numérico autoincremental (1, 2, 3, ...) en lugar del ObjectId de MongoDB
    _id: { type: Number },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    dni: {
      type: String,
      required: [true, "El DNI es obligatorio"],
      trim: true,
      unique: true,
      match: [/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"],
    },
    rolId: {
      type: Number,
      ref: "Rol",
      required: [true, "El rol del empleado es obligatorio"],
    },
  },
  { timestamps: true },
);

// Antes de validar un documento nuevo, le asigna el siguiente ID de la secuencia
empleadoSchema.pre("validate", async function () {
  if (this.isNew && this._id == null) {
    this._id = await siguienteId("empleados");
  }
});

const Empleado = mongoose.model("Empleado", empleadoSchema);

export default Empleado;
