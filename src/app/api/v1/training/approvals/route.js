import { apiEnvelope } from '@/lib/apiEnvelope';
import { approvals } from '@/lib/trainingData';

export function GET() {
  return apiEnvelope({ approvals });
}
