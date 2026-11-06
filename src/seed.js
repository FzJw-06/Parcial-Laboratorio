// Script de datos de prueba.
// Borra la base local y carga roles, empleados y registros de horas de ejemplo.
// Se ejecuta con: node src/seed.js
import "dotenv/config";
import mongoose from "mongoose";
import Rol from "./models/Rol.js";
import Empleado from "./models/Empleado.js";
import RegistroHoras from "./models/RegistroHoras.js";

async function sembrar() {
  const uri = process.env.MONGO_URI || "";

  // Seguro: solo borramos si la base es local
  if (!uri.includes("127.0.0.1") && !uri.includes("localhost")) {
    console.error("MONGO_URI no es una base local. Se cancela el seed.");
    process.exit(1);
  }

  // Conecta con la base indicada en el .env
  await mongoose.connect(uri);
  console.log("Base:", mongoose.connection.name);

  // Borra TODA la base y la recrea desde cero
  await mongoose.connection.dropDatabase();

  // Vuelve a crear los índices (incluidos los unique) después de borrar la base
  await Promise.all([
    Rol.createIndexes(),
    Empleado.createIndexes(),
    RegistroHoras.createIndexes(),
  ]);

  // Se usa create() (y no insertMany) porque insertMany no ejecuta los hooks
  // que asignan los IDs numéricos autoincrementales.
  const roles = [];

  // Datos de los tres roles de ejemplo
  for (const datos of [
    { nombre: "Administrativo", valorHora: 4000 },
    { nombre: "Operario", valorHora: 3500 },
    { nombre: "Supervisor", valorHora: 5000 },
  ]) {
    roles.push(await Rol.create(datos));
  }

  // Guarda las referencias para usarlas al crear los empleados
  const [administrativo, operario, supervisor] = roles;

  const empleados = [];

  // Cada empleado apunta al ID del rol que se creó arriba
  for (const datos of [
    {
      nombre: "Juan",
      apellido: "Pérez",
      dni: "40123456",
      rolId: administrativo._id,
    },
    {
      nombre: "María",
      apellido: "Gómez",
      dni: "40987654",
      rolId: operario._id,
    },
    {
      nombre: "Carlos",
      apellido: "López",
      dni: "38555111",
      rolId: supervisor._id,
    },
  ]) {
    empleados.push(await Empleado.create(datos));
  }

  // Guarda las referencias para usarlas al crear los registros
  const [juan, maria, carlos] = empleados;

  // Registros de ejemplo: 9, 8 y 10 horas (9 y 10 generan horas extra)
  for (const datos of [
    { empleadoId: juan._id, fecha: "2026-10-26", horasTrabajadas: 9 },
    { empleadoId: maria._id, fecha: "2026-10-26", horasTrabajadas: 8 },
    { empleadoId: carlos._id, fecha: "2026-10-27", horasTrabajadas: 10 },
  ]) {
    await RegistroHoras.create(datos);
  }

  // Muestra un resumen con los IDs generados
  console.log("Seed completado.");
  console.log(
    "Roles:",
    roles.map((r) => `${r.nombre}: ${r._id}`),
  );
  console.log(
    "Empleados:",
    empleados.map((e) => `${e.nombre} ${e.apellido}: ${e._id}`),
  );

  // Cierra la conexión para que el script termine
  await mongoose.disconnect();
}

// Ejecuta el seed y, si algo falla, muestra el error y corta con código 1
sembrar().catch((error) => {
  console.error("Error en el seed:", error.message);
  process.exit(1);
});
