const { execSync } = require('child_process');
const fs = require('fs');

const targets = [
  { name: 'Homepage Desktop', url: 'http://localhost:3000/', preset: 'desktop' },
  { name: 'Homepage Mobile', url: 'http://localhost:3000/', preset: 'mobile' },
  { name: 'Article Desktop', url: 'http://localhost:3000/articles/stripe-6b-round-2027-ipo', preset: 'desktop' },
  { name: 'Article Mobile', url: 'http://localhost:3000/articles/stripe-6b-round-2027-ipo', preset: 'mobile' },
  { name: 'Case Study Desktop', url: 'http://localhost:3000/case-studies/stripe-infrastructure-leverage', preset: 'desktop' },
  { name: 'Case Study Mobile', url: 'http://localhost:3000/case-studies/stripe-infrastructure-leverage', preset: 'mobile' },
];

async function runAudits() {
  console.log('====================================================');
  console.log('       LIGHTHOUSE 6-SET COMPREHENSIVE AUDIT         ');
  console.log('====================================================\n');

  const results = [];

  for (const t of targets) {
    console.log(`Running Lighthouse on: ${t.name} (${t.url})...`);
    const outFile = `lh-report-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    const flags = t.preset === 'desktop' ? '--preset=desktop' : '--form-factor=mobile --throttling-method=simulate';
    const cmd = `npx lighthouse "${t.url}" --output=json --output-path="${outFile}" --chrome-flags="--headless --no-sandbox" ${flags} --quiet`;
    
    try {
      execSync(cmd, { stdio: 'pipe' });
      const raw = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      
      const perf = Math.round((raw.categories.performance?.score || 0) * 100);
      const a11y = Math.round((raw.categories.accessibility?.score || 0) * 100);
      const bp = Math.round((raw.categories['best-practices']?.score || 0) * 100);
      const seo = Math.round((raw.categories.seo?.score || 0) * 100);

      const lcp = raw.audits['largest-contentful-paint']?.displayValue || 'N/A';
      const cls = raw.audits['cumulative-layout-shift']?.displayValue || '0';
      const ttfb = raw.audits['server-response-time']?.displayValue || 'N/A';
      const inp = raw.audits['interaction-to-next-paint']?.displayValue || raw.audits['total-blocking-time']?.displayValue || 'N/A';

      results.push({
        'Target': t.name,
        'Perf': perf,
        'A11y': a11y,
        'Best Practices': bp,
        'SEO': seo,
        'LCP': lcp,
        'CLS': cls,
        'INP/TBT': inp,
        'TTFB': ttfb,
      });

      try { fs.unlinkSync(outFile); } catch {}
    } catch (e) {
      console.error(`Failed audit on ${t.name}:`, e.message);
    }
  }

  console.log('\n=== LIGHTHOUSE 6-SET RESULTS ===\n');
  console.table(results);
}

runAudits().catch(console.error);
