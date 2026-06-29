import { useMemo, useState } from "react";
import {
  calcularAreaTalhaoHa,
  calcularPerimetroTalhao,
  criarPontoTalhao,
  gerarGridSimplificado1Ha,
} from "../../utils/talhaoDrawingUtils";
import { TalhaoDrawingPoint } from "../../types/talhaoDrawing";

interface MobileTalhaoDrawingMapProps {
  onCancel: () => void;
  onSave: (params: {
    nome: string;
    points: TalhaoDrawingPoint[];
    areaHa: number;
  }) => void;
}

const MOCK_CENTER = {
  latitude: -2.4431,
  longitude: -54.7089,
};

export function MobileTalhaoDrawingMap({
  onCancel,
  onSave,
}: MobileTalhaoDrawingMapProps) {
  const [points, setPoints] = useState<TalhaoDrawingPoint[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [nome, setNome] = useState("Talhão 01");

  const areaHa = useMemo(() => calcularAreaTalhaoHa(points), [points]);
  const perimetroM = useMemo(() => calcularPerimetroTalhao(points), [points]);

  const gridCells = useMemo(
    () => (isClosed ? gerarGridSimplificado1Ha(points) : []),
    [isClosed, points]
  );

  function addPointByTouch(event: React.MouseEvent<HTMLDivElement>) {
    if (isClosed) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    const latitude = MOCK_CENTER.latitude + (0.01 - yRatio * 0.02);
    const longitude = MOCK_CENTER.longitude + (xRatio * 0.02 - 0.01);

    setPoints((current) => [
      ...current,
      criarPontoTalhao(latitude, longitude),
    ]);
  }

  function desfazer() {
    if (isClosed) {
      setIsClosed(false);
      return;
    }

    setPoints((current) => current.slice(0, -1));
  }

  function limpar() {
    setPoints([]);
    setIsClosed(false);
  }

  function fecharPoligono() {
    if (points.length < 3) return;
    setIsClosed(true);
  }

  function salvar() {
    if (!isClosed || points.length < 3) return;

    onSave({
      nome,
      points,
      areaHa,
    });
  }

  return (
    <div className="fixed inset-0 z-[999] bg-zinc-950 text-white">
      <div
        onClick={addPointByTouch}
        className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_center,_#14532d,_#052e16_45%,_#020617)]"
      >
        <div className="absolute left-4 top-4 right-4 z-20 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
            className="rounded-2xl bg-black/70 px-4 py-3 text-sm"
          >
            ←
          </button>

          <div className="rounded-2xl bg-black/70 px-5 py-3 text-center">
            <input
              value={nome}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setNome(event.target.value)}
              className="w-40 bg-transparent text-center text-base font-bold outline-none"
            />

            <p className="text-xs text-zinc-300">
              {isClosed ? "Grid de 1 ha gerado" : "Desenhe as bordaduras"}
            </p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCancel();
            }}
            className="rounded-2xl bg-black/70 px-4 py-3 text-sm"
          >
            Cancelar
          </button>
        </div>

        <svg className="absolute inset-0 h-full w-full">
          {points.length > 1 && (
            <polyline
              points={points
                .map((point) => {
                  const x =
                    ((point.longitude - (MOCK_CENTER.longitude - 0.01)) /
                      0.02) *
                    window.innerWidth;

                  const y =
                    ((MOCK_CENTER.latitude + 0.01 - point.latitude) /
                      0.02) *
                    window.innerHeight;

                  return `${x},${y}`;
                })
                .join(" ")}
              fill="rgba(34,197,94,0.22)"
              stroke="#86efac"
              strokeWidth="3"
            />
          )}

          {isClosed &&
            gridCells.map((cell) => {
              const x1 =
                ((cell.bounds.west - (MOCK_CENTER.longitude - 0.01)) /
                  0.02) *
                window.innerWidth;

              const x2 =
                ((cell.bounds.east - (MOCK_CENTER.longitude - 0.01)) /
                  0.02) *
                window.innerWidth;

              const y1 =
                ((MOCK_CENTER.latitude + 0.01 - cell.bounds.north) /
                  0.02) *
                window.innerHeight;

              const y2 =
                ((MOCK_CENTER.latitude + 0.01 - cell.bounds.south) /
                  0.02) *
                window.innerHeight;

              return (
                <rect
                  key={cell.id}
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  fill="rgba(255,255,255,0.05)"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1"
                />
              );
            })}

          {points.map((point) => {
            const x =
              ((point.longitude - (MOCK_CENTER.longitude - 0.01)) / 0.02) *
              window.innerWidth;

            const y =
              ((MOCK_CENTER.latitude + 0.01 - point.latitude) / 0.02) *
              window.innerHeight;

            return (
              <circle
                key={point.id}
                cx={x}
                cy={y}
                r="6"
                fill="#ffffff"
                stroke="#86efac"
                strokeWidth="3"
              />
            );
          })}
        </svg>

        <div className="absolute left-4 top-28 z-20 rounded-2xl bg-black/70 p-4 text-sm">
          <p className="text-zinc-300">
            {isClosed
              ? "Revise o grid antes de salvar"
              : "Toque no mapa para adicionar pontos"}
          </p>

          <p className="mt-3 text-emerald-400">
            Pontos: {points.length}
          </p>
        </div>

        <div className="absolute bottom-28 left-4 z-20 rounded-2xl bg-black/70 p-4">
          <p className="text-xs text-zinc-400">Área bruta</p>
          <p className="text-2xl font-bold text-emerald-400">
            {areaHa.toFixed(2)} ha
          </p>

          <p className="mt-2 text-xs text-zinc-400">
            Perímetro: {perimetroM} m
          </p>

          {isClosed && (
            <p className="mt-2 text-xs text-zinc-300">
              Células: {gridCells.length}
            </p>
          )}
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-20 flex gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              desfazer();
            }}
            className="flex-1 rounded-2xl bg-zinc-800 py-4 text-sm font-semibold"
          >
            Desfazer
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              limpar();
            }}
            className="flex-1 rounded-2xl bg-zinc-800 py-4 text-sm font-semibold"
          >
            Limpar
          </button>

          {!isClosed ? (
            <button
              type="button"
              disabled={points.length < 3}
              onClick={(event) => {
                event.stopPropagation();
                fecharPoligono();
              }}
              className="flex-[1.4] rounded-2xl bg-emerald-600 py-4 text-sm font-semibold disabled:opacity-40"
            >
              Fechar polígono
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                salvar();
              }}
              className="flex-[1.4] rounded-2xl bg-emerald-600 py-4 text-sm font-semibold"
            >
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}