export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const command = body.command || '按AI运营信号给本店生成本周实战训练';
  const needsApproval = /群|公开|排名|客户|触达|运营|总部|跨店|抽检/.test(command);
  const isRoleCommand = /角色|权限|员工|店长|总部/.test(command);

  return Response.json({
    success: true,
    type: 'workflow',
    summary: needsApproval
      ? '已生成V3实战训练工作流，并将AI运营触达、公开排名或跨店动作提交审批。'
      : '已生成核心训练、实战陪跑和补练复盘任务，并排入今日培训队列。',
    plan: {
      intent: command,
      filterDesc: isRoleCommand
        ? '当前账号角色 · 培训阶段 · 完成概览 · 下一步重点'
        : '新天地店 · 30天落地计划 · V3 Skill · AI运营只读信号',
      actionTitle: isRoleCommand ? '角色培训工作台编排' : '实战训练任务编排',
      actionContent: isRoleCommand
        ? '读取当前账号可见角色，生成培训阶段、完成概览、能力短板、管理责任和AI建议。'
        : '读取门店盈利模型、30天落地计划和AI运营只读信号，生成核心训练、实战陪跑、证据审核和补练建议。',
      needApproval: needsApproval,
    },
    execution: {
      targetCount: isRoleCommand ? 3 : 8,
      targetNames: isRoleCommand ? ['员工视图', '店长视图', '总部视图'] : ['陈雨', '王珊', '李婷', '周敏', '赵宁'],
      targetLeadNames: isRoleCommand ? ['员工视图', '店长视图', '总部视图'] : ['陈雨', '王珊', '李婷', '周敏', '赵宁'],
      tasksCreated: needsApproval ? 4 : 8,
    },
  });
}
