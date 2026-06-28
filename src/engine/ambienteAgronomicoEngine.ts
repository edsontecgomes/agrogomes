import { AmbienteAgronomico } from "../types/ambienteAgronomico";
import { classificarAmbiente } from "../domain/ambiente/classificacaoAmbienteDomain";

export function analisarAmbienteAgronomico(
  ambiente: AmbienteAgronomico
) {

  return {

    ...ambiente,

    ambienteProdutivo:
      classificarAmbiente(ambiente)

  };

}