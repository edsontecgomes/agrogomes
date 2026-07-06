export type StatusVisualUEI =
  | "desconhecida"
  | "aprendendo"
  | "estavel"
  | "atencao"
  | "alerta";

export function corStatusUEI(status: StatusVisualUEI) {
  switch (status) {
    case "desconhecida":
      return "#94A3B8";
    case "aprendendo":
      return "#3B82F6";
    case "estavel":
      return "#16A34A";
    case "atencao":
      return "#FACC15";
    case "alerta":
      return "#DC2626";
    default:
      return "#94A3B8";
  }
}