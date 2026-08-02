import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow, DrawingManager, Circle } from '@react-google-maps/api';
import { Talhao, Pluviometro, ChuvaComunitaria } from '../../types';
import type { UEIEspacial } from '../../modules/motorEspacial/types';
import { resolverPresencaOperacional } from '../../modules/motorEspacial/presencaOperacional';
import { RAIO_COBERTURA_PLUVIOMETRO_METROS } from '../../modules/chuva/mapa/camadaCoberturaPluviometrosGoogleMaps';

interface GoogleMapComponentProps {
  talhoes?: Talhao[];
  pluviometros?: Pluviometro[];
  chuvas?: ChuvaComunitaria[];
  ueis?: UEIEspacial[];
  farmId: string;
  userRole: string;
  onPolygonCreated?: (geojson: any, area: number) => void;
  onPolygonDeleted?: (id: string) => void;
  onTalhaoClick?: (talhao: Talhao) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

export function GoogleMapComponent({ 
  talhoes = [], 
  pluviometros = [], 
  chuvas = [], 
  ueis = [],
  userRole,
  onPolygonCreated,
  onPolygonDeleted,
  onTalhaoClick
}: GoogleMapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  const canManage = userRole === 'admin' || userRole === 'gerente';
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  const presenca = useMemo(
    () => userLocation ? resolverPresencaOperacional(userLocation, talhoes, ueis) : null,
    [talhoes, ueis, userLocation],
  );
  const corLocalizacao = presenca?.status === 'dentro' ? '#facc15' : presenca?.status === 'gps_impreciso' ? '#94a3b8' : '#2563eb';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing', 'geometry'] as any
  });

  if (loadError) {
    if ((window as any).gm_authFailure) {
      (window as any).gm_authFailure();
    }
    return null;
  }

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    
    // Auto center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy <= 50) {
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(16);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else if (talhoes.length > 0 && talhoes[0].geometria?.geometry?.coordinates?.[0]?.[0]) {
      const coords = talhoes[0].geometria.geometry.coordinates[0][0];
      map.setCenter({ lat: coords[1], lng: coords[0] });
      map.setZoom(14);
    } else {
      map.setCenter({ lat: -14.235, lng: -51.925 });
      map.setZoom(4);
    }
  }, [talhoes]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    if (!onPolygonCreated) return;
    
    const path = polygon.getPath();
    const coordinates: number[][] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      coordinates.push([latLng.lng(), latLng.lat()]);
    }
    
    // Close the polygon
    if (coordinates.length > 0) {
      coordinates.push([...coordinates[0]]);
    }

    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };

    // Calculate area using Google Maps geometry library
    const areaSqMeters = google.maps.geometry.spherical.computeArea(path);
    const areaHectares = areaSqMeters / 10000;

    onPolygonCreated(geojson, areaHectares);
    
    // Remove the drawn polygon as it will be rendered from DB
    polygon.setMap(null);
  };

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">Carregando mapa...</div>;

  return (
    <div className="relative h-full w-full">
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeId: 'satellite',
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {canManage && onPolygonCreated && (
        <DrawingManager
          onPolygonComplete={onPolygonComplete}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              strokeColor: '#3b82f6',
              strokeWeight: 2,
              clickable: false,
              editable: false,
              zIndex: 1
            }
          }}
        />
      )}

      {talhoes.map(talhao => {
        if (!talhao.geometria || !talhao.geometria.geometry || !talhao.geometria.geometry.coordinates) return null;
        
        const paths = talhao.geometria.geometry.coordinates.map((ring: number[][]) => 
          ring.map((c: number[]) => ({ lat: c[1], lng: c[0] }))
        );

        return (
          <Polygon
            key={talhao.id}
            paths={paths}
            options={{
              fillColor: '#10b981',
              fillOpacity: 0.2,
              strokeColor: '#10b981',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
            onClick={(e) => {
              setSelectedItem({ type: 'talhao', data: talhao, position: { lat: e.latLng?.lat(), lng: e.latLng?.lng() } });
            }}
          />
        );
      })}

      {pluviometros.map(pluv => (
        <Circle
          key={`${pluv.id}-cobertura`}
          center={{ lat: pluv.location.lat, lng: pluv.location.lng }}
          radius={RAIO_COBERTURA_PLUVIOMETRO_METROS}
          options={{ fillColor: '#38bdf8', fillOpacity: 0.1, strokeColor: '#0284c7', strokeOpacity: 0.45, strokeWeight: 1 }}
        />
      ))}

      {pluviometros.map(pluv => (
        <Marker
          key={pluv.id}
          position={{ lat: pluv.location.lat, lng: pluv.location.lng }}
          onClick={() => setSelectedItem({ type: 'pluviometro', data: pluv, position: { lat: pluv.location.lat, lng: pluv.location.lng } })}
        />
      ))}

      {chuvas.map(chuva => (
        <Marker
          key={chuva.id}
          position={{ lat: chuva.location.lat, lng: chuva.location.lng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
            strokeWeight: 1,
            strokeColor: '#ffffff'
          }}
          onClick={() => setSelectedItem({ type: 'chuva', data: chuva, position: { lat: chuva.location.lat, lng: chuva.location.lng } })}
        />
      ))}

      {userLocation && <Marker
        position={userLocation}
        title="Sua localização"
        icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: corLocalizacao, fillOpacity: presenca?.status === 'gps_impreciso' ? 0.65 : 1, strokeColor: '#fff', strokeWeight: 2.5 }}
      />}

      {selectedItem && (
        <InfoWindow
          position={selectedItem.position}
          onCloseClick={() => setSelectedItem(null)}
        >
          <div className="p-2 text-slate-800">
            {selectedItem.type === 'talhao' && (
              <>
                <h3 className="font-bold">{selectedItem.data.nome}</h3>
                <p className="text-sm">Área: {selectedItem.data.area.toFixed(2)} ha</p>
                <button
                  onClick={() => onTalhaoClick?.(selectedItem.data)}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors border-none cursor-pointer"
                >
                  Ver Diário Agronômico
                </button>
                {canManage && onPolygonDeleted && (
                  <button
                    onClick={() => {
                      onPolygonDeleted(selectedItem.data.id);
                      setSelectedItem(null);
                    }}
                    className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Excluir Talhão
                  </button>
                )}
              </>
            )}
            {selectedItem.type === 'pluviometro' && (
              <>
                <h3 className="font-bold">{selectedItem.data.nome}</h3>
                <p className="text-sm text-slate-500">Pluviômetro</p>
              </>
            )}
            {selectedItem.type === 'chuva' && (
              <>
                <h3 className="font-bold">Registro de Chuva</h3>
                <p className="text-sm">{selectedItem.data.mm} mm</p>
                <p className="text-xs text-slate-500">{new Date(selectedItem.data.timestamp).toLocaleString()}</p>
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[min(92%,360px)] -translate-x-1/2 rounded-2xl bg-slate-950/90 px-4 py-3 text-xs font-bold text-white shadow-xl backdrop-blur">
      {!presenca ? 'Localização indisponível' : presenca.status === 'gps_impreciso' ? `GPS impreciso — posição não confirmada (${Math.round(presenca.precisaoMetros)} m)` : presenca.status === 'dentro' ? <>Área operacional ativa<br /><span className="text-slate-300">Talhão: {presenca.talhaoNome}</span><br /><span className="text-yellow-300">UEI: {presenca.ueiCodigo ?? 'não identificada'}</span></> : <>Fora da área operacional<br /><span className="text-slate-400">Nenhuma UEI identificada</span></>}
    </div>
    </div>
  );
}
