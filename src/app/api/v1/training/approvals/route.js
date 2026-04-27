import { apiEnvelope } from '@/lib/apiEnvelope';
import { getApprovals } from '@/lib/trainingRuntimeStore';

export function GET() {
  return apiEnvelope({ approvals: getApprovals() });
}
