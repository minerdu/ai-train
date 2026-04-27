import { acceptedEnvelope } from '@/lib/apiEnvelope';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const runId = `run_plan_${Date.now()}`;

  return acceptedEnvelope({
    prompt: body.prompt || '按30天落地计划生成本周核心训练',
    plan_preview: {
      title: '30天门店落地实战训练计划',
      duration_days: 30,
      target_role: '员工/店长/总部',
      task_count: 42,
      passing_rules: { score: 80, required_scenarios: ['六大服务流程', '咨询诊断', '体验转卡', 'B档案补全'] },
    },
    run_ref: {
      run_id: runId,
      status: 'running',
      stream_url: `/api/v1/training/agent-runs/${runId}/stream`,
    },
  });
}
