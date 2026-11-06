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

  await mongoose.connect(uri);
  console.log("Base:", mongoose.connection.name);

  // Borra TODA la base y la recrea desde cero
  await mongoose.connection.dropDatabase();
  await Promise.all([
    Rol.createIndexes(),
    Empleado.createIndexes(),
    RegistroHoras.createIndexes(),
  ]);

  // Se usa create() (y no insertMany) porque insertMany no ejecuta los hooks
  // que asignan los IDs numéricos autoincrementales.
  const roles = [];
  for (const datos of [
    { nombre: "Administrativo", valorHora: 4000 },
    { nombre: "Operario", valorHora: 3500 },
    { nombre: "Supervisor", valorHora: 5000 },
  ]) {
    roles.push(await Rol.create(datos));
  }

  const [administrativo, operario, supervisor] = roles;

  const empleados = [];
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

  const [juan, maria, carlos] = empleados;

  for (const datos of [
    { empleadoId: juan._id, fecha: "2026-10-26", horasTrabajadas: 9 },
    { empleadoId: maria._id, fecha: "2026-10-26", horasTrabajadas: 8 },
    { empleadoId: carlos._id, fecha: "2026-10-27", horasTrabajadas: 10 },
  ]) {
    await RegistroHoras.create(datos);
  }

  console.log("Seed completado.");
  console.log(
    "Roles:",
    roles.map((r) => `${r.nombre}: ${r._id}`),
  );
  console.log(
    "Empleados:",
    empleados.map((e) => `${e.nombre} ${e.apellido}: ${e._id}`),
  );

  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error("Error en el seed:", error.message);
  process.exit(1);
});
