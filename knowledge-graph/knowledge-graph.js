// knowledge-graph.js
// Lightweight SVG force graph for SustainAlign (Prototype)
// Uses shared/shared.js datasets: LOCAL_REGS and GLOBAL_MAP + similarity() helper

import { LOCAL_REGS, GLOBAL_MAP, similarity, el, simulateDelay } from '../shared/shared.js';

// configuration for physics
const CONFIG = {
  width: 1000,
  height: 480,
  nodeRadius: 16,
  repulsion: 9000,       // larger = stronger repulsion
  springLength: 120,     // desired edge length
  springStiffness: 0.05, // spring strength
  damping: 0.85,
  timeStep: 0.8
};

// small RNG
function rand(min, max){ return min + Math.random() * (max - min); }

// entry function
export function initKnowledgeGraph(opts = {}) {
  const svg = document.querySelector(opts.svgSelector || '#graphSVG');
  const regenBtn = document.querySelector(opts.regenBtn || '#regenBtn');
  const thresholdInput = document.querySelector(opts.thresholdInput || '#threshold');
  const thresholdVal = document.querySelector(opts.thresholdVal || '#thresholdVal');
  const nodeDetail = document.querySelector(opts.nodeDetail || '#nodeDetail');
  const zoomIn = document.querySelector(opts.zoomIn || '#zoomIn');
  const zoomOut = document.querySelector(opts.zoomOut || '#zoomOut');

  let width = svg.clientWidth || CONFIG.width;
  let height = svg.clientHeight || CONFIG.height;

  // responsiveness
  window.addEventListener('resize', ()=> { width = svg.clientWidth || CONFIG.width; height = svg.clientHeight || CONFIG.height; });

  // build nodes and links from datasets
  function buildGraph(threshold = 30) {
    // nodes: local regs (prefix L_) and global standards (prefix G_)
    const nodes = [];
    const nodeMap = new Map();
    const links = [];

    // add local regs
    LOCAL_REGS.forEach((r, i) => {
      const id = `L_${r.id}`;
      const node = {
        id,
        type: 'local',
        raw: r,
        label: r.id,
        title: r.title,
        keywords: r.keywords || [],
        x: rand(100, width-100),
        y: rand(80, height-80),
        vx: 0, vy: 0
      };
      nodeMap.set(id, node);
      nodes.push(node);
    });

    // add global standards
    Object.keys(GLOBAL_MAP).forEach(k => {
      GLOBAL_MAP[k].forEach(g => {
        const id = `G_${g.id.replace(/\s+/g,'_')}`;
        const node = {
          id,
          type: 'global',
          raw: g,
          label: g.id,
          title: g.topic,
          x: rand(100, width-100),
          y: rand(80, height-80),
          vx: 0, vy: 0
        };
        nodeMap.set(id, node);
        nodes.push(node);
      });
    });

    // create links by similarity > threshold
    nodes.forEach(nLocal => {
      if (nLocal.type !== 'local') return;
      Object.keys(GLOBAL_MAP).forEach(k => {
        GLOBAL_MAP[k].forEach(g => {
          const score = similarity(nLocal.keywords || [], g.topic || '');
          if (score >= threshold) {
            const gid = `G_${g.id.replace(/\s+/g,'_')}`;
            links.push({
              source: nLocal.id,
              target: gid,
              weight: Math.max(1, Math.round(score / 20)),
              score
            });
          }
        });
      });
    });

    return { nodes, links };
  }

  // draw graph (SVG elements)
  function renderGraph(graph) {
    // clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // defs for arrow / styles (not used arrows but keep for extension)
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    svg.appendChild(defs);

    // group for pan/zoom
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','graph-group');
    svg.appendChild(g);

    // edges (lines)
    graph.linkEls = graph.links.map(link => {
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('stroke','rgba(30,41,59,0.12)');
      line.setAttribute('stroke-width', Math.max(1, link.weight));
      line.setAttribute('data-score', link.score);
      g.appendChild(line);
      return Object.assign(link, { el: line });
    });

    // nodes (circles + labels)
    graph.nodeEls = graph.nodes.map(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg','g');
      group.setAttribute('class','node-group');
      group.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('r', CONFIG.nodeRadius);
      circle.setAttribute('fill', node.type === 'local' ? '#3B97C1' : '#4FB48E');
      circle.setAttribute('stroke','rgba(2,6,23,0.06)');
      circle.setAttribute('stroke-width','1');

      // label (small)
      const label = document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('class','node-label');
      label.setAttribute('text-anchor','middle');
      label.setAttribute('dy','4');
      label.textContent = node.label;

      group.appendChild(circle);
      group.appendChild(label);

      // event: hover -> show quick tooltip via aside
      group.addEventListener('mouseenter', ()=> {
        nodeDetail.innerHTML = `<div class="tooltip"><strong>${node.label}</strong><div class="text-xs text-slate-600">${node.title || ''}</div></div>`;
      });
      group.addEventListener('mouseleave', ()=> {
        nodeDetail.innerHTML = 'None';
      });

      // click -> expand details
      group.addEventListener('click', ()=> {
        const info = node.type === 'local'
          ? `<strong>${node.raw.id}</strong><div class="text-xs">${node.raw.title}</div><div class="text-xs mt-2">Keywords: ${(node.keywords||[]).join(', ')}</div>`
          : `<strong>${node.raw.id}</strong><div class="text-xs">${node.raw.topic}</div>`;
        nodeDetail.innerHTML = `<div class="tooltip">${info}</div>`;
      });

      // drag support
      let dragging = false;
      let offset = {x:0,y:0};
      group.addEventListener('pointerdown', (ev) => {
        dragging = true;
        group.setPointerCapture(ev.pointerId);
        offset.x = ev.clientX - node.x;
        offset.y = ev.clientY - node.y;
        node.vx = 0; node.vy = 0;
      });
      window.addEventListener('pointerup', (ev) => { if(dragging){ dragging = false; }});
      window.addEventListener('pointermove', (ev) => {
        if (!dragging) return;
        node.x = ev.clientX - offset.x;
        node.y = ev.clientY - offset.y;
      });

      g.appendChild(group);
      return Object.assign(node, { groupEl: group, circleEl: circle, labelEl: label });
    });

    // initial placement
    applyPositions(graph);

    return graph;
  }

  // apply node + link positions to SVG elements
  function applyPositions(graph, transform = {x:0,y:0,k:1}) {
    graph.nodeEls.forEach(n => {
      const gx = n.x * transform.k + transform.x;
      const gy = n.y * transform.k + transform.y;
      n.groupEl.setAttribute('transform', `translate(${gx},${gy})`);
    });
    graph.linkEls.forEach(l => {
      const s = graph.nodes.find(n => n.id === l.source);
      const t = graph.nodes.find(n => n.id === l.target);
      l.el.setAttribute('x1', s.x * transform.k + transform.x);
      l.el.setAttribute('y1', s.y * transform.k + transform.y);
      l.el.setAttribute('x2', t.x * transform.k + transform.x);
      l.el.setAttribute('y2', t.y * transform.k + transform.y);
    });
  }

  // physics tick: repulsion + springs
  function tick(graph) {
    const nodes = graph.nodes;
    const links = graph.links;

    // repulsion
    for (let i=0;i<nodes.length;i++){
      for (let j=i+1;j<nodes.length;j++){
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let dist2 = dx*dx + dy*dy + 0.01;
        let dist = Math.sqrt(dist2);
        const force = CONFIG.repulsion / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // springs
    links.forEach(l => {
      const s = nodes.find(n => n.id === l.source);
      const t = nodes.find(n => n.id === l.target);
      if (!s || !t) return;
      let dx = t.x - s.x, dy = t.y - s.y;
      let dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
      const desired = CONFIG.springLength;
      const diff = dist - desired;
      const k = CONFIG.springStiffness * (1 + l.weight*0.05);
      const fx = (dx / dist) * diff * k;
      const fy = (dy / dist) * diff * k;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    });

    // integrate velocities
    nodes.forEach(n => {
      n.vx *= CONFIG.damping;
      n.vy *= CONFIG.damping;
      n.x += n.vx * CONFIG.timeStep;
      n.y += n.vy * CONFIG.timeStep;

      // bounds
      n.x = Math.max(40, Math.min(width-40, n.x));
      n.y = Math.max(40, Math.min(height-40, n.y));
    });

    applyPositions(graph);
  }

  // simulation loop
  let rafId = null;
  function startSimulation(graph) {
    if (rafId) cancelAnimationFrame(rafId);
    function step() {
      tick(graph);
      rafId = requestAnimationFrame(step);
    }
    step();
  }

  // public initializer
  let currentGraph = null;
  function generateAndRender(threshold) {
    const g = buildGraph(threshold);
    currentGraph = renderGraph(g);
    startSimulation(currentGraph);
  }

  // hook up controls
  regenBtn.addEventListener('click', ()=> {
    const v = parseInt(thresholdInput.value,10);
    generateAndRender(v);
  });

  thresholdInput.addEventListener('input', (e)=> {
    const v = e.target.value;
    thresholdVal.textContent = v;
  });

  zoomIn.addEventListener('click', ()=> {
    // simple zoom: scale node positions toward center
    if (!currentGraph) return;
    currentGraph.nodes.forEach(n => {
      n.x = (n.x - width/2) * 0.9 + width/2;
      n.y = (n.y - height/2) * 0.9 + height/2;
    });
  });
  zoomOut.addEventListener('click', ()=> {
    if (!currentGraph) return;
    currentGraph.nodes.forEach(n => {
      n.x = (n.x - width/2) * 1.12 + width/2;
      n.y = (n.y - height/2) * 1.12 + height/2;
    });
  });

  // initial run with threshold from input
  const startThreshold = parseInt(document.querySelector(opts.thresholdInput || '#threshold').value,10) || 30;
  generateAndRender(startThreshold);

  // small accessibility / keyboard: press R to regenerate
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
      generateAndRender(parseInt(thresholdInput.value,10));
    }
  });
}

// expose as default for simple import
export default initKnowledgeGraph;
