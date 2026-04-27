import { handleTrainingCommand } from '@/lib/trainingRuntimeStore';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const command = String(body.command || '').trim();

  if (!command) {
    return Response.json(
      {
        success: false,
        type: 'error',
        message: '请输入培训指令。',
      },
      { status: 400 },
    );
  }

  const context = {
    currentTab: body.current_tab || body.currentTab || 'ai-training',
    role: body.role || 'manager',
    workspaceId: body.workspace_id || body.workspaceId || 'train_demo',
  };

  return Response.json(handleTrainingCommand(command, context));
}
