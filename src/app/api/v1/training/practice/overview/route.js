import { apiEnvelope } from '@/lib/apiEnvelope';
import { getPracticeOverviewDTO } from '@/lib/trainingData';

export function GET() {
  return apiEnvelope(getPracticeOverviewDTO());
}
