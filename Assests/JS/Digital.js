// digital clock.js (replace your current JS with this)

const dy = document.querySelector("#day");
const clock = document.getElementById("time");

// format buttons (24H / 12H)
const formatButtons = Array.from(document.querySelectorAll(".segment-option"));

// load use12Hour from localStorage (default false)
const saved = localStorage.getItem("use12Hour");
let use12Hour = saved === null ? true : saved === "true";

// If nothing was saved previously, persist the chosen default so UI stays consistent next load
if (saved === null) localStorage.setItem("use12Hour", String(use12Hour));

function formatCount(n) {
  return String(n).padStart(2, "0");
}

function updateTime() {
  const now = new Date();

  const weekday = now.toLocaleString("en-GB", { weekday: "long" });
  const monthDay = now.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
  });
  const year = now.getFullYear();

  const hr24 = now.getHours(); // 0-23
  const minutes = formatCount(now.getMinutes());
  const seconds = formatCount(now.getSeconds());

  const ampm = hr24 >= 12 ? "PM" : "AM";

  if (use12Hour) {
    // Convert 24-hour to 12-hour
    let hr12 = hr24 % 12; // 0-11
    if (hr12 === 0) hr12 = 12; // show 12 instead of 0

    // If you prefer not to show a leading zero on 12-hour hours, replace
    // formatCount(hr12) with String(hr12)
    clock.innerHTML = `${formatCount(
      hr12
    )}:${minutes}:${seconds} <span class="ampm">${ampm}</span>`;
  } else {
    clock.innerHTML = `${formatCount(hr24)}:${minutes}:${seconds}`;
  }

  const full = `${weekday}, ${monthDay}, ${year}`;
  if (dy) dy.textContent = full;
}

// call once immediately
updateTime();
// refresh every second
setInterval(updateTime, 1000);

// ---------- Format buttons (24H / 12H)
function setFormatActive(format) {
  formatButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.format === format);
  });
}

formatButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const fmt = btn.dataset.format; // "24h" or "12h"
    use12Hour = fmt === "12h";
    localStorage.setItem("use12Hour", String(use12Hour));
    setFormatActive(fmt);
    updateTime();
  });
});

// initialize format buttons UI
setFormatActive(use12Hour ? "12h" : "24h");
