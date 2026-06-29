import SmartFarmMap from "./SmartFarmMap";
import { Talhao } from "../types/map.types";

const mockTalhoes: Talhao[] = [
  {
    id: "talhao-01",
    producerId: "producer-demo",
    farmId: "farm-demo",
    nome: "Talhão 01",
    areaHa: 12,
    polygon: [
      { lat: -2.4422, lng: -54.7101 },
      { lat: -2.4412, lng: -54.7065 },
      { lat: -2.4451, lng: -54.7058 },
      { lat: -2.4462, lng: -54.7098 },
    ],
  },
];

export default function HectaMapHome() {
  return (
    <SmartFarmMap
      farmName="Fazenda Demo"
      talhoes={mockTalhoes}
    />
  );
}