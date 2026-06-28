export type OrientacaoNovoPluviometro = {
  deveCriar: boolean;
  mensagem: string;
};

export function orientarNovoPluviometro(encontrouPluviometro: boolean): OrientacaoNovoPluviometro {
  if (encontrouPluviometro) {
    return {
      deveCriar: false,
      mensagem: "Pluviômetro identificado automaticamente.",
    };
  }

  return {
    deveCriar: true,
    mensagem:
      "Nenhum pluviômetro encontrado em até 50 metros. Identifique ou cadastre um novo pluviômetro para registrar este evento.",
  };
}