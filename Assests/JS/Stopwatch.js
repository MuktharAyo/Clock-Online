// Stopwatch implementation (HH:MM:SS(.mmm)) with ms toggle and lap re-rendering

// --- Elements: DOM references used by the script ---
const display = document.getElementById("display"); // main time display element
const startPauseBtn = document.getElementById("startPause"); // start/pause button element
const lapResetBtn = document.getElementById("lapReset"); // lap/reset button element
const lapsContainer = document.getElementById("laps"); // container for lap list
const clearLapsBtn = document.getElementById("clearLaps"); // button to clear laps
const toggleMs = document.getElementById("show-milliseconds-checkbox"); // checkbox to show/hide ms

// --- State: runtime variables ---
let timerId = null; // interval id for ticking
let running = false; // whether the stopwatch is currently running
let startTime = null; // timestamp when the current run started
let previousElapsed = 0; // total ms accumulated across previous runs
let laps = []; // array of lap objects { timeMs, at }

// --- Constants: configuration values ---
const TICK_MS = 10; // how often the UI updates (ms)

// --- UI icon templates ---
const actionIcons = {
  start: `
    <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
    </svg>
  `,
  pause: `
    <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  `,
  reset: `
    <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>
  `,
  split: `
    <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5"></path>
    </svg>
  `,
};

// --- Helpers: small utility functions ---
// pad a number with leading zeros to a given size
const pad = (num, size = 2) => String(num).padStart(size, "0");

// format a total millisecond count into HH:MM:SS(.mmm) and optionally hide ms
// function formatTime(totalMs, showMs = true) {
//   const hours = Math.floor(totalMs / 3600000);
//   const minutes = Math.floor((totalMs % 3600000) / 60000);
//   const seconds = Math.floor((totalMs % 60000) / 1000);
//   const ms = totalMs % 1000;
//   return showMs
//     ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(ms, 3)}`
//     : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
// }

function formatTimeParts(totalMs) {
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  const main = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // HH:MM:SS
  const msStr = `.${pad(ms, 3)}`; // .mmm
  return { main, msStr };
}

// set the running UI state (button icons, attributes, disabled states)
function setRunningUI(isRunning) {
  running = isRunning;
  startPauseBtn.innerHTML = isRunning ? actionIcons.pause : actionIcons.start;
  startPauseBtn.setAttribute("aria-pressed", String(isRunning));
  startPauseBtn.classList.toggle("running", isRunning);
  lapResetBtn.disabled = !isRunning && previousElapsed === 0; // disable when stopped and no time
  lapResetBtn.innerHTML = isRunning ? actionIcons.split : actionIcons.reset;
}

// update the main display according to current elapsed time and ms toggle
// function updateDisplay() {
//   const now = Date.now();
//   const total = previousElapsed + (running ? now - startTime : 0);
//   const showMs = Boolean(toggleMs && toggleMs.checked);
//   display.textContent = formatTime(total, showMs);
// }

// update the main display according to current elapsed time and ms toggle
function updateDisplay() {
  const now = Date.now();
  const total = previousElapsed + (running ? now - startTime : 0);
  const showMs = Boolean(toggleMs && toggleMs.checked);
  const parts = formatTimeParts(total);

  // Use innerHTML so milliseconds can be in their own <span>
  if (showMs) {
    // .ms can be styled via CSS
    display.innerHTML = `${parts.main}<span class="ms" aria-hidden="true">${parts.msStr}</span>`;
  } else {
    // plain text when ms hidden (keeps it accessible)
    display.textContent = parts.main;
  }
}

// start or resume the stopwatch
function start() {
  if (running) return;
  startTime = Date.now();
  running = true;
  timerId = setInterval(updateDisplay, TICK_MS);
  startPauseBtn.style.background = "var(--inactive)";
  updateDisplay(); // immediate render
  setRunningUI(true);
  clearLapsBtn.disabled = laps.length === 0;
}

// pause the stopwatch and accumulate elapsed time
function pause() {
  if (!running) return;
  const now = Date.now();
  previousElapsed += now - startTime;
  running = false;
  clearInterval(timerId);
  timerId = null;
  startPauseBtn.style.background = "var(--active)";
  updateDisplay(); // show exact paused time
  setRunningUI(false);
}

// reset the stopwatch to zero and clear laps
function reset() {
  if (running) pause();
  previousElapsed = 0;
  startTime = null;
  updateDisplay();
  laps = [];
  renderLaps();
  setRunningUI(false);
  clearLapsBtn.disabled = true;
}

// record a lap as the current total elapsed milliseconds
function lap() {
  const now = Date.now();
  const total = previousElapsed + (running ? now - startTime : 0);
  const lapObject = { timeMs: total, at: new Date(now).toLocaleTimeString() };
  laps.unshift(lapObject); // newest first
  renderLaps();
  clearLapsBtn.disabled = false;
}

// render the lap list into the DOM according to current ms toggle
// function renderLaps() {
//   lapsContainer.innerHTML = "";

//   const frag = document.createDocumentFragment();
//   const showMs = Boolean(toggleMs && toggleMs.checked);
//   laps.forEach((l, i) => {
//     const row = document.createElement("div");
//     row.className = "lap";
//     const left = document.createElement("div");
//     left.textContent = `# ${laps.length - i}`; // lap numbering
//     const right = document.createElement("div");
//     right.textContent = `${formatTime(l.timeMs, showMs)} • ${l.at}`; // formatted lap label
//     row.appendChild(left);
//     row.appendChild(right);
//     frag.appendChild(row);
//   });
//   lapsContainer.appendChild(frag);
// }

// render the lap list into the DOM according to current ms toggle
function renderLaps() {
  lapsContainer.innerHTML = "";

  const frag = document.createDocumentFragment();
  const showMs = Boolean(toggleMs && toggleMs.checked);
  laps.forEach((l, i) => {
    const row = document.createElement("div");
    row.className = "lap";
    const left = document.createElement("div");
    left.textContent = `# ${laps.length - i}`; // lap numbering
    const right = document.createElement("div");
    // Use innerHTML when showing ms so the .ms span is present
    if (showMs) {
      const parts = formatTimeParts(l.timeMs);
      // include local time string after a bullet
      right.innerHTML = `${parts.main}<span class="ms" aria-hidden="true">${parts.msStr}</span> &bull; ${l.at}`;
    } else {
      right.textContent = `${formatTimeParts(l.timeMs).main} • ${l.at}`;
    }
    row.appendChild(left);
    row.appendChild(right);
    frag.appendChild(row);
  });
  lapsContainer.appendChild(frag);
}

// clear all laps and update UI
function clearLaps() {
  laps = [];
  renderLaps();
  clearLapsBtn.disabled = true;
}

// toggle start/pause based on current running state
function toggleStartPause() {
  running ? pause() : start();
}

// toggle lap or reset depending on running state
function toggleLapReset() {
  running ? lap() : reset();
}

// milliseconds toggle handler to re-render display and laps immediately
function onToggleMsChange() {
  updateDisplay();
  renderLaps();
  clearLapsBtn.disabled = laps.length === 0;
}

// --- Event wiring: connect buttons and keyboard shortcuts ---
startPauseBtn.addEventListener("click", toggleStartPause); // wire start/pause
lapResetBtn.addEventListener("click", toggleLapReset); // wire lap/reset
clearLapsBtn.addEventListener("click", clearLaps); // wire clear laps
toggleMs.addEventListener("change", onToggleMsChange); // wire ms checkbox

// keyboard shortcuts: Space = Start/Pause, R = Reset, L = Lap
document.addEventListener("keydown", (e) => {
  if (
    e.target &&
    (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
  )
    return; // ignore typing
  if (e.code === "Space") {
    e.preventDefault();
    toggleStartPause();
  }
  if (e.key && e.key.toLowerCase() === "r") reset();
  if (e.key && e.key.toLowerCase() === "l" && !lapResetBtn.disabled) lap();
});

// --- Initialization: set default UI state on load ---
if (toggleMs) {
  toggleMs.checked = false; // ensure milliseconds are hidden on page load
  clearLapsBtn.disabled = true; // no laps initially
}
reset(); // initialize display and UI
