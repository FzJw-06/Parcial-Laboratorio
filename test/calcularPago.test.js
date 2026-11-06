// Tests de la regla de negocio del pago de horas.
// Usan el runner nativo de Node (node:test), así que no hace falta instalar nada.
// Se ejecutan con: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularPago } from "../src/services/registroHorasService.js";

// Crea un empleado de prueba con su rol ya cargado (como lo deja populate).
// El parámetro valorHora permite probar distintos roles.
function crearEmpleado(valorHora = 4000) {
  return {
    nombre: "Juan",
    apellido: "Pérez",
    rolId: { nombre: "Administrativo", valorHora },
  };
}

// Caso base: 8 horas exactas no generan horas extra.
test("8 horas exactas: todo se paga a valor normal", () => {
  const r = calcularPago(crearEmpleado(4000), 8);

  assert.equal(r.horasNormales, 8); // las 8 horas son normales
  assert.equal(r.horasExtra, 0); // no hay extras
  assert.equal(r.pagoNormal, 32000); // 8 × 4000
  assert.equal(r.pagoExtra, 0);
  assert.equal(r.totalPagar, 32000);
});

// Menos de 8 horas: se pagan todas al valor normal.
test("menos de 8 horas: no hay horas extra", () => {
  const r = calcularPago(crearEmpleado(4000), 5);

  assert.equal(r.horasNormales, 5);
  assert.equal(r.horasExtra, 0);
  assert.equal(r.totalPagar, 20000); // 5 × 4000
});

// 9 horas: 8 normales + 1 extra pagada al 150 %.
test("9 horas: la hora que pasa de 8 se paga al 150%", () => {
  const r = calcularPago(crearEmpleado(4000), 9);

  assert.equal(r.horasNormales, 8);
  assert.equal(r.horasExtra, 1);
  assert.equal(r.pagoNormal, 32000); // 8 × 4000
  assert.equal(r.pagoExtra, 6000); // 1 × 4000 × 1,5
  assert.equal(r.totalPagar, 38000);
});

// El valor de la hora se toma del rol del empleado (en este caso, 5000).
test("usa el valor por hora del rol (Supervisor, 10 horas)", () => {
  const r = calcularPago(crearEmpleado(5000), 10);

  assert.equal(r.pagoNormal, 40000); // 8 × 5000
  assert.equal(r.pagoExtra, 15000); // 2 × 5000 × 1,5
  assert.equal(r.totalPagar, 55000);
});

// Horas decimales: 8,5 se separan en 8 normales y 0,5 extra.
test("horas con decimales: 8,5 horas = 0,5 de extra", () => {
  const r = calcularPago(crearEmpleado(4000), 8.5);

  assert.equal(r.horasExtra, 0.5);
  assert.equal(r.pagoExtra, 3000); // 0,5 × 4000 × 1,5
  assert.equal(r.totalPagar, 35000);
});

// Jornada máxima permitida: 24 horas (8 normales + 16 extra).
test("jornada máxima de 24 horas", () => {
  const r = calcularPago(crearEmpleado(4000), 24);

  assert.equal(r.horasNormales, 8);
  assert.equal(r.horasExtra, 16);
  assert.equal(r.totalPagar, 32000 + 16 * 4000 * 1.5); // 128000
});

// La respuesta incluye el nombre completo y el valor de la hora usado.
test("el resultado incluye el nombre completo del empleado", () => {
  const r = calcularPago(crearEmpleado(), 8);

  assert.equal(r.empleado, "Juan Pérez");
  assert.equal(r.valorHora, 4000);
});

// Sin empleado no hay datos para calcular: devuelve null.
test("sin empleado devuelve null", () => {
  assert.equal(calcularPago(null, 8), null);
});

// Si el rol fue borrado, tampoco se puede calcular: devuelve null.
test("empleado sin rol (rol borrado) devuelve null", () => {
  const sinRol = { nombre: "Ana", apellido: "Ruiz", rolId: null };

  assert.equal(calcularPago(sinRol, 8), null);
});
