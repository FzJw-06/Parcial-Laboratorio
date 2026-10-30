// Tests de la regla de negocio del pago de horas.
// Usan el runner nativo de Node (node:test), así que no hace falta instalar nada.
// Se ejecutan con: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularPago } from "../src/services/registroHorasService.js";

// Empleado de prueba con su rol ya cargado (como lo deja populate)
function crearEmpleado(valorHora = 4000) {
  return {
    nombre: "Juan",
    apellido: "Pérez",
    rolId: { nombre: "Administrativo", valorHora },
  };
}

test("8 horas exactas: todo se paga a valor normal", () => {
  const r = calcularPago(crearEmpleado(4000), 8);

  assert.equal(r.horasNormales, 8);
  assert.equal(r.horasExtra, 0);
  assert.equal(r.pagoNormal, 32000);
  assert.equal(r.pagoExtra, 0);
  assert.equal(r.totalPagar, 32000);
});

test("menos de 8 horas: no hay horas extra", () => {
  const r = calcularPago(crearEmpleado(4000), 5);

  assert.equal(r.horasNormales, 5);
  assert.equal(r.horasExtra, 0);
  assert.equal(r.totalPagar, 20000);
});

test("9 horas: la hora que pasa de 8 se paga al 150%", () => {
  const r = calcularPago(crearEmpleado(4000), 9);

  assert.equal(r.horasNormales, 8);
  assert.equal(r.horasExtra, 1);
  assert.equal(r.pagoNormal, 32000);
  assert.equal(r.pagoExtra, 6000); // 1 h × 4000 × 1,5
  assert.equal(r.totalPagar, 38000);
});

test("usa el valor por hora del rol (Supervisor, 10 horas)", () => {
  const r = calcularPago(crearEmpleado(5000), 10);

  assert.equal(r.pagoNormal, 40000); // 8 × 5000
  assert.equal(r.pagoExtra, 15000); // 2 × 5000 × 1,5
  assert.equal(r.totalPagar, 55000);
});

test("horas con decimales: 8,5 horas = 0,5 de extra", () => {
  const r = calcularPago(crearEmpleado(4000), 8.5);

  assert.equal(r.horasExtra, 0.5);
  assert.equal(r.pagoExtra, 3000); // 0,5 × 4000 × 1,5
  assert.equal(r.totalPagar, 35000);
});

test("jornada máxima de 24 horas", () => {
  const r = calcularPago(crearEmpleado(4000), 24);

  assert.equal(r.horasNormales, 8);
  assert.equal(r.horasExtra, 16);
  assert.equal(r.totalPagar, 32000 + 16 * 4000 * 1.5); // 128000
});

test("el resultado incluye el nombre completo del empleado", () => {
  const r = calcularPago(crearEmpleado(), 8);

  assert.equal(r.empleado, "Juan Pérez");
  assert.equal(r.valorHora, 4000);
});

test("sin empleado devuelve null", () => {
  assert.equal(calcularPago(null, 8), null);
});

test("empleado sin rol (rol borrado) devuelve null", () => {
  const sinRol = { nombre: "Ana", apellido: "Ruiz", rolId: null };

  assert.equal(calcularPago(sinRol, 8), null);
});
