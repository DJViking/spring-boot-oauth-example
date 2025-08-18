import { NextRequest, NextResponse } from 'next/server';
import { getSpringBase } from '@/lib/springBase';

export async function GET(req: NextRequest) {
  const SPRING_BASE = getSpringBase();
  const res = await fetch(`${SPRING_BASE}/api/users/me`, {
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') ?? ''
    },
    redirect: 'manual',
  });

  if (res.status === 302 || res.status === 401) {
    return new NextResponse(null, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
