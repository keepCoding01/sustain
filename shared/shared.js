// Shared utilities and datasets for SustainAlign Prototype

// -----------------------------
//  Basic Selector
// -----------------------------
export const el = (id) => document.getElementById(id);

// -----------------------------
//  Delay / async simulation
// -----------------------------
export function simulateDelay(min = 500, max = 1200) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

// -----------------------------
//  Topics (12 Sustainability Categories)
// -----------------------------
export const TOPICS = [
  'Emisi (Carbon & Air)',
  'Air & Water Management',
  'Limbah & Circular Economy',
  'Hak Tenaga Kerja',
  'Kesehatan & Keselamatan Kerja',
  'Governance & Anti-Corruption',
  'Biodiversity',
  'Energy Efficiency',
  'Supply Chain & Sourcing',
  'Community & Social Impact',
  'Product Stewardship',
  'Climate Risk & Adaptation'
];

// -----------------------------
//  Local Regulations Dataset
// -----------------------------
export const LOCAL_REGS = [
  { id: 'KLHK-001', title: 'Peraturan Emisi 2021', keywords: ['emisi', 'carbon', 'udara'] },
  { id: 'LIM-004', title: 'Limbah B3 2022', keywords: ['limbah', 'b3', 'waste'] },
  { id: 'K3-003', title: 'Keselamatan Kerja 2019', keywords: ['k3', 'safety', 'health'] },
  { id: 'ESDM-002', title: 'Permen Energi 2020', keywords: ['energi', 'energy', 'efisiensi'] }
];

// -----------------------------
//  Global Standards Mapping
// -----------------------------
export const REGs_GLOBAL = {
  GRI: [
    { id: 'GRI 305', topic: 'Emissions' },
    { id: 'GRI 306', topic: 'Waste' },
    { id: 'GRI 403', topic: 'Occupational Health & Safety' },
    { id: 'GRI 302', topic: 'Energy' }
  ],
  ISSB: [
    { id: 'ISSB S2', topic: 'Climate-related disclosures' },
    { id: 'ISSB S1', topic: 'General Sustainability' }
  ],
  SASB: [
    { id: 'SASB EM-ENERGY', topic: 'Energy management' },
    { id: 'SASB WST-MGMT', topic: 'Waste management' }
  ]
};

// -----------------------------
//  Sector-based Regulation Recommendations
// -----------------------------
export const REGS = {
  manufacturing: [
    { id: 'KLHK-001', title: 'Peraturan Emisi 2021' },
    { id: 'LIM-004', title: 'Limbah B3 2022' }
  ],
  energy: [
    { id: 'ESDM-002', title: 'Permen Energi 2020' },
    { id: 'KLHK-001', title: 'Peraturan Emisi 2021' }
  ],
  finance: [
    { id: 'OJK-16/2021', title: 'SEOJK 16/2021 — Sustainability Reporting' }
  ],
  agri: [
    { id: 'PERKEBUNAN-03', title: 'Perkebunan Berkelanjutan 2020' }
  ]
};

// -----------------------------
//  Indicator Recommendations
// -----------------------------
export const INDICATORS_ALL = {
  manufacturing: ['GRI 305 — Emisi', 'GRI 306 — Limbah', 'ISSB S2 — Climate Disclosure'],
  energy: ['GRI 302 — Energi', 'GRI 305 — Emisi', 'ISSB S2 — Climate Risk'],
  finance: ['GRI 201 — Economic Performance', 'ISSB S1 — General Sustainability'],
  agri: ['GRI 303 — Air', 'GRI 304 — Biodiversity']
};

// -----------------------------
//  Similarity (Local ↔ Global)
// -----------------------------
export function similarity(localKeywords, globalTopic) {
  let score = 0;
  const text = globalTopic.toLowerCase();
  localKeywords.forEach((k) => {
    if (text.includes(k)) score += 40;
  });
  score += Math.floor(Math.random() * 30);
  return Math.min(score, 100);
}

// -----------------------------
//  VALIDATION ENGINE (Feature 4)
// -----------------------------
export function assessValidation(fields) {
  const required = ['emission', 'energy', 'waste'];
  let score = 0;
  let missing = [];

  required.forEach((r) => {
    if (fields.includes(r)) score += 30;
    else missing.push(r);
  });

  if (fields.includes('safety')) score += 10;
  if (fields.includes('hrs')) score += 10;
  if (fields.includes('supply')) score += 10;

  score = Math.min(score + Math.floor(Math.random() * 8), 100);
  return { score, missing };
}

export function mapFieldLabel(key) {
  const map = {
    emission: 'Emission Inventory',
    energy: 'Energy Consumption',
    waste: 'Waste Report',
    safety: 'H&S Records',
    hrs: 'Labor Rights',
    supply: 'Supply Chain Data'
  };
  return map[key] || key;
}

export function generateRemedies(list) {
  const remedies = [];

  list.forEach((item) => {
    if (item === 'emission')
      remedies.push({
        title: 'Conduct Emission Inventory',
        detail: 'Lakukan inventarisasi emisi (Scope 1 & 2) dan dokumentasikan methodology.'
      });

    if (item === 'energy')
      remedies.push({
        title: 'Collect Energy Data',
        detail: 'Kumpulkan data konsumsi energi per unit produksi dan verifikasi meter.'
      });

    if (item === 'waste')
      remedies.push({
        title: 'Limbah Handling Plan',
        detail: 'Susun rencana pengelolaan limbah B3 dan lakukan monitoring bulanan.'
      });
  });

  if (remedies.length === 0)
    remedies.push({
      title: 'All core fields present',
      detail: 'Dokumen memenuhi persyaratan minimum. Pertimbangkan expert review.'
    });

  return remedies;
}

// -----------------------------
//  Logging Utility
// -----------------------------
export function logFlowValidation(containerId, msg) {
  const container = el(containerId);
  if (!container) return;
  const div = document.createElement('div');
  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  div.className = 'text-sm text-slate-700';
  container.prepend(div);
}

// -----------------------------
//  Export JSON Summary
// -----------------------------
export function exportValidationSummary(data, filename = 'validation_summary.json') {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "SustainAlign Prototype",
    ...data
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


export function exportCSV(rows, filename = "export.csv") {
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
