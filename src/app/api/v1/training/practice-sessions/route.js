import { acceptedEnvelope } from '@/lib/apiEnvelope';
import { practiceScenarios } from '@/lib/trainingData';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const scenario = practiceScenarios.find((item) => item.scenario_id === body.scenario_id) || practiceScenarios[0];

  return acceptedEnvelope({
    session: {
      session_id: `ps_${Date.now()}`,
      scenario_id: scenario.scenario_id,
      user_id: 'user_chen_yu',
      status: 'running',
      score: null,
    },
    ai_customer: scenario.customer_profile,
  });
}
