import { acceptedEnvelope } from '@/lib/apiEnvelope';
import { createFieldGuidance } from '@/lib/trainingData';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const guidance = createFieldGuidance(body);

  return acceptedEnvelope({
    guidance,
    run_ref: {
      run_id: `run_field_${Date.now()}`,
      status: 'succeeded',
      stream_url: `/api/v1/training/agent-runs/run_field_${Date.now()}/stream`,
    },
  });
}
