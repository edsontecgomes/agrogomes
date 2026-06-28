import { AmbienteAgronomico } from "../../types/ambienteAgronomico";

export function classificarAmbiente(
  ambiente: AmbienteAgronomico
): string {

  if (
    ambiente.compactacao &&
    ambiente.compactacao > 70
  ) {

    return "restritivo";

  }

  if (
    ambiente.materiaOrganica &&
    ambiente.materiaOrganica > 4
  ) {

    return "alto_potencial";

  }

  if (
    ambiente.ph &&
    ambiente.ph < 5
  ) {

    return "necessita_correcao";

  }

  return "intermediario";

}