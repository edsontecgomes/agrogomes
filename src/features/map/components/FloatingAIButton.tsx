import { BrainCircuit } from "lucide-react";
import "./FloatingAIButton.css";

type Props = {
  onClick: () => void;
};

export default function FloatingAIButton({
  onClick,
}: Props) {
  return (
    <button
      className="floating-ai-button"
      onClick={onClick}
    >
      <BrainCircuit size={30} />
    </button>
  );
}