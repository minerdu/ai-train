import { acceptedEnvelope } from '@/lib/apiEnvelope';
import { managerCards } from '@/lib/trainingData';

export function POST() {
  const runId = `run_report_${Date.now()}`;

  return acceptedEnvelope({
    report: {
      report_id: `report_${Date.now()}`,
      report_type: 'store_weekly',
      title: '新天地店本周训练汇报',
      summary_text: '本周训练完成率78%，咨询诊断、体验转卡和B档案补全仍是主要短板，建议安排实战陪跑、补练复盘和晨会示范。',
      metrics: managerCards,
      recommendations: managerCards.ai_recommendations,
    },
    run_ref: {
      run_id: runId,
      status: 'succeeded',
      stream_url: `/api/v1/training/agent-runs/${runId}/stream`,
    },
  });
}
