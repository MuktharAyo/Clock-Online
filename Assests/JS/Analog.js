const deg = 6;
const dy = document.querySelector("#day");
const hr = document.querySelector("#hr");
const mn = document.querySelector("#mn");
const sc = document.querySelector("#sc");

function updateTime() {
  const day = new Date();

  const weekday = day.toLocaleString("en-GB", { weekday: "long" });
  const monthDay = day.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
  });
  const year = day.getFullYear();
  const hours = day.getHours() % 12; // 0-11
  const minutes = day.getMinutes();
  const seconds = day.getSeconds();

  const hh = hours * 30; // 30deg per hour
  const mm = minutes * deg; // deg is 6 -> 6deg per minute
  const ss = seconds * deg; // 6deg per second

  // Add minute and second contribution for smooth hour hand:
  // hour = hours*30 + minutes*0.5 + seconds*(0.5/60)
  const hourAngle = hh + minutes * 0.5 + seconds * (0.5 / 60);
  const minuteAngle = mm;
  const secondAngle = ss;

  const full = `${weekday}, ${monthDay}, ${year}`;

  dy.textContent = full;
  if (hr) hr.style.transform = `rotateZ(${hourAngle}deg)`;
  if (mn) mn.style.transform = `rotateZ(${minuteAngle}deg)`;
  if (sc) sc.style.transform = `rotateZ(${secondAngle}deg)`;
}

// call once immediately so clock doesn't wait 1s
updateTime();

// *** SetInterval method allows us to refresh the function every second
setInterval(
  // Getting the time from the Date module
  updateTime,
  1000
);