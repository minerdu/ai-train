import { acceptedEnvelope } from '@/lib/apiEnvelope';
import { startTrainingTask } from '@/lib/trainingRuntimeStore';

export async function POST(_request, context) {
  const { task_id: taskId } = await context.params;
  const result = startTrainingTask(taskId);

  if (!result) {
    return Response.json(
      {
        meta: {
          request_id: `train_${Date.now()}`,
          server_time: new Date().toISOString(),
        },
        data: null,
        error: { message: '未找到训练任务' },
      },
      { status: 404 },
    );
  }

  if (result.blocked === 'pending_approval') {
    return Response.json(
      {
        meta: {
          request_id: `train_${Date.now()}`,
          server_time: new Date().toISOString(),
        },
        data: {
          task_id: taskId,
          status: result.task.status,
          approval_status: result.task.approvalStatus,
        },
        error: { message: '该培训任务仍在审批中，审批通过后才能执行。' },
      },
      { status: 409 },
    );
  }

  return acceptedEnvelope({
    task_id: taskId,
    status: result.task.status,
    run_ref: {
      run_id: result.run.run_id,
      status: result.run.status,
      stream_url: `/api/v1/training/agent-runs/${result.run.run_id}/stream`,
    },
  });
}
