import { apiEnvelope } from '@/lib/apiEnvelope';
import { getPracticeOverview } from '@/lib/trainingRuntimeStore';

export function GET() {
  return apiEnvelope(getPracticeOverview());
}
