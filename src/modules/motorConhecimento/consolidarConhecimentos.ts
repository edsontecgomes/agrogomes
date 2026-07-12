import { consolidarDoisConhecimentos } from "./consolidarDoisConhecimentos";
import type {
  ConhecimentoAgronomico,
} from "./types";

export function consolidarConhecimentos(
  conhecimentos: ConhecimentoAgronomico[],
): ConhecimentoAgronomico[] {
  const mapa = new Map<
    string,
    ConhecimentoAgronomico
  >();

  conhecimentos.forEach(
    (conhecimento) => {
      const existente =
        mapa.get(conhecimento.chave);

      if (!existente) {
        mapa.set(
          conhecimento.chave,
          conhecimento,
        );

        return;
      }

      mapa.set(
        conhecimento.chave,
        consolidarDoisConhecimentos(
          existente,
          conhecimento,
        ),
      );
    },
  );

  return Array.from(
    mapa.values(),
  );
}