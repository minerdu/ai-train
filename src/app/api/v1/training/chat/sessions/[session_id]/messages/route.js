import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(request, context) {
  const { session_id: sessionId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const runId = `run_chat_${Date.now()}`;

  return acceptedEnvelope({
    session_id: sessionId,
    message: {
      message_id: `msg_${Date.now()}`,
      role: 'assistant',
      content: '已创建AI培训AgentRun，正在匹配TrainingSkill并生成结构化卡片。',
      cards: [
        {
          card_id: `card_${Date.now()}`,
          card_type: 'agent_run',
          title: 'Training Orchestrator',
          payload: {
            user_input: body.content || '',
            run_id: runId,
          },
        },
      ],
    },
    run_ref: {
      run_id: runId,
      status: 'running',
      stream_url: `/api/v1/training/agent-runs/${runId}/stream`,
    },
  });
}
