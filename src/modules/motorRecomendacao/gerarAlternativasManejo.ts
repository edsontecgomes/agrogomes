import { conhecimentoParaAlternativa } from "./conhecimentoParaAlternativa";
import type {
  AlternativaManejo,
  ContextoRecomendacao,
} from "./types";

export function gerarAlternativasManejo(
  contexto: ContextoRecomendacao,
): AlternativaManejo[] {
  return contexto.conhecimentos
    .filter(
      (conhecimento) =>
        conhecimento.status !==
          "arquivado" &&
        conhecimento.farmId ===
          contexto.farmId,
    )
    .map(
      conhecimentoParaAlternativa,
    );
}