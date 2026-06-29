import "./TalhaoInfoCard.css";
import { Talhao } from "../types/map.types";

type Props = {
  talhao: Talhao | null;
};

export default function TalhaoInfoCard({
  talhao,
}: Props) {

  if(!talhao) return null;

  return(

<div className="talhao-card">

<h2>{talhao.nome}</h2>

<p>{talhao.areaHa} ha</p>

<span>
Cada hectare se torna mais inteligente a cada dia.
</span>

</div>

  );

}