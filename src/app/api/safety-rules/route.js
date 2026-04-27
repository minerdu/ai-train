import { NextResponse } from 'next/server';

const RULES = {
  stop_keywords: [
    { id: 'stop-1', value: '不用学了', isActive: true },
    { id: 'stop-2', value: '暂停训练', isActive: true },
    { id: 'stop-3', value: '先不练了', isActive: true },
  ],
  financial_keywords: [
    { id: 'effect-1', value: '一次见效', isActive: true },
    { id: 'effect-2', value: '保证治好', isActive: true },
    { id: 'effect-3', value: '永久改善', isActive: true },
    { id: 'effect-4', value: '公开排名', isActive: true },
  ],
  journey_blocks: [
    { id: 'block-1', value: '员工休息时间不主动催练', isActive: true },
    { id: 'block-2', value: '未@AI时不插入普通聊天', isActive: true },
    { id: 'block-3', value: 'AI运营客户触达必须转审批', isActive: true },
  ],
  daily_limit: { id: 'limit-1', value: '80', isActive: true },
};

export async function GET() {
  return NextResponse.json(RULES);
}

export async function POST(request) {
  await request.json().catch(() => ({}));
  return NextResponse.json({ success: true, message: '培训安全规则已添加' });
}

export async function PUT(request) {
  await request.json().catch(() => ({}));
  return NextResponse.json({ success: true, message: '培训安全规则已更新' });
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: '培训安全规则已删除' });
}
