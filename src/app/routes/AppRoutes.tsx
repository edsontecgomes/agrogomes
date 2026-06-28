import { Routes, Route } from "react-router-dom";

import { useFarm } from "../../contexts/FarmContext";

import { MobileHome } from "../../components/navigation";
import { ChuvaDashboard } from "../../modules/chuva/ChuvaDashboard";
import { TalhoesDashboard } from "../../modules/talhoes/TalhoesDashboard";
import { ServicosDashboard } from "../../modules/servicos/ServicosDashboard";
import { AgronomiaHub } from "../../modules/agronomia/AgronomiaHub";
import { FarmIntegrityDebug } from "../../modules/admin/FarmIntegrityDebug";

function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white">
      <p className="text-sm text-emerald-400">Gestão Agro</p>

      <h1 className="mt-1 text-2xl font-bold">{title}</h1>

      {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
    </main>
  );
}

function FarmRequiredPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-white">
      <p className="text-sm text-emerald-400">Gestão Agro</p>

      <h1 className="mt-1 text-2xl font-bold">Selecione uma fazenda</h1>

      <p className="mt-2 text-sm text-zinc-400">
        Para acessar este módulo, primeiro selecione uma fazenda ativa.
      </p>
    </main>
  );
}

export function AppRoutes() {
  const farmContext = useFarm() as unknown as {
    activeFarmId?: string;
    farmId?: string;
    selectedFarmId?: string;
    currentFarmId?: string;
  };

  const farmId =
    farmContext.activeFarmId ??
    farmContext.farmId ??
    farmContext.selectedFarmId ??
    farmContext.currentFarmId ??
    "";

  return (
    <Routes>
      <Route path="/" element={<MobileHome />} />

      <Route
        path="/fazenda"
        element={
          <PlaceholderPage
            title="Fazenda"
            subtitle="Estrutura da fazenda, equipe e dados principais."
          />
        }
      />

      <Route
        path="/talhoes"
        element={
          farmId ? <TalhoesDashboard farmId={farmId} /> : <FarmRequiredPage />
        }
      />

      <Route
        path="/ciclo"
        element={
          <PlaceholderPage
            title="Ciclo Agronômico"
            subtitle="Safra, cultura, variedade e objetivo produtivo."
          />
        }
      />

      <Route
        path="/manejo"
        element={
          <PlaceholderPage
            title="Plano de Manejo"
            subtitle="Estratégia técnica e decisões agronômicas."
          />
        }
      />

      <Route
        path="/chuva"
        element={
          farmId ? <ChuvaDashboard farmId={farmId} /> : <FarmRequiredPage />
        }
      />

      <Route
        path="/servicos"
        element={
          farmId ? <ServicosDashboard farmId={farmId} /> : <FarmRequiredPage />
        }
      />

      <Route path="/agronomia" element={<AgronomiaHub />} />

      <Route
        path="/inteligencia"
        element={
          <PlaceholderPage
            title="Inteligência"
            subtitle="Memória Agronômica, aprendizados e recomendações."
          />
        }
      />

      <Route path="/admin" element={<FarmIntegrityDebug />} />

      <Route
        path="*"
        element={
          <PlaceholderPage
            title="Página não encontrada"
            subtitle="Volte para o início do Gestão Agro."
          />
        }
      />
    </Routes>
  );
}