import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(_request, context) {
  const { skill_id: skillId } = await context.params;
  const runId = `run_adapt_${Date.now()}`;

  return acceptedEnvelope({
    skill_id: skillId,
    run_ref: {
      run_id: runId,
      status: 'running',
      stream_url: `/api/v1/training/agent-runs/${runId}/stream`,
    },
  });
}
