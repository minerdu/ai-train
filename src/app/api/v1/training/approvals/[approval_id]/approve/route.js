import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(request, context) {
  const { approval_id: approvalId } = await context.params;
  const body = await request.json().catch(() => ({}));

  return acceptedEnvelope({
    approval_id: approvalId,
    status: 'approved',
    decision_note: body.decision_note || '同意执行，保留审计记录。',
    applied_at: new Date().toISOString(),
  });
}
