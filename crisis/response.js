// crisis/crisis.js
import { injectLayout } from "../shared/components.js";
try { injectLayout(); } catch(e){ /* ignore */ }

/*
  Crisis Playbook mock generator
  - generatePlaybook: produce actions, timeline, communication, checklist, post-review
  - renderTimelineChart: draw with Chart.js (horizontal bar-like)
  - exportPDF: capture outputArea with html2canvas and build PDF with jsPDF
*/

const el = (id) => document.getElementById(id);

// helper randomizer for more realistic variation
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return 'PB-' + Math.floor(Math.random() * 90000 + 10000); }

// small templates
const IMMEDIATE_TEMPLATES = {
  'kebocoran limbah': [
    "Evacuate the immediate area and cordon off a 50m perimeter.",
    "Stop source of leak if safe to do so; shut isolation valves.",
    "Deploy absorbent & containment booms; prevent spread to drains.",
    "Notify HSE officer and on-call emergency team.",
    "Record initial observations (time, volume estimate, material) and take photos."
  ],
  'kebakaran': [
    "Activate fire alarm and initiate evacuation to assembly point.",
    "Call emergency services and site fire team immediately.",
    "Use portable extinguishers only if fire is small and safe to approach.",
    "Shut down nearby equipment and isolate flammable sources.",
    "Establish command post and headcount at assembly point."
  ],
  'workplace accident': [
    "Ensure scene is safe; provide first aid within scope of training.",
    "Call emergency medical services if required.",
    "Secure the area; prevent tampering with evidence.",
    "Notify line manager and HSE.",
    "Record witness details and immediate conditions (weather, lighting)."
  ],
  'spill chemical': [
    "Stop the source (valve shut-off) if safe.",
    "Contain spill with absorbents and prevent drainage into waterways.",
    "Use appropriate PPE and ventilate area if vapors present.",
    "Call spill response team and HSE.",
    "Collect material safety data sheet (MSDS) and confirm chemical identity."
  ],
  'other': [
    "Assess risk and isolate area.",
    "Notify responsible personnel and escalate to emergency team.",
    "Collect initial facts and evidence.",
    "Establish immediate containment and temporary controls.",
    "Document the event and update stakeholder communications."
  ]
};

const COMM_TEMPLATES = {
  shortTemplate: (meta) => `
Subject: Incident Report — ${meta.incidentType} at ${meta.location}

Dear Stakeholders,

At ${meta.whenLocal} there was a ${meta.incidentType} at ${meta.location} (asset: ${meta.asset}).
Immediate actions taken: ${meta.actionsShort}

Current status: ${meta.status}

Next steps:
- Safety: ensure all personnel are safe
- Containment: containment measures in progress
- Reporting: full report to follow within 24 hours

Regards,
${meta.reporter || 'Site HSE Team'}
`.trim()
};

// regulatory timeline generator (mock): produce array of {label, daysFromNow}
function generateRegulatoryTimeline(severity) {
  // severity: low, moderate, high, critical
  const base = {
    'low': [1,3,7,14],
    'moderate': [0,1,3,7,30],
    'high': [0,1,3,7,14,30],
    'critical': [0,0,1,3,7,14,30]
  };
  const events = [
    'Internal Incident Log',
    'Internal Notification to Regulator (if applicable)',
    'Initial Investigation Report',
    'Containment & Corrective Plan Submitted',
    'Regulatory Inspection',
    'Formal Follow-up Report',
    'Post-incident Review & Action Plan'
  ];
  const days = base[severity] || base['moderate'];
  // map to events length (cap)
  const timeline = [];
  for (let i=0;i<days.length;i++){
    timeline.push({ label: events[i] || `Action ${i+1}`, daysFromNow: days[i] });
  }
  return timeline;
}

function synthesizeActions(type, severity, notes) {
  const base = IMMEDIATE_TEMPLATES[type] || IMMEDIATE_TEMPLATES['other'];
  // pick N based on severity
  const severityMap = { 'low': 2, 'moderate': 3, 'high': 4, 'critical': 5 };
  const n = severityMap[severity] || 3;
  // return top n with small modifications for realism
  return base.slice(0, n).map((t, i) => `${t} ${i===0 && notes?`(Note: ${notes})`:''}`.trim());
}

function generateCommTemplate(meta) {
  const short = meta.actions.slice(0,3).join('; ');
  const payload = {
    incidentType: meta.incidentType,
    location: meta.location,
    asset: meta.asset || '-',
    whenLocal: new Date(meta.when).toLocaleString(),
    actionsShort: short,
    reporter: meta.reporter || 'Site HSE Team',
    status: meta.severity.toUpperCase()
  };
  return COMM_TEMPLATES.shortTemplate(payload);
}

function buildChecklist(type, severity) {
  const common = [
    "Photographic evidence of scene",
    "Incident log with timestamps",
    "Witness statements",
    "Material Safety Data Sheet (MSDS) if chemicals involved",
    "Containment & remediation records",
    "Notification records to authorities/third parties"
  ];
  if (type === 'kebakaran') {
    common.unshift("Fire department attendance record", "Fire extinguishers usage log");
  }
  if (type === 'kebocoran limbah' || type === 'spill chemical') {
    common.unshift("Sampling results (water/soil)", "Containment booms/absorbent deployment log");
  }
  if (severity === 'critical') {
    common.push("External expert assessment report", "Legal counsel engagement record");
  }
  return common;
}

// render timeline chart using Chart.js
let timelineChart = null;
function renderTimelineChart(canvasId, timeline) {
  const ctx = document.getElementById(canvasId).getContext('2d');

  // prepare labels and values (days)
  const labels = timeline.map(t => t.label);
  const values = timeline.map(t => t.daysFromNow);

  // destroy if exists
  if (timelineChart) { timelineChart.destroy(); timelineChart = null; }

  timelineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Days from incident',
        data: values,
        backgroundColor: values.map(v => v === 0 ? '#dc2626' : v <= 3 ? '#f59e0b' : '#10b981'),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          ticks: { beginAtZero: true },
          title: { display: true, text: 'Days from incident' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `In ${ctx.raw} day(s)` } }
      }
    }
  });
}

// generate a full playbook object
function generatePlaybookObject(inputs) {
  const id = uid();
  const now = new Date().toISOString();
  const actions = synthesizeActions(inputs.incidentType, inputs.severity, inputs.notes);
  const timeline = generateRegulatoryTimeline(inputs.severity);
  const checklist = buildChecklist(inputs.incidentType, inputs.severity);
  const comm = generateCommTemplate({ ...inputs, actions });
  const postReview = `Conduct root cause analysis within 14 days; implement corrective actions, monitor outcomes for 90 days. Assign owner and timeline.`;

  return {
    id,
    generatedAt: now,
    metadata: inputs,
    actions,
    regulatoryTimeline: timeline,
    documentationChecklist: checklist,
    communicationTemplate: comm,
    postIncidentReview: postReview
  };
}

// UI wiring
const genBtn = el('genBtn');
const outputArea = el('outputArea');
const actionsList = el('actionsList');
const docChecklist = el('docChecklist');
const commTemplate = el('commTemplate');
const postReview = el('postReview');
const metaBlock = el('metaBlock');
const exportJsonBtn = el('exportJson');
const copyBtn = el('copyBtn');
const downloadPdfBtn = el('downloadPdf');
const downloadTimelinePng = el('downloadTimelinePng');

let currentPlaybook = null;

genBtn.addEventListener('click', () => {
  // gather inputs
  const inputs = {
    incidentType: el('incidentType').value,
    severity: el('severity').value,
    location: el('location').value || 'Unknown location',
    when: el('when').value || new Date().toISOString(),
    asset: el('asset').value || '-',
    reporter: el('reporter').value || '-',
    notes: el('notes').value || ''
  };

  // generate
  currentPlaybook = generatePlaybookObject(inputs);

  // render UI
  outputArea.classList.remove('hidden');
  // actions
  actionsList.innerHTML = '';
  currentPlaybook.actions.forEach(a => {
    const li = document.createElement('li'); li.textContent = a; actionsList.appendChild(li);
  });

  // checklist
  docChecklist.innerHTML = '';
  currentPlaybook.documentationChecklist.forEach(c => {
    const li = document.createElement('li'); li.textContent = c; docChecklist.appendChild(li);
  });

  // comm
  commTemplate.innerHTML = `<pre class="whitespace-pre-wrap text-xs">${currentPlaybook.communicationTemplate}</pre>`;

  // post
  postReview.innerHTML = `<div class="text-sm">${currentPlaybook.postIncidentReview}</div>`;

  // metadata
  metaBlock.innerHTML = `
    ID: <strong>${currentPlaybook.id}</strong><br/>
    Generated: ${new Date(currentPlaybook.generatedAt).toLocaleString()}<br/>
    Severity: <strong>${inputs.severity}</strong> • Incident: <strong>${inputs.incidentType}</strong>
  `;

  // timeline chart
  renderTimelineChart('timelineChart', currentPlaybook.regulatoryTimeline);
});

// Export JSON
exportJsonBtn.addEventListener('click', () => {
  if (!currentPlaybook) return alert('Generate playbook dulu.');
  const blob = new Blob([JSON.stringify(currentPlaybook, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `playbook_${currentPlaybook.id}.json`; a.click();
  URL.revokeObjectURL(url);
});

// Copy summary to clipboard
copyBtn.addEventListener('click', async () => {
  if (!currentPlaybook) return alert('Generate playbook dulu.');
  const txt = [
    `Playbook ID: ${currentPlaybook.id}`,
    `Incident: ${currentPlaybook.metadata.incidentType} — ${currentPlaybook.metadata.location} (${new Date(currentPlaybook.metadata.when).toLocaleString()})`,
    `Immediate actions:\n- ${currentPlaybook.actions.join('\n- ')}`,
    `Communication:\n${currentPlaybook.communicationTemplate}`
  ].join('\n\n');
  try {
    await navigator.clipboard.writeText(txt);
    alert('Summary copied to clipboard');
  } catch (e) {
    alert('Gagal copy. Silakan salin manual.');
  }
});

// Export PDF (capture outputArea)
downloadPdfBtn.addEventListener('click', async () => {
  if (!currentPlaybook) return alert('Generate playbook dulu.');

  // capture the outputArea node
  const node = outputArea;
  // temporarily ensure styles for good capture
  node.style.background = 'white';
  try {
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    // create PDF with jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // calculate image dimensions
    const imgProps = { width: canvas.width, height: canvas.height };
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const imgW = imgProps.width * ratio;
    const imgH = imgProps.height * ratio;
    pdf.addImage(imgData, 'PNG', (pageWidth - imgW) / 2, 40, imgW, imgH);
    pdf.setProperties({ title: `Playbook_${currentPlaybook.id}` });
    pdf.save(`playbook_${currentPlaybook.id}.pdf`);
  } catch (err) {
    console.error(err);
    alert('Gagal membuat PDF. Lihat console.');
  } finally {
    node.style.background = '';
  }
});

// download timeline chart image only
downloadTimelinePng.addEventListener('click', () => {
  if (!timelineChart) return alert('Generate timeline terlebih dahulu.');
  const a = document.createElement('a');
  a.href = timelineChart.toBase64Image();
  a.download = `timeline_${currentPlaybook ? currentPlaybook.id : Date.now()}.png`;
  a.click();
});

// small UX: allow pressing Enter on form to generate
['incidentType','severity','location','when','asset','reporter'].forEach(id=>{
  const eln = document.getElementById(id);
  if(eln) eln.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter') { e.preventDefault(); genBtn.click(); }
  });
});
