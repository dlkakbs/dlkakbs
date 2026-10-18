const fs = require("node:fs");
const path = require("node:path");
const { marked } = require("marked");

const root = path.resolve(__dirname, "..");
const markdown = fs.readFileSync(path.join(root, "README.md"), "utf8");
const content = marked.parse(markdown, { gfm: true });

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>dlkakbs — GitHub profile preview</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 48px 24px;
      color: #1f2328;
      background: #f6f8fa;
      font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .profile {
      width: min(100%, 1012px);
      margin: 0 auto;
      padding: 32px;
      background: #fff;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      box-shadow: 0 14px 40px rgba(61, 41, 56, .08);
    }
    h2 {
      margin-top: 32px;
      padding-bottom: .3em;
      border-bottom: 1px solid #d8dee4;
      font-size: 1.5em;
    }
    p { margin: 16px 0; }
    img { max-width: 100%; height: auto; }
    table { width: 100%; border-spacing: 8px; border-collapse: separate; }
    td { padding: 0; border: 0; vertical-align: top; }
    a { color: #8d6aa9; text-decoration: none; }
    @media (max-width: 680px) {
      body { padding: 12px; }
      .profile { padding: 16px; }
      td { display: block; width: 100% !important; margin-bottom: 8px; }
    }
  </style>
</head>
<body>
  <main class="profile">${content}</main>
</body>
</html>`;

fs.writeFileSync(path.join(root, "preview.html"), html);
