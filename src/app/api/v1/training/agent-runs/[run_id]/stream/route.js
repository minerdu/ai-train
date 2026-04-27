export async function GET(_request, context) {
  const { run_id: runId } = await context.params;
  const encoder = new TextEncoder();
  const steps = [
    { event: 'training.agent.run.created', progress: 5, message: '已创建TrainingAgentRun' },
    { event: 'training.agent.run.progress', progress: 32, message: '正在检查权限和门店数据范围' },
    { event: 'training.agent.run.progress', progress: 58, message: '正在匹配TrainingSkill和SkillVersion' },
    { event: 'training.agent.run.progress', progress: 84, message: '正在生成任务卡片并校验Guardrail' },
    { event: 'training.agent.run.succeeded', progress: 100, message: '运行完成' },
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
