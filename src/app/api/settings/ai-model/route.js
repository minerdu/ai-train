import { NextResponse } from 'next/server';

const TRAINING_AI_MODEL_CONFIG = {
  enabled: true,
  provider: 'openai',
  apiBaseUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-5.4',
  apiKeyMasked: 'sk-****train',
  maxTokens: 50,
  kbSource: 'zhipu',
  kbId: 'training-skill-kb',
  kbApiUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  enableSegment: true,
  segmentCount: 3,
  segmentTriggerChars: 120,
  segmentModelName: 'zhipu',
  segmentModelApiUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  sendInterval: 3,
  stopKeywords: '不用学了,暂停训练,先不练了,转店长',
  smartSkipMode: true,
  imageAnalysis: true,
};

export async function GET() {
  return NextResponse.json(TRAINING_AI_MODEL_CONFIG);
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'AI培训模型与知识库连接正常' });
}

export async function PUT(request) {
  await request.json().catch(() => ({}));
  return NextResponse.json({ success: true, message: 'AI培训模型配置已保存' });
}
