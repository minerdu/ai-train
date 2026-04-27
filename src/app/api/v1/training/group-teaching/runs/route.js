import { acceptedEnvelope } from '@/lib/apiEnvelope';

export function POST() {
  return acceptedEnvelope({
    group_teaching_run: {
      run_id: `group_${Date.now()}`,
      group_connector_id: 'wecom_xintiandi_staff',
      status: 'active',
      schedule: {
        publish_at: '09:30',
        remind_at: '16:00',
      },
    },
  });
}
