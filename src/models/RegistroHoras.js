import mongoose from "mongoose";
import "./Empleado.js";
import { siguienteId } from "./Contador.js";

// Al devolver el registro, la fecha sale como "AAAA-MM-DD" (sin hora),
// así ningún cliente puede interpretarla como el día anterior por la zona horaria
function formatearFecha(doc, ret) {
  if (ret.fecha instanceof Date) {
    ret.fecha = ret.fecha.toISOString().slice(0, 10);
  }
  return ret;
}

const registroHorasSchema = new mongoose.Schema(
  {
    // ID numérico autoincremental (1, 2, 3, ...) en lugar del ObjectId de MongoDB
    _id: { type: Number },
    empleadoId: {
      type: Number,
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
  {
    timestamps: true,
    toJSON: { transform: formatearFecha },
    toObject: { transform: formatearFecha },
  },
);
// Un empleado no puede tener dos registros el mismo día:
// así las horas extra (más de 8 por día) se calculan siempre sobre el día completo
registroHorasSchema.index({ empleadoId: 1, fecha: 1 }, { unique: true });

// Antes de validar un documento nuevo, le asigna el siguiente ID de la secuencia
registroHorasSchema.pre("validate", async function () {
  if (this.isNew && this._id == null) {
    this._id = await siguienteId("registrosHoras");
  }
});

const RegistroHoras = mongoose.model("RegistroHoras", registroHorasSchema);

export default RegistroHoras;
