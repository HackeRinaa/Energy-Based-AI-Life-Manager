import { Router } from "express";
import { EnergyEntry } from "@energy-manager/shared";
import { dataStore } from "../store.js";

const router = Router();

// POST /energy - Store an energy check-in
router.post("/", (req, res) => {
  const { value, sleepHours } = req.body;

  if (typeof value !== "number" || value < 1 || value > 5) {
    return res.status(400).json({ 
      error: "Energy value must be a number between 1 and 5" 
    });
  }

  if (sleepHours !== undefined && (typeof sleepHours !== "number" || sleepHours < 0 || sleepHours > 24)) {
    return res.status(400).json({ 
      error: "Sleep hours must be a number between 0 and 24" 
    });
  }

  const entry: EnergyEntry = {
    id: `energy-${Date.now()}`,
    value,
    sleepHours: sleepHours || undefined,
    timestamp: new Date().toISOString()
  };

  dataStore.addEnergyEntry(entry);
  
  res.status(201).json(entry);
});

// GET /energy - Get all energy entries (for debugging/display)
router.get("/", (req, res) => {
  res.json(dataStore.getEnergyEntries());
});

// GET /energy/latest - Get the most recent energy entry
router.get("/latest", (req, res) => {
  const latest = dataStore.getLatestEnergy();
  if (!latest) {
    return res.status(404).json({ error: "No energy entries found" });
  }
  res.json(latest);
});

export { router as energyRoutes };
