import { useState } from "react";
import "./EnergyCheckIn.css";

interface EnergyCheckInProps {
  currentEnergy: number | null;
  currentSleepHours?: number;
  onCheckIn: (value: number, sleepHours?: number) => void;
  loading: boolean;
}

const EnergyCheckIn = ({ currentEnergy, currentSleepHours, onCheckIn, loading }: EnergyCheckInProps) => {
  const [sleepHours, setSleepHours] = useState<number | "">(currentSleepHours || "");
  const [showSleepInput, setShowSleepInput] = useState(false);

  const energyLabels = [
    "Very low",
    "Low",
    "Moderate",
    "Good",
    "High"
  ];

  const handleEnergyClick = (value: number) => {
    onCheckIn(value, sleepHours !== "" ? Number(sleepHours) : undefined);
  };

  return (
    <div className="energy-check-in">
      <div className="energy-buttons">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`energy-button ${currentEnergy === value ? "active" : ""}`}
            onClick={() => handleEnergyClick(value)}
            disabled={loading}
            aria-label={`Energy level ${value}: ${energyLabels[value - 1]}`}
          >
            <span className="energy-dot" data-energy={value}></span>
            <span className="energy-label">{value}</span>
          </button>
        ))}
      </div>
      
      <div className="sleep-section">
        <button
          type="button"
          className="sleep-toggle"
          onClick={() => setShowSleepInput(!showSleepInput)}
        >
          {showSleepInput ? "−" : "+"} Sleep hours
        </button>
        
        {showSleepInput && (
          <div className="sleep-input-group">
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Hours of sleep"
              className="sleep-input"
            />
            <span className="sleep-hint">
              {sleepHours !== "" && Number(sleepHours) < 6 && "⚠️ Low sleep may reduce energy"}
              {sleepHours !== "" && Number(sleepHours) >= 7 && Number(sleepHours) <= 9 && "✓ Optimal sleep"}
              {sleepHours !== "" && Number(sleepHours) > 9 && "💤 Oversleeping may affect energy"}
            </span>
          </div>
        )}
      </div>

      {currentEnergy && (
        <p className="energy-status">
          Current energy: {energyLabels[currentEnergy - 1].toLowerCase()}
          {currentSleepHours && ` • ${currentSleepHours}h sleep`}
        </p>
      )}
    </div>
  );
};

export default EnergyCheckIn;
