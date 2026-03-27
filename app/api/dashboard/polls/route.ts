import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (
        id,
        poll_id,
        option_text,
        vote_count,
        percentage
      )
    `)
    .eq('active', true)
    .single();  // Latest active poll

  if (error || !polls) {
    console.error('Fetch polls error:', error);
    // Fallback demo poll data (remove once table seeded)
    return NextResponse.json({
      id: 'demo-1',
      question: 'What are you most excited about?',
      options: [
        { id: '1', option_text: 'BTC Analysis', vote_count: 816, percentage: 68 },
        { id: '2', option_text: 'ETH Staking', vote_count: 264, percentage: 22 },
        { id: '3', option_text: 'Altcoins', vote_count: 120, percentage: 10 }
      ],
      total_votes: 1200,
      ends_at: '2024-04-15T00:00:00Z'
    });
  }

  return NextResponse.json(polls);
}

