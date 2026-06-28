import { analisarChuvas } from "../engine/chuvaEngine";
import {
  listarChuvasPorCiclo,
  listarChuvasPorMemoriaAgronomica,
  salvarChuvaAgronomica,
} from "../repositories/chuvaAgronomicaRepository";
import { ChuvaAgronomica } from "../types/chuvaAgronomica";

type CriarChuvaAgronomicaInput = Omit<
  ChuvaAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarChuvaAgronomica(
  payload: CriarChuvaAgronomicaInput
): Promise<string> {
  return salvarChuvaAgronomica(payload);
}

export async function analisarChuvasDaMemoriaAgronomica(
  memoriaAgronomicaId: string
) {
  const chuvas = await listarChuvasPorMemoriaAgronomica(
    memoriaAgronomicaId
  );

  return analisarChuvas(chuvas);
}

export async function analisarChuvasDoCiclo(
  cicloAgronomicoId: string
) {
  const chuvas = await listarChuvasPorCiclo(cicloAgronomicoId);

  return analisarChuvas(chuvas);
}