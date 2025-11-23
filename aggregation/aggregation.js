// aggregation/aggregation.js
import { simulateDelay } from "../shared/shared.js";

/**
 * Simulate fetching regulations from various sources (mock).
 * Returns array of {id, title, source, keywords}
 */
export async function fetchRegulationsMock(sector = "manufacturing") {
  await simulateDelay(300, 900);
  // Mock dataset (extendable)
  const pool = [
    { id: "KLHK-001", title: "Peraturan Emisi 2021", source: "KLHK", keywords: ["emisi", "carbon", "udara"] },
    { id: "LIM-004", title: "Limbah B3 2022", source: "KLHK", keywords: ["limbah", "b3", "waste"] },
    { id: "ESDM-002", title: "Permen Energi 2020", source: "ESDM", keywords: ["energi", "efisiensi"] },
    { id: "K3-003", title: "Keselamatan Kerja 2019", source: "Kemenaker", keywords: ["k3", "safety"] }
  ];

  // sector filter small heuristic (for demo)
  const map = {
    manufacturing: ["KLHK-001", "LIM-004", "K3-003"],
    energy: ["ESDM-002", "KLHK-001"],
    finance: ["KLHK-001"],
    agri: ["LIM-004"]
  };

  const ids = map[sector] || map.manufacturing;
  return pool.filter(p => ids.includes(p.id));
}

/**
 * Normalize and deduplicate an array of regs
 */
export function normalizeAndIndex(regs) {
  const idx = {};
  regs.forEach(r => {
    const key = r.id.toUpperCase();
    if (!idx[key]) {
      idx[key] = {
        id: key,
        title: r.title,
        source: r.source || "unknown",
        keywords: (r.keywords || []).map(k => k.toLowerCase())
      };
    } else {
      // merge keyword lists
      idx[key].keywords = Array.from(new Set([...idx[key].keywords, ...(r.keywords || []).map(k=>k.toLowerCase())]));
    }
  });
  return Object.values(idx);
}

/**
 * High-level pipeline: fetch -> normalize -> index
 */
export async function runAggregationPipeline(sector) {
  const raw = await fetchRegulationsMock(sector);
  const normalized = normalizeAndIndex(raw);
  return normalized;
}
