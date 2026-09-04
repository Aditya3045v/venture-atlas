const fs = require('fs');
const path = require('path');

const terms = ['ventureatlas.io', 'localhost:3000'];
const rootDirs = ['src', 'scripts', 'public', 'supabase'];
const configFiles = ['.env', 'next.config.mjs', 'next.config.js', 'package.json', 'tsconfig.json', 'README.md'];

const hits = [];

function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const term of terms) {
        if (line.includes(term)) {
          hits.push({ file: filePath.replace(/\\/g, '/'), line: idx + 1, term, content: line.trim() });
        }
      }
    });
  } catch (e) {}
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', '.gemini', 'dist'].includes(entry.name)) {
        walk(full);
      }
    } else {
      searchFile(full);
    }
  }
}

rootDirs.forEach(walk);
configFiles.forEach(f => { if (fs.existsSync(f)) searchFile(f); });

console.log('=== COMPLETE AUDIT: ALL GREP HITS ACROSS REPO ===');
for (const h of hits) {
  console.log(h.file + ':' + h.line + ' [' + h.term + '] => ' + h.content);
}
console.log('\nTotal hits:', hits.length);
