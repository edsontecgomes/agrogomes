import { calcularConfiabilidadeAprendizado } from "./calcularConfiabilidadeAprendizado";
import {
  calcularForcaAprendizado,
  classificarStatusAprendizado,
} from "./calcularForcaAprendizado";
import { detectarContradicaoAprendizado } from "./detectarContradicaoAprendizado";
import { gerarIdAprendizado } from "./normalizarChaveAprendizado";
import {
  AprendizadoAgronomico,
  EscopoAprendizado,
  EvidenciaAprendizado,
  OrigemAprendizado,
} from "./types";

type CriarAprendizadoParams = {
  chave: string;

  titulo: string;

  descricao: string;

  fatorPrincipal: string;

  escopo: EscopoAprendizado;

  entidadeId: string;

  farmId: string;

  producerId?: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraId?: string;

  cultura?: string;

  origem?: OrigemAprendizado;

  evidencias?: EvidenciaAprendizado[];

  numeroEventos?: number;

  numeroSafras?: number;

  numeroUEIs?: number;

  propriedades?: Record<string, unknown>;
};

export function criarAprendizadoAgronomico(
  params: CriarAprendizadoParams,
): AprendizadoAgronomico {
  const agora =
    new Date().toISOString();

  const id = gerarIdAprendizado({
    entidadeId:
      params.entidadeId,

    fatorPrincipal:
      params.fatorPrincipal,

    safraId:
      params.safraId,
  });

  const evidencias =
    params.evidencias ?? [];

  const baseForca = {
    evidencias,

    numeroEventos:
      params.numeroEventos ?? 0,

    numeroSafras:
      params.numeroSafras ?? 0,

    numeroUEIs:
      params.numeroUEIs ?? 0,
  };

  const forca =
    calcularForcaAprendizado(
      baseForca,
    );

  const contradicao =
    detectarContradicaoAprendizado(
      id,
      evidencias,
    );

  return {
    id,

    chave:
      params.chave,

    titulo:
      params.titulo,

    descricao:
      params.descricao,

    fatorPrincipal:
      params.fatorPrincipal,

    escopo:
      params.escopo,

    entidadeId:
      params.entidadeId,

    producerId:
      params.producerId,

    farmId:
      params.farmId,

    talhaoId:
      params.talhaoId,

    ueiId:
      params.ueiId,

    gdaId:
      params.gdaId,

    safraId:
      params.safraId,

    cultura:
      params.cultura,

    status:
      classificarStatusAprendizado(
        forca,
        contradicao.existeContradicao,
      ),

    origem:
      params.origem ??
      "consolidacao",

    evidencias,

    totalEvidenciasFavoraveis:
      contradicao.totalFavoraveis,

    totalEvidenciasContrarias:
      contradicao.totalContrarias,

    numeroEventos:
      params.numeroEventos ?? 0,

    numeroSafras:
      params.numeroSafras ?? 0,

    numeroUEIs:
      params.numeroUEIs ?? 0,

    forca,

    confiabilidade:
      calcularConfiabilidadeAprendizado(
        evidencias,
      ),

    criadoEm:
      agora,

    atualizadoEm:
      agora,

    propriedades:
      params.propriedades,
  };
}