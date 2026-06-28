import { AppPillarConfig } from "../../types/appPillarNavigation";

export const APP_PILLARS: AppPillarConfig[] = [
  {
    key: "fazenda",
    label: "Fazenda",
    description: "Estrutura, áreas e equipe.",
    icon: "🌱",
    colorClass: "border-emerald-800 bg-emerald-950/30",
    items: [
      {
        label: "Fazendas",
        description: "Dados principais da propriedade.",
        path: "/fazenda",
        icon: "🏡",
        enabled: true,
      },
      {
        label: "Talhões",
        description: "Mapas, áreas e histórico.",
        path: "/talhoes",
        icon: "🗺️",
        enabled: true,
      },
      {
        label: "Equipe",
        description: "Usuários, funções e acessos.",
        path: "/usuarios",
        icon: "👥",
        enabled: true,
      },
    ],
  },
  {
    key: "operacoes",
    label: "Operações",
    description: "Ordens, execução e campo.",
    icon: "🚜",
    colorClass: "border-amber-800 bg-amber-950/30",
    items: [
      {
        label: "Ordens",
        description: "Planejamento operacional.",
        path: "/servicos",
        icon: "📋",
        enabled: true,
      },
      {
        label: "Execução",
        description: "Acompanhar atividades em campo.",
        path: "/servicos",
        icon: "📍",
        enabled: true,
      },
      {
        label: "Máquinas",
        description: "Equipamentos e implementos.",
        path: "/equipamentos",
        icon: "🚜",
        enabled: true,
      },
      {
        label: "Checklists",
        description: "Pré-operacional e segurança.",
        path: "/servicos",
        icon: "✅",
        enabled: true,
      },
    ],
  },
  {
    key: "agronomia",
    label: "Agronomia",
    description: "Solo, chuva, manejo e resultados.",
    icon: "🧪",
    colorClass: "border-sky-800 bg-sky-950/30",
    items: [
      {
        label: "Chuva",
        description: "Registros e pluviômetros.",
        path: "/chuva",
        icon: "🌧️",
        enabled: true,
      },
      {
        label: "Solo",
        description: "Análises físicas e químicas.",
        path: "/agronomia",
        icon: "🧱",
        enabled: true,
      },
      {
        label: "Manejo",
        description: "Plano e decisões agronômicas.",
        path: "/manejo",
        icon: "🌾",
        enabled: true,
      },
      {
        label: "Produtividade",
        description: "Resultados e mapas de colheita.",
        path: "/agronomia",
        icon: "📈",
        enabled: true,
      },
    ],
  },
  {
    key: "inteligencia",
    label: "Inteligência",
    description: "Memória, aprendizado e recomendações.",
    icon: "🧠",
    colorClass: "border-violet-800 bg-violet-950/30",
    items: [
      {
        label: "Memória Agronômica",
        description: "Histórico permanente da área.",
        path: "/inteligencia",
        icon: "🧬",
        enabled: true,
      },
      {
        label: "Aprendizados",
        description: "Padrões encontrados pelo sistema.",
        path: "/inteligencia",
        icon: "📚",
        enabled: true,
      },
      {
        label: "Recomendações",
        description: "Sugestões técnicas explicáveis.",
        path: "/inteligencia",
        icon: "💡",
        enabled: true,
      },
      {
        label: "Explicabilidade",
        description: "Por que o sistema recomenda.",
        path: "/inteligencia",
        icon: "🔎",
        enabled: true,
      },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    description: "Insumos, custos e suporte.",
    icon: "⚙️",
    colorClass: "border-zinc-700 bg-zinc-900/60",
    items: [
      {
        label: "Estoque",
        description: "Produtos e movimentações.",
        path: "/estoque",
        icon: "📦",
        enabled: true,
      },
      {
        label: "Combustível",
        description: "Abastecimentos e horímetros.",
        path: "/combustivel",
        icon: "⛽",
        enabled: true,
      },
      {
        label: "Manutenção",
        description: "Planos e manutenções.",
        path: "/manutencao",
        icon: "🔧",
        enabled: true,
      },
      {
        label: "Admin",
        description: "Suporte e integridade.",
        path: "/admin",
        icon: "🛠️",
        enabled: true,
      },
    ],
  },
];

export function getEnabledPillars(): AppPillarConfig[] {
  return APP_PILLARS.map((pillar) => ({
    ...pillar,
    items: pillar.items.filter((item) => item.enabled),
  }));
}