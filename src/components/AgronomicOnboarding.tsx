import React from "react";
import { motion } from "motion/react";
import {
  Database,
  BarChart3,
  Settings,
  CloudRain,
  Layers,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    title: "Solo",
    description:
      "Amostragem georreferenciada para entender a fertilidade de cada ponto.",
    icon: Database,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Produtividade",
    description:
      "Mapas de colheita que revelam o potencial real de cada hectare.",
    icon: BarChart3,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Manejo",
    description:
      "Registro de todas as operações: plantio, adubação e pulverização.",
    icon: Settings,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Chuva",
    description:
      "Monitoramento pluviométrico local para correlação hídrica.",
    icon: CloudRain,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Compactação",
    description:
      "Análise da condição física do solo para garantir o crescimento radicular.",
    icon: Layers,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Resultado",
    description:
      "Cruzamento de dados para gerar modelos de resposta produtiva otimizados.",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
  },
];

export function AgronomicOnboarding() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Inteligência Agronômica Eqtara
        </h2>

        <p className="text-slate-600 max-w-2xl mx-auto">
          Entenda como transformamos dados de campo em modelos de alta
          produtividade para sua fazenda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div
              className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <step.icon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {step.title}
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed">
              {step.description}
            </p>

            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-200">
                <ChevronRight className="w-6 h-6" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-emerald-900 rounded-3xl text-white text-center">
        <h3 className="text-xl font-bold mb-2">
          O ciclo da produtividade
        </h3>

        <p className="text-emerald-100/80 text-sm max-w-xl mx-auto">
          Quanto mais dados você registra, mais precisos se tornam os modelos
          de recomendação por hectare.
        </p>
      </div>
    </div>
  );
}