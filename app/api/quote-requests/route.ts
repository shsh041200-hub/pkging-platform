import { NextResponse } from 'next/server';

// PACAA-466: 견적 의뢰 기능 폐지. Packlinx 는 정보제공 디렉토리이며 거래·견적 의뢰를 직접 중개하지 않는다.
// 410 Gone — stale 클라이언트가 이 엔드포인트를 호출해도 서버는 거부한다.
export async function POST() {
  return NextResponse.json(
    { error: 'Quote request feature has been discontinued. Packlinx is an information directory only.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: 'Gone' }, { status: 410 });
}
