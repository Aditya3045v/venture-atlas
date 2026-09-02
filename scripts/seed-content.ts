/**
 * scripts/seed-content.ts
 *
 * Seeds content into the Venture Atlas database via the service key.
 * Idempotent: inserts skip on slug conflict.
 * Run: npx tsx --env-file=.env scripts/seed-content.ts
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing env vars'); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Use the seeded test admin as author_id
const ADMIN_ID  = 'ffe245e1-85dd-45bc-8664-e75340420f18'; // admin.test@ventureatlas.io
const WRITER_ID = 'c99f0b77-1efb-4367-ad58-0e6a4f4fc707'; // writer.test@ventureatlas.io

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

async function main() {
  console.log('====================================================');
  console.log('        SEED CONTENT                                ');
  console.log('====================================================\n');

  // ----------------------------------------------------------------
  // 1. Categories (6 — matching navigation)
  // ----------------------------------------------------------------
  console.log('Seeding categories...');
  const { data: cats, error: catErr } = await db.from('categories').upsert([
    { name: 'Unicorn',            slug: 'unicorn',          description: 'Billion-dollar valuations and blitzscaling',   color: '#EC4899', display_order: 1 },
    { name: 'Failure',            slug: 'failure',          description: 'Post-mortems and cautionary startup lessons',  color: '#EF4444', display_order: 2 },
    { name: 'Finance',            slug: 'finance',          description: 'Fintech rails and venture lending',            color: '#10B981', display_order: 3 },
    { name: 'Crypto Web3',        slug: 'crypto-web3',      description: 'DeFi, L1 networks, and token economics',       color: '#06B6D4', display_order: 4 },
    { name: 'Founder Biography',  slug: 'founder-biography',description: 'In-depth founder portraits and journeys',      color: '#F59E0B', display_order: 5 },
    { name: 'Case Studies',       slug: 'case-studies',     description: 'Startup architecture and teardown analyses',   color: '#8B5CF6', display_order: 6 },
  ], { onConflict: 'slug', ignoreDuplicates: false }).select('id, slug');
  if (catErr) { console.error('Categories error:', catErr.message); process.exit(1); }
  
  const catMap: Record<string, string> = {};
  for (const c of cats ?? []) catMap[c.slug] = c.id;
  console.log(`  ${Object.keys(catMap).length} categories ready: ${Object.keys(catMap).join(', ')}\n`);

  // ----------------------------------------------------------------
  // 2. Published Articles (12 across categories, varied dates, 2 featured)
  // ----------------------------------------------------------------
  console.log('Seeding articles...');
  const articles = [
    // Unicorn (3)
    { title: 'Stripe Closes $6.5B Round at $65B Valuation, Eyes 2027 IPO', slug: 'stripe-6b-round-2027-ipo', summary: 'Stripe has secured a $6.5 billion Series I at a $65 billion valuation, led by Sequoia and General Catalyst. CFO Dhivya Suryadevara confirmed the round will fund expansion into Southeast Asia and a potential 2027 public offering. The fintech titan processed $1.4 trillion in payments volume in the last fiscal year.', body: 'Stripe has secured a $6.5 billion Series I at a $65 billion valuation.', category_slug: 'unicorn', published_at: daysAgo(1),  is_featured: true,  author_id: ADMIN_ID },
    { title: 'Anduril Industries Raises $1.5B, Valuation Hits $14B',       slug: 'anduril-1-5b-defense-valuation', summary: 'Defense tech startup Anduril Industries has raised $1.5 billion in a Series F, pushing its valuation to $14 billion. Palmer Luckey\'s firm is supplying autonomous drone systems to the US military under a $1 billion DoD contract. Investors include Peter Thiel\'s Founders Fund and Andreessen Horowitz.', body: 'Anduril raises $1.5B Series F.', category_slug: 'unicorn', published_at: daysAgo(3),  is_featured: false, author_id: ADMIN_ID },
    { title: 'Databricks Posts $3.5B Revenue Run Rate, IPO Filing Imminent', slug: 'databricks-35b-revenue-ipo', summary: 'Databricks has crossed a $3.5 billion annual recurring revenue run rate, a 65% year-over-year increase, ahead of an anticipated IPO filing this quarter. The data lakehouse pioneer serves 10,000 enterprise customers including Apple, Shell, and JPMorgan. CEO Ali Ghodsi confirmed the board has approved proceeding with public markets.', body: 'Databricks at $3.5B ARR, IPO imminent.', category_slug: 'unicorn', published_at: daysAgo(5),  is_featured: false, author_id: ADMIN_ID },
    // Failure (2)
    { title: 'Convoy Shuts Down: $4B Freight Startup\'s Rapid Collapse',   slug: 'convoy-shutdown-freight-collapse', summary: 'Digital freight network Convoy ceased operations after burning through $900 million in venture funding. The Seattle-based company, once valued at $4 billion, could not bridge the gap between spot freight market compression and unit economics. Co-founder Dan Lewis cited macro conditions and a failed acquisition bid by Echo Global Logistics.', body: 'Convoy shuts down after burning $900M.', category_slug: 'failure', published_at: daysAgo(7),  is_featured: false, author_id: ADMIN_ID },
    { title: 'Stability AI\'s Near-Death: Governance Crisis and Talent Exodus', slug: 'stability-ai-governance-crisis', summary: 'Stability AI narrowly avoided insolvency after founder Emad Mostaque\'s abrupt resignation triggered a $75 million Series B withdrawal and a mass departure of key researchers. The board installed Intel\'s Sean Evans as interim CEO. Three competing image generation models launched by former staff threaten its open-source positioning.', body: 'Stability AI governance crisis detailed.', category_slug: 'failure', published_at: daysAgo(10), is_featured: false, author_id: WRITER_ID },
    // Finance (2)
    { title: 'Mercury Bank Launches $5M Credit Lines for Seed-Stage Startups', slug: 'mercury-5m-credit-seed-startups', summary: 'Mercury Bank has rolled out venture debt lines up to $5 million for seed-stage companies with at least six months of runway. The product targets founders who want to extend their runway without dilution. Lines are secured against ARR and require a Mercury checking account. Pricing starts at Prime plus 2.5%, with no warrants.', body: 'Mercury launches venture debt for seed stage.', category_slug: 'finance', published_at: daysAgo(2),  is_featured: true,  author_id: ADMIN_ID },
    { title: 'Tiger Global Marks Down Portfolio by $23B Amid Rate Reset',   slug: 'tiger-global-23b-markdown', summary: 'Tiger Global has written down its venture portfolio by $23 billion, the largest markdown by a single firm in venture history. The hedge fund\'s crossover strategy, which deployed $70 billion in private markets at peak valuations, has been crushed by rising interest rates and compressed SaaS multiples. LP distributions remain frozen.', body: 'Tiger Global $23B markdown detailed.', category_slug: 'finance', published_at: daysAgo(12), is_featured: false, author_id: ADMIN_ID },
    // Crypto Web3 (2)
    { title: 'Ethereum L2 Base Processes 4M Daily Transactions, Surpasses Mainnet', slug: 'base-l2-4m-transactions-surpass-mainnet', summary: 'Coinbase\'s Base L2 network recorded 4 million daily transactions, surpassing Ethereum mainnet throughput for the first time. Sequencer fees generated $18 million in the last month. The network hosts 1,200 active dApps including Aerodrome, Morpho, and Friend.tech successor Superfluid. Total value locked stands at $7.2 billion.', body: 'Base L2 surpasses Ethereum mainnet.', category_slug: 'crypto-web3', published_at: daysAgo(4),  is_featured: false, author_id: ADMIN_ID },
    { title: 'BlackRock Bitcoin ETF Hits $20B AUM in 8 Months', slug: 'blackrock-bitcoin-etf-20b-aum', summary: 'BlackRock\'s iShares Bitcoin Trust ETF has accumulated $20 billion in assets under management, becoming the fastest ETF in history to reach that milestone. Daily inflows averaged $240 million in Q3, displacing Grayscale\'s GBTC as the leading Bitcoin investment vehicle. Institutional adoption now accounts for 68% of ETF holdings.', body: 'BlackRock Bitcoin ETF reaches $20B AUM.', category_slug: 'crypto-web3', published_at: daysAgo(8),  is_featured: false, author_id: WRITER_ID },
    // Founder Biography (2)
    { title: 'Brian Chesky\'s Obsession with Product: Inside Airbnb\'s Comeback',  slug: 'brian-chesky-airbnb-comeback-story', summary: 'When the pandemic erased 80% of Airbnb\'s revenue overnight, Brian Chesky slept on the platform he built. He personally called 1,000 hosts and cut $800 million in costs within eight weeks. The decision to stay private longer and invest in experience quality—not growth—produced the most profitable IPO of 2020 and a $75 billion market cap.', body: 'Brian Chesky\'s Airbnb comeback story.', category_slug: 'founder-biography', published_at: daysAgo(6),  is_featured: false, author_id: ADMIN_ID },
    { title: 'Jensen Huang Built NVIDIA\'s Moat in Plain Sight Over 30 Years',    slug: 'jensen-huang-nvidia-30-year-moat', summary: 'Jensen Huang spent three decades turning a graphics chip company into the infrastructure of modern AI. The thesis was simple: bet on parallel compute before demand existed. His decision to open-source CUDA in 2007, absorb operating losses for years, and bet the company on data center GPUs produced a $3 trillion market cap and 80% AI accelerator market share.', body: 'Jensen Huang built NVIDIA over 30 years.', category_slug: 'founder-biography', published_at: daysAgo(9),  is_featured: false, author_id: ADMIN_ID },
    // Case Studies (1 PUBLISHED article type)
    { title: 'How Figma Captured Design Tooling Before Adobe Could React',   slug: 'figma-captured-design-adobe-react', summary: 'Figma\'s $20 billion acquisition offer from Adobe validated a product built on one insight: design is collaboration, not creation. Dylan Field launched in a browser when Electron didn\'t exist, refused enterprise deals that would slow the PLG flywheel, and held multiplayer at the core before Notion or Linear made collaboration a category. Adobe was too slow.', body: 'Figma product strategy and Adobe acquisition.', category_slug: 'case-studies', published_at: daysAgo(11), is_featured: false, author_id: ADMIN_ID },
  ];

  let articleCount = 0;
  const articleIds: Record<string, string> = {};
  for (const a of articles) {
    const catId = catMap[a.category_slug];
    if (!catId) { console.error(`  No category found for slug: ${a.category_slug}`); continue; }
    const { data, error } = await db.from('articles').upsert({
      title: a.title, slug: a.slug, summary: a.summary, body: a.body,
      category_id: catId, author_id: a.author_id,
      status: 'PUBLISHED', published_at: a.published_at,
      is_featured: a.is_featured, word_count: 60, read_time_minutes: 1,
    }, { onConflict: 'slug', ignoreDuplicates: false }).select('id, slug');
    if (error) { console.error(`  FAILED ${a.slug}: ${error.message}`); }
    else { articleIds[a.slug] = data![0].id; articleCount++; }
  }
  console.log(`  ${articleCount} published articles seeded.\n`);

  // ----------------------------------------------------------------
  // 3. DRAFT articles (2)
  // ----------------------------------------------------------------
  console.log('Seeding DRAFT articles...');
  const drafts = [
    { title: '[DRAFT] ElevenLabs Closes $80M at $1.1B Valuation', slug: 'draft-elevenlabs-80m-valuation', summary: 'ElevenLabs, the AI voice synthesis startup, is closing an $80 million Series B that would push its valuation to $1.1 billion, per sources close to the deal. The round is being led by Andreessen Horowitz with participation from Sequoia. The company\'s API currently generates 1 billion minutes of synthetic audio monthly.', body: 'Draft article body for ElevenLabs funding.', category_slug: 'unicorn', author_id: WRITER_ID },
    { title: '[DRAFT] Founders Fund Returns 8x on SpaceX Secondary Sale',   slug: 'draft-founders-fund-spacex-secondary', summary: 'Founders Fund is distributing $2.4 billion to LPs from a SpaceX secondary transaction, representing an 8x return on their 2008 Series D investment. The transaction was executed at a $210 billion implied valuation. This marks the largest venture fund distribution in the firm\'s 20-year history.', body: 'Draft article body for Founders Fund SpaceX.', category_slug: 'finance', author_id: ADMIN_ID },
  ];
  let draftCount = 0;
  for (const d of drafts) {
    const catId = catMap[d.category_slug];
    const { error } = await db.from('articles').upsert({
      title: d.title, slug: d.slug, summary: d.summary, body: d.body,
      category_id: catId, author_id: d.author_id, status: 'DRAFT',
      word_count: 60, read_time_minutes: 1,
    }, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) { console.error(`  FAILED ${d.slug}: ${error.message}`); }
    else draftCount++;
  }
  console.log(`  ${draftCount} DRAFT articles seeded.\n`);

  // ----------------------------------------------------------------
  // 4. SCHEDULED article (1, scheduled 7 days from now)
  // ----------------------------------------------------------------
  console.log('Seeding SCHEDULED article...');
  const { error: schedErr } = await db.from('articles').upsert({
    title: 'Exclusive: OpenAI\'s GPT-5 Launch Date Locked for Q4 2026',
    slug: 'scheduled-openai-gpt5-q4-2026',
    summary: 'OpenAI has internally confirmed a Q4 2026 launch window for GPT-5, according to three people familiar with the roadmap. The model is said to achieve AGI benchmark parity on all frontier evals. Sam Altman has briefed select enterprise partners under NDA. A public preview is expected 30 days before the full release.',
    body: 'Scheduled article body for OpenAI GPT-5.',
    category_id: catMap['unicorn'], author_id: ADMIN_ID,
    status: 'SCHEDULED', scheduled_for: daysFromNow(7),
    word_count: 60, read_time_minutes: 1,
  }, { onConflict: 'slug', ignoreDuplicates: false });
  if (schedErr) { console.error('  FAILED scheduled:', schedErr.message); }
  else console.log('  1 SCHEDULED article seeded (publishes in 7 days).\n');

  // ----------------------------------------------------------------
  // 5. Case Studies (3 published)
  // ----------------------------------------------------------------
  console.log('Seeding case studies...');
  const caseStudies = [
    { title: 'Figma: The Collaboration-First Design Monopoly', slug: 'figma-collaboration-design-monopoly', company: 'Figma', summary: 'How Figma redefined product design tooling by putting real-time multiplayer at the center of a category built around solo artistry.', challenge: 'Adobe owned the design tool market with Photoshop and Illustrator. Figma had no installed base and no enterprise contracts.', strategy: 'Browser-first architecture, multiplayer by default, PLG via free tier with viral sharing. No sales team for the first four years.', outcome: 'Adobe offered $20 billion to acquire Figma in 2022. The deal was blocked by EU regulators, validating Figma\'s independent market position.', body: 'Full case study body for Figma.', category_slug: 'case-studies' },
    { title: 'Stripe: Infrastructure as Leverage', slug: 'stripe-infrastructure-leverage', company: 'Stripe', summary: 'How Patrick and John Collison turned seven lines of code into the payments backbone of the internet economy.', challenge: 'Payments were dominated by legacy processors requiring weeks of integration and percentage-point pricing. Developer experience was an afterthought.', strategy: 'Developer-first API, instant onboarding, transparent pricing, and relentless platform expansion into fraud, tax, and capital.', outcome: '$65 billion valuation, $1.4 trillion in payment volume annually, and deep infrastructure lock-in across 3 million businesses.', body: 'Full case study body for Stripe.', category_slug: 'finance' },
    { title: 'FTX Post-Mortem: When Governance Fails at Scale', slug: 'ftx-post-mortem-governance', company: 'FTX', summary: 'The collapse of an $32 billion exchange and what it reveals about founder-led governance in crypto.', challenge: 'FTX grew from zero to $32 billion valuation in three years with no independent board, no risk management function, and no audit trail.', strategy: 'Sam Bankman-Fried used Alameda Research as a shadow liquidity provider, commingling customer funds with proprietary trading capital.', outcome: 'FTX filed for bankruptcy in November 2022. SBF was convicted on seven counts of fraud. $8 billion in customer funds remain unrecovered.', body: 'Full case study body for FTX post-mortem.', category_slug: 'failure' },
  ];
  let csCount = 0;
  for (const cs of caseStudies) {
    const catId = catMap[cs.category_slug];
    const { error } = await db.from('case_studies').upsert({
      title: cs.title, slug: cs.slug, company: cs.company, summary: cs.summary,
      challenge: cs.challenge, strategy: cs.strategy, outcome: cs.outcome, body: cs.body,
      category_id: catId, author_id: ADMIN_ID, status: 'PUBLISHED',
      published_at: daysAgo(Math.floor(Math.random() * 14)), read_time_minutes: 8,
    }, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) { console.error(`  FAILED ${cs.slug}: ${error.message}`); }
    else csCount++;
  }
  console.log(`  ${csCount} case studies seeded.\n`);

  // ----------------------------------------------------------------
  // 6. Blog Posts (2 published)
  // ----------------------------------------------------------------
  console.log('Seeding blog posts...');
  const blogs = [
    { title: 'The Liquidity Illusion: Why Most VC Returns Are Paper', slug: 'liquidity-illusion-vc-paper-returns', excerpt: 'Most venture portfolios look extraordinary on paper. Few look extraordinary in LP bank accounts. Here\'s why the gap exists and how it is widening.', body: 'Full blog post body about VC liquidity illusion.', category_slug: 'finance' },
    { title: 'Founder Mode Is Real, But Nobody Talks About the Downside', slug: 'founder-mode-real-downside', excerpt: 'Paul Graham\'s Founder Mode essay went viral. What it didn\'t address is what happens to an organization when the founder can\'t let go.', body: 'Full blog post body about founder mode downside.', category_slug: 'founder-biography' },
  ];
  let blogCount = 0;
  for (const b of blogs) {
    const catId = catMap[b.category_slug];
    const { error } = await db.from('blog_posts').upsert({
      title: b.title, slug: b.slug, excerpt: b.excerpt, body: b.body,
      category_id: catId, author_id: ADMIN_ID, status: 'PUBLISHED',
      published_at: daysAgo(Math.floor(Math.random() * 14)), read_time_minutes: 6,
    }, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) { console.error(`  FAILED ${b.slug}: ${error.message}`); }
    else blogCount++;
  }
  console.log(`  ${blogCount} blog posts seeded.\n`);

  // ----------------------------------------------------------------
  // 7. Row counts summary
  // ----------------------------------------------------------------
  console.log('Row counts:');
  for (const table of ['articles', 'case_studies', 'blog_posts', 'categories']) {
    const { count } = await db.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${table}: ${count}`);
  }
  // Status breakdown for articles
  const { data: statusBreakdown } = await db.from('articles').select('status');
  const counts: Record<string, number> = {};
  for (const r of statusBreakdown ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
  console.log('  articles by status:', JSON.stringify(counts));

  console.log('\n====================================================');
  console.log('SEED COMPLETE');
  console.log('====================================================');
}

main().catch(e => { console.error(e); process.exit(1); });
