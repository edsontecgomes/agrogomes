import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import TalhaoLayer from "./TalhaoLayer";
import HectareGridLayer from "./HectareGridLayer";
import MapHeader from "./MapHeader";
import MapBottomNav from "./MapBottomNav";

import { HectareCell, Talhao } from "../types/map.types";
import { useHectareGrid } from "../hooks/useHectareGrid";

import "./SmartFarmMap.css";

type Props = {
  farmName: string;
  talhoes: Talhao[];
};

export default function SmartFarmMap({
  farmName,
  talhoes,
}: Props) {
  const [activeTab, setActiveTab] = useState("mapa");
  const [selectedHectare, setSelectedHectare] =
    useState<HectareCell | null>(null);

  const hectares = useHectareGrid(talhoes);

  const mapCenter = useMemo<[number, number]>(() => {
    const firstTalhao = talhoes[0];
    const firstPoint = firstTalhao?.polygon?.[0];

    if (!firstPoint) {
      return [-2.442, -54.708];
    }

    return [firstPoint.lat, firstPoint.lng];
  }, [talhoes]);

  return (
    <div className="smart-farm-map">
      <MapContainer
        center={mapCenter}
        zoom={16}
        zoomControl={false}
        className="smart-farm-map__leaflet"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <TalhaoLayer talhoes={talhoes} />

        <HectareGridLayer
          hectares={hectares}
          onClickHectare={setSelectedHectare}
        />

        <ZoomControl position="bottomright" />
      </MapContainer>

      <MapHeader farmName={farmName} iqFarm={0} />

      {selectedHectare && (
        <div className="hectare-preview">
          <strong>Hectare {selectedHectare.hectareIndex}</strong>

          <span>IQH {selectedHectare.iqh}</span>

          <small>Status: {selectedHectare.status}</small>
        </div>
      )}

      <MapBottomNav
        active={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}