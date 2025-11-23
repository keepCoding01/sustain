// Report Builder Logic for SustainAlign
import { el, INDICATORS, REGS, simulateDelay } from "../shared/shared.js";

// Utility: create element
function make(tag, cls = "", html = "") {
  const x = document.createElement(tag);
  if (cls) x.className = cls;
  if (html) x.innerHTML = html;
  return x;
}

// DOM
const sectorSel = el("sectorSelect");
const generateBtn = el("generateReport");
const editorArea = el("editorArea");
const previewBtn = el("previewBtn");
const previewBox = el("previewBox");
const exportJSON = el("exportJSON");
const exportHTML = el("exportHTML");

// Build outline structure
function buildOutline(sector) {
  const indicators = INDICATORS[sector] || [];
  const regs = REGS[sector] || [];

  return {
    sector,
    indicators,
    regulations: regs.map((r) => r.title),
    sections: [
      {
        title: "1. Overview Perusahaan",
        content: "[Tuliskan deskripsi perusahaan, sektor, lokasi, dan konteks keberlanjutan]",
      },
      {
        title: "2. Kerangka Regulasi & Standar Global",
        content:
          "SustainAlign mengidentifikasi regulasi utama: " +
          regs.map((r) => r.title).join(", ") +
          ". Standar global relevan: " + indicators.join(", ") + ".",
      },
      {
        title: "3. Pengungkapan Sesuai Indikator",
        content:
          "Bagian ini berisi pengungkapan berdasarkan indikator: " +
          indicators.join(", ") +
          ". Jelaskan data, metodologi, dan hasil utama.",
      },
      {
        title: "4. Analisis Risiko & Kinerja",
        content:
          "Analisis risiko terkait emisi, energi, limbah, dan aspek keberlanjutan lainnya. Sertakan grafik atau tabel jika tersedia.",
      },
      {
        title: "5. Rencana Perbaikan & Aksi Ke Depan",
        content:
          "Identifikasi gap berdasarkan validasi SustainAlign dan susun rencana tindak lanjut.",
      },
    ],
  };
}

// Render outline to editor
function renderEditor(outline) {
  editorArea.innerHTML = "";
  outline.sections.forEach((sec, idx) => {
    const box = make(
      "div",
      "p-4 mb-4 bg-white/70 rounded-xl border",
      `<h3 class="font-bold text-slate-800 mb-2">${sec.title}</h3>
       <textarea data-idx="${idx}" class="sectionText w-full p-3 rounded-lg bg-white border min-h-[120px]">${sec.content}</textarea>`
    );
    editorArea.appendChild(box);
  });
}

// Gather editor content
function collectReport() {
  const sector = sectorSel.value;
  const indicators = INDICATORS[sector] || [];
  const regs = REGS[sector] || [];
  const texts = Array.from(document.querySelectorAll(".sectionText"));
  return {
    sector,
    indicators,
    regulations: regs.map((r) => r.title),
    sections: texts.map((t) => ({ title: t.parentElement.querySelector("h3").textContent, content: t.value })),
    timestamp: new Date().toISOString(),
  };
}

// Handlers
generateBtn.addEventListener("click", async () => {
  const sector = sectorSel.value;
  editorArea.innerHTML = "<div class='p-4 text-slate-600'>Membangun laporan...</div>";
  await simulateDelay(300, 700);
  const outline = buildOutline(sector);
  renderEditor(outline);
});

previewBtn.addEventListener("click", () => {
  const data = collectReport();
  let html = "";
  data.sections.forEach((s) => {
    html += `<h3 class='font-bold text-lg mb-1'>${s.title}</h3><p class='mb-4 text-slate-700'>${s.content}</p>`;
  });
  previewBox.innerHTML = html;
});

exportJSON.addEventListener("click", () => {
  const data = collectReport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sustainalign_report.json";
  a.click();
  URL.revokeObjectURL(url);
});

exportHTML.addEventListener("click", () => {
  const data = collectReport();
  let html = `<!DOCTYPE html><html><head><meta charset='UTF-8'><title>SustainAlign Report</title></head><body>`;
  data.sections.forEach((s) => {
    html += `<h2>${s.title}</h2><p>${s.content}</p>`;
  });
  html += "</body></html>";

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sustainalign_report.html";
  a.click();
  URL.revokeObjectURL(url);
});
