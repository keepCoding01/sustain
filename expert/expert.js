// expert/expert.js
// Modular logic helper untuk Expert Assistant — SustainAlign
// Tidak mengubah tampilan, hanya menyediakan abstraction untuk AI pipeline

import { similarity, simulateDelay } from "../shared/shared.js";
import { recommendIndicatorsForSector, generateSectorRecommendations } from "../recommender/recommender.js";
import { LOCAL_REGS, GLOBAL_MAP, REGS, INDICATORS, TOPICS } from "../shared/shared.js";

/**
 * Class ExpertAssistant
 * abstraction logic AI agar tidak menumpuk di file HTML
 */
export class ExpertAssistant {

  /**
   * Handle query untuk chat/interface
   * @param {string} q — user query
   * @returns {Promise<string>} — AI response
   */
  async processQuery(q) {
    const query = q.toLowerCase();

    // Mapping GRI → Local (regulation mapper)
    if (query.includes("gri") || query.match(/gri\s*\d+/i)) {
      const allGRI = GLOBAL_MAP["GRI"] || [];
      const found = allGRI.find(g =>
        query.includes(g.id.toLowerCase().replace(/\s+/g, "")) ||
        query.includes(g.topic.toLowerCase().split(" ")[0])
      );

      if (found) {
        const locals = LOCAL_REGS
          .filter(r => (r.keywords || []).some(k => found.topic.toLowerCase().includes(k)))
          .map(r => r.id);

        await simulateDelay(400, 800);
        return `
        <strong>Mapping Result</strong><br/>
        ${found.id} — ${found.topic}<br/><br/>
        Related Local Regulations: ${locals.length ? locals.join(", ") : "Tidak ditemukan dalam dataset"}<br/><br/>
        <em>Rekomendasi:</em> Samakan pelaporan Anda dengan ${found.id} dan referensikan regulasi lokal terkait.
        `;
      }
    }

    // Required indicators
    if (query.includes("required indicators") || query.includes("required indicator")) {
      const sector = Object.keys(REGS).find(s => query.includes(s)) || "manufacturing";
      const rec = await recommendIndicatorsForSector(sector, { baseIndicators: INDICATORS });

      const list = rec.recommended
        .map(r => `- ${r.indicator} (${r.confidence}%)`)
        .join("<br/>");

      return `Untuk sektor <strong>${sector}</strong>, indikator wajib:<br/><br/>${list}`;
    }

    // Recommendations
    if (query.includes("recommend") || query.includes("suggest")) {
      const sector = Object.keys(REGS).find(s => query.includes(s)) || "manufacturing";
      const pack = await generateSectorRecommendations(sector);

      const inds = pack.indicators.recommended.slice(0, 4)
        .map(i => `${i.indicator} (${i.confidence}%)`).join(", ");
      const regs = pack.regulations.slice(0, 3)
        .map(r => r.id).join(", ");

      return `
      <strong>Rekomendasi SustainAlign untuk sektor ${sector}</strong><br/><br/>
      Indikator Prioritas: ${inds}<br/>
      Regulasi terkait: ${regs}<br/>
      Rencana aksi: ${pack.actionPlan.plan[0]?.title || "Perkuat pengumpulan data"}<br/>
      `;
    }

    // Regulation Search
    if (["peraturan", "perm", "limbah", "emisi", "k3"].some(key => query.includes(key))) {
      const hits = LOCAL_REGS.filter(r =>
        (r.id + r.title + (r.keywords || []).join(" ")).toLowerCase().includes(query)
      );
      await simulateDelay(200, 600);

      if (hits.length)
        return `Ditemukan ${hits.length} regulasi:<br/>` +
          hits.map(h => `<strong>${h.id}</strong> — ${h.title}`).join("<br/>");

      return `Tidak ada hasil untuk '${q}'. Coba gunakan kata kunci lebih pendek (mis. "emisi", "limbah").`;
    }

    // Similarity fallback AI
    const scores = TOPICS.map(t => ({
      topic: t,
      score: similarity(q.split(/\W+/), t)
    })).sort((a, b) => b.score - a.score);

    await simulateDelay(250, 700);
    return `
      Sepertinya topik terkait: <strong>${scores[0].topic}</strong> 
      (confidence ${scores[0].score}%).<br/>
      Contoh pertanyaan: 
      <em>"Regulasi apa yang mengatur ${scores[0].topic}?"</em>
    `;
  }
}

export const ExpertAI = new ExpertAssistant();
