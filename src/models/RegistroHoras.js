import mongoose from "mongoose";
import "./Empleado.js";

const registroHorasSchema = new mongoose.Schema(
  {
    empleadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empleado",
      required: [true, "El empleado es obligatorio"],
    },
    fecha: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },
    horasTrabajadas: {
      type: Number,
      required: [true, "Las horas trabajadas son obligatorias"],
      min: [0.01, "Las horas deben ser mayores que cero"],
      max: [24, "No se pueden registrar más de 24 horas por día"],
    },
  },
  { timestamps: true },
);

const RegistroHoras = mongoose.model("RegistroHoras", registroHorasSchema);

export default RegistroHoras;
