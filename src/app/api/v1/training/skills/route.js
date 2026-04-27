import { apiEnvelope } from '@/lib/apiEnvelope';
import { trainingSkills } from '@/lib/trainingData';

export function GET() {
  return apiEnvelope({ skills: trainingSkills });
}
