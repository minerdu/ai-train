import { trainingTasks } from '@/lib/trainingData';

const stages = [
  { label: '盈利模型', count: 3 },
  { label: '30天落地', count: 6 },
  { label: '核心训练', count: 8 },
  { label: '补练复盘', count: 4 },
  { label: '实战陪跑', count: 7 },
  { label: '角色权限', count: 3 },
  { label: 'Skill发布', count: 2 },
  { label: '店长带教', count: 3 },
  { label: '运营信号', count: 5 },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('summary') === 'journey') {
    return Response.json({
      totalJourney: trainingTasks.length + 32,
      todayCount: trainingTasks.length,
      executedRate: 78,
      stages,
      lastScanAt: new Date().toISOString(),
    });
  }

  return Response.json({
    tasks: trainingTasks.map((task) => ({
      id: task.task_id,
      title: task.title,
      leadName: '新天地店员工',
      taskType: task.task_type,
      content: task.description,
      triggerReason: task.description,
      triggerSource: task.source_type,
      approvalStatus: task.status === 'completed' ? 'approved' : 'pending',
      executeStatus: task.status === 'completed' ? 'success' : 'scheduled',
      scheduledAt: new Date().toISOString(),
    })),
    stats: {
      pending: trainingTasks.filter((task) => task.status === 'pending').length,
      toExecute: trainingTasks.filter((task) => task.status === 'running').length,
      completed: trainingTasks.filter((task) => task.status === 'completed').length,
      rejected: trainingTasks.filter((task) => task.status === 'overdue').length,
      rejectRate: 20,
    },
  });
}

export async function PATCH() {
  return Response.json({ ok: true });
}

export async function POST() {
  return Response.json({ ok: true, task_id: `task_${Date.now()}` }, { status: 201 });
}
