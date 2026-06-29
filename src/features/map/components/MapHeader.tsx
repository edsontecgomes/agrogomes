import "./MapHeader.css";

type Props = {
  farmName: string;
  iqFarm: number;
};

export default function MapHeader({
  farmName,
  iqFarm,
}: Props) {
  return (
    <div className="hecta-header">
      <h1>HECTA</h1>

      <span>
        Cada hectare se torna mais inteligente a cada dia.
      </span>

      <small>
        {farmName} • IQ Fazenda {iqFarm}
      </small>
    </div>
  );
}