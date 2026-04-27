import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(_request, context) {
  const { skill_id: skillId } = await context.params;

  return acceptedEnvelope({
    skill_id: skillId,
    install_id: `install_${Date.now()}`,
    status: 'installed',
    active_version_id: 'sv_onboarding_7d_101',
  });
}
