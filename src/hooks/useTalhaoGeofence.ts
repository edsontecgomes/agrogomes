import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { Talhao, OrdemServico } from '../types';
import { useOrdensServico, useMinhasExecucoesAtivas } from './useServicos';
import { useTalhoes } from './useTalhoes';
import { criarBufferInternoMetros } from '../modules/geometria/buffer/criarBufferInterno';
import { criarPoligonoTurf } from '../modules/geometria';

type CoordenadaTalhao = {
  lat: number;
  lng: number;
};

const DISTANCIA_SEGURA_METROS = 20;
const PRECISAO_MAXIMA_GPS_METROS = 20;
const CHECK_INTERVAL = 10000;

function coordenadasValidas(
  valor: unknown
): valor is CoordenadaTalhao[] {
  return (
    Array.isArray(valor) &&
    valor.length >= 3 &&
    valor.every(
      (coordenada) =>
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
      (coordenada) =>
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
  if (
    coordenadasValidas(
      talhao.limiteAtivacaoOperacional
    )
  ) {
    return talhao.limiteAtivacaoOperacional;
  }

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

  if (
    coordenadasValidas(
      talhao.limiteOperacional
    )
  ) {
    return talhao.limiteOperacional;
  }

  return null;
}

export function useTalhaoGeofence(farmId: string | null) {
  const { talhoes } = useTalhoes(farmId || undefined);
  const { ordens } = useOrdensServico(farmId);
  const { execucoesAtivas } = useMinhasExecucoesAtivas(farmId);
  
  const [currentTalhao, setCurrentTalhao] = useState<Talhao | null>(null);
  const [suggestedOrdem, setSuggestedOrdem] = useState<OrdemServico | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | null>(null);
  
  const lastCheckRef = useRef<number>(0);

  const talhoesComLimiteSeguro =
    useMemo(
      () =>
        talhoes.flatMap(
          (talhao) => {
            const coordenadas =
              obterLimiteAtivacao(
                talhao
              );

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
          }
        ),
      [talhoes]
    );

  const detectTalhao = useCallback((lat: number, lng: number) => {
    const pt = point([lng, lat]);
    
    let found: Talhao | null = null;
    for (
      const {
        talhao,
        poligono
      } of talhoesComLimiteSeguro
    ) {
      try {
        if (
          booleanPointInPolygon(
            pt,
            poligono,
            {
              ignoreBoundary: false
            }
          )
        ) {
          found = talhao;
          break;
        }
      } catch (e) {
        console.warn(
          'Erro ao verificar limite seguro do talhão',
          talhao.id,
          e
        );
      }
    }

    // Only update if talhao changed
    if (found?.id !== currentTalhao?.id) {
      setCurrentTalhao(found);
      
      if (found) {
        // Look for compatible OS (pending, partial, or execution)
        const compatible = ordens.find(o => 
          o.talhaoId === found?.id && 
          ['pendente', 'parcial', 'em_execucao'].includes(o.status)
        );

        // Check if user already has an active execution for this OS
        const alreadyRunning = execucoesAtivas.some(e => e.ordemId === compatible?.id);

        if (compatible && !alreadyRunning) {
          setSuggestedOrdem(compatible);
        } else {
          setSuggestedOrdem(null);
        }
      } else {
        setSuggestedOrdem(null);
      }
    }
  }, [
    talhoesComLimiteSeguro,
    ordens,
    currentTalhao,
    execucoesAtivas
  ]);

  useEffect(() => {
    if (!navigator.geolocation || !farmId || talhoes.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });

        if (
          accuracy >
          PRECISAO_MAXIMA_GPS_METROS
        ) {
          setCurrentTalhao(null);
          setSuggestedOrdem(null);
          return;
        }

        const now = Date.now();
        if (now - lastCheckRef.current < CHECK_INTERVAL) return;
        lastCheckRef.current = now;

        detectTalhao(latitude, longitude);
      },
      (err) => console.error('Geofence GPS Error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [farmId, talhoes, detectTalhao]);

  const dismissSuggestion = () => setSuggestedOrdem(null);

  return {
    currentTalhao,
    suggestedOrdem,
    location,
    dismissSuggestion
  };
}
