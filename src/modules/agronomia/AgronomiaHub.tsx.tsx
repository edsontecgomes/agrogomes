import {
  BarChart3,
  Brain,
  CloudRain,
  History,
  Map,
  Sprout,
  TestTube2,
} from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { Section } from "../../components/layout/Section";
import { ModuleCard } from "../../components/navigation/ModuleCard";
import { SectionGrid } from "../../components/navigation/SectionGrid";

type AgronomiaHubProps = {
  onOpenModule: (moduleId: string) => void;
};

export function AgronomiaHub({ onOpenModule }: AgronomiaHubProps) {
  return (
    <PageContainer
      title="Agronomia IA"
      subtitle="Central de análise agronômica para solo, chuvas, talhões, produtividade e recomendações inteligentes."
    >
      <Section
        title="Análises principais"
        subtitle="Escolha uma área para analisar dados e tomar decisões no campo."
      >
        <SectionGrid columns={3}>
          <ModuleCard
            title="Solo"
            description="Análise física, química, compactação, fertilidade e camadas do perfil do solo."
            icon={<TestTube2 className="w-6 h-6" />}
            badge="Em breve"
            disabled
            onClick={() => {}}
          />

          <ModuleCard
            title="Chuvas"
            description="Histórico pluviométrico, acumulados por talhão e relação com produtividade."
            icon={<CloudRain className="w-6 h-6" />}
            onClick={() => onOpenModule("chuvas")}
          />

          <ModuleCard
            title="Talhões"
            description="Visualização dos talhões, áreas, mapas e histórico agronômico."
            icon={<Map className="w-6 h-6" />}
            onClick={() => onOpenModule("talhoes")}
          />

          <ModuleCard
            title="Produtividade"
            description="Mapas de colheita, zonas de alta e baixa resposta e comparativos por safra."
            icon={<BarChart3 className="w-6 h-6" />}
            badge="Em breve"
            disabled
            onClick={() => {}}
          />

          <ModuleCard
            title="Histórico de Manejo"
            description="Linha do tempo com operações, chuvas, aplicações, plantio e colheita por talhão."
            icon={<History className="w-6 h-6" />}
            badge="Em breve"
            disabled
            onClick={() => {}}
          />

          <ModuleCard
            title="Recomendações IA"
            description="Sugestões inteligentes com base em solo, clima, manejo, variedade e produtividade."
            icon={<Brain className="w-6 h-6" />}
            badge="Futuro"
            disabled
            onClick={() => {}}
          />
        </SectionGrid>
      </Section>

      <Section
        title="Visão proposta"
        subtitle="O objetivo é transformar dados soltos em decisões agronômicas práticas."
        className="mt-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
            <Sprout className="w-6 h-6 mb-2" />
            <p className="text-sm font-bold">Ambiente produtivo</p>
            <p className="text-sm mt-1 text-emerald-700">
              Cruzar solo, chuva, variedade e manejo.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-slate-800">
            <BarChart3 className="w-6 h-6 mb-2" />
            <p className="text-sm font-bold">Curva resposta</p>
            <p className="text-sm mt-1 text-slate-600">
              Avaliar produtividade por insumo, chuva e condição do talhão.
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
            <Brain className="w-6 h-6 mb-2" />
            <p className="text-sm font-bold">IA Agronômica</p>
            <p className="text-sm mt-1 text-amber-700">
              Gerar recomendações objetivas para a próxima safra.
            </p>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}