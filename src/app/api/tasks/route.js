import {
  createManualTask,
  getJourneySummary,
  getTaskDashboard,
  startTrainingTask,
} from '@/lib/trainingRuntimeStore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('summary') === 'journey') {
    return Response.json(getJourneySummary());
  }

  return Response.json(getTaskDashboard());
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'start';
  const taskId = body.task_id || body.taskId || body.id;

  if (action === 'start' && taskId) {
    const result = startTrainingTask(taskId);
    if (!result) {
      return Response.json({ ok: false, message: '未找到训练任务' }, { status: 404 });
    }
    if (result.blocked === 'pending_approval') {
      return Response.json({ ok: false, message: '该培训任务仍在审批中，审批通过后才能执行。' }, { status: 409 });
    }
    return Response.json({ ok: true, task: result.task, run: result.run });
  }

  return Response.json({ ok: false, message: '不支持的任务动作' }, { status: 400 });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const task = createManualTask(body);
  return Response.json({ ok: true, task_id: task.task_id, task }, { status: 201 });
}
