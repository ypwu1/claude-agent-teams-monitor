import { NextResponse } from 'next/server';
import { getDebugLogFiles, readDebugLog } from '@/lib/parsers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    const log = readDebugLog(sessionId);
    return NextResponse.json(log);
  }

  const logFiles = getDebugLogFiles();
  return NextResponse.json(logFiles);
}
