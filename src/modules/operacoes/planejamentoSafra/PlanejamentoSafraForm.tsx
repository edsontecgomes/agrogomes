import React, { useState } from "react";
import { criarPlanejamentoComOrdens } from "./criarPlanejamentoComOrdens";
import { CulturaSafra } from "./types";

type TalhaoResumo = {
  id: string;
  nome?: string;
};

type PlanejamentoSafraFormProps = {
  farmId: string;
  producerId: string;
  talhoes: TalhaoResumo[];
};

export function PlanejamentoSafraForm({
  farmId,
  producerId,
  talhoes,
}: PlanejamentoSafraFormProps) {
  const [talhaoId, setTalhaoId] = useState("");
  const [nome, setNome] = useState("");
  const [anoAgricola, setAnoAgricola] = useState("2026/2027");
  const [cultura, setCultura] = useState<CulturaSafra>("soja");
  const [variedade, setVariedade] = useState("");
  const [populacaoPlantasHa, setPopulacaoPlantasHa] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (!talhaoId || !nome) {
      alert("Informe o nome da safra e o talhão.");
      return;
    }

    setLoading(true);

    try {
      await criarPlanejamentoComOrdens({
        producerId,
        farmId,
        talhaoId,
        nome,
        anoAgricola,
        cultura,
        variedade,
        populacaoPlantasHa: Number(populacaoPlantasHa || 0),
        status: "planejada",
      });

      alert("Planejamento criado e ordens programadas geradas.");
      setNome("");
      setTalhaoId("");
      setVariedade("");
      setPopulacaoPlantasHa("");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar planejamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Planejamento de Safra</h2>
        <p className="text-sm text-slate-500">
          Crie uma safra e gere automaticamente as ordens iniciais.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Nome da safra"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Ano agrícola"
          value={anoAgricola}
          onChange={(e) => setAnoAgricola(e.target.value)}
        />

        <select
          className="border rounded-xl px-3 py-2"
          value={talhaoId}
          onChange={(e) => setTalhaoId(e.target.value)}
        >
          <option value="">Selecione o talhão</option>
          {talhoes.map((talhao) => (
            <option key={talhao.id} value={talhao.id}>
              {talhao.nome || talhao.id}
            </option>
          ))}
        </select>

        <select
          className="border rounded-xl px-3 py-2"
          value={cultura}
          onChange={(e) => setCultura(e.target.value as CulturaSafra)}
        >
          <option value="soja">Soja</option>
          <option value="milho">Milho</option>
          <option value="sorgo">Sorgo</option>
          <option value="arroz">Arroz</option>
          <option value="feijao">Feijão</option>
          <option value="algodao">Algodão</option>
          <option value="pastagem">Pastagem</option>
          <option value="outra">Outra</option>
        </select>

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="Variedade / híbrido"
          value={variedade}
          onChange={(e) => setVariedade(e.target.value)}
        />

        <input
          className="border rounded-xl px-3 py-2"
          placeholder="População plantas/ha"
          value={populacaoPlantasHa}
          onChange={(e) => setPopulacaoPlantasHa(e.target.value)}
        />
      </div>

      <button
        onClick={salvar}
        disabled={loading}
        className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Criar safra e gerar ordens"}
      </button>
    </div>
  );
}