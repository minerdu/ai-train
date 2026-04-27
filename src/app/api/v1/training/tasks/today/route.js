import { apiEnvelope } from '@/lib/apiEnvelope';
import { getTaskPageDTO } from '@/lib/trainingData';

export function GET() {
  return apiEnvelope(getTaskPageDTO());
}
