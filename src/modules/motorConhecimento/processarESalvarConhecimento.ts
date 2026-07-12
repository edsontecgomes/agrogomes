import type {
  AprendizadoAgronomico,
} from "../motorAprendizagem/types";

import { atualizarGDAComConhecimento } from "./atualizarGDAComConhecimento";
import { processarMotorConhecimento } from "./processarMotorConhecimento";
import { salvarConhecimentos } from "./salvarConhecimentos";
import type {
  ResultadoConsolidacaoConhecimento,
} from "./types";

export type ResultadoConhecimentoPersistido = {
  conhecimentoIds: string[];

  resultado:
    ResultadoConsolidacaoConhecimento;
};

export async function processarESalvarConhecimento(
  aprendizados: AprendizadoAgronomico[],
): Promise<ResultadoConhecimentoPersistido> {
  const resultado =
    processarMotorConhecimento(
      aprendizados,
    );

  const conhecimentoIds =
    await salvarConhecimentos(
      resultado,
    );

  const gdaIds = Array.from(
    new Set(
      resultado.conhecimentos
        .map(
          (conhecimento) =>
            conhecimento.gdaId,
        )
        .filter(
          (gdaId): gdaId is string =>
            Boolean(gdaId),
        ),
    ),
  );

  await Promise.all(
    gdaIds.map((gdaId) =>
      atualizarGDAComConhecimento(
        gdaId,
        resultado.conhecimentos,
      ),
    ),
  );

  return {
    conhecimentoIds,
    resultado,
  };
}