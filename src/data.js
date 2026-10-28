// Trade feed used by the dashboard.
// Each entry: ticker, agent that closed it, result in percent.
window.FORGE_CONFIG = {
  startBalance: 7,
  // share of the balance each agent puts into a position
  allocation: 0.437,
  // ms between closed trades
  interval: 2200,
  agents: {
    Scout:  { color: "#6366f1" },
    Sniper: { color: "#ec4899" },
    Curve:  { color: "#f59e0b" },
    Grad:   { color: "#14b8a6" },
  },
  trades: [
    { tk: "MOCHI",  agent: "Sniper", pct: 180 },
    { tk: "ZORP",   agent: "Scout",  pct: 109 },
    { tk: "KIWI",   agent: "Grad",   pct: 159 },
    { tk: "BLIP",   agent: "Curve",  pct: -9 },
    { tk: "NOODL",  agent: "Sniper", pct: 121 },
    { tk: "YAPPY",  agent: "Scout",  pct: 135 },
    { tk: "GLIMR",  agent: "Curve",  pct: 129 },
    { tk: "FIZZ",   agent: "Grad",   pct: 129 },
    { tk: "TUBA",   agent: "Grad",   pct: 880 },
    { tk: "PIXL",   agent: "Sniper", pct: 412 },
    { tk: "WOMBO",  agent: "Scout",  pct: 233 },
    { tk: "ORBIT",  agent: "Curve",  pct: 318 },
  ],
  idle: [
    "scanning for runners",
    "skipped fake contract",
    "watching new pairs",
    "entering position",
    "riding it",
  ],
};
