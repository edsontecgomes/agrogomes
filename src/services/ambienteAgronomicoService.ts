import { AmbienteAgronomico } from "../types/ambienteAgronomico";
import { analisarAmbienteAgronomico } from "../engine/ambienteAgronomicoEngine";

export async function processarAmbienteAgronomico(
  ambiente: AmbienteAgronomico
) {

  return analisarAmbienteAgronomico(
    ambiente
  );

}