import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(_request, context) {
  const { guidance_id: guidanceId } = await context.params;

  return acceptedEnvelope({
    guidance_id: guidanceId,
    ops_handoff_request: {
      request_id: `ops_handoff_${Date.now()}`,
      status: 'pending_approval',
      policy: 'AI培训只能发起请求，不能直接触达客户。',
    },
  });
}
