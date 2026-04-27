import { getAgentRun } from '@/lib/trainingRuntimeStore';

export async function GET(_request, context) {
  const { run_id: runId } = await context.params;
  const encoder = new TextEncoder();
  const run = getAgentRun(runId);

  if (!run) {
    return Response.json({ error: '未找到AgentRun' }, { status: 404 });
  }

  const stepMessages = Array.isArray(run.steps) && run.steps.length > 0
    ? run.steps
    : ['读取角色状态', '匹配TrainingSkill', '生成训练动作', '完成权限校验'];
  const steps = [
    { event: 'training.agent.run.created', progress: 5, message: '已创建TrainingAgentRun' },
    ...stepMessages.map((message, index) => ({
      event: 'training.agent.run.progress',
      progress: Math.min(90, 18 + index * Math.floor(70 / Math.max(stepMessages.length, 1))),
      message,
    })),
    {
      event: run.status === 'waiting_approval' ? 'training.agent.run.waiting_approval' : 'training.agent.run.succeeded',
      progress: run.progress_percent || 100,
      message: run.current_message || '运行完成',
    },
  ];

  const stream = new ReadableStream({
    start(controller) {
      steps.forEach((step) => {
        controller.enqueue(
          encoder.encode(`event: ${step.event}\ndata: ${JSON.stringify({ run_id: runId, ...step })}\n\n`),
        );
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
