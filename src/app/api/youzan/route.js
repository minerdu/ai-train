import { NextResponse } from 'next/server';

const ACCESS_CONFIG = {
  appId: 'ai-ops-readonly-training',
  shopId: 'fanwenhua-training',
  syncEnabled: true,
  syncInterval: 'daily',
  lastSyncAt: '2026-04-27 08:30:00',
  hasSecret: true,
};

export async function GET() {
  return NextResponse.json(ACCESS_CONFIG);
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'AI-OPS-APP 只读连接正常，培训系统不会写回运营数据',
  });
}

export async function PUT(request) {
  await request.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'AI运营系统只读接入配置已保存',
  });
}
