import { NextResponse } from 'next/server';
import { getTeamWithDetails } from '@/lib/parsers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const team = getTeamWithDetails(name);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  return NextResponse.json(team);
}
