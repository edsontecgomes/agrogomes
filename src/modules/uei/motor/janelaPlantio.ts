export type JanelaPlantio = {
  inicio: string;
  fim: string;
  classificacao: "cedo" | "ideal" | "tardia";
};

export function dataDentroDaJanela(data: string, janela: JanelaPlantio) {
  const d = new Date(data).getTime();
  return d >= new Date(janela.inicio).getTime() && d <= new Date(janela.fim).getTime();
}