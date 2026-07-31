import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Database,
  Layers,
  Settings,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";

type EtapaInteligencia = {
  title: string;
  eyebrow: string;
  description: string;
  introduction: string;
  collection: string[];
  processing: string[];
  result: string[];
  connection: string;
  icon: LucideIcon;
  color: string;
  accent: string;
  surface: string;
};

const steps: EtapaInteligencia[] = [
  {
    title: "Solo",
    eyebrow: "O ponto de partida",
    description:
      "Amostragem georreferenciada para compreender a fertilidade e a variabilidade de cada área.",
    introduction:
      "O solo estabelece o ambiente onde a cultura irá se desenvolver. Por isso, a Eqtara começa organizando cada análise na posição correta do talhão e da UEI, preservando profundidade, época e histórico.",
    collection: [
      "Amostras vinculadas ao ponto de coleta, talhão, UEI, fazenda e produtor.",
      "Camadas de profundidade, como 0–10, 10–20 e 20–30 cm, sem misturar resultados.",
      "pH, matéria orgânica, CTC, saturação por bases, macro e micronutrientes.",
      "Data, responsável, laboratório, método e evidências de qualidade da amostragem.",
    ],
    processing: [
      "Validação da localização, profundidade, unidade de medida e consistência do laudo.",
      "Comparação com análises anteriores da mesma UEI para identificar evolução ou perda de fertilidade.",
      "Construção de mapas de variabilidade e zonas com limitações semelhantes.",
      "Cálculo de confiança conforme densidade, idade e qualidade das amostras.",
    ],
    result: [
      "Mapa de fertilidade por camada e por unidade produtiva.",
      "Identificação de limitações químicas e áreas que exigem investigação adicional.",
      "Planejamento de novas amostragens e base técnica para correção e adubação.",
      "Memória Agronômica do solo, preservada para comparar safras e respostas futuras.",
    ],
    connection:
      "O diagnóstico do solo fornece o contexto para interpretar o Manejo: o sistema passa a saber não apenas o que foi feito, mas em qual condição cada operação foi realizada.",
    icon: Database,
    color: "bg-amber-100 text-amber-700",
    accent: "text-amber-700",
    surface: "border-amber-200 bg-amber-50",
  },
  {
    title: "Manejo",
    eyebrow: "O que foi feito",
    description:
      "Registro rastreável das operações, materiais, doses, máquinas e pessoas que atuaram no campo.",
    introduction:
      "O manejo transforma decisões em ações. Cada plantio, adubação ou pulverização precisa informar quando, onde, como e com qual material foi executado para que sua resposta possa ser medida depois.",
    collection: [
      "Ordens e execuções com data, horário, operador, máquina, implemento e largura operacional.",
      "Trajeto GPS, talhão, UEIs percorridas, pausas, sobreposições e áreas não cobertas.",
      "Produtos, sementes, cultivares, lotes, doses planejadas e quantidades realmente utilizadas.",
      "Condições da operação, observações de campo, checklists e ocorrências registradas online ou offline.",
    ],
    processing: [
      "Associação do trajeto e dos insumos às UEIs efetivamente alcançadas pela operação.",
      "Cálculo de cobertura, distância, tempo operando, tempo parado e velocidade compatível.",
      "Reconciliação das execuções offline e eliminação de duplicidades ou pontos GPS inconsistentes.",
      "Comparação entre planejamento e execução para localizar falhas, desvios e oportunidades de eficiência.",
    ],
    result: [
      "Mapa do que foi aplicado, plantado ou realizado em cada unidade produtiva.",
      "Rastreabilidade de cultivar, lote, produto, dose, operador e equipamento.",
      "Indicadores de eficiência operacional, consumo, cobertura e qualidade da execução.",
      "Histórico de manejo conectado às condições do solo e às respostas observadas depois.",
    ],
    connection:
      "Depois de conhecer o ambiente e o manejo, a Chuva mostra quanta água ficou disponível para ativar nutrientes, sustentar o crescimento e modificar a resposta de cada decisão.",
    icon: Settings,
    color: "bg-blue-100 text-blue-700",
    accent: "text-blue-700",
    surface: "border-blue-200 bg-blue-50",
  },
  {
    title: "Chuva",
    eyebrow: "O multiplicador hídrico",
    description:
      "Leituras locais e verificadas para entender a distribuição da água e seu efeito sobre o manejo.",
    introduction:
      "A chuva funciona como multiplicador da eficiência agronômica. A Eqtara diferencia chuva medida, zero confirmado e ausência de informação para não transformar uma lacuna de coleta em uma conclusão falsa.",
    collection: [
      "Volume em milímetros, pluviômetro, data, hora, usuário e localização da leitura.",
      "Evidências de proximidade ao pluviômetro, precisão do GPS e identificação do dispositivo.",
      "Leituras manuais ou de sensores, inclusive as registradas offline e sincronizadas depois.",
      "Confirmação explícita de zero milímetro, separada de um dia sem observação.",
    ],
    processing: [
      "Validação de duplicidade, coerência temporal, localização e vínculo com a fazenda.",
      "Pontuação de confiança baseada em frequência, proximidade, origem e consistência da leitura.",
      "Acúmulos por hora, dia, semana, fase da cultura, talhão e UEI.",
      "Correlação da disponibilidade hídrica com solo, manejo, compactação e produtividade.",
    ],
    result: [
      "Histórico pluviométrico auditável e mapas de distribuição da chuva.",
      "Indicadores de confiança que mostram onde a informação é forte ou ainda insuficiente.",
      "Leitura da resposta produtiva por faixa de chuva, como sacas por hectare a cada nível acumulado.",
      "Alertas e contexto hídrico para avaliar aplicações, plantio, desenvolvimento e risco.",
    ],
    connection:
      "Com o regime hídrico conhecido, a Compactação pode ser interpretada corretamente, pois a resistência do solo e o desenvolvimento radicular também dependem de umidade e tráfego.",
    icon: CloudRain,
    color: "bg-indigo-100 text-indigo-700",
    accent: "text-indigo-700",
    surface: "border-indigo-200 bg-indigo-50",
  },
  {
    title: "Compactação",
    eyebrow: "A condição física",
    description:
      "Medições georreferenciadas da resistência do solo e das limitações ao crescimento radicular.",
    introduction:
      "A fertilidade só se converte em crescimento quando as raízes conseguem explorar o perfil do solo. A compactação revela barreiras físicas que podem limitar água, nutrientes e produtividade.",
    collection: [
      "Leituras de penetrômetro com localização, profundidade, resistência e umidade do solo.",
      "Pontos repetidos por UEI para representar a variabilidade e reduzir conclusões isoladas.",
      "Histórico de tráfego de máquinas, operações, chuva recente e condição da superfície.",
      "Observações de raízes, infiltração, erosão e camadas restritivas encontradas em campo.",
    ],
    processing: [
      "Construção do perfil de resistência por profundidade e unidade produtiva.",
      "Comparação com limites técnicos adequados à umidade e à condição da área.",
      "Cruzamento com trajetos de máquinas, relevo, chuva, solo e falhas de desenvolvimento.",
      "Separação entre compactação localizada, estrutural e medições com baixa confiança.",
    ],
    result: [
      "Mapa de compactação por profundidade e prioridade de intervenção.",
      "Indicação das áreas que justificam manejo mecânico ou investigação complementar.",
      "Possibilidade de evitar operações generalizadas onde apenas parte do talhão apresenta limitação.",
      "Comparação antes e depois do manejo para medir se a intervenção realmente funcionou.",
    ],
    connection:
      "Solo, manejo, água e condição física explicam o ambiente construído durante a safra. A Produtividade registra a resposta final da planta a essa combinação.",
    icon: Layers,
    color: "bg-orange-100 text-orange-700",
    accent: "text-orange-700",
    surface: "border-orange-200 bg-orange-50",
  },
  {
    title: "Produtividade",
    eyebrow: "A resposta da planta",
    description:
      "Mapas de colheita e registros produtivos que revelam a resposta real de cada hectare.",
    introduction:
      "A produtividade é a resposta observável do sistema produtivo. Ela deixa de ser apenas uma média do talhão quando cada medição é ligada à UEI, ao material plantado e ao histórico que a antecedeu.",
    collection: [
      "Dados de monitor de colheita, mapas importados ou pesagens vinculadas à área correta.",
      "Coordenadas, massa, umidade, velocidade, largura de corte, data e equipamento.",
      "Cultivar, lote, população, época de plantio e demais informações rastreadas no manejo.",
      "Observações de falhas, perdas, condições de colheita e qualidade da fonte de dados.",
    ],
    processing: [
      "Remoção de pontos inválidos, sobreposições, velocidades incompatíveis e efeitos de borda.",
      "Correção de umidade e padronização das unidades antes de comparar resultados.",
      "Consolidação da produtividade por UEI, talhão, cultivar, manejo e condição ambiental.",
      "Comparação entre potencial conhecido, produtividade alcançada e estabilidade entre safras.",
    ],
    result: [
      "Mapa de produtividade com zonas estáveis, responsivas e limitantes.",
      "Indicadores de conversão do potencial agronômico em produção efetiva.",
      "Leitura da resposta de cada material às condições de solo, chuva, compactação e manejo.",
      "Base quantitativa para separar coincidência, tendência e resposta repetível.",
    ],
    connection:
      "A produtividade fecha a coleta principal da safra. Em Resultados, todas as etapas são integradas para explicar diferenças e apoiar a próxima decisão.",
    icon: BarChart3,
    color: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-700",
    surface: "border-emerald-200 bg-emerald-50",
  },
  {
    title: "Resultados",
    eyebrow: "Conhecimento aplicado",
    description:
      "Integração dos dados para explicar respostas, comparar estratégias e orientar decisões futuras.",
    introduction:
      "Resultados é onde a Memória Agronômica se transforma em conhecimento útil. O sistema cruza as evidências acumuladas, mede sua confiança e apresenta conclusões no nível da UEI e recomendações práticas no nível do talhão.",
    collection: [
      "Histórico integrado de solo, manejo, chuva, compactação, produtividade, custos e observações.",
      "Contexto espacial completo: UEI, talhão, fazenda, produtor, safra e período analisado.",
      "Objetivo da análise, como produtividade, margem, estabilidade, risco ou eficiência operacional.",
      "Qualidade e disponibilidade de cada fonte, mantendo visíveis lacunas e incertezas.",
    ],
    processing: [
      "Cruzamento espacial e temporal das variáveis que antecederam cada resposta produtiva.",
      "Construção de curvas de resposta e comparação entre ambientes e estratégias semelhantes.",
      "Cálculo de confiança, relevância dos fatores e separação entre evidência e hipótese.",
      "Avaliação da distribuição no talhão para recomendar a opção que beneficia a maior área ou outro objetivo definido.",
    ],
    result: [
      "Painéis explicáveis mostrando o que aconteceu, onde aconteceu e quais fatores contribuíram.",
      "Comparações como cultivar × adubação × chuva × ambiente, com percentuais de área beneficiada.",
      "Recomendações com confiança, possíveis ganhos, riscos, custos e trade-offs apresentados.",
      "Memória que evolui a cada safra e melhora continuamente as decisões da fazenda.",
    ],
    connection:
      "O resultado de uma safra volta a enriquecer o diagnóstico de Solo e inicia um novo ciclo. Cada hectare se torna mais inteligente a cada dia.",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700",
    accent: "text-purple-700",
    surface: "border-purple-200 bg-purple-50",
  },
];

type DetailColumnProps = {
  title: string;
  items: string[];
};

function DetailColumn({ title, items }: DetailColumnProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="text-base font-bold text-slate-900">
        {title}
      </h4>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm leading-6 text-slate-600"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AgronomicOnboarding() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  const openStep = (index: number) => {
    setSelectedStep(index);

    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const closeStep = () => {
    setSelectedStep(null);
  };

  const activeStep =
    selectedStep === null
      ? null
      : steps[selectedStep];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
          Do dado ao conhecimento
        </p>

        <h2 className="mb-4 text-3xl font-bold text-slate-900">
          Inteligência Agronômica Eqtara
        </h2>

        <p className="mx-auto max-w-2xl text-slate-600">
          Acompanhe como os dados são coletados, processados e
          transformados em decisões ao longo de um ciclo contínuo.
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Etapas da Inteligência Agronômica Eqtara"
      >
        {steps.map((step, index) => {
          const isSelected = selectedStep === index;

          return (
            <motion.button
              key={step.title}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => openStep(index)}
              aria-expanded={isSelected}
              aria-controls="detalhe-inteligencia-agronomica"
              className={[
                "group relative overflow-hidden rounded-3xl border bg-white p-6 text-left shadow-sm",
                "transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200",
                isSelected
                  ? "border-emerald-400 ring-2 ring-emerald-100"
                  : "border-slate-100",
              ].join(" ")}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color} transition-transform group-hover:scale-110`}
                >
                  <step.icon className="h-6 w-6" />
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Etapa {index + 1}
                </span>
              </div>

              <p className={`mb-1 text-[11px] font-black uppercase tracking-widest ${step.accent}`}>
                {step.eyebrow}
              </p>

              <h3 className="mb-2 text-lg font-bold text-slate-900">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>

              <span className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-700">
                Entenda esta etapa
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Selecione um card para conhecer o processo completo
      </p>

      <AnimatePresence mode="wait">
        {activeStep && selectedStep !== null && (
          <motion.section
            id="detalhe-inteligencia-agronomica"
            ref={detailRef}
            key={activeStep.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="scroll-mt-24 pt-10"
            aria-live="polite"
          >
            <div className={`rounded-[32px] border p-5 shadow-sm sm:p-8 ${activeStep.surface}`}>
              <div className="flex items-start justify-between gap-5">
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:flex ${activeStep.color}`}
                  >
                    <activeStep.icon className="h-7 w-7" />
                  </div>

                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${activeStep.accent}`}>
                      Etapa {selectedStep + 1} de {steps.length} · {activeStep.eyebrow}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                      {activeStep.title}
                    </h3>

                    <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
                      {activeStep.introduction}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeStep}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  aria-label="Fechar detalhes"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <DetailColumn
                title="Como os dados serão coletados"
                items={activeStep.collection}
              />

              <DetailColumn
                title="Como serão processados"
                items={activeStep.processing}
              />

              <DetailColumn
                title="Qual resultado será apresentado"
                items={activeStep.result}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white shadow-lg sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Continuidade do conhecimento
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
                {activeStep.connection}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => openStep(selectedStep - 1)}
                disabled={selectedStep === 0}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Etapa anterior
              </button>

              <button
                type="button"
                onClick={closeStep}
                className="min-h-12 rounded-2xl px-5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
              >
                Voltar aos cards
              </button>

              <button
                type="button"
                onClick={() => openStep(selectedStep + 1)}
                disabled={selectedStep === steps.length - 1}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Próxima etapa
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="mt-16 rounded-3xl bg-emerald-950 p-8 text-center text-white">
        <h3 className="text-xl font-bold">
          O ciclo da produtividade
        </h3>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-emerald-100/80">
          Solo, manejo, chuva, compactação e produtividade formam uma
          sequência de evidências. Em Resultados, a Eqtara transforma
          essa memória em explicações e decisões para o próximo ciclo.
        </p>
      </div>
    </div>
  );
}
