// ===============================
// Export utilities for SustainAlign (Final)
// ===============================

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// EXPORT JSON
export function exportJSON(data, filename = "export.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  downloadBlob(blob, filename);
}

// EXPORT CSV
export function exportCSV(rows, filename = "export.csv") {
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, filename);
}

// EXPORT Excel (.xlsx mock — real backend ready)
export function exportXLSX(rows, filename = "export.xlsx") {
  const table = rows.map(r => r.join("\t")).join("\n");
  const blob = new Blob([table], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, filename);
}

// EXPORT PDF (mock preview)
export function exportPDF(text, filename = "report.pdf") {
  const blob = new Blob([text], { type: "application/pdf" });
  downloadBlob(blob, filename);
}

console.log("[EXPORT] export.js final loaded");
