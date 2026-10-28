import mongoose from "mongoose";
import "./Rol.js";

const empleadoSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rol",
      required: [true, "El rol del empleado es obligatorio"],
    },
  },
  { timestamps: true },
);

const Empleado = mongoose.model("Empleado", empleadoSchema);

export default Empleado;
