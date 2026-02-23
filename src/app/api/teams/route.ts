import { NextResponse } from 'next/server';
import { getAllTeamsWithDetails } from '@/lib/parsers';

export async function GET() {
  const teams = getAllTeamsWithDetails();
  return NextResponse.json(teams);
}
