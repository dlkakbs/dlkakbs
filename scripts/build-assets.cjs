const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const assets = path.join(root, "assets");
const cardsDir = path.join(assets, "cards");

fs.mkdirSync(cardsDir, { recursive: true });

const bannerText = Buffer.from(`
<svg width="2172" height="724" viewBox="0 0 2172 724" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#7A5572" flood-opacity="0.12" />
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <rect x="546" y="192" width="1080" height="340" rx="54" fill="#FFF8FB" fill-opacity="0.72" stroke="#FFFFFF" stroke-opacity="0.78" stroke-width="2" />
  </g>
  <text x="1086" y="327" text-anchor="middle" font-family="Avenir Next, Avenir, Helvetica, Arial, sans-serif" font-size="104" font-weight="700" letter-spacing="18" fill="#463544">DILEK</text>
  <text x="1086" y="391" text-anchor="middle" font-family="Avenir Next, Avenir, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" letter-spacing="8" fill="#8E657E">@DLKAKBS</text>
  <line x1="888" y1="432" x2="1284" y2="432" stroke="#C995AE" stroke-width="2" stroke-linecap="round" />
  <text x="1086" y="478" text-anchor="middle" font-family="Avenir Next, Avenir, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="5" fill="#6F506B">AI AGENTS  ·  OPEN SOURCE  ·  BLOCKCHAIN</text>
</svg>
`);

const cards = [
  {
    file: "flowpay.svg",
    title: "FlowPay",
    label: "ARC",
    lines: ["Streaming, invoicing, and paywalls", "powered by native USDC on Arc."],
  },
  {
    file: "veliora.svg",
    title: "Veliora",
    label: "ARC",
    lines: ["Multi-agent biomedical research", "with traceable evidence and payments."],
  },
  {
    file: "twin-workspace.svg",
    title: "Twin Workspace",
    label: "HERMES AGENT",
    lines: ["A control surface for programmable", "identity and real-world interactions."],
  },
  {
    file: "proofpacket.svg",
    title: "ProofPacket",
    label: "FLOP LABS",
    lines: ["A read-only explorer for public", "Technocore agent activity."],
  },
  {
    file: "hermes-agent.svg",
    title: "Hermes Agent",
    label: "NOUS RESEARCH",
    lines: ["An open-source agent designed", "to grow with its user."],
  },
  {
    file: "cofhesdk.svg",
    title: "CoFHE SDK",
    label: "FHENIX",
    lines: ["7 merged pull requests", "React, ABI + CI improvements"],
  },
  {
    file: "miden-web-sdk.svg",
    title: "Miden Web SDK",
    label: "0xMIDEN",
    lines: ["WASM client, React hooks, and tools", "for building on Miden from the web."],
  },
  {
    file: "seaport-js.svg",
    title: "Seaport.js",
    label: "OPENSEA",
    lines: ["TypeScript tooling for interacting", "with the Seaport marketplace protocol."],
  },
];

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '\"': "&quot;",
  })[character]);
}

function cardSvg(card, index) {
  const accent = index % 2 === 0 ? "#B98298" : "#8D6AA9";
  const glow = index % 2 === 0 ? "#F2CCD9" : "#DDD0F0";
  return `
<svg width="760" height="220" viewBox="0 0 760 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="760" y2="220" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF8FB" />
      <stop offset="1" stop-color="#F4E7F2" />
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="26" /></filter>
  </defs>
  <rect x="1" y="1" width="758" height="218" rx="24" fill="url(#bg)" stroke="#DABBCD" stroke-width="2" />
  <circle cx="680" cy="30" r="90" fill="${glow}" fill-opacity="0.58" filter="url(#soft)" />
  <rect x="36" y="28" width="150" height="27" rx="13.5" fill="${accent}" fill-opacity="0.13" />
  <text x="111" y="47" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" letter-spacing="1.7" fill="${accent}">${escapeXml(card.label)}</text>
  <text x="36" y="98" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" fill="#463544">${escapeXml(card.title)}</text>
  <text x="36" y="139" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#6F596A">${escapeXml(card.lines[0])}</text>
  <text x="36" y="166" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#6F596A">${escapeXml(card.lines[1])}</text>
  <path d="M36 190H180" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
  <circle cx="194" cy="190" r="4" fill="${accent}" />
</svg>`.trimStart();
}

async function main() {
  await sharp(path.join(assets, "banner-background.png"))
    .resize(2172, 724, { fit: "cover" })
    .composite([{ input: bannerText, top: 0, left: 0 }])
    .png({ quality: 94, compressionLevel: 9 })
    .toFile(path.join(assets, "banner.png"));

  cards.forEach((card, index) => {
    fs.writeFileSync(path.join(cardsDir, card.file), cardSvg(card, index));
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
