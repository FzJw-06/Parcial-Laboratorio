import mongoose from "mongoose";

const rolSchema = new mongoose.Schema(
  {
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

const Rol = mongoose.model("Rol", rolSchema, "roles");

export default Rol;
