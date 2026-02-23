import { NextResponse } from 'next/server';
import { parseStatsCache } from '@/lib/parsers';

export async function GET() {
  const stats = parseStatsCache();
  return NextResponse.json(stats);
}
