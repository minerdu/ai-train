import { apiEnvelope } from '@/lib/apiEnvelope';
import { getTaskDashboard, listRuntimeTasks } from '@/lib/trainingRuntimeStore';

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const dashboard = getTaskDashboard();

  return apiEnvelope({
    ...dashboard,
    tasks: listRuntimeTasks({ status, type }),
  });
}
