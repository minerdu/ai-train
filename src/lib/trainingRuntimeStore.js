import {
  abilityProfile,
  agentRuns,
  approvals as seedApprovals,
  getPracticeOverviewDTO,
  managerCards,
  practiceScenarios,
  trainingSkills,
  trainingTasks,
} from '@/lib/trainingData';

const HOUR_MS = 60 * 60 * 1000;
const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';
const ACTIVE_SCAN_INTERVAL_MS = HOUR_MS;
const OFF_HOURS_SCAN_INTERVAL_MS = 6 * HOUR_MS;

const globalForTrainingRuntime = globalThis;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getShanghaiHour(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHANGHAI_TIME_ZONE,
    hour: '2-digit',
    hour12: false,
  });
  return Number(formatter.format(date));
}

function isActiveScanHour(hour) {
  return hour >= 8 && hour < 22;
}

function hoursSince(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(value).getTime()) / HOUR_MS;
}

function dueLabel(minutes = 60) {
  const date = new Date(Date.now() + minutes * 60 * 1000);
  return date.toLocaleString('zh-CN', {
    timeZone: SHANGHAI_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSkillByVersion(versionId) {
  return trainingSkills.find((skill) => skill.version_id === versionId) || trainingSkills[0];
}

function getSkillForCommand(command = '') {
  if (/B档案|档案|361|老客|复购/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_customer_361_profile');
  if (/体验|办卡|转卡|卡项|品项/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_card_item_system');
  if (/手法|项目|肩颈|视频/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_project_hands');
  if (/店长|晨会|带教|审核/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_manager_coach');
  if (/总部|抽检|跨店|5A|证据/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_5a_experience');
  if (/流程|邀约|接待|咨询/.test(command)) return trainingSkills.find((skill) => skill.skill_id === 'skill_service_flow_6');
  return trainingSkills.find((skill) => skill.skill_id === 'skill_30day_store_landing') || trainingSkills[0];
}

function getNeedApproval(command = '') {
  return /总部|跨店|公开|排名|客户触达|触达客户|转AI运营|运营触达|群发|抽检|发布Skill|修改Skill|权限/.test(command);
}

function taskStatusFromRuntime(task) {
  if (task.executeStatus === 'success') return 'completed';
  if (task.executeStatus === 'running') return 'running';
  if (task.executeStatus === 'cancelled' || task.approvalStatus === 'rejected') return 'overdue';
  return task.status || 'pending';
}

function normalizeSeedTask(task) {
  const skill = getSkillByVersion(task.source_skill_version_id);
  return {
    ...clone(task),
    id: task.task_id,
    task_id: task.task_id,
    content: task.description,
    approvalStatus: task.status === 'completed' ? 'approved' : 'approved',
    executeStatus: task.status === 'completed' ? 'success' : task.status === 'running' ? 'running' : 'scheduled',
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'ai',
    reviewNotes: '种子训练任务，来自产品开发文档与TrainingSkill。',
    source_skill_name: skill?.skill_name || 'TrainingSkill',
    assigned_to: task.task_type === 'manager' ? '店长账号' : '新天地店员工',
  };
}

function normalizeSeedApproval(approval) {
  return {
    ...clone(approval),
    id: approval.approval_id,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    objectType: 'training',
    objectName: approval.title,
    sourceAgent: 'TrainingReviewAgent',
    impact: approval.impact_scope,
    recommendation: approval.recommended_decision,
  };
}

function initState() {
  return {
    tasks: trainingTasks.map(normalizeSeedTask),
    practiceScenarios: clone(practiceScenarios),
    approvals: seedApprovals.map(normalizeSeedApproval),
    agentRuns: clone(agentRuns).map((run) => ({
      ...run,
      id: run.run_id,
      steps: [
        '读取角色权限与培训计划',
        '匹配TrainingSkill版本',
        '生成任务、实战或审核动作',
        '完成红线与AI运营只读边界校验',
      ],
    })),
    auditLogs: [],
    lastAutonomousScanAt: null,
    scanStats: {
      scanCount: 0,
      generatedTasks: 0,
      generatedPractices: 0,
      pendingApprovals: 0,
      blocked: 0,
    },
    roleSnapshots: [
      {
        role: 'employee',
        owner: '陈雨',
        completionRate: 0.62,
        weakPoint: '手法与项目',
        skillVersionId: 'sv_project_hands_200',
        nextAction: '上传肩颈手法视频并完成店长复评',
      },
      {
        role: 'manager',
        owner: '林夏',
        completionRate: 0.78,
        weakPoint: '员工证据审核',
        skillVersionId: 'sv_manager_coach_200',
        nextAction: '审核6条员工证据并生成明早晨会带教',
      },
      {
        role: 'hq',
        owner: '培训总部',
        completionRate: 0.69,
        weakPoint: '徐家汇店B档案缺失',
        skillVersionId: 'sv_customer_361_profile_200',
        nextAction: '生成跨店抽检建议，保留审批',
      },
    ],
    opsSignals: [
      { key: 'trial_no_card', label: '新客体验后未办卡', severity: 'high', source: 'AI运营只读信号' },
      { key: 'b_profile_missing', label: 'B档案缺失', severity: 'medium', source: 'AI运营只读信号' },
      { key: 'old_customer_silent', label: '老客30/60天未到店', severity: 'medium', source: 'AI运营只读信号' },
    ],
  };
}

function getState() {
  if (!globalForTrainingRuntime.__aiTrainRuntime) {
    globalForTrainingRuntime.__aiTrainRuntime = initState();
  }
  return globalForTrainingRuntime.__aiTrainRuntime;
}

function createAgentRun({ agentType = 'TrainingPlannerAgent', triggerType = 'natural_language', skillVersionId, linkedObjectType = 'training_task', linkedObjectId = null, message }) {
  const state = getState();
  const runId = makeId('run_train');
  const run = {
    run_id: runId,
    id: runId,
    agent_type: agentType,
    trigger_type: triggerType,
    status: 'running',
    progress_percent: 8,
    current_message: message || 'TrainingAgent正在编排任务、实战与审批动作',
    source_skill_version_id: skillVersionId || trainingSkills[0].version_id,
    linked_object_type: linkedObjectType,
    linked_object_id: linkedObjectId,
    started_at: nowIso(),
    steps: [
      '读取员工/店长/总部角色状态',
      '匹配培训计划、TrainingSkill和AI运营只读信号',
      '生成任务、实战、审批与执行计划',
      '完成红线、安全规则和权限校验',
      '写入任务/实战队列并返回linkedObjects',
    ],
  };
  state.agentRuns.unshift(run);
  return run;
}

function buildTaskFromSpec(spec) {
  const state = getState();
  const taskId = makeId('task');
  const skill = getSkillByVersion(spec.skillVersionId) || getSkillForCommand(spec.title);
  const task = {
    task_id: taskId,
    id: taskId,
    title: spec.title,
    description: spec.description,
    content: spec.description,
    task_type: spec.taskType || 'practice',
    source_type: spec.sourceType || 'ai_generated',
    source_skill_version_id: skill.version_id,
    source_skill_name: skill.skill_name,
    source_agent_run_id: spec.runId,
    due_at: spec.dueAt || `今天 ${dueLabel(spec.delayMinutes || 90)}`,
    scheduledAt: spec.scheduledAt || new Date(Date.now() + (spec.delayMinutes || 90) * 60 * 1000).toISOString(),
    estimated_minutes: spec.estimatedMinutes || 12,
    priority: spec.priority || 'high',
    status: spec.status || 'pending',
    approvalStatus: spec.needApproval ? 'pending' : 'approved',
    executeStatus: spec.needApproval ? 'draft' : 'scheduled',
    completion_rule: spec.completionRule || '完成训练并提交证据或复盘结果',
    assigned_to: spec.assignedTo || '新天地店员工',
    reviewedBy: spec.needApproval ? 'human_required' : 'ai',
    reviewNotes: spec.needApproval ? '命中培训权限或AI运营边界，需人工确认。' : 'TrainingReviewAgent自动通过：标准培训任务。',
    createdAt: nowIso(),
    commandId: spec.commandId || null,
    linkedPracticeId: spec.linkedPracticeId || null,
  };
  state.tasks.unshift(task);
  return task;
}

function buildPracticeFromSpec(spec) {
  const state = getState();
  const scenarioId = makeId('scenario');
  const scenario = {
    scenario_id: scenarioId,
    scenario_name: spec.name,
    scenario_type: spec.type || 'field',
    difficulty_level: spec.difficulty || 'AI生成',
    customer_profile: { state: spec.state },
    must_cover_points: spec.points || ['判断', '话术', '风险边界'],
    forbidden_phrases: spec.forbidden || ['承诺一次见效', '越权触达客户'],
    score: spec.score || 0,
    source_agent_run_id: spec.runId,
    source_skill_version_id: spec.skillVersionId,
    created_at: nowIso(),
  };
  state.practiceScenarios.unshift(scenario);
  return scenario;
}

function createApprovalFromSpec(spec) {
  const state = getState();
  const approvalId = makeId('approval');
  const approval = {
    approval_id: approvalId,
    id: approvalId,
    approval_type: spec.type || 'training_guardrail',
    risk_level: spec.riskLevel || 'medium',
    status: 'pending',
    title: spec.title,
    impact_scope: spec.impact,
    recommended_decision: spec.recommendation || '建议人工确认后执行，保留审计记录。',
    source_agent_run_id: spec.runId,
    source_skill_version_id: spec.skillVersionId,
    linked_task_ids: spec.taskIds || [],
    linked_practice_ids: spec.practiceIds || [],
    createdAt: nowIso(),
    objectType: 'training',
    objectName: spec.title,
    sourceAgent: 'TrainingReviewAgent',
    impact: spec.impact,
    recommendation: spec.recommendation,
  };
  state.approvals.unshift(approval);
  state.scanStats.pendingApprovals += 1;
  return approval;
}

function audit(action, reason, metadata = {}) {
  getState().auditLogs.unshift({
    id: makeId('audit'),
    action,
    reason,
    metadata,
    createdAt: nowIso(),
  });
}

function buildCommandSpecs(command, run) {
  const skill = getSkillForCommand(command);
  const needApproval = getNeedApproval(command);
  const isOps = /AI运营|运营信号|B档案|体验|未办卡|老客|复购/.test(command);
  const isManager = /店长|晨会|审核|带教/.test(command);
  const isHq = /总部|跨店|抽检|Skill/.test(command);
  const isMakeup = /补练|低完成|低分|落后|未完成/.test(command);
  const targets = isHq
    ? ['新天地店', '徐家汇店', '虹桥店']
    : isManager
      ? ['店长林夏', '新天地店员工组']
      : ['陈雨', '王珊', '李婷', '周敏'];

  const taskSpecs = [];
  const practiceSpecs = [];

  if (isOps || /实战|陪跑/.test(command)) {
    practiceSpecs.push(
      {
        name: /B档案|档案/.test(command) ? 'AI生成：B档案缺失补全实战' : 'AI生成：体验后未办卡实战陪跑',
        type: 'field',
        difficulty: 'AI运营只读信号',
        state: /B档案|档案/.test(command)
          ? 'AI运营只读信号显示顾客偏好、预算或到店计划字段缺失，需要训练员工自然补问。'
          : 'AI运营只读信号显示体验满意但未办卡，需要训练价值复盘、轻选择和风险边界。',
        points: /B档案|档案/.test(command) ? ['偏好', '预算', '到店计划', '隐私边界'] : ['确认体验', '价值复盘', '轻选择', '风险边界'],
        skillVersionId: skill.version_id,
        runId: run.run_id,
      },
    );
  }

  if (isManager) {
    taskSpecs.push({
      title: 'AI生成：店长晨会带教与员工复盘',
      description: '根据本店员工完成率、证据待审核和AI运营只读信号，生成明早10分钟晨会主题、示范话术和员工练习作业。',
      taskType: 'manager',
      assignedTo: '店长账号',
      skillVersionId: 'sv_manager_coach_200',
      runId: run.run_id,
      needApproval,
      completionRule: '确认晨会稿并完成员工复盘安排',
    });
  } else if (isHq) {
    taskSpecs.push({
      title: 'AI生成：总部跨店培训抽检建议',
      description: '按Skill版本、门店完成率和证据质量生成总部抽检计划。该任务只生成管理建议，不代替员工或店长完成训练。',
      taskType: 'group',
      assignedTo: '总部账号',
      skillVersionId: skill.version_id,
      runId: run.run_id,
      needApproval: true,
      completionRule: '总部确认抽检范围、证据标准和回滚策略',
    });
  } else {
    taskSpecs.push({
      title: isMakeup ? 'AI生成：低完成率员工补练任务' : 'AI生成：核心训练与实战陪跑任务',
      description: isMakeup
        ? '根据员工完成率、能力画像和培训计划，生成针对咨询诊断、手法项目或顾客经营361的补练任务。'
        : '根据培训计划和TrainingSkill生成核心训练、实战陪跑、证据提交和复盘要求。',
      taskType: isMakeup ? 'makeup' : 'practice',
      assignedTo: '新天地店员工',
      skillVersionId: skill.version_id,
      runId: run.run_id,
      needApproval,
      completionRule: isMakeup ? '完成补练并达到80分，必要时提交证据' : '完成AI陪练或实战复盘并提交结果',
    });
  }

  if (practiceSpecs.length > 0) {
    taskSpecs.push({
      title: `AI生成：${practiceSpecs[0].name.replace('AI生成：', '')}`,
      description: practiceSpecs[0].state,
      taskType: 'real_action',
      sourceType: 'ops_signal',
      assignedTo: isManager ? '店长账号' : '新天地店员工',
      skillVersionId: skill.version_id,
      runId: run.run_id,
      needApproval,
      completionRule: '进入实战Tab完成场景演练、禁用话术检查和复盘',
    });
  }

  return { skill, targets, needApproval, taskSpecs, practiceSpecs };
}

export function handleTrainingCommand(command, context = {}) {
  const commandId = makeId('cmd');
  const skill = getSkillForCommand(command);
  const run = createAgentRun({
    agentType: 'TrainingCommandAgent',
    triggerType: 'natural_language',
    skillVersionId: skill.version_id,
    message: `正在处理自然语言培训指令：${command}`,
  });
  const { targets, needApproval, taskSpecs, practiceSpecs } = buildCommandSpecs(command, run);
  const practices = practiceSpecs.map((spec) => buildPracticeFromSpec(spec));
  const tasks = taskSpecs.map((spec, index) => buildTaskFromSpec({
    ...spec,
    commandId,
    linkedPracticeId: practices[index]?.scenario_id || practices[0]?.scenario_id || null,
  }));

  let approval = null;
  if (needApproval) {
    approval = createApprovalFromSpec({
      title: 'AI培训高风险动作审批',
      impact: '涉及总部/跨店/公开排名/客户触达或AI运营边界，需要人工确认后执行。',
      recommendation: '建议只保留培训任务和复盘建议；如需客户触达，转AI运营系统审批。',
      riskLevel: /客户触达|转AI运营|运营触达/.test(command) ? 'high' : 'medium',
      runId: run.run_id,
      skillVersionId: skill.version_id,
      taskIds: tasks.map((task) => task.task_id),
      practiceIds: practices.map((practice) => practice.scenario_id),
    });
  }

  audit('ai_command', command, {
    commandId,
    runId: run.run_id,
    taskIds: tasks.map((task) => task.task_id),
    practiceIds: practices.map((practice) => practice.scenario_id),
    approvalId: approval?.approval_id || null,
    context,
  });

  run.status = needApproval ? 'waiting_approval' : 'succeeded';
  run.progress_percent = needApproval ? 88 : 100;
  run.current_message = needApproval ? '已生成培训动作，等待权限/红线审批。' : '已生成培训任务与实战动作，并写入对应Tab。';

  return {
    success: true,
    type: 'workflow',
    command: {
      id: commandId,
      input: command,
      intent: command,
      status: needApproval ? 'pending_approval' : 'completed',
      resultType: 'workflow',
      resultSummary: needApproval
        ? '已生成培训任务/实战动作，涉及权限或AI运营边界，已提交审批。'
        : '已生成培训任务/实战动作，并同步到任务与实战Tab。',
      createdAt: nowIso(),
      linkedObjects: [
        ...tasks.map((task) => ({ type: 'task', id: task.task_id, name: task.title, href: '/tasks' })),
        ...practices.map((practice) => ({ type: 'practice', id: practice.scenario_id, name: practice.scenario_name, href: '/practice' })),
        ...(approval ? [{ type: 'approval', id: approval.approval_id, name: approval.title, href: '/approvals' }] : []),
      ],
      execution: {
        targetCount: targets.length,
        tasksCreated: tasks.length,
        practicesCreated: practices.length,
        pendingManual: approval ? 1 : 0,
        targetNames: targets,
      },
      context,
    },
    plan: {
      intent: command,
      filterDesc: '角色权限 · 培训计划 · TrainingSkill · AI运营只读信号 · 当前完成情况',
      actionTitle: needApproval ? '培训动作编排（待审批）' : '培训动作编排（已写入队列）',
      actionContent: '已生成可追踪的任务、实战、审批和AgentRun记录；任务Tab与实战Tab将读取同一运行态数据。',
      needApproval,
      linkedRunId: run.run_id,
    },
    execution: {
      targetCount: targets.length,
      targetNames: targets,
      targetLeadNames: targets,
      tasksCreated: tasks.length,
      practicesCreated: practices.length,
      autoApproved: needApproval ? 0 : tasks.length,
      pendingManual: approval ? 1 : 0,
      tasks: tasks.map((task) => ({
        id: task.task_id,
        title: task.title,
        status: task.approvalStatus === 'pending' ? '待审批' : '已排期',
      })),
      practices: practices.map((practice) => ({
        id: practice.scenario_id,
        title: practice.scenario_name,
      })),
    },
    linkedObjects: [
      ...tasks.map((task) => ({ type: 'task', id: task.task_id, name: task.title, href: '/tasks' })),
      ...practices.map((practice) => ({ type: 'practice', id: practice.scenario_id, name: practice.scenario_name, href: '/practice' })),
      ...(approval ? [{ type: 'approval', id: approval.approval_id, name: approval.title, href: '/approvals' }] : []),
    ],
    summary: needApproval
      ? `已生成 ${tasks.length} 条训练任务和 ${practices.length} 个实战场景，因涉及权限/AI运营边界已提交审批。`
      : `已生成 ${tasks.length} 条训练任务和 ${practices.length} 个实战场景，并同步到任务与实战Tab。`,
    context,
  };
}

export function listRuntimeTasks(filters = {}) {
  const state = getState();
  return state.tasks
    .map((task) => ({ ...task, status: taskStatusFromRuntime(task) }))
    .filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.type && task.task_type !== filters.type) return false;
      return true;
    });
}

export function getTaskDashboard() {
  const tasks = listRuntimeTasks();
  const pending = tasks.filter((task) => task.status === 'pending').length;
  const running = tasks.filter((task) => task.status === 'running').length;
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const overdue = tasks.filter((task) => task.status === 'overdue').length;
  const manualTotal = tasks.filter((task) => task.source_type === 'manual_command').length;
  const rejectedManual = tasks.filter((task) => task.source_type === 'manual_command' && task.approvalStatus === 'rejected').length;

  return {
    tasks,
    skills: trainingSkills,
    manager_cards: {
      ...managerCards,
      weak_scenarios: Array.from(new Set([
        ...managerCards.weak_scenarios,
        ...getState().opsSignals.map((signal) => signal.label),
      ])).slice(0, 5),
    },
    stats: {
      pending,
      toExecute: running,
      completed,
      rejected: overdue,
      rejectRate: manualTotal > 0 ? Math.round((rejectedManual / manualTotal) * 100) : Math.round((overdue / Math.max(tasks.length, 1)) * 100),
    },
  };
}

export function createManualTask(payload = {}) {
  const run = createAgentRun({
    agentType: 'TrainingManualTaskAgent',
    triggerType: payload.triggerSource || 'manual',
    skillVersionId: payload.skillVersionId || 'sv_30day_store_landing_200',
    message: '正在创建人工培训任务',
  });
  return buildTaskFromSpec({
    title: payload.title || '培训跟进任务',
    description: payload.content || payload.description || '人工创建培训任务',
    taskType: payload.taskType || 'practice',
    sourceType: payload.triggerSource || 'manual',
    skillVersionId: payload.skillVersionId || 'sv_30day_store_landing_200',
    runId: run.run_id,
    needApproval: payload.needApproval !== false,
    assignedTo: payload.leadName || payload.assignedTo || '新天地店员工',
    scheduledAt: payload.scheduledAt || null,
  });
}

export function getPracticeOverview() {
  const dto = getPracticeOverviewDTO();
  return {
    ...dto,
    scenarios: getState().practiceScenarios,
    today_practice: listRuntimeTasks().filter((task) => ['practice', 'makeup', 'real_action'].includes(task.task_type)),
    ability_profile: abilityProfile,
  };
}

export function getApprovals() {
  return getState().approvals;
}

export function approveTrainingApproval(approvalId, decisionNote = '') {
  const state = getState();
  const approval = state.approvals.find((item) => item.approval_id === approvalId || item.id === approvalId);
  if (!approval) return null;

  approval.status = 'approved';
  approval.decidedAt = nowIso();
  approval.decision_note = decisionNote || '同意执行，保留审计记录。';

  const linkedIds = new Set(approval.linked_task_ids || []);
  state.tasks.forEach((task) => {
    if (linkedIds.has(task.task_id)) {
      task.approvalStatus = 'approved';
      task.executeStatus = 'scheduled';
      task.status = 'pending';
      task.reviewedBy = 'human';
      task.reviewNotes = approval.decision_note;
      if (!task.scheduledAt) task.scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    }
  });

  audit('approval_approved', approval.title, { approvalId });
  return approval;
}

export function startTrainingTask(taskId) {
  const state = getState();
  const task = state.tasks.find((item) => item.task_id === taskId || item.id === taskId);
  if (!task) return null;
  if (task.approvalStatus === 'pending') {
    return { task, run: null, blocked: 'pending_approval' };
  }

  task.executeStatus = 'running';
  task.status = 'running';
  task.startedAt = nowIso();
  const run = createAgentRun({
    agentType: 'TrainingExecutionAgent',
    triggerType: 'task_start',
    skillVersionId: task.source_skill_version_id,
    linkedObjectType: 'training_task',
    linkedObjectId: task.task_id,
    message: `正在执行：${task.title}`,
  });
  task.source_agent_run_id = run.run_id;
  audit('task_started', task.title, { taskId: task.task_id, runId: run.run_id });
  return { task, run };
}

export function getAgentRun(runId) {
  return getState().agentRuns.find((run) => run.run_id === runId || run.id === runId) || null;
}

function hasRecentTask(title, hours = 20) {
  return getState().tasks.some((task) => task.title === title && hoursSince(task.createdAt) < hours);
}

export function shouldRunAutonomousScan(now = new Date()) {
  const state = getState();
  const last = state.lastAutonomousScanAt ? new Date(state.lastAutonomousScanAt) : null;
  if (!last) return true;
  const hour = getShanghaiHour(now);
  const interval = isActiveScanHour(hour) ? ACTIVE_SCAN_INTERVAL_MS : OFF_HOURS_SCAN_INTERVAL_MS;
  return now.getTime() - last.getTime() >= interval;
}

export function runAutonomousTrainingEngine({ force = false } = {}) {
  const state = getState();
  if (!force && !shouldRunAutonomousScan()) {
    return {
      status: 'idle',
      scanned: false,
      nextRule: '8:00-22:00每小时扫描，其他时间每6小时扫描',
      lastScanAt: state.lastAutonomousScanAt,
      ...state.scanStats,
    };
  }

  const run = createAgentRun({
    agentType: 'AutonomousTrainingEngine',
    triggerType: 'scheduled_scan',
    skillVersionId: 'sv_30day_store_landing_200',
    message: '正在扫描角色状态、培训计划、执行进度与AI运营只读信号',
  });
  const createdTasks = [];
  const createdPractices = [];
  const approvals = [];

  for (const snapshot of state.roleSnapshots) {
    if (snapshot.completionRate < 0.75) {
      const title = `自主引擎：${snapshot.owner}${snapshot.weakPoint}补练`;
      if (!hasRecentTask(title)) {
        createdTasks.push(buildTaskFromSpec({
          title,
          description: `系统扫描发现${snapshot.owner}当前完成率${Math.round(snapshot.completionRate * 100)}%，弱项为${snapshot.weakPoint}。结合培训计划自动生成补练任务：${snapshot.nextAction}。`,
          taskType: snapshot.role === 'hq' ? 'group' : 'makeup',
          sourceType: 'autonomous_engine',
          assignedTo: snapshot.role === 'hq' ? '总部账号' : snapshot.role === 'manager' ? '店长账号' : '员工账号',
          skillVersionId: snapshot.skillVersionId,
          runId: run.run_id,
          needApproval: snapshot.role === 'hq',
          completionRule: '完成补练/抽检并回传训练结果',
          delayMinutes: 30,
        }));
      }
    }
  }

  for (const signal of state.opsSignals) {
    const title = signal.key === 'b_profile_missing'
      ? '自主引擎：B档案缺失实战陪跑'
      : signal.key === 'trial_no_card'
        ? '自主引擎：体验后未办卡实战陪跑'
        : '自主引擎：老客沉默复盘实战';
    if (hasRecentTask(title)) continue;
    const skill = signal.key === 'b_profile_missing'
      ? trainingSkills.find((item) => item.skill_id === 'skill_customer_361_profile')
      : trainingSkills.find((item) => item.skill_id === 'skill_card_item_system');
    const practice = buildPracticeFromSpec({
      name: title.replace('自主引擎：', ''),
      type: 'field',
      difficulty: signal.source,
      state: `${signal.source}显示${signal.label}，培训系统只生成训练和复盘动作，不直接触达客户。`,
      points: signal.key === 'b_profile_missing' ? ['偏好', '需求', '预算', '隐私边界'] : ['体验复盘', '价值表达', '轻选择', '风险边界'],
      skillVersionId: skill.version_id,
      runId: run.run_id,
    });
    createdPractices.push(practice);
    createdTasks.push(buildTaskFromSpec({
      title,
      description: `${signal.source}触发：${signal.label}。请进入实战Tab完成陪跑、风险话术检查和店长复盘。`,
      taskType: 'real_action',
      sourceType: 'autonomous_engine',
      assignedTo: '新天地店员工',
      skillVersionId: skill.version_id,
      runId: run.run_id,
      linkedPracticeId: practice.scenario_id,
      needApproval: false,
      completionRule: '完成AI实战陪跑并提交复盘',
      delayMinutes: 45,
    }));
  }

  const hqTasks = createdTasks.filter((task) => task.approvalStatus === 'pending');
  if (hqTasks.length > 0) {
    approvals.push(createApprovalFromSpec({
      title: '自主培训引擎总部抽检审批',
      impact: `${hqTasks.length}条总部/跨店训练管理动作需确认，避免越权查看或代替门店完成训练。`,
      recommendation: '建议总部确认抽检范围，只发布任务与证据标准，不直接处理员工训练结果。',
      riskLevel: 'medium',
      runId: run.run_id,
      skillVersionId: 'sv_5a_experience_200',
      taskIds: hqTasks.map((task) => task.task_id),
      practiceIds: [],
    }));
  }

  state.lastAutonomousScanAt = nowIso();
  state.scanStats.scanCount += 1;
  state.scanStats.generatedTasks += createdTasks.length;
  state.scanStats.generatedPractices += createdPractices.length;
  state.scanStats.pendingApprovals += approvals.length;
  run.status = approvals.length > 0 ? 'waiting_approval' : 'succeeded';
  run.progress_percent = 100;
  run.current_message = `扫描完成：生成${createdTasks.length}条任务、${createdPractices.length}个实战场景。`;
  audit('autonomous_scan', 'AI自主培训引擎完成扫描', {
    runId: run.run_id,
    taskIds: createdTasks.map((task) => task.task_id),
    practiceIds: createdPractices.map((practice) => practice.scenario_id),
    approvalIds: approvals.map((approval) => approval.approval_id),
  });

  return {
    status: createdTasks.length || createdPractices.length || approvals.length ? 'success' : 'idle',
    scanned: true,
    runId: run.run_id,
    tasksCreated: createdTasks.length,
    practicesCreated: createdPractices.length,
    approvalsCreated: approvals.length,
    coverageRate: `${Math.min(9, createdTasks.length + createdPractices.length)}/9`,
    lastScanAt: state.lastAutonomousScanAt,
    scanRule: '8:00-22:00每小时扫描一次，其他时间每6小时扫描一次',
  };
}

export function getJourneySummary() {
  const state = getState();
  const tasks = listRuntimeTasks();
  const stageLabels = ['盈利模型', '30天落地', '核心训练', '补练复盘', '实战陪跑', '角色权限', 'Skill发布', '店长带教', '运营信号'];
  const stages = stageLabels.map((label) => ({
    key: label,
    label,
    count: tasks.filter((task) => `${task.title} ${task.description} ${task.source_skill_name}`.includes(label)).length,
  }));
  return {
    totalJourney: tasks.filter((task) => ['ai_generated', 'ops_signal', 'autonomous_engine', 'manual_command'].includes(task.source_type)).length,
    todayCount: tasks.filter((task) => hoursSince(task.createdAt) < 24).length,
    executedRate: tasks.length > 0 ? Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100) : 0,
    stages,
    lastScanAt: state.lastAutonomousScanAt,
    scanRule: '8:00-22:00每小时扫描一次，其他时间每6小时扫描一次',
  };
}

export function runExecutionEngine() {
  const state = getState();
  const now = Date.now();
  const ready = state.tasks.filter((task) => (
    task.approvalStatus === 'approved' &&
    task.executeStatus === 'scheduled' &&
    task.scheduledAt &&
    new Date(task.scheduledAt).getTime() <= now &&
    ['ai_generated', 'ops_signal', 'autonomous_engine', 'manual_command', 'manual'].includes(task.source_type)
  ));

  ready.forEach((task) => {
    task.executeStatus = 'running';
    task.status = 'running';
    task.startedAt = nowIso();
    audit('task_prompted', task.title, { taskId: task.task_id });
  });

  return {
    status: ready.length > 0 ? 'success' : 'idle',
    executed: ready.length,
    failed: 0,
    skipped: 0,
    logs: { executedIds: ready.map((task) => task.task_id), failedIds: [], skippedIds: [] },
  };
}

const trainingRuntimeStore = {
  getState,
  handleTrainingCommand,
  listRuntimeTasks,
  getTaskDashboard,
  createManualTask,
  getPracticeOverview,
  getApprovals,
  approveTrainingApproval,
  startTrainingTask,
  getAgentRun,
  runAutonomousTrainingEngine,
  getJourneySummary,
  runExecutionEngine,
};

export default trainingRuntimeStore;
