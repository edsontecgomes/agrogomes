import { CicloAgronomico } from "../types/cicloAgronomico";
import { DecisaoAgronomica } from "../types/decisaoAgronomica";
import { PlanoManejo } from "../types/planoManejo";
import { criarCicloAgronomico } from "./cicloAgronomicoService";
import { criarDecisaoAgronomica } from "./decisaoAgronomicaService";
import { registrarEventoAgronomico } from "./eventoAgronomicoService";
import { vincularCicloNaMemoriaAgronomica } from "./memoriaAgronomicaService";
import { criarPlanoManejo } from "./planoManejoService";

type CriarCicloSOAInput = Omit<
  CicloAgronomico,
  "id" | "createdAt" | "updatedAt" | "status" | "ativo"
>;

type CriarPlanoSOAInput = Omit<
  PlanoManejo,
  "id" | "createdAt" | "updatedAt" | "status"
>;

type CriarDecisaoSOAInput = Omit<
  DecisaoAgronomica,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "eventosRelacionados"
  | "resultadosRelacionados"
>;

export async function criarCicloNoSistemaOperacionalAgronomico(
  payload: CriarCicloSOAInput
): Promise<string> {
  const cicloId = await criarCicloAgronomico(payload);

  if (payload.memoriaAgronomicaId) {
    await vincularCicloNaMemoriaAgronomica(
      payload.memoriaAgronomicaId,
      cicloId
    );
  }

  await registrarEventoAgronomico({
    producerId: payload.producerId,
    farmId: payload.farmId,
    talhaoId: payload.talhaoId,
    cicloAgronomicoId: cicloId,
    memoriaAgronomicaId: payload.memoriaAgronomicaId,
    tipo: "criacao_ciclo",
    origem: "sistema",
    titulo: "Ciclo Agronômico criado",
    descricao: `Ciclo da safra ${payload.safra} criado para a cultura ${
      payload.cultura ?? "não informada"
    }.`,
    dataEvento: new Date().toISOString(),
    confiabilidade: "alto",
    dados: {
      safra: payload.safra,
      cultura: payload.cultura ?? "",
      variedadeOuHibrido: payload.variedadeOuHibrido ?? "",
      tipoOcupacao: payload.tipoOcupacao,
    },
    createdBy: payload.createdBy,
  });

  return cicloId;
}

export async function criarPlanoNoSistemaOperacionalAgronomico(
  payload: CriarPlanoSOAInput
): Promise<string> {
  const planoId = await criarPlanoManejo(payload);

  await registrarEventoAgronomico({
    producerId: payload.producerId,
    farmId: payload.farmId,
    talhaoId: payload.talhaoId,
    cicloAgronomicoId: payload.cicloAgronomicoId,
    memoriaAgronomicaId: payload.memoriaAgronomicaId,
    planoManejoId: planoId,
    tipo: "criacao_plano_manejo",
    origem: "sistema",
    titulo: "Plano de Manejo criado",
    descricao: payload.nome,
    dataEvento: new Date().toISOString(),
    confiabilidade: "alto",
    dados: {
      nome: payload.nome,
      safra: payload.safra,
      cultura: payload.cultura ?? "",
      variedadeOuHibrido: payload.variedadeOuHibrido ?? "",
      quantidadeEtapas: payload.etapas.length,
    },
    createdBy: payload.createdBy,
  });

  return planoId;
}

export async function criarDecisaoNoSistemaOperacionalAgronomico(
  payload: CriarDecisaoSOAInput
): Promise<string> {
  const decisaoId = await criarDecisaoAgronomica(payload);

  await registrarEventoAgronomico({
    producerId: payload.producerId,
    farmId: payload.farmId,
    talhaoId: payload.talhaoId,
    cicloAgronomicoId: payload.cicloAgronomicoId,
    memoriaAgronomicaId: payload.memoriaAgronomicaId,
    planoManejoId: payload.planoManejoId,
    decisaoAgronomicaId: decisaoId,
    tipo: "criacao_decisao_agronomica",
    origem: "sistema",
    titulo: "Decisão Agronômica criada",
    descricao: payload.titulo,
    dataEvento: new Date().toISOString(),
    confiabilidade: "alto",
    dados: {
      tipo: payload.tipo,
      titulo: payload.titulo,
      justificativaTecnica: payload.justificativaTecnica,
      objetivoEsperado: payload.objetivoEsperado ?? "",
      hipoteseAgronomica: payload.hipoteseAgronomica ?? "",
      risco: payload.risco ?? "",
    },
    createdBy: payload.createdBy,
  });

  return decisaoId;
}