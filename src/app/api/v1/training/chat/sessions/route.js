import { apiEnvelope } from '@/lib/apiEnvelope';
import { chatMessages } from '@/lib/trainingData';

export function POST() {
  return apiEnvelope({
    session_id: `chat_${Date.now()}`,
    messages: chatMessages,
    context: {
      store_id: 'store_xintiandi',
      role: 'manager',
      active_skill_version_id: 'sv_onboarding_7d_101',
    },
  });
}
