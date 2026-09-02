import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: pubArts, error: artErr } = await supabase
    .from('articles')
    .select('id')
    .eq('status', 'PUBLISHED')
    .limit(1);

  console.log('pubArts:', pubArts, 'artErr:', artErr);

  if (!pubArts || pubArts.length === 0) return;

  const { data: inserted, error } = await supabase
    .from('comments')
    .insert({
      article_id: pubArts[0].id,
      entity_id: pubArts[0].id,
      entity_type: 'ARTICLE',
      user_name: 'Test Reader',
      user_email: 'test.reader@domain.com',
      body: 'Test comment',
      status: 'PENDING',
    })
    .select()
    .single();

  console.log('inserted:', inserted, 'error:', error);

  if (inserted?.id) {
    await supabase.from('comments').delete().eq('id', inserted.id);
  }
}

main().catch(console.error);
