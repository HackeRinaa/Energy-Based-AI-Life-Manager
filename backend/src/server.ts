import express from "express";
import cors from "cors";
import { energyRoutes } from "./routes/energy.js";
import { taskRoutes } from "./routes/tasks.js";
import { planRoutes } from "./routes/plan.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/energy", energyRoutes);
app.use("/tasks", taskRoutes);
app.use("/plan", planRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`Please either:`);
    console.error(`  1. Stop the process using port ${PORT}`);
    console.error(`  2. Or set a different port: PORT=3002 npm run dev\n`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
