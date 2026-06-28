export type ImplementoUei = {
  id?: string;
  nome: string;
  tipo: "plantadeira" | "pulverizador" | "distribuidor" | "colheitadeira" | "outro";
  larguraOperacionalMetros?: number;
};

export function calcularAreaOperacionalHa(distanciaMetros: number, larguraMetros: number) {
  return (distanciaMetros * larguraMetros) / 10000;
}