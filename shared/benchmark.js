// Benchmark Data (Mock)
const BASE_DATA = {
  manufacturing: { company: 72, industry: 81 },
  energy: { company: 68, industry: 78 },
  finance: { company: 75, industry: 83 },
  agri: { company: 64, industry: 74 }
};

const RADAR_DIMENSIONS = {
  manufacturing: { emissions: 70, energy: 65, governance: 80, community: 75, waste: 60, safety: 85 },
  energy: { emissions: 65, energy: 70, governance: 78, community: 60, waste: 62, safety: 77 },
  finance: { emissions: 55, energy: 50, governance: 88, community: 82, waste: 40, safety: 70 },
  agri: { emissions: 68, energy: 63, governance: 76, community: 70, waste: 58, safety: 72 }
};

// --- Benchmark Core ---
export function getSectorBenchmark(sector) {
  const entry = BASE_DATA[sector];
  const gap = entry.company - entry.industry;
  return { ...entry, gap };
}

// --- Radar Data ---
export function getRadarData(sector) {
  const d = RADAR_DIMENSIONS[sector];

  return {
    labels: ["Emissions", "Energy", "Governance", "Community", "Waste", "Safety"],
    datasets: [
      {
        label: "Company",
        data: [d.emissions, d.energy, d.governance, d.community, d.waste, d.safety],
        borderColor: "#3B97C1",
        backgroundColor: "rgba(59,151,193,0.25)"
      },
      {
        label: "Industry",
        data: [
          d.emissions + 5,
          d.energy + 8,
          d.governance + 4,
          d.community + 6,
          d.waste + 7,
          d.safety + 3
        ],
        borderColor: "#4FB48E",
        backgroundColor: "rgba(79,180,142,0.25)"
      }
    ]
  };
}

// --- AI-like Insight ---
export function generateInsight(data) {
  const gap = data.gap;
  if (gap >= 0) {
    return `
      <strong>📈 Company is above industry average!</strong><br>
      Posisi kamu <strong>${gap}% lebih tinggi</strong> dari rata-rata industri.<br>
      Pertahankan dengan fokus pada energy efficiency dan supply-chain disclosures.
    `;
  }

  const deficit = Math.abs(gap);
  let suggestion = "Perbaiki documentation & data quality untuk kenaikan cepat.";
  if (deficit > 12) suggestion = "Fokus pada pembenahan sistem pengukuran, audit internal, dan integrasi data.";
  if (deficit > 20) suggestion = "Prioritas strategis: modernisasi sustainability reporting framework.";

  return `
    <strong>⚠ Company is below industry average.</strong><br>
    Kamu berada <strong>${deficit}% di bawah</strong> standar industri.<br>
    Rekomendasi: ${suggestion}
  `;
}

// --- Export JSON ---
export function exportBenchmarkJSON(sector) {
  const data = {
    sector,
    summary: getSectorBenchmark(sector),
    timestamp: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "benchmark_summary.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Export HTML mock ---
export function exportBenchmarkHTML() {
  const html = `
    <html><body>
      <h1>SustainAlign Benchmark Summary</h1>
      <p>Export mock (UI prototype only)</p>
    </body></html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "benchmark_summary.html";
  a.click();
  URL.revokeObjectURL(url);
}
