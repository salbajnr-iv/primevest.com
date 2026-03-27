import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types/wallet';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { search } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    .neq('id', user.id)
    .limit(10);

  if (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }

  const users: User[] = profiles?.map((p) => ({
    id: p.id,
    name: p.full_name || (p.email ? p.email.split('@')[0] : 'User'),
    email: p.email ?? '',
    avatar: p.avatar_url ? p.avatar_url.slice(-2).toUpperCase() : '??'
  })) || [];

  return NextResponse.json(users);
}
