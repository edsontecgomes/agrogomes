import React, { useEffect, useRef, useState } from 'react';
import { Pluviometro, ChuvaComunitaria } from '../types';
import { loadGoogleMaps } from '../services/googleMaps';

interface MapProps {
  pluviometros: Pluviometro[];
  chuvasComunitarias: ChuvaComunitaria[];
}

export function Map({ pluviometros, chuvasComunitarias }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapContainerRef.current) return;
        
        const defaultCenter = pluviometros.length > 0 
          ? { lat: pluviometros[0].location.lat, lng: pluviometros[0].location.lng } 
          : { lat: -14.235, lng: -51.925 };
          
        const defaultZoom = pluviometros.length > 0 ? 12 : 4;

        const gMap = new google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeId: 'satellite',
          disableDefaultUI: false,
          zoomControl: true,
        });

        // Add Pluviômetros
        pluviometros.forEach((p) => {
          const totalRain = chuvasComunitarias
            .filter(c => c.pluviometroId === p.id)
            .reduce((sum, c) => sum + c.mm, 0);

          const marker = new google.maps.Marker({
            position: { lat: p.location.lat, lng: p.location.lng },
            map: gMap,
            title: `Pluviômetro: ${p.nome}`,
            icon: {
              url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              scaledSize: new google.maps.Size(25, 41),
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: sans-serif; color: #1e293b;">
                <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">Pluviômetro: ${p.nome}</h3>
                <p style="margin: 0; font-size: 12px; color: #475569;">Total acumulado: <strong style="color: #2563eb;">${totalRain.toFixed(1)} mm</strong></p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(gMap, marker);
          });
        });

        // Add Chuvas
        chuvasComunitarias.forEach((c, index) => {
          const offsetLat = (index % 5 - 2) * 0.0001;
          const offsetLng = ((index + 2) % 5 - 2) * 0.0001;

          const marker = new google.maps.Marker({
            position: { lat: c.location.lat + offsetLat, lng: c.location.lng + offsetLng },
            map: gMap,
            title: `Chuva: ${c.mm.toFixed(1)} mm`,
            icon: {
              url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              scaledSize: new google.maps.Size(25, 41),
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: sans-serif; color: #1e293b;">
                <h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px; color: #2563eb;">💧 Registro de Chuva</h3>
                <p style="margin: 0; font-size: 12px;">Volume: <strong>${c.mm.toFixed(1)} mm</strong></p>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #94a3b8;">${new Date(c.timestamp).toLocaleDateString()}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(gMap, marker);
          });
        });
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Erro ao carregar o Google Maps');
      });

    return () => {
      active = false;
    };
  }, [pluviometros, chuvasComunitarias]);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-rose-500 font-semibold">{error}</div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full" />
      )}
    </div>
  );
}
