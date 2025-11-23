// validation/validation.js
import { simulateDelay, mapFieldLabel } from "../shared/shared.js";

/**
 * Weighted validation engine:
 * - required fields each contribute a base weight
 * - optional fields contribute smaller weights
 * - data quality and documentation can add bonus (simulated)
 */
export async function runValidationEngine(presentFields = []) {
  await simulateDelay(300, 900);

  // configuration
  const required = { emission: 30, energy: 30, waste: 30 };
  const optional = { safety: 5, hrs: 2.5, supply: 2.5 };

  let score = 0;
  const missing = [];

  // required
  Object.keys(required).forEach(k => {
    if (presentFields.includes(k)) score += required[k];
    else missing.push(k);
  });

  // optional
  Object.keys(optional).forEach(k => {
    if (presentFields.includes(k)) score += optional[k];
  });

  // simulated documentation quality boost (mock)
  const docQualityBoost = Math.floor(Math.random() * 8); // 0-7
  score = Math.min(100, Math.round(score + docQualityBoost));

  // build breakdown
  const breakdown = {
    baseScore: score - docQualityBoost,
    docQualityBoost,
    finalScore: score
  };

  // remedies (for missing)
  const remedies = missing.map(m => {
    const label = mapFieldLabel(m);
    let detail = "";
    if (m === 'emission') detail = "Lakukan inventarisasi emisi (Scope 1 & 2), gunakan standardized methodology, dan simpan evidence (meter readings, logs).";
    if (m === 'energy') detail = "Kumpulkan data pemakaian energi per unit; verifikasi meter dan laporkan periodik.";
    if (m === 'waste') detail = "Sertakan rencana pengelolaan limbah B3, lokasi pembuangan, dan monitoring rutin.";
    return { field: m, label, detail };
  });

  return { score, breakdown, missing, remedies };
}

/**
 * Generate AI suggestions (richer & more realistic) for the validation result.
 * Accepts the result object returned by runValidationEngine and returns an array
 * of suggestion objects { title, text }.
 */
export function generateAISuggestions(result = {}) {
  // result: { score, breakdown, missing, remedies }
  const suggestions = [];
  const score = result.score || 0;
  const missing = result.missing || [];

  // helper for randomized phrasing
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const introPhrases = [
    "Saran segera",
    "Rekomendasi praktis",
    "Langkah yang disarankan",
    "Action plan singkat"
  ];
  const tonePhrases = [
    "Segera lakukan", "Pertimbangkan untuk", "Rencanakan", "Prioritaskan"
  ];

  // If score high => consolidation suggestions
  if (score >= 80) {
    suggestions.push({
      title: pick(introPhrases) + " — Optimisasi & dokumentasi",
      text: `${pick(tonePhrases)} peningkatan dokumentasi dan verifikasi eksternal. Pertimbangkan third-party assurance untuk meningkatkan kredibilitas laporan.`
    });
  } else {
    // if missing key fields, provide concrete steps
    if (missing.length > 0) {
      missing.forEach(m => {
        if (m === 'emission') {
          suggestions.push({
            title: "Inventaris Emisi (Scope 1 & 2)",
            text: `${pick(tonePhrases)} inventarisasi emisi. Mulai dari identifikasi sumber, pengukuran (meter/fuel logs), hingga kalkulasi CO2e per metodologi standar. Target: baseline dalam 3 bulan.`
          });
        }
        if (m === 'energy') {
          suggestions.push({
            title: "Pengumpulan Data Energi",
            text: `${pick(tonePhrases)} penerapan sistem pembacaan meter terjadwal, konsolidasi data per unit produksi, dan audit energi internal. Gunakan dashboard untuk monitoring harian.`
          });
        }
        if (m === 'waste') {
          suggestions.push({
            title: "Rencana Pengelolaan Limbah",
            text: `${pick(tonePhrases)} membuat SOP pengelolaan limbah B3, penanggung jawab lapangan, dan jadwal monitoring. Sertakan log pembuangan dan vendor berlisensi.`
          });
        }
      });

      // generic suggestion to close gaps faster
      suggestions.push({
        title: "Tingkatkan Kapasitas Internal",
        text: `Adakan pelatihan singkat untuk tim operasional dan compliance tentang pengumpulan data, template pelaporan, dan penggunaan dashboard. Ini mempercepat pengisian missing items.`
      });
    } else {
      // no missing but score moderate
      suggestions.push({
        title: "Perkuat Validasi Data",
        text: `Meskipun field sudah ada, tingkatkan kualitas data by implementing QA checks, sampling, dan cross-validation antara meter & laporan.`
      });
    }

    // cost / timeline hint (randomized)
    const timelines = ["2-4 minggu", "1-3 bulan", "3-6 bulan"];
    suggestions.push({
      title: "Est. effort & next step",
      text: `Perkirakan effort: ${pick(timelines)} untuk implementasi awal (data collection + SOP). Prioritaskan emissions & energy jika resources terbatas.`
    });
  }

  // final: short prioritized checklist
  suggestions.push({
    title: "Checklist prioritas",
    text: `1) Dokumentasi sumber data • 2) Assign owner per indikator • 3) Implement QC & reporting cadence.`
  });

  // return up to 5 suggestions
  return suggestions.slice(0, 6);
}

export default runValidationEngine;
