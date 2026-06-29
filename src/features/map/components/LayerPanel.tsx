import "./LayerPanel.css";

type Props = {
  layers: string[];
};

export default function LayerPanel({
  layers,
}: Props) {
  return (
    <div className="layer-panel">

      <h3>Camadas</h3>

      {layers.map(layer => (

        <label key={layer}>

          <input type="checkbox"/>

          {layer}

        </label>

      ))}

    </div>
  );
}