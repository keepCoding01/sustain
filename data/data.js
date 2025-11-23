// Mock API layer for SustainAlign
// Used to simulate backend responses for real-world behaviour

export async function apiFetchRegulations(sector) {
  await delay();
  return {
    sector,
    regulations: [
      { id: "R-001", title: "Energy Compliance 2022" },
      { id: "R-002", title: "Waste Handling 2021" }
    ]
  };
}

export async function apiFetchGlobalMapping() {
  await delay();
  return {
    GRI: ["GRI 302", "GRI 305", "GRI 403"],
    ISSB: ["ISSB S1", "ISSB S2"],
    SASB: ["SASB EM", "SASB WM"]
  };
}

export async function apiValidateDocument(fields) {
  await delay();
  return {
    score: Math.floor(Math.random() * 30) + fields.length * 12,
    missing: ["Emission", "Energy"].filter(x => !fields.includes(x))
  };
}

export async function delay(ms = 600) {
  return new Promise(res => setTimeout(res, ms));
}

console.log("[API] mock api loaded");
