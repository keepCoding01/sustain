// use-case-simulation.js
// Module: Use Case Simulation for SustainAlign prototype
// Two scenarios: Compliance flow (Tekstil) and Crisis flow (Kebocoran Limbah B3)

import { simulateDelay, LOCAL_REGS, REGS } from '../shared/shared.js';
import { exportValidationSummary } from '../shared/shared.js'; // reuse export util

const $ = s => document.querySelector(s);

/**
 * Default steps for compliance flow (simplified and presentable)
 */
const COMPLIANCE_FLOW_STEPS = [
  { id: 'ingest', label: 'Ingest company profile & uploaded documents' },
  { id: 'aggregate', label: 'Aggregate relevant regulations (auto-crawl mock)' },
  { id: 'classify', label: 'AI Classifier → categorize into sustainability topics' },
  { id: 'harmonize', label: 'Map local regs to global standards (GRI/ISSB/SASB)' },
  { id: 'recommend', label: 'Recommend indicators & priority actions' },
  { id: 'validate', label: 'Run Auto-Validation Engine (score)' },
  { id: 'report', label: 'Generate Draft Compliance Report (one-click)' }
];

/**
 * Default steps for crisis flow
 */
const CRISIS_FLOW_STEPS = [
  { id: 'report_incident', label: 'User reports incident (mobile input)' },
  { id: 'triage', label: 'Triage severity & immediate actions' },
  { id: 'notify', label: 'Generate stakeholder notifications (regulator, media, staff)' },
  { id: 'reg_check', label: 'Check emergency regulations & response obligations' },
  { id: 'document', label: 'Create incident documentation & timeline' },
  { id: 'followup', label: 'Recommend remediation & legal steps' }
];

export default function initUseCaseSim(opts = {}) {
  const btnCompliance = $(opts.btnCompliance || '#runCompliance');
  const btnCrisis = $(opts.btnCrisis || '#runCrisis');
  const resetBtn = $(opts.resetBtn || '#resetSim');
  const timelineEl = $(opts.timeline || '#simTimeline');
  const currentStepEl = $(opts.currentStep || '#currentStep');
  const simStatusEl = $(opts.simStatus || '#simStatus');
  const outputsEl = $(opts.outputs || '#simOutputs');
  const speedEl = $(opts.speed || '#simSpeed');
  const exportBtn = $(opts.exportBtn || '#exportSim');

  let running = false;
  let audit = [];

  function logStep(text) {
    const d = document.createElement('div');
    d.className = 'p-2 rounded bg-white/70';
    d.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    timelineEl.prepend(d);
    audit.unshift({ ts: new Date().toISOString(), text });
  }

  async function runFlow(steps, context = {}) {
    if (running) return;
    running = true;
    simStatusEl.textContent = 'running';
    audit = [];
    timelineEl.innerHTML = '';
    outputsEl.innerHTML = '';
    currentStepEl.textContent = 'starting';

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      currentStepEl.textContent = `${i+1}/${steps.length} — ${step.label}`;
      logStep(`Started: ${step.label}`);
      // variable delay controlled by slider
      const speed = parseFloat(speedEl?.value || 1);
      await simulateDelay(600 * (2 - speed), 1200 * (2 - speed));

      // simulate different actions
      if (step.id === 'aggregate') {
        // mock: pick regs for sector
        const regs = REGS['manufacturing'] || [];
        logStep(`Aggregated ${regs.length} regulations: ${regs.map(r=>r.id).join(', ')}`);
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Aggregated regs: <strong>${regs.map(r=>r.id).join(', ')}</strong></div>`;
      }

      if (step.id === 'classify') {
        // classification summary mock
        const sample = LOCAL_REGS.slice(0,3).map(r=>`${r.id} (${r.keywords.join(',')})`).join('; ');
        logStep(`Classified documents: ${sample}`);
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Classified: ${sample}</div>`;
      }

      if (step.id === 'harmonize') {
        logStep('Harmonized local regs to GRI / ISSB (mock)');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Harmonization: KLHK-001 → GRI 305</div>`;
      }

      if (step.id === 'recommend') {
        logStep('Recommended indicators: GRI 305, GRI 306');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Indicators: GRI 305, GRI 306</div>`;
      }

      if (step.id === 'validate') {
        // attempt to call modular validation engine (if present)
        try {
          const { runValidationEngine } = await import('../validation/validation.js');
          const res = await runValidationEngine(['emission','energy','waste'], { docQuality:'simulated' });
          logStep(`Validation score: ${res.score}%`);
          outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Validation score: <strong>${res.score}%</strong></div>`;
        } catch (e) {
          // fallback mock
          const mockScore = Math.floor(70 + Math.random()*20);
          logStep(`Validation (mock) score: ${mockScore}%`);
          outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Validation score: <strong>${mockScore}%</strong> (mock)</div>`;
        }
      }

      if (step.id === 'report') {
        logStep('Generated draft compliance report (preview)');
        outputsEl.innerHTML += `<div class="p-3 bg-white/90 rounded"><strong>Draft Report:</strong><div class="text-xs text-slate-600 mt-1">Section: Emissions, Energy, Waste — Indicators auto-filled</div></div>`;
      }

      if (step.id === 'report_incident') {
        logStep('Incident recorded: Kebocoran Limbah B3 — lokasi: Plant A');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Incident: Kebocoran Limbah B3 — Plant A</div>`;
      }

      if (step.id === 'triage') {
        logStep('Triage: Severity HIGH. Immediate containment recommended.');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Triage: Severity HIGH</div>`;
      }

      if (step.id === 'notify') {
        logStep('Notifications generated for regulator & community (templates)');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Notifications: Regulator, Media, Staff</div>`;
      }

      if (step.id === 'reg_check') {
        logStep('Checked emergency regs: Found 2 relevant obligations');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Emergency obligations: Report to KLHK within 24h</div>`;
      }

      if (step.id === 'document') {
        logStep('Incident documentation compiled');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Document: Timeline & evidence placeholders</div>`;
      }

      if (step.id === 'followup') {
        logStep('Follow-up: Remediation plan & legal counsel recommended');
        outputsEl.innerHTML += `<div class="p-2 bg-white/80 rounded">Follow-up: Remediation plan ready</div>`;
      }

      logStep(`Completed: ${step.label}`);
    }

    currentStepEl.textContent = 'completed';
    simStatusEl.textContent = 'idle';
    running = false;
    logStep('Simulation finished');
  }

  // Public bindings
  btnCompliance?.addEventListener('click', () => runFlow(COMPLIANCE_FLOW_STEPS, { sector: 'manufacturing' }));
  btnCrisis?.addEventListener('click', () => runFlow(CRISIS_FLOW_STEPS, { incident: 'kebocoran limbah' }));
  resetBtn?.addEventListener('click', () => {
    timelineEl.innerHTML = '';
    outputsEl.innerHTML = '';
    currentStepEl.textContent = '—';
    simStatusEl.textContent = 'idle';
    audit = [];
  });

  exportBtn?.addEventListener('click', () => {
    const payload = {
      audit,
      outputs: Array.from(outputsEl.children).map(n => n.textContent.trim()),
      timestamp: new Date().toISOString()
    };
    exportValidationSummary(payload, `usecase_sim_${Date.now()}.json`);
  });

  // init hint
  logStep('Use case simulation module ready (mock).');

  return {
    runCompliance: () => runFlow(COMPLIANCE_FLOW_STEPS),
    runCrisis: () => runFlow(CRISIS_FLOW_STEPS),
    getAudit: () => audit
  };
}
