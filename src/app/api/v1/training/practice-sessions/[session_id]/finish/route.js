import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(_request, context) {
  const { session_id: sessionId } = await context.params;

  return acceptedEnvelope({
    session_id: sessionId,
    status: 'scored',
    score: 78,
    passed: false,
    dimension_scores: {
      empathy: 86,
      value_clarity: 72,
      risk_boundary: 91,
      next_action: 66,
    },
    good_sentences: ['我理解您会比较价格，我们先不急着决定。'],
    bad_sentences: ['这个肯定会有效果。'],
    suggested_script: '先共情，再把护理目标、服务流程和下次观察点讲清楚，最后给轻量选择。',
    makeup_task_created: true,
  });
}
