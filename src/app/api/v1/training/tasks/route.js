import { apiEnvelope } from '@/lib/apiEnvelope';
import { trainingTasks } from '@/lib/trainingData';

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  const tasks = trainingTasks.filter((task) => {
    if (status && task.status !== status) return false;
    if (type && task.task_type !== type) return false;
    return true;
  });

  return apiEnvelope({ tasks });
}
