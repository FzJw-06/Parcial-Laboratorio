import { crearRegistroHoras } from "../services/registroHorasService.js";

export async function crearRegistro(req, res) {
  try {
    const { registro, calculo } = await crearRegistroHoras(req.body);

    res.status(201).json({
      status: "success",
      data: {
        registro,
        calculo,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "No se pudo crear el registro de horas",
      errors: [error.message],
    });
  }
}
