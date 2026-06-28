import { TalhaoCadastro, talhaoCadastroValido } from "./talhaoCadastro";

export type ResultadoValidacaoTalhao = {
  valido: boolean;
  mensagens: string[];
};

export function validarTalhaoParaSalvar(
  talhao: TalhaoCadastro,
): ResultadoValidacaoTalhao {
  const mensagens: string[] = [];

  if (!talhao.farmId) mensagens.push("Fazenda não identificada.");
  if (!talhao.nome) mensagens.push("Informe o nome do talhão.");
  if (talhao.coordenadas.length < 3) {
    mensagens.push("Desenhe pelo menos 3 pontos para formar o talhão.");
  }
  if (!talhao.areaHa || talhao.areaHa <= 0) {
    mensagens.push("A área do talhão precisa ser maior que zero.");
  }

  return {
    valido: talhaoCadastroValido(talhao) && mensagens.length === 0,
    mensagens,
  };
}