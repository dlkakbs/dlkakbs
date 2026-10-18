import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const username = process.env.PROFILE_USERNAME || "dlkakbs";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2];
const outputPath = resolve(projectRoot, "assets/contribution-activity.svg");

const html = inputPath
  ? await readFile(inputPath, "utf8")
  : await fetch(`https://github.com/users/${username}/contributions`).then((response) => {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      return response.text();
    });

const cells = [...html.matchAll(/<td[^>]*data-date="([^"]+)"[^>]*data-level="([0-4])"[^>]*>/g)]
  .map((match) => ({ date: match[1], level: Number(match[2]) }));

if (!cells.length) throw new Error("No contribution cells found in GitHub response");

const totalMatch = html.match(/<h2[^>]*id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s*contributions/i);
const total = totalMatch?.[1] ?? "—";
const toUtcDate = (value) => new Date(`${value}T00:00:00Z`);
const firstDate = toUtcDate(cells[0].date);
const start = new Date(firstDate);
start.setUTCDate(start.getUTCDate() - start.getUTCDay());

const palette = ["#F4E8EF", "#E9C5D5", "#D39AB3", "#B98298", "#8D6AA9"];
const cellSize = 13;
const gap = 4;
const step = cellSize + gap;
const gridX = 150;
const gridY = 142;
const maxDate = cells.reduce((latest, cell) => cell.date > latest ? cell.date : latest, cells[0].date);
const activeDays = cells.filter((cell) => cell.level > 0).length;

const rectangles = cells.map((cell) => {
  const date = toUtcDate(cell.date);
  const dayOffset = Math.round((date - start) / 86400000);
  const week = Math.floor(dayOffset / 7);
  const day = date.getUTCDay();
  return `<rect x="${gridX + week * step}" y="${gridY + day * step}" width="${cellSize}" height="${cellSize}" rx="3" fill="${palette[cell.level]}" />`;
}).join("\n    ");

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabels = [];
let previousMonth = -1;
const weekCount = Math.floor((toUtcDate(maxDate) - start) / 604800000) + 1;
for (let week = 0; week < weekCount; week += 1) {
  const date = new Date(start);
  date.setUTCDate(start.getUTCDate() + week * 7);
  const month = date.getUTCMonth();
  if (month !== previousMonth) {
    monthLabels.push(`<text x="${gridX + week * step}" y="122" class="month">${monthNames[month]}</text>`);
    previousMonth = month;
  }
}

const updated = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(toUtcDate(maxDate));

const svg = `<svg width="1200" height="320" viewBox="0 0 1200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="card-bg" x1="0" y1="0" x2="1200" y2="320" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF8FB" />
      <stop offset="1" stop-color="#F4E7F2" />
    </linearGradient>
    <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="34" />
    </filter>
    <style>
      text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
      .title { font-size: 30px; font-weight: 700; fill: #463544; }
      .subtitle { font-size: 15px; fill: #6F596A; }
      .stat { font-size: 13px; font-weight: 700; letter-spacing: 1.2px; fill: #B98298; }
      .month, .day, .legend { font-size: 12px; fill: #7A6675; }
    </style>
  </defs>
  <rect x="1" y="1" width="1198" height="318" rx="26" fill="url(#card-bg)" stroke="#DABBCD" stroke-width="2" />
  <circle cx="1104" cy="42" r="120" fill="#E7BCD0" fill-opacity=".34" filter="url(#soft-glow)" />
  <circle cx="68" cy="292" r="94" fill="#D8C2E7" fill-opacity=".28" filter="url(#soft-glow)" />

  <text x="48" y="54" class="title">Contribution activity</text>
  <text x="48" y="81" class="subtitle">A year of building in public, one commit at a time.</text>
  <rect x="974" y="34" width="176" height="42" rx="21" fill="#B98298" fill-opacity=".12" />
  <text x="1062" y="60" text-anchor="middle" class="stat">${total} CONTRIBUTIONS</text>

  ${monthLabels.join("\n  ")}
  <text x="104" y="168" class="day">Mon</text>
  <text x="104" y="202" class="day">Wed</text>
  <text x="104" y="236" class="day">Fri</text>
  <g>
    ${rectangles}
  </g>

  <text x="48" y="288" class="subtitle">${activeDays} active days · updated ${updated}</text>
  <g transform="translate(932 278)">
    <text x="0" y="11" class="legend">Less</text>
    ${palette.map((color, index) => `<rect x="${38 + index * 21}" y="0" width="13" height="13" rx="3" fill="${color}" />`).join("\n    ")}
    <text x="150" y="11" class="legend">More</text>
  </g>
</svg>
`;

await writeFile(outputPath, svg);
console.log(`Updated ${outputPath} with ${cells.length} contribution cells`);
