import { EventoAgronomico } from "../eventosAgronomicos/types";

import { extrairAmostrasDosEventos } from "./extrairAmostrasDosEventos";
import { processarMotorEstatistico } from "./processarMotorEstatistico";
import { ResultadoMotorEstatistico } from "./types";

export type ResultadoEstatisticoEventos = {
  totalEventos: number;

  totalAmostras: number;

  resultados:
    ResultadoMotorEstatistico[];

  processadoEm: Date;
};

export function processarEventosAgronomicos(
  eventos: EventoAgronomico[],
): ResultadoEstatisticoEventos {
  const amostras =
    extrairAmostrasDosEventos(
      eventos,
    );

  const fatores = Array.from(
    new Set(
      amostras.map(
        (amostra) =>
          amostra.fator,
      ),
    ),
  );

  const resultados =
    fatores.map(
      (fatorPrincipal) =>
        processarMotorEstatistico({
          fatorPrincipal,

          amostras,

          fatoresRelacionados:
            fatores.filter(
              (fator) =>
                fator !==
                fatorPrincipal,
            ),
        }),
    );

  return {
    totalEventos:
      eventos.length,

    totalAmostras:
      amostras.length,

    resultados,

    processadoEm:
      new Date(),
  };
}