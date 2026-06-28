import { CoordenadaCadastroTalhao } from "./talhaoCadastro";
import { montarTalhaoCadastro } from "./montarTalhaoCadastro";
import { validarTalhaoParaSalvar } from "./validarSalvarTalhao";
import { salvarTalhaoCadastro } from "./salvarTalhao";

export async function executarFluxoCriarTalhao(params: {
  farmId: string;
  producerId?: string;
  nome: string;
  coordenadas: CoordenadaCadastroTalhao[];
  areaHa: number;
  bordaduraPercentual?: number;
}) {
  const talhao = montarTalhaoCadastro({
    farmId: params.farmId,
    nome: params.nome,
    coordenadas: params.coordenadas,
    areaHa: params.areaHa,
    bordaduraPercentual: params.bordaduraPercentual,
  });

  const validacao = validarTalhaoParaSalvar(talhao);

  if (!validacao.valido) {
    return {
      sucesso: false,
      mensagens: validacao.mensagens,
      talhao: null,
    };
  }

  const salvo = await salvarTalhaoCadastro(talhao, params.producerId);

  return {
    sucesso: true,
    mensagens: ["Talhão cadastrado com sucesso."],
    talhao: salvo,
  };
}