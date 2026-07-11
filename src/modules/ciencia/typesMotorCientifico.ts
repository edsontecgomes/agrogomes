import { EventoCientifico } from "./eventoCientifico";
import { GrafoConhecimento } from "./grafoConhecimento";
import { EvidenciaHipotese } from "./hipoteses/evidencia";
import { HipoteseCientifica } from "./hipoteses/hipotese";

export type FatorCientificoExtraido = {
  chave: string;

  valor: unknown;

  descricao: string;

  peso: number;

  origem:
    | "evento"
    | "contexto"
    | "operacao"
    | "clima"
    | "qualidade"
    | "payload";
};

export type ComparacaoCientificaEntrada = {
  fator: string;

  antes: number;

  depois: number;

  titulo?: string;

  descricao?: string;
};

export type ResultadoMotorCientificoCompleto = {
  eventoAgronomicoId?: string;

  eventoCientifico: EventoCientifico;

  grafo: GrafoConhecimento;

  fatores: FatorCientificoExtraido[];

  evidencias: EvidenciaHipotese[];

  hipoteses: HipoteseCientifica[];

  descobertas: unknown[];

  explicacao?: unknown;

  totalEntidades: number;

  totalRelacoes: number;

  totalEvidencias: number;

  totalHipoteses: number;

  totalDescobertas: number;

  processadoEm: Date;
};