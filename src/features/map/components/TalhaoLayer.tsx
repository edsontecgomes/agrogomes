import { Polygon } from "react-leaflet";
import { Talhao } from "../types/map.types";

type Props = {
  talhoes: Talhao[];
  onClickTalhao?: (talhao: Talhao) => void;
};

export default function TalhaoLayer({
  talhoes,
  onClickTalhao,
}: Props) {
  return (
    <>
      {talhoes.map((talhao) => (
        <Polygon
          key={talhao.id}
          positions={talhao.polygon.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color: "#FFFFFF",
            weight: 2,
            fillColor: "#22C55E",
            fillOpacity: 0.08,
          }}
          eventHandlers={{
            click: () => onClickTalhao?.(talhao),
          }}
        />
      ))}
    </>
  );
}