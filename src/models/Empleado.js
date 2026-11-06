// Modelo de Empleado: persona a la que se le pagan las horas trabajadas.
import mongoose from "mongoose";
import "./Rol.js"; // registra el modelo Rol para que populate("rolId") funcione
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
      unique: true, // no puede haber dos empleados con el mismo DNI
      match: [/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"], // solo números
    },
    rolId: {
      type: Number,
      ref: "Rol", // relación con el modelo Rol
      required: [true, "El rol del empleado es obligatorio"],
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  },
);

// Antes de validar un documento nuevo, le asigna el siguiente ID de la secuencia
empleadoSchema.pre("validate", async function () {
  // Solo genera ID si el documento es nuevo y todavía no tiene uno
  if (this.isNew && this._id == null) {
    this._id = await siguienteId("empleados");
  }
});

// Crea el modelo "Empleado" con el esquema definido arriba
const Empleado = mongoose.model("Empleado", empleadoSchema);

export default Empleado;
