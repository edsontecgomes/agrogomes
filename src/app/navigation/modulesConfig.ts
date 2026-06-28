import { AppModuleConfig } from "../../types/appNavigation";

export const APP_MODULES: AppModuleConfig[] = [
  {
    key: "inicio",
    label: "Início",
    description: "Resumo da fazenda e atividades principais.",
    path: "/",
    icon: "🏠",
    enabled: true,
    mobilePriority: 1,
  },
  {
    key: "fazenda",
    label: "Fazenda",
    description: "Dados da fazenda, equipe e estrutura.",
    path: "/fazenda",
    icon: "🌱",
    enabled: true,
    mobilePriority: 2,
  },
  {
    key: "talhoes",
    label: "Talhões",
    description: "Áreas, mapas e histórico dos talhões.",
    path: "/talhoes",
    icon: "🗺️",
    enabled: true,
    mobilePriority: 3,
  },
  {
    key: "ciclo",
    label: "Ciclo",
    description: "Safra, cultura, variedade e objetivo produtivo.",
    path: "/ciclo",
    icon: "🔄",
    enabled: true,
    mobilePriority: 4,
  },
  {
    key: "manejo",
    label: "Manejo",
    description: "Plano de manejo e decisões agronômicas.",
    path: "/manejo",
    icon: "📋",
    enabled: true,
    mobilePriority: 5,
  },
  {
    key: "chuva",
    label: "Chuva",
    description: "Registro de chuvas e pluviômetros.",
    path: "/chuva",
    icon: "🌧️",
    enabled: true,
    mobilePriority: 6,
  },
  {
    key: "operacoes",
    label: "Operações",
    description: "Ordens de serviço, execução e campo.",
    path: "/servicos",
    icon: "🚜",
    enabled: true,
    mobilePriority: 7,
  },
  {
    key: "agronomia",
    label: "Agronomia",
    description: "Solo, produtividade, ambiente e análises.",
    path: "/agronomia",
    icon: "🧪",
    enabled: true,
    mobilePriority: 8,
  },
  {
    key: "inteligencia",
    label: "Inteligência",
    description: "Memória Agronômica, recomendações e aprendizados.",
    path: "/inteligencia",
    icon: "🧠",
    enabled: true,
    mobilePriority: 9,
  },
  {
    key: "admin",
    label: "Admin",
    description: "Suporte, integridade e implantação assistida.",
    path: "/admin",
    icon: "⚙️",
    enabled: true,
    mobilePriority: 10,
  },
];

export function getMobileModules() {
  return APP_MODULES.filter((module) => module.enabled).sort(
    (a, b) => a.mobilePriority - b.mobilePriority
  );
}