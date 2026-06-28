import { Routes, Route } from "react-router-dom";

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
      <p className="text-sm text-emerald-400">
        Gestão Agro
      </p>

      <h1 className="mt-1 text-2xl font-bold">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-sm text-zinc-400">
          {subtitle}
        </p>
      )}
    </main>
  );
}

export function AppRoutes() {
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

      <Route path="/talhoes" element={<TalhoesDashboard />} />

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

      <Route path="/chuva" element={<ChuvaDashboard />} />

      <Route path="/servicos" element={<ServicosDashboard />} />

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