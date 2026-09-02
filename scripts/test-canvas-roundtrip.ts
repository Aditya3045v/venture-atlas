import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log('====================================================');
  console.log('     CANVAS DATA SAVE / RELOAD ROUNDTRIP TEST       ');
  console.log('====================================================\n');

  const { data: category } = await supabase.from('categories').select('id').limit(1).single();
  const { data: adminUser } = await supabase.from('profiles').select('id').eq('role', 'ADMIN').limit(1).single();

  const fullCanvasData = {
    header: {
      founderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      tagline: 'HIGH-FREQUENCY DEEPTECH INTELLIGENCE FOR VENTURE OPERATORS',
      bannerBg: '#09090b',
    },
    metrics: [
      { id: 'm1', label: 'Founded', value: '2023', icon: 'calendar' },
      { id: 'm2', label: 'Valuation', value: '$2.5 Billion', subValue: '(Series B)', icon: 'unicorn' },
      { id: 'm3', label: 'Total Raised', value: '$340 Million', subValue: '(Verified)', icon: 'funding' },
      { id: 'm4', label: 'Headquarters', value: 'San Francisco', subValue: 'California', icon: 'building' },
    ],
    profile: {
      founderName: 'Dr. Elena Rostova',
      founderRole: 'Co-Founder & Chief Scientist',
      businessModelTitle: 'Core Technology Architecture & Unit Economics',
      businessModelPoints: [
        'Proprietary sub-nanometer lithography with 94% yield rate',
        'Direct-to-enterprise foundry contracts bypassing broker layer',
        '84% gross margins with predictable recurring subscription revenue',
      ],
    },
    calloutBoxes: [
      {
        id: 'b1',
        title: 'Capital Formation & Syndication',
        content: 'Led by Founders Fund with participation from Sequoia Capital and Lux Capital.',
        icon: 'trending',
        variant: 'green',
      },
      {
        id: 'b2',
        title: 'The Contrarian Moat',
        content: 'Building physical fabrication infrastructure instead of pure software wrapper.',
        icon: 'star',
        variant: 'blue',
      },
      {
        id: 'b3',
        title: 'Ecosystem Threat Matrix',
        content: 'Legacy incumbents face 18-month architectural lag to reach parity.',
        icon: 'lightbulb',
        variant: 'amber',
      },
    ],
  };

  const testSlug = `canvas-roundtrip-test-${Date.now()}`;
  const insertPayload = {
    title: 'Canvas Roundtrip Verification Brief',
    slug: testSlug,
    summary: 'A complete test summary verifying that all canvas blocks and attributes survive serialization.',
    body: 'Body text for canvas roundtrip validation test.',
    status: 'PUBLISHED',
    category_id: category!.id,
    author_id: adminUser!.id,
    canvas_data: fullCanvasData,
  };

  console.log('[1] Inserting article with complete Canvas Data block tree...');
  const { data: inserted, error: insertErr } = await supabase
    .from('articles')
    .insert(insertPayload)
    .select()
    .single();

  if (insertErr || !inserted) {
    console.error('[FAIL] Insert error:', insertErr?.message);
    process.exit(1);
  }

  console.log(`[2] Article created (id: ${inserted.id}). Fetching row back from database...`);
  const { data: fetched, error: fetchErr } = await supabase
    .from('articles')
    .select('*')
    .eq('id', inserted.id)
    .single();

  if (fetchErr || !fetched) {
    console.error('[FAIL] Fetch error:', fetchErr?.message);
    process.exit(1);
  }

  console.log('\n--- BEFORE SAVE (Input CanvasData) ---');
  console.log(JSON.stringify(fullCanvasData, null, 2));

  console.log('\n--- AFTER RELOAD (Persisted CanvasData from DB) ---');
  console.log(JSON.stringify(fetched.canvas_data, null, 2));

  function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => deepEqual(item, b[i]));
    }
    if (typeof a === 'object') {
      const aKeys = Object.keys(a).sort();
      const bKeys = Object.keys(b).sort();
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every(k => deepEqual(a[k], b[k]));
    }
    return false;
  }

  const isIdentical = deepEqual(fullCanvasData, fetched.canvas_data);

  console.log('\n--- VERIFICATION RESULT ---');
  console.log(`Deep semantic equality: ${isIdentical}`);
  console.log(`Header preserved: ${deepEqual(fetched.canvas_data?.header, fullCanvasData.header)}`);
  console.log(`Metrics count: ${fetched.canvas_data?.metrics?.length} (Expected 4)`);
  console.log(`Profile points: ${fetched.canvas_data?.profile?.businessModelPoints?.length} (Expected 3)`);
  console.log(`Callout boxes: ${fetched.canvas_data?.calloutBoxes?.length} (Expected 3)`);

  // Cleanup
  await supabase.from('articles').delete().eq('id', inserted.id);
  console.log('\n[Cleanup] Test article purged from database.');

  if (!isIdentical) {
    console.error('\n[FAIL] Canvas data corrupted during roundtrip.');
    process.exit(1);
  } else {
    console.log('\n====================================================');
    console.log('[SUCCESS] Canvas block data survives save/reload 100% intact.');
    console.log('====================================================\n');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
