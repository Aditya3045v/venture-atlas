export const SEED_CATEGORIES = [
  {
    name: 'Startups',
    slug: 'startups',
    description: 'Early stage ventures, stealth launches, founder stories and YC batches',
    color: '#FF6B6B',
    order: 1,
  },
  {
    name: 'Funding',
    slug: 'funding',
    description: 'Seed rounds, Series A to Growth, valuations and term sheet insights',
    color: '#10B981',
    order: 2,
  },
  {
    name: 'Venture Capital',
    slug: 'venture-capital',
    description: 'Fund raises, LP dynamics, thesis shifts and partner movements',
    color: '#6366F1',
    order: 3,
  },
  {
    name: 'Founders',
    slug: 'founders',
    description: 'Operator playbooks, scaling lessons, product pivots and culture',
    color: '#F59E0B',
    order: 4,
  },
  {
    name: 'AI & Tech',
    slug: 'ai-and-tech',
    description: 'LLMs, compute clusters, foundational models and developer tools',
    color: '#8B5CF6',
    order: 5,
  },
  {
    name: 'Fintech',
    slug: 'fintech',
    description: 'Neobanks, cross-border rails, payments infrastructure and regulation',
    color: '#EC4899',
    order: 6,
  },
  {
    name: 'Markets & M&A',
    slug: 'markets-and-m-and-a',
    description: 'IPOs, secondary market liquidity, acquisitions and macro conditions',
    color: '#3B82F6',
    order: 7,
  },
];

export const SEED_USERS = [
  {
    email: 'admin@ventureatlas.io',
    name: 'Alex Rivera',
    role: 'ADMIN',
    plan: 'ENTERPRISE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Founding Editor & Managing Director at Venture Atlas',
  },
  {
    email: 'editor@ventureatlas.io',
    name: 'Sarah Chen',
    role: 'EDITOR',
    plan: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    bio: 'Senior Technology & Markets Editor',
  },
  {
    email: 'author@ventureatlas.io',
    name: 'Devon Scott',
    role: 'AUTHOR',
    plan: 'PRO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Staff Reporter covering Seed & Early Stage ecosystems',
  },
  {
    email: 'reader@ventureatlas.io',
    name: 'Priya Mehta',
    role: 'USER',
    plan: 'FREE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Angel Investor & Venture Enthusiast',
  },
];

export const SEED_ARTICLES = [
  {
    title: 'Verity Silicon Closes $340M Series C to Ramp AI Inference Microchips',
    slug: 'verity-silicon-closes-340m-series-c-ai-inference',
    summary: 'Verity Silicon closed a $340 million round led by Sequoia and Temasek, valuing the inference chip maker at $4.1 billion. The funding will accelerate mass fabrication of their low-power ultra-dense accelerators targeted at local AI workloads on mobile devices and edge appliances.',
    body: `### The Breakthrough Architecture

Verity Silicon, an analog compute startup founded by former Apple and Nvidia semiconductor veterans, announced a major $340M Series C funding round today.

The round was co-led by Sequoia Capital and Temasek, with participation from Lightspeed and existing early backers. The company is now valued at $4.1 billion post-money.

Unlike traditional GPU architectures that suffer from memory transfer bottlenecks, Verity calculates neural weights directly within non-volatile resistive RAM arrays.

- **70% Lower Power**: Enables real-time speech and visual reasoning on sub-15W battery devices.
- **Enterprise Demand**: Initial commercial pilots are active across automotive telematics and sovereign defense hardware.
- **Production Ramp**: Commercial shipments are slated to begin late Q4 from TSMC's 4nm fabs.

> "Inference efficiency is the defining hardware battleground of this decade. We designed Verity from first principles to compute without the Von Neumann tax," said CEO Marcus Vance.`,
    categorySlug: 'funding',
    sourceName: 'The Information',
    sourceUrl: 'https://theinformation.com/articles/verity-silicon-funding-round',
    sourceAuthor: 'Amira Thorne',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'VERITY SILICON / FAB LAB',
    readTimeMinutes: 2,
    wordCount: 52,
    status: 'PUBLISHED',
    isFeatured: true,
    isTrending: true,
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    viewCount: 18420,
    tags: ['Semiconductors', 'AI Hardware', 'Series C', 'Sequoia'],
  },
  {
    title: 'Two Ex-Stripe Engineers Launch Unified Payroll Rails Across 18 African Markets',
    slug: 'two-ex-stripe-engineers-launch-african-payroll-rails',
    summary: 'Fintech startup Zephyr emerged from stealth with $14M in seed funding to unify cross-border contractor payouts across 18 African nations. The API automates tax withholding, local currency conversions, and instant mobile money routing across M-Pesa, Wave, and Orange Money.',
    body: `### Solving the Fragmented Rails

Zephyr, founded by early Stripe engineers Adebayo Ojo and Kwesi Mensah, is tackling one of the most stubborn friction points in emerging market employment: cross-border compensation.

The company raised a $14M seed round led by Founders Fund and Y Combinator, with participation from angel investors across Stripe, Wise, and Flutterwave.

#### Core Capabilities:
1. **Multi-Rail Instant Settlement**: Routes payments directly into local mobile wallets including M-Pesa (Kenya), Wave (Senegal/Ivory Coast), and bank clearing networks in Nigeria and South Africa.
2. **Automated Compliance Engine**: Calculates local statutory withholdings and tax filings in accordance with municipal labor statutes.
3. **FX Hedging**: Built-in treasury tools lock in convertibility rates for remote international employers.

Global companies hiring engineering and support talent in Nairobi, Lagos, and Cairo previously waited up to five business days for international wire transfers to clear. Zephyr settles funds in under 90 seconds.`,
    categorySlug: 'startups',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/startups/zephyr-african-payroll-api',
    sourceAuthor: 'Tariq Johnson',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'ZEPHYR / NAIROBI HQ',
    readTimeMinutes: 2,
    wordCount: 48,
    status: 'PUBLISHED',
    isFeatured: false,
    isTrending: true,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    viewCount: 12890,
    tags: ['Fintech', 'Africa', 'Seed Round', 'YC'],
  },
  {
    title: 'European Union Finalizes Two-Year Price Ceiling on Carbon Import Levies',
    slug: 'eu-finalizes-carbon-import-levy-ceiling',
    summary: 'EU ministers agreed a two-year ceiling on the carbon border adjustment mechanism (CBAM) following marathon negotiations in Brussels. Importers of steel, aluminum, cement and fertilizer will pay capped rates starting in January, mitigating inflation pressures for industrial manufacturers.',
    body: `### Policy Compromise in Brussels

Following eight hours of closed-door deliberations, European trade and climate ministers adopted an emergency transition mechanism for the Carbon Border Adjustment Mechanism (CBAM).

The cap will fix emissions compliance costs at €62 per tonne through December 2028, roughly 28% beneath the initial modeled projections.

Poland and Italy agreed to withdraw formal veto reservations following the addition of a bilateral review clause, which requires the European Commission to evaluate supply chain competitiveness quarterly.`,
    categorySlug: 'markets-and-m-and-a',
    sourceName: 'Reuters',
    sourceUrl: 'https://reuters.com/sustainability/eu-carbon-cap',
    sourceAuthor: 'Helena Berg',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'REUTERS / PORT OF ROTTERDAM',
    readTimeMinutes: 2,
    wordCount: 50,
    status: 'PUBLISHED',
    isFeatured: false,
    isTrending: false,
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    viewCount: 9400,
    tags: ['Policy', 'Carbon', 'EU', 'Trade'],
  },
  {
    title: 'Dollar Index Falls to 14-Month Low as Central Banks Price Two Fed Rate Cuts',
    slug: 'dollar-index-falls-fed-rate-cuts',
    summary: 'The US Dollar Index slipped 0.8% to its weakest level since June of last year as global rate traders priced in two additional 25-basis-point reductions by the Federal Reserve before year-end. Yields on the 10-year Treasury note sank to 3.82% amid cooling wholesale producer prices.',
    body: `### Macroeconomic Pivot

Foreign exchange trading desks witnessed sharp repositioning this morning after the Bureau of Labor Statistics reported cooling Producer Price Index data.

Traders in federal funds futures now price an 84% probability of back-to-back quarter-point cuts at the upcoming FOMC policy gatherings.`,
    categorySlug: 'markets-and-m-and-a',
    sourceName: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com/markets/currencies/dollar-slips',
    sourceAuthor: 'Ibrahim Vance',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'BLOOMBERG / TRADING DESK',
    readTimeMinutes: 2,
    wordCount: 47,
    status: 'PUBLISHED',
    isFeatured: false,
    isTrending: true,
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    viewCount: 16100,
    tags: ['Macro', 'Dollar', 'Fed', 'Bonds'],
  },
  {
    title: 'Enterprise Survey Reveals 62% of Engineering Teams Moving to Self-Hosted LLMs',
    slug: 'enterprise-survey-self-hosted-open-weight-llms',
    summary: 'A benchmark survey of 400 engineering and security leaders shows that 62% of mid-to-large enterprises are migrating proprietary data pipelines from proprietary cloud APIs to self-hosted open-weight models, citing dramatic cost reductions and data residency governance.',
    body: `### The Open Weights Inflection

The economics of enterprise artificial intelligence are undergoing a tectonic shift toward self-hosted quantization architectures.

Key insights from the 2026 Enterprise AI Infrastructure Benchmark:
- **Cost Reduction**: Organizations migrating 70B parameter models onto dedicated server clusters report average inference expenditure decreases of 74%.
- **Latency & Privacy**: Retaining embeddings within private virtual clouds eliminates compliance hurdles under HIPAA, GDPR, and sovereign cloud mandates.`,
    categorySlug: 'ai-and-tech',
    sourceName: 'VentureBeat',
    sourceUrl: 'https://venturebeat.com/ai/open-weight-enterprise',
    sourceAuthor: 'Kiran Patel',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'VENTUREBEAT / LABS',
    readTimeMinutes: 2,
    wordCount: 46,
    status: 'PUBLISHED',
    isFeatured: false,
    isTrending: true,
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    viewCount: 22400,
    tags: ['AI', 'Open Source', 'Enterprise', 'Cloud'],
  },
  {
    title: 'Y Combinator Launches $1M Dedicated Grant Track for Deeptech & Nuclear Microreactors',
    slug: 'yc-launches-1m-deeptech-nuclear-track',
    summary: 'Y Combinator announced a specialized acceleration track pairing non-dilutive grant capital with standard seed checks for early-stage teams commercializing clean nuclear fission, grid-scale energy storage, and industrial carbon mineralization technologies.',
    body: `### Capitalizing Heavy Tech

Early-stage venture accelerator Y Combinator is doubling down on hard engineering with the launch of its dedicated Deeptech Core initiative.

The program pairs YC's standard $500,000 equity check with up to $1,000,000 in non-dilutive government and philanthropic grant matching.`,
    categorySlug: 'venture-capital',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/venture/yc-deeptech-track',
    sourceAuthor: 'Elena Rostova',
    coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    photoCredit: 'YC MEDIA / SAN FRANCISCO',
    readTimeMinutes: 2,
    wordCount: 44,
    status: 'PUBLISHED',
    isFeatured: false,
    isTrending: false,
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    viewCount: 8900,
    tags: ['Deeptech', 'Nuclear', 'YC', 'Grants'],
  },
];

export const SEED_BLOGS = [
  {
    title: 'The Modern Founder Blueprint: Why Capital Efficiency Is Outperforming Growth at All Costs',
    slug: 'modern-founder-blueprint-capital-efficiency',
    excerpt: 'An extensive breakdown of how top Tier-1 seed and Series A founders are structuring operating margins, compensation pools, and server infrastructure in 2026.',
    body: `### The Death of the Burn Multiple Era

Over the past four years, the benchmark for exceptional venture-backed growth underwent an irreversible reset.

Between 2019 and 2021, seed-stage capital was deployed under the assumption that top-line customer acquisition was the singular metric that mattered. Today, the most competitive founders are building with a drastically different operating philosophy.

#### 1. The Power of Lean Engineering Density
Companies that raised $3M seed rounds in 2021 frequently hired 15 to 20 generalist employees within six months. Today's breakout software companies are reaching $5M in Annual Recurring Revenue (ARR) with core teams of fewer than eight engineers.

#### 2. Negative Working Capital as a Moat
High-performing B2B SaaS and developer platforms are structuring upfront annual enterprise contracts to finance their customer expansion cycles internally, reducing the need for continuous dilutive equity rounds.`,
    categorySlug: 'founders',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    readTimeMinutes: 5,
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'How Liquidity Preferences in Late-Stage Term Sheets Really Work',
    slug: 'how-liquidity-preferences-work-late-stage',
    excerpt: 'Demystifying participating vs non-participating preferred equity, seniority tranches, and downside protections for early startup team members.',
    body: `### Inside the Term Sheet

When a startup announces a mega-valuation round, headline numbers rarely convey the structural covenants negotiated between general partners and founders.

#### Key Mechanisms:
- **1x Non-Participating Preferred**: The venture industry standard, allowing investors to choose between their capital return or converting to common stock.
- **Multiple Preferences (2x-3x)**: Structured during distressed funding environments, these clauses ensure investors recoup multiples before common shareholders see liquidity.`,
    categorySlug: 'venture-capital',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    readTimeMinutes: 4,
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const SEED_CASE_STUDIES = [
  {
    title: 'Stripe: The Architecture of a $1 Trillion Payment Processing Rails',
    slug: 'stripe-architecture-of-1-trillion-payment-rails',
    company: 'Stripe',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=120&q=80',
    valuation: '$65 Billion',
    stage: 'Global Scale (Pre-IPO)',
    keyMetric: '$1T Annual TPV',
    summary: 'How Patrick and John Collison engineered an 8-line API snippet into a global sovereign financial rail handling 1% of global GDP, maintaining five-nines uptime without monolithic database locks.',
    challenge: 'In 2010, accepting credit card payments online required setting up an ISO merchant account, weeks of faxing documents, and managing PCI compliance certificates with legacy bank processors.',
    strategy: 'Build developer-first client libraries where 8 lines of JavaScript replaced merchant underwriting. The company created immutable ledger double-entry bookkeeping engines and autonomous infrastructure pods that decouple checkout traffic from analytical reporting.',
    outcome: 'Stripe processed over $1 trillion in total payment volume (TPV) in 2024, operating with EBITDA margins exceeding 40% while serving millions of businesses globally.',
    body: `### 1. The Origin of Developer-First Infrastructure

When Stripe launched in 2010, the process of accepting payments online was notoriously broken. Traditional merchant acquiring banks required weeks of paper underwriting, personal guarantees, and hundreds of pages of SOAP/XML documentation.

Stripe made a single radical design decision: **Developer Experience as the Primary Distribution Channel**.

\`\`\`javascript
// The 8-line snippet that changed global commerce
const stripe = require('stripe')('sk_live_...');
const charge = await stripe.charges.create({
  amount: 2000,
  currency: 'usd',
  source: 'tok_visa',
  description: 'Charge for test@example.com',
});
\`\`\`

### 2. High-Availability Distributed Financial Ledger

Processing $1 trillion annually requires guarantees far stricter than standard web applications. Every penny must balance across sovereign banking clearing houses in under 200ms.

#### Core Architectural Decisions:
- **Zero In-Place Mutations**: Every balance change creates an immutable credit/debit transaction pair in the ledger.
- **Idempotency Keys**: Network requests automatically include client-generated UUID keys to prevent double-charging during network timeouts.
- **Multi-Region Active-Active Rails**: If an AWS region degrades, transactions failover automatically to secondary availability zones without dropping in-flight payments.

> "If our system drops a single packet during Black Friday, an entrepreneur somewhere loses a mortgage payment. Reliability is not a feature; it is the entire product." — Patrick Collison

### 3. Expansion Into Enterprise Treasury & Billing

Stripe leveraged its core checkout footprint to cross-sell higher-margin software:
1. **Stripe Billing**: Recurring subscription logic handling complex proration and churn prevention.
2. **Stripe Connect**: Multi-sided marketplace payouts powering platforms like Shopify, Lyft, and DoorDash.
3. **Stripe Atlas**: Company formation engine in Delaware that incubates next-generation venture-backed startups from day zero.

### 4. Key Operator Lessons for Founders
- **Friction Reduction Is A Moat**: Eliminating 10 steps down to 1 step generates exponential adoption even when pricing is 2-3x higher than legacy incumbents.
- **Write For Developers, Sell To Executives**: By capturing bottom-up engineering teams, Stripe created an undeniable enterprise pull that CIOs could not bypass.`,
    categorySlug: 'fintech',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    readTimeMinutes: 8,
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Linear: Building a $400M Cult Software Company with Zero Outbound Sales',
    slug: 'linear-building-400m-software-zero-sales',
    company: 'Linear',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    valuation: '$400 Million',
    stage: 'Series B',
    keyMetric: '70%+ Net Margins',
    summary: 'How an 18-person engineering team built the gold standard in issue tracking, defeating Jira and enterprise competitors through 60fps local-first WebGL clients and extreme product craft.',
    challenge: 'Jira and Atlassian owned enterprise project management with massive sales forces and entrenched procurement relationships, but their web apps were sluggish, bloated, and hated by engineers.',
    strategy: 'Karri Saarinen and Tuomas Artman engineered a local-first SQLite synchronizer in Web Workers. Every keystroke is instant (sub-50ms) with keyboard-first shortcuts and a relentless refusal to hire outbound enterprise sales reps.',
    outcome: 'Linear scaled past $35M ARR with fewer than 25 total employees, achieving industry-leading capital efficiency and becoming the default tooling choice for 70%+ of top Tier-1 YC and venture-backed startups.',
    body: `### 1. The Local-First Software Philosophy

Most web applications make an HTTP roundtrip to a server for every click, resulting in 200-500ms latency. Linear took an architectural gamble on **Local-First Synchronization**.

#### How Linear's Sync Engine Works:
- **Client-Side SQLite in IndexedDB**: The user's entire workspace is mirrored on their local computer.
- **Optimistic Instant Updates**: When you change an issue status or assign a task, the UI updates in 0 milliseconds.
- **WebSocket CRDT Reconciliation**: In the background, conflict-free replicated data types synchronize changes across teammates.

### 2. The Power of Extreme Craft Over Enterprise Sales

Linear completely inverted the standard B2B SaaS playbook:
- **No Outbound SDRs**: Zero cold emails or LinkedIn outreach.
- **No Custom Enterprise Feature Bloat**: Rejection of RFPs that would make the software clunky for daily practitioners.
- **Opinionated Workflows**: Instead of endless configuration screens, Linear enforces a streamlined cycle and backlog cadence inspired by elite engineering organizations.

> "Great craft is viral. When software is 10x faster and genuinely enjoyable to use, developers bring it into their company without asking permission."

### 3. Key Operator Lessons for Founders
- **Speed Is The Ultimate Feature**: Sub-50ms latency creates an addictive tactile feel that competing enterprise software cannot replicate.
- **Lean Team Density**: High-density engineering talent out-executes large fragmented teams every time.`,
    categorySlug: 'startups',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    readTimeMinutes: 7,
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Ramp: How Velocity of Execution Beat Legacy Corporate Cards in 36 Months',
    slug: 'ramp-velocity-of-execution-beat-legacy-cards',
    company: 'Ramp',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&q=80',
    valuation: '$7.6 Billion',
    stage: 'Series D',
    keyMetric: '$300M+ ARR in 36 Months',
    summary: 'The fastest-growing enterprise financial software platform in history: how Eric Glyman and Karim Atiyeh built automated savings algorithms that save customers money instead of maximizing fees.',
    challenge: 'American Express and legacy corporate cards made money by encouraging employees to spend more through reward points, causing corporate finance teams to waste hundreds of hours on receipt collection and audit reconciliation.',
    strategy: 'Align incentives: promise CFOs that Ramp will actively decrease their corporate expenses through automated price intelligence and AI receipt matching, monetizing on interchange while delivering immediate tangible ROI.',
    outcome: 'Ramp reached $300M in ARR faster than any software company before it, processing tens of billions in corporate transactions across 25,000+ businesses.',
    body: `### 1. Counter-Intuitive Value Proposition

Legacy credit cards compete on perks, airport lounge access, and rewards points that incentivize high corporate spending.

Ramp pioneered a completely contrary thesis: **We help you spend less money.**

#### Core Pillars:
1. **Automated Vendor Duplicate Detection**: Algorithms flag duplicate software subscriptions and unused SaaS licenses across departments.
2. **Instant Receipt Reconciliation via SMS/Email**: Employees snap a photo of a receipt or forward an invoice, and LLM parsers match it to the ledger in 3 seconds.
3. **Multi-Level Approval Rules**: Budget limits enforced programmatically at the card hardware level.

### 2. Multi-Product Velocity

Rather than remaining a single corporate card company, Ramp shipped four major products in 24 months:
- Corporate Cards & Spend Management
- Global Bill Pay & Accounts Payable (AP)
- Travel Booking & Policy Enforcement
- Procurement & Vendor Contract Intelligence

### 3. Key Operator Lessons
- **Incentive Alignment Wins**: Aligning your revenue model with your customer's bottom line creates unbreakable retention.`,
    categorySlug: 'founders',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    readTimeMinutes: 9,
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];
