// Simple timer that increases every second. Set the current value by typing a number
// into the right-side input and pressing Enter or leaving the field (blur).

const timerEl = document.getElementById("timer");
const inputHour = document.getElementById("setValueH");
const inputMinute = document.getElementById("setValueM");
const inputSeconds = document.getElementById("setValueS");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");

const DEFAULT_HOURS = 0;
const DEFAULT_MINUTES = 30; // default shown in main counter
const DEFAULT_SECONDS = 0;

let hours = DEFAULT_HOURS;
let minutes = DEFAULT_MINUTES;
let seconds = DEFAULT_SECONDS;

// initialize totalSeconds from defaults so display shows default on load
let totalSeconds = hours * 3600 + minutes * 60 + seconds;
let running = false;
let intervalId = null;

const actionIcons = {
  start: `
      <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z">
        </path>
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
};

const pad = (num, size = 2) => String(num).padStart(size, "0");

function formatTime(s) {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function display() {
  const countdown = Math.floor(Math.abs(totalSeconds));
  const formatted = formatTime(countdown);
  timerEl.textContent = totalSeconds < 0 ? `-${formatted}` : formatted;
  timerEl.classList.toggle("overtime", totalSeconds < 0);
}

function applyInputValue() {
  const hVal = inputHour.value.trim();
  const mVal = inputMinute.value.trim();
  const sVal = inputSeconds.value.trim();

  // if all empty, don't change anything
  if (hVal === "" && mVal === "" && sVal === "") return;

  const h = Number(hVal);
  const m = Number(mVal);
  const s = Number(sVal);

  hours = Number.isFinite(h) ? Math.floor(h) : 0;
  minutes = Number.isFinite(m) ? Math.floor(m) : 0;
  seconds = Number.isFinite(s) ? Math.floor(s) : 0;

  totalSeconds = hours * 3600 + minutes * 60 + seconds;

  display();
}

function tick() {
  // current behavior: countdown
  totalSeconds -= 1;
  display();
}

startPauseBtn.addEventListener("click", () => {
  if (!running) {
    intervalId = setInterval(tick, 1000);
    running = true;
    startPauseBtn.innerHTML = actionIcons.pause;
    resetBtn.style.display = "inline-flex";
  } else {
    clearInterval(intervalId);
    running = false;
    startPauseBtn.innerHTML = actionIcons.start;
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  running = false;
  startPauseBtn.innerHTML = actionIcons.start;
  resetBtn.style.display = "none";

  // reset back to defaults so main counter shows default again
  hours = DEFAULT_HOURS;
  minutes = DEFAULT_MINUTES;
  seconds = DEFAULT_SECONDS;
  totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // reflect defaults in inputs
  inputHour.value = String(hours);
  inputMinute.value = String(minutes);
  inputSeconds.value = String(seconds);

  display();
});

// apply on Enter
inputHour.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyInputValue();
    inputHour.blur();
  }
});
inputMinute.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyInputValue();
    inputMinute.blur();
  }
});
inputSeconds.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    applyInputValue();
    inputSeconds.blur();
  }
});

// apply on blur
inputHour.addEventListener("blur", applyInputValue);
inputMinute.addEventListener("blur", applyInputValue);
inputSeconds.addEventListener("blur", applyInputValue);

// initialize inputs and display so the main counter shows the default immediately
inputHour.value = String(hours);
inputMinute.value = String(minutes);
inputSeconds.value = String(seconds);

// hide reset initially
// resetBtn.style.display = "none";

// initial render (shows 00:30:00)
display();
