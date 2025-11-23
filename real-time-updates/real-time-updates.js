// real-time-updates.js
import { simulateDelay, LOCAL_REGS } from '../shared/shared.js';
import { exportJSON } from '../export/export.js';

const $ = sel => document.querySelector(sel);

function formatTime(d = new Date()) {
  return d.toLocaleString();
}

function makeMockUpdate() {
  const sampleTitles = [
    'Peraturan Emisi — Pembaruan definisi ambang batas',
    'Permen Energi — Revisi insentif efisiensi',
    'Surat Edaran Kewajiban Pelaporan — Tambahan lampiran',
    'Peraturan Limbah B3 — Pengetatan sanksi administrasi',
    'Perubahan K3 — Standar proteksi pekerja diperbarui'
  ];
  const t = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
  const source = LOCAL_REGS[Math.floor(Math.random() * LOCAL_REGS.length)] || { id: 'UPD-000', title: 'Regulasi Baru' };
  return {
    id: `UPD-${Math.floor(1000 + Math.random()*9000)}`,
    title: t,
    related: source.id,
    snippet: `${t} — ringkasan singkat. Sumber: ${source.title}`,
    timestamp: new Date().toISOString()
  };
}

export default function initRealTimeUpdates(opts = {}) {
  const checkBtn = $(opts.checkBtn);
  const clearBtn = $(opts.clearBtn);
  const exportBtn = $('#exportFeed');   // new button
  const feedList = $(opts.feedList);
  const crawlLog = $(opts.crawlLog);
  const lastChecked = $(opts.lastChecked);
  const autoPollCb = $(opts.autoPoll);
  const notifBadge = $(opts.notifBadge);

  let feed = [];
  let autoPollInterval = null;

  function log(msg) {
    const d = document.createElement('div');
    d.className = 'p-2 rounded bg-white/70 text-sm';
    d.innerHTML = `<strong>${formatTime()}</strong> — ${msg}`;
    crawlLog.prepend(d);
  }

  function renderFeed() {
    feedList.innerHTML = '';
    feed.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-3 rounded bg-white/80 border';
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <div class="font-semibold">${item.title}</div>
            <div class="text-xs text-slate-600 mt-1">${item.snippet}</div>
            <div class="text-xs text-slate-400 mt-2">Related: ${item.related} • ${new Date(item.timestamp).toLocaleString()}</div>
          </div>
          <div class="text-xs text-slate-500 ml-3">${new Date(item.timestamp).toLocaleTimeString()}</div>
        </div>
      `;
      feedList.appendChild(card);
    });
  }

  async function checkNow() {
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    log('Started mock crawl');

    await simulateDelay(600, 1600);

    const n = 1 + Math.floor(Math.random()*3);
    const newItems = Array.from({length:n}, () => makeMockUpdate());
    feed = newItems.concat(feed);
    renderFeed();

    lastChecked.textContent = formatTime();
    log(`Crawl finished — found ${newItems.length} new regulation update(s)`);

    if (notifBadge) {
      notifBadge.classList.remove('hidden');
      setTimeout(()=> notifBadge.classList.add('hidden'), 2500);
    }

    checkBtn.disabled = false;
    checkBtn.textContent = 'Check new regulations';

    if (window.updateDashboardScore) window.updateDashboardScore(feed.length);
  }

  function clearFeed() {
    feed = [];
    renderFeed();
    log('Feed cleared');
    lastChecked.textContent = '-';
  }

  function exportFeedJSON() {
    exportJSON(feed, "regulatory_updates.json");
    log('Feed exported to JSON');
  }

  // Polling
  function startAutoPoll() {
    if (autoPollInterval) return;
    autoPollInterval = setInterval(() => { checkNow().catch(console.error); }, 15000);
    log('Auto-poll enabled');
  }
  function stopAutoPoll() {
    clearInterval(autoPollInterval); autoPollInterval=null;
    log('Auto-poll disabled');
  }

  checkBtn.addEventListener('click', () => checkNow().catch(console.error));
  clearBtn.addEventListener('click', clearFeed);
  exportBtn.addEventListener('click', exportFeedJSON);
  autoPollCb.addEventListener('change', e => e.target.checked ? startAutoPoll() : stopAutoPoll());

  log('Real-time update module initialized');
}
