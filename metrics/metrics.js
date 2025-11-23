// metrics/metrics.js
import { INDICATORS, LOCAL_REGS, similarity, simulateDelay } from "../shared/shared.js";

/**
 * Recommend indicators for a given sector (base + augmentation).
 * Returns {sector, baseIndicators, augmented: [{indicator, confidence}]}
 */
export async function recommendIndicatorsForSector(sector) {
  await simulateDelay(120, 400);
  const base = INDICATORS[sector] || [];
  const augmented = base.map(ind => {
    // compute naive confidence by comparing indicator keywords to local regs
    const tokens = ind.split(/\W+/);
    const regMatchScore = LOCAL_REGS.reduce((acc, r) => {
      const s = similarity(tokens, (r.keywords || []).join(' '));
      return Math.max(acc, s);
    }, 0);
    const confidence = Math.min(100, Math.round(50 + regMatchScore/2)); // heuristic
    return { indicator: ind, confidence };
  });

  return { sector, baseIndicators: base, augmented };
}

/**
 * For a company profile (sector + presentIndicators list),
 * compute coverage and missing indicators with scores.
 */
export async function computeIndicatorCoverage(sector, present = []) {
  await simulateDelay(100, 300);
  const rec = await recommendIndicatorsForSector(sector);
  const presentLower = present.map(p => p.toLowerCase());
  const missing = rec.baseIndicators.filter(i => !presentLower.some(p => p.includes(i.split('—')[0].trim().toLowerCase())));
  const coverage = Math.round((rec.baseIndicators.length - missing.length) / rec.baseIndicators.length * 100);
  return { sector, coverage, missing, recommended: rec.augmented };
}
