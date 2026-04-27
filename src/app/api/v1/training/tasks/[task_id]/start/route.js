import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(_request, context) {
  const { task_id: taskId } = await context.params;

  return acceptedEnvelope({
    task_id: taskId,
    status: 'running',
    run_ref: {
      run_id: `run_task_${Date.now()}`,
      status: 'running',
      stream_url: `/api/v1/training/agent-runs/run_task_${Date.now()}/stream`,
    },
  });
}
