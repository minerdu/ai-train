import { acceptedEnvelope } from '@/lib/apiEnvelope';
import { approveTrainingApproval } from '@/lib/trainingRuntimeStore';

export async function POST(request, context) {
  const { approval_id: approvalId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const approval = approveTrainingApproval(approvalId, body.decision_note);

  if (!approval) {
    return Response.json(
      {
        meta: {
          request_id: `train_${Date.now()}`,
          server_time: new Date().toISOString(),
        },
        data: null,
        error: { message: '未找到审批记录' },
      },
      { status: 404 },
    );
  }

  return acceptedEnvelope({
    approval_id: approvalId,
    status: approval.status,
    decision_note: approval.decision_note,
    applied_at: approval.decidedAt,
  });
}
