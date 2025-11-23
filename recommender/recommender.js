// recommender/recommender.js
import { simulateDelay } from "../shared/shared.js";

/**
 * Simple rule-based recommender that returns ranked actions based on gap & focus areas.
 * - gap: negative -> below industry
 * - focusAreas: array of strings
 */
export async function recommendActions(sector, gap, focusAreas = []) {
  await simulateDelay(150, 500);

  const absGap = Math.abs(gap);
  const actions = [];

  // high priority if gap large
  if (gap < -15 || absGap > 15) {
    actions.push({
      priority: "High",
      title: `Implement measurement & verification (M&V) for ${focusAreas[0] || 'key area'}`,
      detail: `Set up data collection, automated dashboards, and verification to close gap of ${absGap}%.`
    });
  }

  // mid-priority
  actions.push({
    priority: "Medium",
    title: `Policy update for ${focusAreas[1] || 'secondary area'}`,
    detail: `Update SOPs and controls; align to relevant local regulation and global standards.`
  });

  // low-priority / continuous
  actions.push({
    priority: "Low",
    title: `Capacity building & reporting`,
    detail: `Train staff, run pilot projects, and prepare improved disclosures for next cycle.`
  });

  // sort by priority label
  return actions;
}

/**
 * Actionable plan generator: returns roadmap timeline (mock)
 */
export async function generateActionPlan(sector, gap, focusAreas = []) {
  await simulateDelay(200, 600);
  const actions = await recommendActions(sector, gap, focusAreas);
  return {
    sector,
    gap,
    plan: actions.map((a, i) => ({ ...a, month: (i+1) * 2 }))
  };
}
