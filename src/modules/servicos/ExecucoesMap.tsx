import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Filter,
  Layers3,
  Navigation,
  X,
} from "lucide-react";

import { useSegmentosExecucao } from "../../hooks/useSegmentos";
import { useTodasExecucoesServico } from "../../hooks/useServicos";
import { useUsuarios } from "../../hooks/useUsuarios";
import { loadGoogleMaps } from "../../services/googleMaps";
import { Estoque, Usuario } from "../../types";
import { buscarUEIsDaFazenda } from "../motorEspacial/buscarUEIsDaFazenda";
import { buscarUEIsDoTalhao } from "../motorEspacial/buscarUEIsDoTalhao";
import {
  ControleCamadaUEIGoogleMaps,
  criarCamadaUEIGoogleMaps,
} from "../motorEspacial/camadaUEIGoogleMaps";
import { UEIEspacial } from "../motorEspacial/types";

interface ExecucoesMapProps {
  farmId: string;
  usuarios?: Usuario[];
  estoque?: Estoque[];
  talhaoId?: string;
  showAll?: boolean;
}

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#0891b2",
  "#be123c",
];

const OPERATOR_COLORS: Record<string, string> = {};

function getOperatorColor(operatorId: string) {
  if (!OPERATOR_COLORS[operatorId]) {
    OPERATOR_COLORS[operatorId] =
      COLORS[
        Object.keys(OPERATOR_COLORS).length % COLORS.length
      ];
  }

  return OPERATOR_COLORS[operatorId];
}

function criarInfoExecucao(
  titulo: string,
  linhas: Array<[string, string]>,
): HTMLDivElement {
  const conteudo = document.createElement("div");

  conteudo.style.padding = "8px";
  conteudo.style.color = "#0f172a";
  conteudo.style.fontFamily = "sans-serif";
  conteudo.style.minWidth = "170px";

  const cabecalho = document.createElement("strong");

  cabecalho.textContent = titulo;
  cabecalho.style.display = "block";
  cabecalho.style.marginBottom = "6px";

  conteudo.appendChild(cabecalho);

  linhas.forEach(([rotulo, valor]) => {
    const linha = document.createElement("div");

    linha.style.fontSize = "12px";
    linha.style.marginTop = "3px";

    const nome = document.createElement("span");

    nome.textContent = `${rotulo}: `;
    nome.style.color = "#64748b";

    const dado = document.createElement("strong");

    dado.textContent = valor;

    linha.append(nome, dado);
    conteudo.appendChild(linha);
  });

  return conteudo;
}

export function ExecucoesMap({
  farmId,
  usuarios: usuariosProp,
  talhaoId,
}: ExecucoesMapProps) {
  const {
    execucoes,
    loading: loadingExecs,
  } = useTodasExecucoesServico(farmId);

  const {
    segmentos,
    loading: loadingSegments,
  } = useSegmentosExecucao(farmId);

  const {
    usuarios: usuariosHook,
    loading: loadingUsers,
  } = useUsuarios(farmId);

  const usuarios = usuariosProp ?? usuariosHook;

  const [filterDataInicio, setFilterDataInicio] =
    useState("");

  const [filterDataFim, setFilterDataFim] =
    useState("");

  const [filterOperador, setFilterOperador] =
    useState("");

  const [showFullTracks, setShowFullTracks] =
    useState(true);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [ueis, setUeis] =
    useState<UEIEspacial[]>([]);

  const [loadingUeis, setLoadingUeis] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const mapContainerRef =
    useRef<HTMLDivElement>(null);

  const polylinesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);

  const camadaUEIRef =
    useRef<ControleCamadaUEIGoogleMaps | null>(null);

  const filteredExecucoes = useMemo(() => {
    return execucoes.filter((execucao) => {
      if (
        talhaoId &&
        execucao.talhaoId !== talhaoId
      ) {
        return false;
      }

      if (filterDataInicio) {
        const inicio =
          new Date(filterDataInicio);

        const dataExecucao =
          execucao.dataInicio ??
          execucao.createdAt;

        if (dataExecucao < inicio) {
          return false;
        }
      }

      if (filterDataFim) {
        const fim = new Date(filterDataFim);

        fim.setHours(23, 59, 59, 999);

        const dataExecucao =
          execucao.dataInicio ??
          execucao.createdAt;

        if (dataExecucao > fim) {
          return false;
        }
      }

      if (
        filterOperador &&
        execucao.operadorId !== filterOperador
      ) {
        return false;
      }

      return true;
    });
  }, [
    execucoes,
    filterDataFim,
    filterDataInicio,
    filterOperador,
    talhaoId,
  ]);

  const filteredSegments = useMemo(() => {
    return segmentos.filter((segmento) => {
      if (
        talhaoId &&
        segmento.talhaoId !== talhaoId
      ) {
        return false;
      }

      if (
        filterOperador &&
        segmento.operadorId !== filterOperador
      ) {
        return false;
      }

      const execucao = execucoes.find(
        (item) =>
          item.id === segmento.execucaoId,
      );

      if (!execucao) {
        return false;
      }

      const dataExecucao =
        execucao.dataInicio ??
        execucao.createdAt;

      if (
        filterDataInicio &&
        dataExecucao <
          new Date(filterDataInicio)
      ) {
        return false;
      }

      if (filterDataFim) {
        const fim =
          new Date(filterDataFim);

        fim.setHours(23, 59, 59, 999);

        if (dataExecucao > fim) {
          return false;
        }
      }

      return true;
    });
  }, [
    segmentos,
    talhaoId,
    filterOperador,
    execucoes,
    filterDataInicio,
    filterDataFim,
  ]);

  const distanceByOperator = useMemo(() => {
    const distancias: Record<string, number> = {};

    filteredSegments.forEach((segmento) => {
      const distancia =
        segmento.metadata?.distanciaPercorrida ??
        0;

      distancias[segmento.operadorId] =
        (distancias[segmento.operadorId] ?? 0) +
        distancia;
    });

    return distancias;
  }, [filteredSegments]);

  const center = useMemo(() => {
    const primeiraExecucao =
      filteredExecucoes.find(
        (execucao) => execucao.path?.length,
      );

    if (primeiraExecucao?.path?.length) {
      return {
        lat: primeiraExecucao.path[0].lat,
        lng: primeiraExecucao.path[0].lng,
      };
    }

    const primeiraUei = ueis[0];

    if (primeiraUei?.centroide) {
      return primeiraUei.centroide;
    }

    if (primeiraUei?.geometria.length) {
      return primeiraUei.geometria[0];
    }

    return {
      lat: -14.235,
      lng: -51.925,
    };
  }, [filteredExecucoes, ueis]);

  useEffect(() => {
    let active = true;

    setLoadingUeis(true);

    const carregar = talhaoId
      ? buscarUEIsDoTalhao(
          farmId,
          talhaoId,
        )
      : buscarUEIsDaFazenda(farmId);

    carregar
      .then((resultado) => {
        if (active) {
          setUeis(resultado);
          setLoadingUeis(false);
        }
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar UEIs:",
          erro,
        );

        if (active) {
          setUeis([]);
          setLoadingUeis(false);
        }
      });

    return () => {
      active = false;
    };
  }, [farmId, talhaoId]);

  useEffect(() => {
    let active = true;

    const limparDesenhos = () => {
      camadaUEIRef.current?.limpar();
      camadaUEIRef.current = null;

      polylinesRef.current.forEach(
        (polyline) => polyline.setMap(null),
      );

      polylinesRef.current = [];

      markersRef.current.forEach(
        (marker) => marker.setMap(null),
      );

      markersRef.current = [];
    };

    loadGoogleMaps()
      .then((google) => {
        if (
          !active ||
          !mapContainerRef.current
        ) {
          return;
        }

        setError(null);
        limparDesenhos();

        const mapa = new google.maps.Map(
          mapContainerRef.current,
          {
            center,
            zoom: talhaoId ? 16 : 14,
            mapTypeId: "satellite",
            disableDefaultUI: false,
            fullscreenControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true,
          },
        );

        camadaUEIRef.current =
          criarCamadaUEIGoogleMaps(
            google,
            mapa,
            ueis,
            {
              ajustarEnquadramento:
                Boolean(talhaoId) &&
                ueis.length > 0,
            },
          );

        if (showFullTracks) {
          filteredExecucoes.forEach(
            (execucao) => {
              if (
                !execucao.path ||
                execucao.path.length < 2
              ) {
                return;
              }

              const polyline =
                new google.maps.Polyline({
                  path: execucao.path.map(
                    (ponto) => ({
                      lat: ponto.lat,
                      lng: ponto.lng,
                    }),
                  ),
                  geodesic: true,
                  strokeColor:
                    getOperatorColor(
                      execucao.operadorId,
                    ),
                  strokeOpacity: 0.45,
                  strokeWeight: 3,
                  zIndex: 6,
                  map: mapa,
                });

              polylinesRef.current.push(
                polyline,
              );
            },
          );
        }

        filteredSegments.forEach(
          (segmento) => {
            if (
              !segmento.pontos ||
              segmento.pontos.length < 2
            ) {
              return;
            }

            const polyline =
              new google.maps.Polyline({
                path: segmento.pontos.map(
                  (ponto) => ({
                    lat: ponto.lat,
                    lng: ponto.lng,
                  }),
                ),
                geodesic: true,
                strokeColor:
                  getOperatorColor(
                    segmento.operadorId,
                  ),
                strokeOpacity: 1,
                strokeWeight: 6,
                zIndex: 7,
                map: mapa,
              });

            const operador =
              usuarios.find(
                (usuario) =>
                  usuario.id ===
                  segmento.operadorId,
              )?.nome ?? "Operador";

            const infoWindow =
              new google.maps.InfoWindow({
                content: criarInfoExecucao(
                  operador,
                  [
                    [
                      "Distância",
                      `${(
                        segmento.metadata
                          ?.distanciaPercorrida ??
                        0
                      ).toFixed(0)} m`,
                    ],
                    [
                      "Velocidade",
                      `${(
                        segmento.metadata
                          ?.velocidadeMedia ??
                        0
                      ).toFixed(1)} km/h`,
                    ],
                  ],
                ),
              });

            polyline.addListener(
              "click",
              (evento: any) => {
                infoWindow.setPosition(
                  evento.latLng,
                );

                infoWindow.open(mapa);
              },
            );

            polylinesRef.current.push(
              polyline,
            );
          },
        );

        filteredExecucoes.forEach(
          (execucao) => {
            if (
              execucao.status !==
                "em_execucao" ||
              !execucao.path?.length
            ) {
              return;
            }

            const ultimoPonto =
              execucao.path[
                execucao.path.length - 1
              ];

            const operador =
              execucao.operadorNome ??
              "Operador";

            const marker =
              new google.maps.Marker({
                position: {
                  lat: ultimoPonto.lat,
                  lng: ultimoPonto.lng,
                },
                map: mapa,
                title: operador,
                zIndex: 10,
                icon: {
                  path:
                    google.maps.SymbolPath
                      .CIRCLE,
                  scale: 8,
                  fillColor:
                    getOperatorColor(
                      execucao.operadorId,
                    ),
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                },
              });

            const infoWindow =
              new google.maps.InfoWindow({
                content: criarInfoExecucao(
                  operador,
                  [
                    [
                      "Status",
                      "Execução ativa",
                    ],
                  ],
                ),
              });

            marker.addListener(
              "click",
              () => {
                infoWindow.open(
                  mapa,
                  marker,
                );
              },
            );

            markersRef.current.push(
              marker,
            );
          },
        );
      })
      .catch((erro) => {
        console.error(
          "Erro ao carregar Google Maps:",
          erro,
        );

        if (active) {
          setError(
            "Erro ao carregar o Google Maps.",
          );
        }
      });

    return () => {
      active = false;
      limparDesenhos();
    };
  }, [
    center,
    filteredExecucoes,
    filteredSegments,
    showFullTracks,
    talhaoId,
    ueis,
    usuarios,
  ]);

  const loading =
    loadingExecs ||
    loadingSegments ||
    loadingUeis ||
    (!usuariosProp && loadingUsers);

  return (
    <div className="relative h-full min-h-[500px] w-full overflow-hidden bg-slate-950">
      <div
        ref={mapContainerRef}
        className="h-full w-full"
      />

      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xl">
            Carregando mapa operacional...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white p-6 text-center font-semibold text-rose-600">
          {error}
        </div>
      )}

      <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setFiltersOpen(
              (aberto) => !aberto,
            )
          }
          className="flex items-center gap-2 rounded-xl border border-white/30 bg-slate-950/80 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md"
        >
          {filtersOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Filter className="h-4 w-4" />
          )}

          {filtersOpen
            ? "Fechar"
            : "Filtros"}
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-slate-950/80 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
          <Layers3 className="h-4 w-4 text-emerald-300" />

          {ueis.length} UEI
          {ueis.length === 1 ? "" : "s"}
        </div>
      </div>

      {filtersOpen && (
        <aside className="absolute left-3 right-3 top-14 z-20 max-h-[calc(100%-5rem)] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:right-auto sm:w-[360px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800">
                Visualização operacional
              </h3>

              <p className="text-xs text-slate-500">
                Filtre rastros sem esconder o
                mapa.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(false)
              }
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Período inicial
              </span>

              <input
                type="date"
                value={filterDataInicio}
                onChange={(evento) =>
                  setFilterDataInicio(
                    evento.target.value,
                  )
                }
                className="w-full rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Período final
              </span>

              <input
                type="date"
                value={filterDataFim}
                onChange={(evento) =>
                  setFilterDataFim(
                    evento.target.value,
                  )
                }
                className="w-full rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Operador
              </span>

              <select
                value={filterOperador}
                onChange={(evento) =>
                  setFilterOperador(
                    evento.target.value,
                  )
                }
                className="w-full rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">
                  Todos os operadores
                </option>

                {usuarios.map((usuario) => (
                  <option
                    key={usuario.id}
                    value={usuario.id}
                  >
                    {usuario.nome ??
                      usuario.name ??
                      "Operador"}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                Mostrar rastro completo
              </span>

              <input
                type="checkbox"
                checked={showFullTracks}
                onChange={(evento) =>
                  setShowFullTracks(
                    evento.target.checked,
                  )
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {Object.entries(
              distanceByOperator,
            ).length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {Object.entries(
                  distanceByOperator,
                ).map(
                  ([
                    operadorId,
                    distancia,
                  ]) => (
                    <div
                      key={operadorId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-6 w-1.5 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              getOperatorColor(
                                operadorId,
                              ),
                          }}
                        />

                        <span className="truncate text-xs font-bold text-slate-700">
                          {usuarios.find(
                            (usuario) =>
                              usuario.id ===
                              operadorId,
                          )?.nome ??
                            "Operador"}
                        </span>
                      </div>

                      <strong className="text-xs text-slate-800">
                        {(
                          distancia / 1000
                        ).toFixed(2)}{" "}
                        km
                      </strong>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      <div className="absolute bottom-3 left-3 z-10 rounded-xl border border-white/30 bg-slate-950/80 px-3 py-2 text-[10px] font-bold text-white shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-white" />
          Limite da UEI
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Navigation className="h-3 w-3 text-blue-400" />
          Rastro operacional
        </div>
      </div>
    </div>
  );
}