import { createClient } from '@supabase/supabase-js';

export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CATEGORY_IMAGES: Record<string, { images: string[]; credit: string }> = {
  unicorn: {
    images: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', // High-tech collaboration
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Corporate skyscraper
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Data dashboard
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', // Tech office
    ],
    credit: 'Unsplash / Enterprise Lens',
  },
  failure: {
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80', // Caution / storm
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', // Abstract dark network
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Matrix code glitch
    ],
    credit: 'Unsplash / Cautionary Post-Mortem',
  },
  finance: {
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', // Stock trading candlestick
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', // Venture capital financial graph
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', // Digital fintech payment
    ],
    credit: 'Unsplash / Capital Markets',
  },
  'crypto-web3': {
    images: [
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80', // Blockchain network 3D
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80', // Web3 futuristic neon
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80', // Decentralized ledger
    ],
    credit: 'Unsplash / Web3 Protocol',
  },
  'founder-biography': {
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', // Executive portrait
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80', // Founder portrait
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80', // Leadership portrait
    ],
    credit: 'Unsplash / Founder Archive',
  },
  'case-studies': {
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', // Server racks
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // UI Design system
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Global infrastructure
    ],
    credit: 'Unsplash / Teardown Lab',
  },
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
];

async function main() {
  console.log('====================================================');
  console.log('      POPULATE HIGH-RES COVER IMAGES FOR POSTS      ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Fetch Categories for lookup
  const { data: categories } = await supabase.from('categories').select('id, slug');
  const catSlugById: Record<string, string> = {};
  for (const c of categories || []) catSlugById[c.id] = c.slug;

  // 2. Populate Articles
  const { data: articles } = await supabase.from('articles').select('id, title, category_id, cover_image');
  console.log(`Found ${articles?.length || 0} articles. Updating cover images...`);

  let artIdx = 0;
  for (const art of articles || []) {
    const slug = catSlugById[art.category_id] || 'unicorn';
    const catPool = CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.unicorn;
    const assignedImage = catPool.images[artIdx % catPool.images.length];
    const assignedCredit = catPool.credit;

    await supabase.from('articles').update({
      cover_image: assignedImage,
      photo_credit: assignedCredit,
      updated_at: new Date().toISOString(),
    }).eq('id', art.id);

    artIdx++;
  }
  console.log(`[PASS] Updated ${artIdx} articles with high-resolution editorial photography.\n`);

  // 3. Populate Blog Posts
  const { data: blogs } = await supabase.from('blog_posts').select('id, title, cover_image');
  console.log(`Found ${blogs?.length || 0} blog posts. Updating cover images...`);

  let blogIdx = 0;
  for (const blog of blogs || []) {
    const assignedImage = DEFAULT_IMAGES[blogIdx % DEFAULT_IMAGES.length];
    await supabase.from('blog_posts').update({
      cover_image: assignedImage,
      updated_at: new Date().toISOString(),
    }).eq('id', blog.id);
    blogIdx++;
  }
  console.log(`[PASS] Updated ${blogIdx} blog posts with cover images.\n`);

  // 4. Populate Case Studies
  const { data: caseStudies } = await supabase.from('case_studies').select('id, title, cover_image');
  console.log(`Found ${caseStudies?.length || 0} case studies. Updating cover images...`);

  let caseIdx = 0;
  const caseImages = CATEGORY_IMAGES['case-studies'].images;
  for (const cs of caseStudies || []) {
    const assignedImage = caseImages[caseIdx % caseImages.length];
    await supabase.from('case_studies').update({
      cover_image: assignedImage,
      updated_at: new Date().toISOString(),
    }).eq('id', cs.id);
    caseIdx++;
  }
  console.log(`[PASS] Updated ${caseIdx} case studies with cover images.\n`);

  console.log('====================================================');
  console.log('[SUCCESS] All posts across database populated with high-res cover images.');
  console.log('====================================================\n');
}

main().catch(console.error);
