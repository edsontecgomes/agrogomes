import { EventoAgronomico } from "../eventosAgronomicos/types";

import {
  criarEntidadeCientifica,
  EntidadeCientifica,
} from "./entidadeCientifica";

export function criarEntidadesDoEvento(
  evento: EventoAgronomico,
): EntidadeCientifica[] {
  const entidades: EntidadeCientifica[] = [];

  if (evento.producerId) {
    entidades.push(
      criarEntidadeCientifica({
        id: evento.producerId,
        tipo: "produtor",
        nome: `Produtor ${evento.producerId}`,
        origem: "evento_agronomico",
      }),
    );
  }

  if (evento.farmId) {
    entidades.push(
      criarEntidadeCientifica({
        id: evento.farmId,
        tipo: "fazenda",
        nome: `Fazenda ${evento.farmId}`,
        origem: "evento_agronomico",
        propriedades: {
          producerId: evento.producerId,
        },
      }),
    );
  }

  if (evento.talhaoId) {
    entidades.push(
      criarEntidadeCientifica({
        id: evento.talhaoId,
        tipo: "talhao",
        nome: `Talhão ${evento.talhaoId}`,
        origem: "evento_agronomico",
        propriedades: {
          farmId: evento.farmId,
        },
      }),
    );
  }

  (evento.ueiIds ?? []).forEach((ueiId) => {
    entidades.push(
      criarEntidadeCientifica({
        id: ueiId,
        tipo: "uei",
        nome: `UEI ${ueiId}`,
        origem: "evento_agronomico",
        propriedades: {
          farmId: evento.farmId,
          talhaoId: evento.talhaoId,
        },
      }),
    );
  });

  (evento.gdaIds ?? []).forEach((gdaId) => {
    entidades.push(
      criarEntidadeCientifica({
        id: gdaId,
        tipo: "gda",
        nome: `GDA ${gdaId}`,
        origem: "evento_agronomico",
        propriedades: {
          farmId: evento.farmId,
          talhaoId: evento.talhaoId,
        },
      }),
    );
  });

  return entidades;
}