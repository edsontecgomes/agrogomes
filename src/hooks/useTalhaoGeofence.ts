import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

import { OrdemServico, Talhao } from '../types';
import {
  useMinhasExecucoesAtivas,
  useOrdensServico
} from './useServicos';
import { useTalhoes } from './useTalhoes';
import { criarBufferInternoMetros } from '../modules/geometria/buffer/criarBufferInterno';
import { criarPoligonoTurf } from '../modules/geometria';

type CoordenadaTalhao = {
  lat: number;
  lng: number;
};

export type GeofenceStatus =
  | 'inativo'
  | 'aguardando_gps'
  | 'gps_indisponivel'
  | 'gps_impreciso'
  | 'sem_limite_seguro'
  | 'fora_area_segura'
  | 'sem_ordem'
  | 'execucao_ativa'
  | 'sugestao_disponivel'
  | 'sugestao_ignorada';

type LocalizacaoGeofence = {
  lat: number;
  lng: number;
  accuracy: number;
};

const DISTANCIA_SEGURA_METROS = 20;
const PRECISAO_MAXIMA_GPS_METROS = 20;

function coordenadasValidas(
  valor: unknown
): valor is CoordenadaTalhao[] {
  return (
    Array.isArray(valor) &&
    valor.length >= 3 &&
    valor.every(
      coordenada =>
        Number.isFinite(coordenada?.lat) &&
        Number.isFinite(coordenada?.lng)
    )
  );
}

function obterCoordenadasGeoJson(
  geometria: any
): CoordenadaTalhao[] | null {
  const coordinates =
    geometria?.geometry?.coordinates?.[0] ??
    geometria?.coordinates?.[0];

  if (!Array.isArray(coordinates)) {
    return null;
  }

  const convertidas = coordinates.map(
    (coordenada: unknown) => {
      if (
        !Array.isArray(coordenada) ||
        coordenada.length < 2
      ) {
        return null;
      }

      const [lng, lat] = coordenada;

      return {
        lat: Number(lat),
        lng: Number(lng)
      };
    }
  );

  if (
    convertidas.some(
      coordenada =>
        !coordenada ||
        !Number.isFinite(coordenada.lat) ||
        !Number.isFinite(coordenada.lng)
    )
  ) {
    return null;
  }

  return convertidas as CoordenadaTalhao[];
}

function obterLimiteAtivacao(
  talhao: Talhao
): CoordenadaTalhao[] | null {
  const limiteFisico =
    coordenadasValidas(talhao.coordenadas)
      ? talhao.coordenadas
      : obterCoordenadasGeoJson(
          talhao.geometria
        );

  if (limiteFisico) {
    try {
      return criarBufferInternoMetros(
        limiteFisico,
        DISTANCIA_SEGURA_METROS
      ).geometria;
    } catch (error) {
      console.warn(
        'Talhão sem área interna suficiente para ativação automática a 20 m.',
        talhao.id,
        error
      );

      return null;
    }
  }

  /*
   * Compatibilidade com documentos que não
   * possuem mais o limite físico disponível.
   *
   * Um limite de ativação persistido não deve
   * prevalecer sobre as coordenadas físicas,
   * porque talhões criados por versões antigas
   * podem conter recuos percentuais ou distâncias
   * diferentes dos 20 metros adotados atualmente.
   */
  if (
    coordenadasValidas(
      talhao.limiteAtivacaoOperacional
    )
  ) {
    return talhao.limiteAtivacaoOperacional;
  }

  if (
    coordenadasValidas(
      talhao.limiteOperacional
    )
  ) {
    return talhao.limiteOperacional;
  }

  return null;
}

function mensagemDoStatus(
  status: GeofenceStatus,
  location: LocalizacaoGeofence | null,
  currentTalhao: Talhao | null
) {
  switch (status) {
    case 'inativo':
      return 'Selecione uma fazenda para ativar o geofence.';
    case 'aguardando_gps':
      return 'Aguardando uma posição válida do GPS.';
    case 'gps_indisponivel':
      return 'Localização indisponível ou sem permissão.';
    case 'gps_impreciso':
      return location
        ? `GPS com precisão de ${Math.round(location.accuracy)} m. Necessário até 20 m.`
        : 'GPS sem precisão suficiente.';
    case 'sem_limite_seguro':
      return 'Nenhum talhão possui limite seguro disponível.';
    case 'fora_area_segura':
      return 'Fora da área segura de ativação, 20 m para dentro do talhão.';
    case 'sem_ordem':
      return currentTalhao
        ? `Talhão ${currentTalhao.nome} detectado, mas sem ordem compatível pendente.`
        : 'Nenhuma ordem compatível encontrada.';
    case 'execucao_ativa':
      return 'Já existe uma execução ativa para esta ordem.';
    case 'sugestao_disponivel':
      return 'Área segura e ordem pendente confirmadas.';
    case 'sugestao_ignorada':
      return 'Sugestão ignorada até sair da área segura ou surgir outra ordem.';
    default:
      return 'Geofence em monitoramento.';
  }
}

export function useTalhaoGeofence(
  farmId: string | null
) {
  const { talhoes } = useTalhoes(
    farmId || undefined
  );
  const { ordens } = useOrdensServico(farmId);
  const { execucoesAtivas } =
    useMinhasExecucoesAtivas(farmId);

  const [
    currentTalhao,
    setCurrentTalhao
  ] = useState<Talhao | null>(null);

  const [
    suggestedOrdem,
    setSuggestedOrdem
  ] = useState<OrdemServico | null>(null);

  const [
    location,
    setLocation
  ] = useState<LocalizacaoGeofence | null>(
    null
  );

  const [
    geofenceStatus,
    setGeofenceStatus
  ] = useState<GeofenceStatus>(
    farmId ? 'aguardando_gps' : 'inativo'
  );

  const sugestaoIgnoradaRef = useRef<{
    ordemId: string;
    talhaoId: string;
  } | null>(null);

  const talhoesComLimiteSeguro = useMemo(
    () =>
      talhoes.flatMap(talhao => {
        const coordenadas =
          obterLimiteAtivacao(talhao);

        if (!coordenadas) {
          return [];
        }

        try {
          return [
            {
              talhao,
              poligono:
                criarPoligonoTurf(
                  coordenadas
                )
            }
          ];
        } catch (error) {
          console.warn(
            'Limite seguro inválido para o talhão',
            talhao.id,
            error
          );

          return [];
        }
      }),
    [talhoes]
  );

  useEffect(() => {
    setLocation(null);
    setCurrentTalhao(null);
    setSuggestedOrdem(null);
    sugestaoIgnoradaRef.current = null;
    setGeofenceStatus(
      farmId ? 'aguardando_gps' : 'inativo'
    );
  }, [farmId]);

  useEffect(() => {
    if (!farmId) {
      return;
    }

    if (!navigator.geolocation) {
      setGeofenceStatus('gps_indisponivel');
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        position => {
          const {
            latitude,
            longitude,
            accuracy
          } = position.coords;

          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy
          });
        },
        error => {
          console.error(
            'Geofence GPS Error:',
            error
          );

          setLocation(null);
          setCurrentTalhao(null);
          setSuggestedOrdem(null);
          setGeofenceStatus(
            'gps_indisponivel'
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );

    return () =>
      navigator.geolocation.clearWatch(
        watchId
      );
  }, [farmId]);

  useEffect(() => {
    if (!farmId) {
      setGeofenceStatus('inativo');
      return;
    }

    if (!location) {
      return;
    }

    if (
      location.accuracy >
      PRECISAO_MAXIMA_GPS_METROS
    ) {
      setCurrentTalhao(null);
      setSuggestedOrdem(null);
      setGeofenceStatus('gps_impreciso');
      return;
    }

    if (
      talhoesComLimiteSeguro.length === 0
    ) {
      setCurrentTalhao(null);
      setSuggestedOrdem(null);
      setGeofenceStatus(
        'sem_limite_seguro'
      );
      return;
    }

    const pontoAtual = point([
      location.lng,
      location.lat
    ]);

    let talhaoEncontrado: Talhao | null =
      null;

    for (
      const {
        talhao,
        poligono
      } of talhoesComLimiteSeguro
    ) {
      try {
        if (
          booleanPointInPolygon(
            pontoAtual,
            poligono,
            {
              ignoreBoundary: false
            }
          )
        ) {
          talhaoEncontrado = talhao;
          break;
        }
      } catch (error) {
        console.warn(
          'Erro ao verificar limite seguro do talhão',
          talhao.id,
          error
        );
      }
    }

    if (!talhaoEncontrado) {
      setCurrentTalhao(null);
      setSuggestedOrdem(null);
      sugestaoIgnoradaRef.current = null;
      setGeofenceStatus(
        'fora_area_segura'
      );
      return;
    }

    setCurrentTalhao(
      talhaoEncontrado
    );

    const ordemCompativel =
      ordens.find(
        ordem =>
          ordem.talhaoId ===
            talhaoEncontrado.id &&
          [
            'pendente',
            'parcial',
            'em_execucao'
          ].includes(ordem.status) &&
          ordem.configuracoes
            ?.autoStartPorGeofence !==
            false
      ) ?? null;

    if (!ordemCompativel) {
      setSuggestedOrdem(null);
      setGeofenceStatus('sem_ordem');
      return;
    }

    const execucaoJaAtiva =
      execucoesAtivas.some(
        execucao =>
          execucao.ordemId ===
          ordemCompativel.id
      );

    if (execucaoJaAtiva) {
      setSuggestedOrdem(null);
      setGeofenceStatus(
        'execucao_ativa'
      );
      return;
    }

    const sugestaoIgnorada =
      sugestaoIgnoradaRef.current;

    if (
      sugestaoIgnorada?.ordemId ===
        ordemCompativel.id &&
      sugestaoIgnorada.talhaoId ===
        talhaoEncontrado.id
    ) {
      setSuggestedOrdem(null);
      setGeofenceStatus(
        'sugestao_ignorada'
      );
      return;
    }

    setSuggestedOrdem(
      ordemCompativel
    );
    setGeofenceStatus(
      'sugestao_disponivel'
    );
  }, [
    farmId,
    location,
    talhoesComLimiteSeguro,
    ordens,
    execucoesAtivas
  ]);

  const dismissSuggestion =
    useCallback(() => {
      if (
        suggestedOrdem &&
        currentTalhao
      ) {
        sugestaoIgnoradaRef.current = {
          ordemId:
            suggestedOrdem.id,
          talhaoId:
            currentTalhao.id
        };
      }

      setSuggestedOrdem(null);
      setGeofenceStatus(
        'sugestao_ignorada'
      );
    }, [
      suggestedOrdem,
      currentTalhao
    ]);

  const statusMessage = useMemo(
    () =>
      mensagemDoStatus(
        geofenceStatus,
        location,
        currentTalhao
      ),
    [
      geofenceStatus,
      location,
      currentTalhao
    ]
  );

  return {
    currentTalhao,
    suggestedOrdem,
    location,
    geofenceStatus,
    statusMessage,
    distanciaSeguraMetros:
      DISTANCIA_SEGURA_METROS,
    precisaoMaximaGpsMetros:
      PRECISAO_MAXIMA_GPS_METROS,
    dismissSuggestion
  };
}
