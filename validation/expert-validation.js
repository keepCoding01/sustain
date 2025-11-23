// validation/expert-validation.js
// Hybrid Expert Validation UI + logic for SustainAlign prototype
// Exports initExpertValidation(options) to attach the hybrid panel to any page.
// Simulates: request review -> expert reviews (mock, delayed) -> expert validates / requests changes.
// Author: SustainAlign Prototype

import { simulateDelay } from '../shared/shared.js';

// small helper
const $ = (s) => document.querySelector(s);

// default markup for hybrid panel (keeps visual consistent with site)
function createPanelHtml(opts) {
  const proposalLink = opts.proposalUrl || '#';
  return `
    <div id="hybridPanel" class="mt-4 bg-white/80 p-4 rounded-xl border">
      <h4 class="font-semibold">Hybrid AI + Expert Validation</h4>
      <p class="text-xs text-slate-600 mt-1">AI result vs expert review. Toggle the flow to request an expert and finalize validation.</p>

      <div class="mt-3 grid grid-cols-1 gap-3">
        <div class="flex items-center justify-between">
          <div class="text-sm">AI Compliance Score</div>
          <div id="hv_aiScore" class="font-bold text-xl">--%</div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">Status</div>
          <div id="hv_status" class="font-semibold text-sm text-sblue600">AI only</div>
        </div>

        <div id="hv_timeline" class="text-sm text-slate-700 mt-2 space-y-2">
          <div class="p-2 rounded bg-white/70">AI generated result (pending)</div>
        </div>

        <div class="mt-2 flex gap-2">
          <button id="hv_requestExpert" class="px-3 py-2 rounded bg-sblue600 text-white text-sm">Request Expert Review</button>
          <button id="hv_markValidated" class="px-3 py-2 rounded bg-sgreen600 text-white text-sm hidden">Mark as Expert Validated</button>
          <button id="hv_reject" class="px-3 py-2 rounded border text-sm hidden">Request Changes</button>
        </div>

        <div class="mt-2 text-xs text-slate-500">
          <div>Proposal reference: <a href="${proposalLink}" target="_blank" class="underline text-sblue600">proposal.docx</a></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * initExpertValidation(options)
 * options:
 *   container: selector or element where panel will be injected (default: '#hybridPlaceholder')
 *   scoreSelector: selector string for element that holds AI score (e.g. '#scoreVal')
 *   onValidated: callback(result) when expert marks validated
 *   onRequest: callback(info) when expert review requested
 *   proposalUrl: string (local path) for reference link
 */
export function initExpertValidation(opts = {}) {
  const container = (typeof opts.container === 'string') ? $(opts.container) : opts.container;
  if (!container) {
    console.warn('initExpertValidation: container not found', opts.container);
    return null;
  }

  // inject markup
  container.innerHTML = createPanelHtml(opts);

  // elements
  const aiScoreEl = document.querySelector(opts.scoreSelector || '#scoreVal') || document.getElementById('scoreVal');
  const hv_aiScore = $('#hv_aiScore');
  const hv_status = $('#hv_status');
  const hv_timeline = $('#hv_timeline');
  const btnRequest = $('#hv_requestExpert');
  const btnMark = $('#hv_markValidated');
  const btnReject = $('#hv_reject');

  // internal state
  const state = {
    aiScore: parseInt((aiScoreEl?.textContent || '0').replace('%','')) || 0,
    status: 'AI only', // 'AI only' | 'Under Review' | 'Expert Validated' | 'Changes Requested'
    audit: []
  };

  // sync AI score when it updates (polling simple approach)
  function syncScore() {
    const val = parseInt((aiScoreEl?.textContent || '0').replace('%','')) || state.aiScore;
    state.aiScore = val;
    hv_aiScore.textContent = `${state.aiScore}%`;
  }
  // initial sync
  syncScore();

  // tiny helper to push timeline entries
  function pushTimeline(label, detail='') {
    const div = document.createElement('div');
    div.className = 'p-2 rounded bg-white/70';
    const time = new Date().toLocaleTimeString();
    div.innerHTML = `<strong>${label}</strong><div class="text-xs text-slate-600">${detail}</div><div class="text-xs text-slate-400 mt-1">${time}</div>`;
    hv_timeline.prepend(div);
    state.audit.unshift({label, detail, time: new Date().toISOString()});
  }

  // simulate expert review (mock)
  async function simulateExpertReview(aiScore) {
    // set status
    state.status = 'Under Review';
    hv_status.textContent = 'Under Review';
    pushTimeline('Expert review requested', `Score: ${aiScore}%`);

    // disable request button
    btnRequest.disabled = true;
    btnRequest.classList.add('opacity-60', 'cursor-not-allowed');

    // simulate delay for review
    await simulateDelay(900, 2200);

    // decide mock outcome: if aiScore >= 75 then likely validate, else request changes (randomized)
    const rnd = Math.random();
    if (aiScore >= 80 || (aiScore >= 60 && rnd > 0.3)) {
      state.status = 'Expert Validated';
      hv_status.textContent = 'Expert Validated ✓';
      btnMark.classList.remove('hidden');
      btnReject.classList.add('hidden');
      pushTimeline('Expert validated', `Approved (AI ${aiScore}%)`);
      if (typeof opts.onValidated === 'function') opts.onValidated({aiScore, outcome:'validated', audit: state.audit});
    } else {
      state.status = 'Changes Requested';
      hv_status.textContent = 'Changes Requested';
      btnReject.classList.remove('hidden');
      btnMark.classList.add('hidden');
      pushTimeline('Expert requested changes', `Feedback: please provide missing core fields`);
      if (typeof opts.onRequest === 'function') opts.onRequest({aiScore, outcome:'changes_requested', audit: state.audit});
    }

    // re-enable request button for re-run
    btnRequest.disabled = false;
    btnRequest.classList.remove('opacity-60', 'cursor-not-allowed');
  }

  // event handlers
  btnRequest.addEventListener('click', () => {
    // re-sync score
    syncScore();
    simulateExpertReview(state.aiScore).catch(err => console.error(err));
  });

  btnMark.addEventListener('click', () => {
    state.status = 'Expert Validated';
    hv_status.textContent = 'Expert Validated ✓';
    pushTimeline('Marked as validated (manual)', 'Expert clicked "Mark as Expert Validated"');
    if (typeof opts.onValidated === 'function') opts.onValidated({aiScore: state.aiScore, outcome:'validated', audit: state.audit});
    // hide buttons
    btnMark.classList.add('hidden');
    btnReject.classList.add('hidden');
  });

  btnReject.addEventListener('click', () => {
    state.status = 'Changes Requested';
    hv_status.textContent = 'Changes Requested';
    pushTimeline('Marked as changes requested (manual)', 'Expert clicked "Request Changes"');
    if (typeof opts.onRequest === 'function') opts.onRequest({aiScore: state.aiScore, outcome:'changes_requested', audit: state.audit});
    btnMark.classList.add('hidden');
    btnReject.classList.add('hidden');
  });

  // public API (light)
  return {
    getState: () => ({...state}),
    refresh: () => { syncScore(); },
    requestExpert: () => { btnRequest.click(); }
  };
}

export default initExpertValidation;
