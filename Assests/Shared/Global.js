// Navigation
const clockSelectBtn = document.getElementById("clock-type-btn");
const clockArrow = document.querySelector(".clock-type-arrow");
const clockDropdown = document.getElementById("clock-type-dropdown");
const selectorRoot = document.querySelector(".navbar-clock-selector");
const buttonLabel = clockSelectBtn.querySelector(".clock-type-text");

// Settings
const settingPanel = document.getElementById("settingPanel");
const settingBtn = document.getElementById("settingBtn");

// swatches
const swatches = Array.from(document.querySelectorAll(".color-swatch"));
const root = document.documentElement;

// ---------- Navigation

// helper: open/close
function setOpen(open) {
  clockDropdown.classList.toggle("show", open);
  selectorRoot.classList.toggle("is-open", open);
  clockSelectBtn.setAttribute("aria-expanded", String(!!open));
  clockDropdown.setAttribute("aria-hidden", String(!open));
  // set focusable state for items
  const items = Array.from(
    clockDropdown.querySelectorAll(".clock-type-option")
  );
  items.forEach((it, i) =>
    it.setAttribute("tabindex", open ? (i === 0 ? "0" : "-1") : "-1")
  );
  if (open) items[0].focus();
}

// toggle by button
clockSelectBtn.addEventListener("click", () => {
  const isOpen = clockDropdown.classList.contains("show");
  setOpen(!isOpen);
});

// delegation for option clicks (real navigation links)
clockDropdown.addEventListener("click", (e) => {
  const opt = e.target.closest(".clock-type-option");
  if (!opt) return;

  // Do NOT prevent default for real links
  prevMenuLink(opt);

  // close dropdown after click
  setOpen(false);
  clockSelectBtn.focus();
});

function prevMenuLink(opt) {
  const prev = clockDropdown.querySelector(".is-active");
  if (prev) prev.classList.remove("is-active");
  opt.classList.add("is-active");
  // update label on the button
  buttonLabel.textContent = opt.textContent.trim();
}

// close if click outside
window.addEventListener("click", (event) => {
  if (
    !event.target.closest(".navbar-clock-selector") &&
    clockDropdown.classList.contains("show")
  ) {
    setOpen(false);
  }
});

// ---------- Settings panel toggle

settingBtn.addEventListener("click", () => {
  settingPanel.classList.toggle("show");
});

// Close settings if click outside
window.addEventListener("click", (event) => {
  if (
    settingPanel &&
    settingPanel.classList.contains("show") &&
    !settingPanel.contains(event.target) &&
    !settingBtn.contains(event.target)
  ) {
    settingPanel.classList.remove("show");
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    settingPanel &&
    settingPanel.classList.contains("show")
  ) {
    settingPanel.classList.remove("show");
  }
});

// ---------- Color swatches

function setActiveBtn(active) {
  swatches.forEach((b) => {
    b.classList.toggle("active", b === active);
  });
}

function applySwatchColor(btn) {
  const swatchColor = getComputedStyle(btn).color;
  root.style.setProperty("--clr", swatchColor);
  setActiveBtn(btn);
  // save chosen swatch id to localStorage
  try {
    if (btn.id) localStorage.setItem("chosenSwatchId", btn.id);
    else localStorage.setItem("chosenSwatchColor", swatchColor);
  } catch (err) {
    console.warn("Could not save swatch to storage:", err);
  }
}

// load saved swatch on startup
(function loadSavedSwatch() {
  try {
    const id = localStorage.getItem("chosenSwatchId");
    const color = localStorage.getItem("chosenSwatchColor");
    if (id) {
      const el = document.getElementById(id);
      if (el) applySwatchColor(el);
    } else if (color) {
      // fallback: set --clr to saved color
      root.style.setProperty("--clr", color);
    } else if (swatches.length) {
      // default: apply first swatch
      applySwatchColor(swatches[0]);
    }
  } catch (err) {
    console.warn("Error loading saved swatch:", err);
  }
})();

// attach listeners to swatches
swatches.forEach((btn) => {
  btn.addEventListener("click", () => applySwatchColor(btn));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      applySwatchColor(btn);
    }
  });
});

// keyboard navigation between swatches
document.addEventListener("keydown", (e) => {
  const focused = document.activeElement;
  const currentIndex = swatches.indexOf(focused);
  if (currentIndex !== -1) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = swatches[(currentIndex + 1) % swatches.length];
      next.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev =
        swatches[(currentIndex - 1 + swatches.length) % swatches.length];
      prev.focus();
    }
  }
});
