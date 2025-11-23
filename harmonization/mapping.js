// harmonization/mapping.js
import { similarity, REGs_GLOBAL, simulateDelay } from "../shared/shared.js";

/**
 * Map a single local regulation (with keywords) to global standards.
 * Returns array sorted by confidence {standard, id, topic, score}
 */
export async function mapLocalToGlobal(localReg) {
  await simulateDelay(150, 400);
  const results = [];

  Object.keys(REGs_GLOBAL).forEach(stdKey => {
    REGs_GLOBAL[stdKey].forEach(g => {
      const score = similarity(localReg.keywords || [], g.topic);
      results.push({ standard: stdKey, id: g.id, topic: g.topic, score });
    });
  });

  // sort desc and return top 3
  return results.sort((a,b)=>b.score-a.score).slice(0,3);
}

/**
 * Map a list of local regs and attach best matches
 */
export async function mapBatch(localRegs = []) {
  const out = [];
  for (const r of localRegs) {
    const matches = await mapLocalToGlobal(r);
    out.push({ ...r, mapping: matches });
  }
  return out;
}
