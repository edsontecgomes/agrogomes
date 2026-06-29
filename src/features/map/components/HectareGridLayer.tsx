import { Polygon } from "react-leaflet";
import { HectareCell } from "../types/map.types";

type Props = {
  hectares: HectareCell[];
  onClickHectare?: (hectare: HectareCell) => void;
};

export default function HectareGridLayer({
  hectares,
  onClickHectare,
}: Props) {
  return (
    <>
      {hectares.map((hectare) => (
        <Polygon
          key={hectare.id}
          positions={hectare.polygon.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: "#FFFFFF",
            weight: 1,
            fillColor: "#FFFFFF",
            fillOpacity: 0.03,
          }}
          eventHandlers={{
            click: () => onClickHectare?.(hectare),
          }}
        />
      ))}
    </>
  );
}