// ---------------------------------------
// Navbar + Footer + Theme Toggle + Active Highlight
// ---------------------------------------

export function loadNavbar() {
  const current = window.location.pathname;

  return `
    <header class="glass sticky top-0 z-50 border-b border-white/30">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sblue600 to-sgreen600 
                      flex items-center justify-center text-white font-bold shadow">
            SA
          </div>
          <div>
            <h1 class="text-lg font-bold">SustainAlign</h1>
            <p class="text-xs text-slate-600">Smart ESG Intelligence</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center gap-6 text-sm font-medium relative">

          ${navItem("Home", "/index.html", current)}
          ${navItem("Aggregation", "/aggregation/regulatory-aggregation.html", current)}
          ${navItem("Harmonization", "/harmonization/harmonization-mapping.html", current)}
          ${navItem("Recommender", "/recommender/compliance-recommender.html", current)}

          <!-- Dropdown Metrics -->
          <div class="relative group">
            <button class="hover:text-sblue600">Metrics ▼</button>
            <div class="absolute hidden group-hover:flex flex-col bg-white/90 backdrop-blur 
                        shadow-lg rounded-md p-2 w-[190px] text-slate-700">
              <a class="hover:text-sblue600 p-2" href="/metrics/metrics-navigator.html">Navigator Metrics</a>
              <a class="hover:text-sblue600 p-2" href="/ui-mock/benchmark-explorer.html">Benchmark Radar</a>
            </div>
          </div>

          ${navItem("Validation", "/validation/auto-validation.html", current)}
          ${navItem("Crisis", "/crisis/crisis-playbook.html", current)}
          
          ${navItem("API", "/data/data-simulator.html", current)}

          <!-- Theme Switch -->
          <button id="themeToggle" class="ml-4 px-2 py-1 rounded border text-xs">🌙</button>

        </nav>
      </div>
    </header>
  `;
}

function navItem(label, link, current) {
  const active = current.includes(link.replace("/", ""));
  return `
    <a href="${link}" class="${active ? "text-sblue600 font-bold underline" : "hover:text-sblue600"}">
      ${label}
    </a>
  `;
}

// Footer
export function loadFooter() {
  return `
    <footer class="py-6 text-center text-sm text-slate-600 bg-white/40 backdrop-blur rounded-t-xl mt-12">
      © SustainAlign — ESG Intelligence Prototype
    </footer>
  `;
}

// Inject layout
export function injectLayout() {
  const navContainer = document.getElementById("nav-slot");
  const footerContainer = document.getElementById("footer-slot");

  if (navContainer) navContainer.innerHTML = loadNavbar();
  if (footerContainer) footerContainer.innerHTML = loadFooter();

  initThemeToggle();
}

// Theme toggle system
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  const saved = localStorage.getItem("theme");
  if (saved === "dark") root.classList.add("dark");

  toggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    const mode = root.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", mode);
    toggle.textContent = mode === "dark" ? "☀" : "🌙";
  });
}
