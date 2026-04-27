import { apiEnvelope } from '@/lib/apiEnvelope';

export async function POST(request, context) {
  const { session_id: sessionId } = await context.params;
  const body = await request.json().catch(() => ({}));

  return apiEnvelope({
    session_id: sessionId,
    user_message: body.content || '',
    ai_customer_message: '我主要是担心做了以后没有明显变化，而且价格也比我预期高。',
    live_score: {
      empathy: 82,
      value_clarity: 74,
      risk_boundary: 91,
      next_action: 68,
    },
  });
}
