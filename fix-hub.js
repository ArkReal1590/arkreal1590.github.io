const fs = require('fs');
const path = require('path');

const RULES = [
  [/🦞/g, '<img src="../dashboard/icons/logo-arch.png" class="icon-img icon-logo" alt="" loading="lazy">'],
  [/🦀/g, '<img src="../dashboard/icons/logo-arch.png" class="icon-img icon-logo" alt="" loading="lazy">'],
  [/🤖/g, '<img src="../dashboard/icons/agent-ai.png" class="icon-img" alt="" loading="lazy">'],
  [/🧠/g, '<img src="../dashboard/icons/brain.png" class="icon-img" alt="" loading="lazy">'],
  [/⚡/g,  '<img src="../dashboard/icons/lightning.png" class="icon-img" alt="" loading="lazy">'],
  [/🎯/g, '<img src="../dashboard/icons/target.png" class="icon-img" alt="" loading="lazy">'],
  [/📊/g, '<img src="../dashboard/icons/chart.png" class="icon-img" alt="" loading="lazy">'],
  [/📋/g, '<img src="../dashboard/icons/clipboard.png" class="icon-img" alt="" loading="lazy">'],
  [/🔥/g, '<img src="../dashboard/icons/fire.png" class="icon-img" alt="" loading="lazy">'],
  [/💡/g, '<img src="../dashboard/icons/lightbulb.png" class="icon-img" alt="" loading="lazy">'],
  [/👥/g, '<img src="../dashboard/icons/team.png" class="icon-img" alt="" loading="lazy">'],
  [/💬/g, '<img src="../dashboard/icons/chat.png" class="icon-img" alt="" loading="lazy">'],
  [/🎙️/g, '<img src="../dashboard/icons/signal.png" class="icon-img" alt="" loading="lazy">'],
  [/🎙/g,  '<img src="../dashboard/icons/signal.png" class="icon-img" alt="" loading="lazy">'],
  [/🌌/g, ''],
  [/🌙/g, ''],
  [/🍽️/g, '<img src="../dashboard/icons/agent-ai.png" class="icon-img" alt="" loading="lazy">'],
  [/🍽/g,  '<img src="../dashboard/icons/agent-ai.png" class="icon-img" alt="" loading="lazy">'],
  [/🏛/g,  '<img src="../dashboard/icons/home.png" class="icon-img" alt="" loading="lazy">'],
  [/🎨/g, '<img src="../dashboard/icons/lightbulb.png" class="icon-img" alt="" loading="lazy">'],
];

const CSS = `
    /* === MARCOW ICONS === */
    .icon-img {
      width: 20px; height: 20px;
      object-fit: contain;
      vertical-align: middle;
      filter: brightness(0) invert(1);
      opacity: 0.85;
      display: inline-block;
      flex-shrink: 0;
    }
    h1 .icon-img, h2 .icon-img, .logo .icon-img, .hero .icon-img {
      width: 40px; height: 40px;
      opacity: 1;
    }
    .icon-logo { filter: none !important; opacity: 1 !important; }`;

const filepath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filepath, 'utf8');

const scriptBlocks = [];
let html = content.replace(/<script[\s\S]*?<\/script>/gi, (m) => {
  scriptBlocks.push(m);
  return `\x00S${scriptBlocks.length-1}\x00`;
});

let replacements = 0;
for (const [re, rep] of RULES) {
  const before = html;
  html = html.replace(re, rep);
  if (html !== before) replacements += (before.match(re)||[]).length;
}

// Remettre scripts
scriptBlocks.forEach((b, i) => html = html.replace(`\x00S${i}\x00`, b));

// CSS
if (!html.includes('/* === MARCOW ICONS ===')) {
  html = html.replace('</style>', CSS + '\n    </style>');
}

// Clean title
html = html.replace(/<title>([\s\S]*?)<\/title>/gi, (m, inner) =>
  `<title>${inner.replace(/<img[^>]*>/gi,'').trim()}</title>`
);

// Corriger les chemins d'icônes — le hub est à la racine du repo, les icônes sont dans agents-dashboard
// Les URLs seront relatives depuis arkreal1590.github.io → agents-dashboard/icons/
html = html.replace(/src="\.\.\/dashboard\/icons\//g, 'src="agents-dashboard/icons/');

fs.writeFileSync(filepath, html, 'utf8');
console.log('✅ index.html —', replacements, 'remplacements');
