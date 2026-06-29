export interface TalhaoDrawingPoint {
  id: string;
  latitude: number;
  longitude: number;
}

export interface TalhaoGridCell {
  id: string;
  areaHa: number;
  label: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface TalhaoDrawingState {
  points: TalhaoDrawingPoint[];
  isClosed: boolean;
  areaHa: number;
  perimetroM: number;
  gridCells: TalhaoGridCell[];
}