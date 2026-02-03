import "./PlanExplanation.css";

interface PlanExplanationProps {
  explanation: string;
}

const PlanExplanation = ({ explanation }: PlanExplanationProps) => {
  return (
    <div className="plan-explanation">
      <h2>Why this order?</h2>
      <p>{explanation}</p>
    </div>
  );
};

export default PlanExplanation;
