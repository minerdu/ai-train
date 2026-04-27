import prisma from '@/lib/prisma';

const SHANGHAI_TIME_ZONE = 'Asia/Shanghai';
const HOUR_MS = 60 * 60 * 1000;
const ACTIVE_SCAN_INTERVAL_MS = HOUR_MS;
const OFF_HOURS_SCAN_INTERVAL_MS = 6 * HOUR_MS;
const DEFAULT_DAILY_LIMIT = 120;
const RECENT_TASK_LOOKBACK_DAYS = 45;

function pad(value) {
  return String(value).padStart(2, '0');
}

function getShanghaiParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHANGHAI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getShanghaiDayRange(date = new Date()) {
  const parts = getShanghaiParts(date);
  return {
    start: new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T00:00:00+08:00`),
    end: new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T23:59:59.999+08:00`),
  };
}

function getShanghaiHourStart(date = new Date()) {
  const parts = getShanghaiParts(date);
  return new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:00:00+08:00`);
}

function getShanghaiBusinessStart(date = new Date(), hour = 8) {
  const parts = getShanghaiParts(date);
  return new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(hour)}:00:00+08:00`);
}

function isActiveScanHour(hour) {
  return hour >= 8 && hour < 22;
}

function hoursSince(date) {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }
  return (Date.now() - new Date(date).getTime()) / HOUR_MS;
}

function daysSince(date) {
  return hoursSince(date) / 24;
}

function getLookbackStart(days) {
  return new Date(Date.now() - days * 24 * HOUR_MS);
}

function hasOpenTask(tasks) {
  return tasks.some((task) => (
    task.approvalStatus === 'pending' ||
    task.executeStatus === 'draft' ||
    task.executeStatus === 'scheduled'
  ));
}

function hasRecentAnyTask(tasks, hours) {
  return tasks.some((task) => hoursSince(task.createdAt) < hours);
}

function getLastJourneyTask(tasks, label) {
  return tasks
    .filter((task) => task.triggerSource === 'journey' && (task.triggerReason || '').includes(label))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
}

function getJourneyLabelFromReason(reason = '') {
  return JOURNEY_DEFINITIONS.find((item) => reason.includes(item.label))?.label || null;
}

function isRecognizedJourneyTask(task) {
  return Boolean(getJourneyLabelFromReason(task?.triggerReason || ''));
}

function hasTag(lead, keyword) {
  return lead.tags?.some((item) => item.tag?.name?.includes(keyword));
}

function buildScheduledAt(delayMinutes) {
  const now = new Date();
  const parts = getShanghaiParts(now);

  if (parts.hour < 9) {
    return new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T09:${pad(Math.min(delayMinutes, 50))}:00+08:00`);
  }

  if (parts.hour >= 21) {
    const nextDay = new Date(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T09:00:00+08:00`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    nextDay.setUTCMinutes(nextDay.getUTCMinutes() + delayMinutes);
    return nextDay;
  }

  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

async function loadDailyLimit() {
  try {
    const rule = await prisma.safetyRule.findFirst({
      where: {
        ruleType: 'daily_limit',
        isActive: true,
      },
      select: {
        value: true,
      },
    });

    const value = Number(rule?.value);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  } catch (error) {
    console.warn('[FranchiseJourneyEngine] Failed to load daily limit:', error.message);
  }

  return DEFAULT_DAILY_LIMIT;
}

async function shouldRunScheduledScan() {
  const lastScan = await prisma.auditLog.findFirst({
    where: {
      entityType: 'journey_engine',
      entityId: 'fran-hourly-scan',
      action: 'scan_success',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!lastScan) {
    return true;
  }

  const now = new Date();
  const nowParts = getShanghaiParts(now);
  const lastScanAt = new Date(lastScan.createdAt);

  if (!isActiveScanHour(nowParts.hour)) {
    return now.getTime() - lastScanAt.getTime() >= OFF_HOURS_SCAN_INTERVAL_MS;
  }

  const currentHourStart = getShanghaiHourStart(now);
  if (lastScanAt < currentHourStart) {
    return true;
  }

  const businessStart = getShanghaiBusinessStart(now, 8);
  if (lastScanAt < businessStart && now >= businessStart) {
    return true;
  }

  return now.getTime() - lastScanAt.getTime() >= ACTIVE_SCAN_INTERVAL_MS;
}

const JOURNEY_DEFINITIONS = [
  {
    key: 'first_contact',
    label: '线索首联',
    title: '新线索首联触达',
    priority: 95,
    cooldownHours: 72,
    minGapHours: 24,
    maxCreatePerScan: 10,
    scheduleDelayMinutes: 6,
    match(lead) {
      return ['new', 'pool'].includes(lead.lifecycleStatus) &&
        lead.intentScore < 3.2 &&
        lead.silentDays <= 2;
    },
    score(lead) {
      return Math.max(0, 3.2 - lead.intentScore) * 12 + Math.max(0, 3 - lead.silentDays);
    },
    content(lead) {
      return `${lead.name}您好，我是品牌总部招商顾问。看到您提交了加盟咨询，先和您打个招呼。您方便告诉我计划开店的城市和大概时间吗？我可以先帮您判断适合的合作模型。`;
    },
    reason(lead) {
      return `旅程自动招商·线索首联｜${lead.name} 刚进入线索池，需要完成首轮低压力触达。`;
    },
  },
  {
    key: 'intent_confirm',
    label: '意向确认',
    title: '加盟意向确认跟进',
    priority: 90,
    cooldownHours: 72,
    minGapHours: 24,
    maxCreatePerScan: 10,
    scheduleDelayMinutes: 10,
    match(lead) {
      return ['pool', 'qualified'].includes(lead.lifecycleStatus) &&
        lead.intentScore >= 2.5 &&
        lead.intentScore < 3.8 &&
        lead.silentDays >= 1 &&
        lead.silentDays <= 5;
    },
    score(lead) {
      return lead.intentScore * 18 + Math.max(0, 6 - lead.silentDays);
    },
    content(lead) {
      return `${lead.name}您好，想继续确认下您当前的开店规划。您更关注区域机会、投资预算，还是总部赋能支持？我先根据您的重点方向给您匹配更合适的加盟方案。`;
    },
    reason(lead) {
      return `旅程自动招商·意向确认｜${lead.name} 已进入需求摸排阶段，需要补齐决策信息。`;
    },
  },
  {
    key: 'invite_event',
    label: '邀约到会',
    title: '招商会邀约推进',
    priority: 86,
    cooldownHours: 96,
    minGapHours: 24,
    maxCreatePerScan: 8,
    scheduleDelayMinutes: 14,
    match(lead, context) {
      return lead.lifecycleStatus === 'qualified' &&
        lead.intentScore >= 3.8 &&
        lead.silentDays <= 4 &&
        context.daysSinceLastInteraction <= 7;
    },
    score(lead) {
      return lead.intentScore * 20 + lead.valueScore * 10;
    },
    content(lead) {
      return `${lead.name}您好，我们本周有一场总部小范围招商说明会，会重点讲清楚选址模型、单店模型和开业支持。如果您方便，我可以先帮您预留一个席位。`;
    },
    reason(lead) {
      return `旅程自动招商·邀约到会｜${lead.name} 意向升温，适合进入说明会邀约阶段。`;
    },
  },
  {
    key: 'hq_visit',
    label: '总部考察',
    title: '总部考察推进',
    priority: 82,
    cooldownHours: 120,
    minGapHours: 48,
    maxCreatePerScan: 6,
    scheduleDelayMinutes: 18,
    match(lead, context) {
      return ['qualified', 'negotiating'].includes(lead.lifecycleStatus) &&
        lead.intentScore >= 4.2 &&
        lead.valueScore >= 3.5 &&
        lead.silentDays >= 2 &&
        lead.silentDays <= 7 &&
        context.daysSinceLastInteraction <= 10;
    },
    score(lead) {
      return lead.intentScore * 20 + lead.valueScore * 12;
    },
    content(lead) {
      return `${lead.name}您好，按照您目前的加盟进度，建议下一步直接安排一次总部考察。您来一趟能把品牌模型、培训体系和选址支持都看完整，判断会更快。我可以先帮您协调档期。`;
    },
    reason(lead) {
      return `旅程自动招商·总部考察｜${lead.name} 已进入深度评估阶段，适合推进总部考察。`;
    },
  },
  {
    key: 'sign_push',
    label: '签约催签',
    title: '签约催签跟进',
    priority: 78,
    cooldownHours: 96,
    minGapHours: 48,
    maxCreatePerScan: 6,
    scheduleDelayMinutes: 20,
    match(lead) {
      return lead.lifecycleStatus === 'negotiating' &&
        lead.intentScore >= 4.5 &&
        lead.orderCount >= 2 &&
        lead.silentDays >= 2 &&
        lead.silentDays <= 7;
    },
    score(lead) {
      return lead.intentScore * 22 + lead.orderCount * 6;
    },
    content(lead) {
      return `${lead.name}您好，您目前已经进入签约推进阶段。为了不耽误区域机会和开店节奏，建议这周把签约确认事项逐项敲定，我这边可以先帮您把流程和资料清单整理好。`;
    },
    reason(lead) {
      return `旅程自动招商·签约催签｜${lead.name} 已接近成交窗口，需要推进签约确认。`;
    },
  },
  {
    key: 'sign_care',
    label: '签约关怀',
    title: '签约后加盟关怀',
    priority: 72,
    cooldownHours: 168,
    minGapHours: 72,
    maxCreatePerScan: 6,
    scheduleDelayMinutes: 26,
    match(lead) {
      return lead.lifecycleStatus === 'signed' &&
        lead.silentDays >= 3 &&
        lead.silentDays <= 10;
    },
    score(lead) {
      return lead.valueScore * 16 + Math.max(0, 10 - lead.silentDays);
    },
    content(lead) {
      return `${lead.name}您好，签约后这段时间总部会重点跟进培训、选址和开业筹备。您如果最近内部在排计划，我可以先把总部配合节奏和关键节点发您，方便您同步团队。`;
    },
    reason(lead) {
      return `旅程自动招商·签约关怀｜${lead.name} 已签约，需进入签后稳定关怀节奏。`;
    },
  },
  {
    key: 'franchise_upgrade',
    label: '加盟升级',
    title: '加盟升级与二店机会推进',
    priority: 68,
    cooldownHours: 336,
    minGapHours: 120,
    maxCreatePerScan: 4,
    scheduleDelayMinutes: 30,
    match(lead, context) {
      return lead.lifecycleStatus === 'signed' &&
        (lead.valueScore >= 4.2 || lead.totalSpent >= 1 || hasTag(lead, '区域')) &&
        context.daysSinceLastInteraction >= 14 &&
        context.daysSinceLastInteraction <= 60;
    },
    score(lead) {
      return lead.valueScore * 18 + lead.totalSpent * 5 + lead.orderCount * 4;
    },
    content(lead) {
      return `${lead.name}您好，结合您目前门店推进情况和区域潜力，总部这边建议可以提前评估升级或二店布局机会。如果您愿意，我可以先帮您做一版区域拓展建议供您内部参考。`;
    },
    reason(lead) {
      return `旅程自动招商·加盟升级｜${lead.name} 已具备升级或扩店潜力，适合阶段性经营。`;
    },
  },
  {
    key: 'followup',
    label: '跟进提醒',
    title: '关键线索跟进提醒',
    priority: 64,
    cooldownHours: 96,
    minGapHours: 24,
    maxCreatePerScan: 12,
    scheduleDelayMinutes: 12,
    match(lead) {
      return ['qualified', 'negotiating'].includes(lead.lifecycleStatus) &&
        lead.intentScore >= 3 &&
        lead.silentDays >= 4 &&
        lead.silentDays < 14;
    },
    score(lead) {
      return lead.intentScore * 16 + lead.silentDays;
    },
    content(lead) {
      return `${lead.name}您好，前几天和您沟通的加盟方案我这边还给您留着。如果您还在内部评估，我可以按您的城市和预算，把关键差异点再帮您梳理一遍。`;
    },
    reason(lead) {
      return `旅程自动招商·跟进提醒｜${lead.name} 短期沉默但仍有招商价值，需要低频继续推进。`;
    },
  },
  {
    key: 'reactivate',
    label: '沉默激活',
    title: '沉默线索重新激活',
    priority: 58,
    cooldownHours: 120,
    minGapHours: 48,
    maxCreatePerScan: 8,
    scheduleDelayMinutes: 16,
    match(lead) {
      return lead.lifecycleStatus !== 'signed' &&
        lead.lifecycleStatus !== 'rejected' &&
        lead.silentDays >= 14;
    },
    score(lead) {
      return lead.silentDays + lead.valueScore * 10;
    },
    content(lead) {
      return `${lead.name}您好，好久没有和您联系了。总部最近整理了一批同城加盟案例和最新区域机会信息，如果您还在关注这个项目，我可以先发您一版简明资料做参考。`;
    },
    reason(lead) {
      return `旅程自动招商·沉默激活｜${lead.name} 已沉默较久，按低频唤醒节奏重新激活。`;
    },
  },
];

function buildLeadContext(lead, recentTasks) {
  const lastInteractionAt = lead.lastInteractionAt ? new Date(lead.lastInteractionAt) : null;
  const lastOrderAt = lead.lastOrderAt ? new Date(lead.lastOrderAt) : null;

  return {
    recentTasks,
    hasOpenTask: hasOpenTask(recentTasks),
    daysSinceLastInteraction: daysSince(lastInteractionAt),
    daysSinceLastOrder: daysSince(lastOrderAt),
  };
}

function buildJourneyCandidate(lead, definition, context) {
  const lastSameJourneyTask = getLastJourneyTask(context.recentTasks, definition.label);
  if (lastSameJourneyTask && hoursSince(lastSameJourneyTask.createdAt) < definition.cooldownHours) {
    return null;
  }

  if (context.hasOpenTask || hasRecentAnyTask(context.recentTasks, definition.minGapHours)) {
    return null;
  }

  if (!definition.match(lead, context)) {
    return null;
  }

  return {
    lead,
    definition,
    score: definition.score(lead, context),
  };
}

async function loadLeadTaskMap(leadIds) {
  const recentTasks = await prisma.task.findMany({
    where: {
      customerId: {
        in: leadIds,
      },
      OR: [
        {
          createdAt: {
            gte: getLookbackStart(RECENT_TASK_LOOKBACK_DAYS),
          },
        },
        {
          approvalStatus: 'pending',
        },
        {
          executeStatus: {
            in: ['draft', 'scheduled'],
          },
        },
      ],
    },
    select: {
      id: true,
      customerId: true,
      createdAt: true,
      approvalStatus: true,
      executeStatus: true,
      triggerSource: true,
      triggerReason: true,
    },
  });

  return recentTasks.reduce((map, task) => {
    if (!map.has(task.customerId)) {
      map.set(task.customerId, []);
    }
    map.get(task.customerId).push(task);
    return map;
  }, new Map());
}

export async function generateJourneyTasks() {
  const shouldRun = await shouldRunScheduledScan();
  if (!shouldRun) {
    return { scanned: false, tasksCreated: 0, journeyCoverage: {}, coverageRate: '0/9' };
  }

  const leads = await prisma.customer.findMany({
    where: {
      isGroup: false,
      lifecycleStatus: {
        not: 'rejected',
      },
      wechatId: {
        not: null,
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (leads.length === 0) {
    return { scanned: true, tasksCreated: 0, journeyCoverage: {}, coverageRate: '0/9' };
  }

  const leadTaskMap = await loadLeadTaskMap(leads.map((lead) => lead.id));
  const { start: dayStart, end: dayEnd } = getShanghaiDayRange();
  const dailyLimit = await loadDailyLimit();
  const createdToday = await prisma.task.count({
    where: {
      triggerSource: 'journey',
      createdAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  const journeyCoverage = Object.fromEntries(JOURNEY_DEFINITIONS.map((item) => [item.key, 0]));
  const candidates = [];

  for (const lead of leads) {
    const recentTasks = leadTaskMap.get(lead.id) || [];
    const context = buildLeadContext(lead, recentTasks);
    const candidate = JOURNEY_DEFINITIONS
      .map((definition) => buildJourneyCandidate(lead, definition, context))
      .find(Boolean);

    if (candidate) {
      candidates.push(candidate);
    }
  }

  candidates.sort((a, b) => {
    if (b.definition.priority !== a.definition.priority) {
      return b.definition.priority - a.definition.priority;
    }
    return b.score - a.score;
  });

  const createdTaskIds = [];
  let totalCreated = createdToday;

  for (const candidate of candidates) {
    if (totalCreated >= dailyLimit) {
      break;
    }

    if (journeyCoverage[candidate.definition.key] >= candidate.definition.maxCreatePerScan) {
      continue;
    }

    const task = await prisma.task.create({
      data: {
        customerId: candidate.lead.id,
        title: candidate.definition.title,
        taskType: 'text',
        content: candidate.definition.content(candidate.lead),
        triggerSource: 'journey',
        triggerReason: candidate.definition.reason(candidate.lead),
        approvalStatus: 'approved',
        executeStatus: 'scheduled',
        scheduledAt: buildScheduledAt(candidate.definition.scheduleDelayMinutes),
        reviewedBy: 'ai',
        reviewNotes: 'AI自主招商引擎按旅程规则自动通过',
      },
    });

    createdTaskIds.push(task.id);
    journeyCoverage[candidate.definition.key] += 1;
    totalCreated += 1;
  }

  const coverageCount = Object.values(journeyCoverage).filter((count) => count > 0).length;

  await prisma.auditLog.create({
    data: {
      entityType: 'journey_engine',
      entityId: 'fran-hourly-scan',
      action: 'scan_success',
      operator: 'system',
      reason: `完成招商旅程扫描，生成 ${createdTaskIds.length} 条任务`,
      metadata: JSON.stringify({
        scannedLeads: leads.length,
        createdTaskIds,
        journeyCoverage,
        dailyLimit,
      }),
    },
  });

  return {
    scanned: true,
    tasksCreated: createdTaskIds.length,
    journeyCoverage,
    coverageRate: `${coverageCount}/9`,
  };
}

export async function getJourneySummary() {
  const journeyTasks = await prisma.task.findMany({
    where: {
      triggerSource: 'journey',
    },
    select: {
      triggerReason: true,
      executeStatus: true,
      scheduledAt: true,
      createdAt: true,
    },
  });

  const { start, end } = getShanghaiDayRange();
  const stageCounts = Object.fromEntries(JOURNEY_DEFINITIONS.map((item) => [item.label, 0]));
  const recognizedJourneyTasks = journeyTasks.filter(isRecognizedJourneyTask);
  const legacyJourneyCount = Math.max(0, journeyTasks.length - recognizedJourneyTasks.length);

  for (const task of recognizedJourneyTasks) {
    const label = getJourneyLabelFromReason(task.triggerReason);
    if (label) {
      stageCounts[label] += 1;
    }
  }

  const lastScan = await prisma.auditLog.findFirst({
    where: {
      entityType: 'journey_engine',
      entityId: 'fran-hourly-scan',
      action: 'scan_success',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    totalJourney: recognizedJourneyTasks.length,
    todayCount: recognizedJourneyTasks.filter((task) => {
      const current = new Date(task.scheduledAt || task.createdAt);
      return current >= start && current <= end;
    }).length,
    executedRate: recognizedJourneyTasks.length > 0
      ? Math.round((recognizedJourneyTasks.filter((task) => task.executeStatus === 'success').length / recognizedJourneyTasks.length) * 100)
      : 0,
    stages: JOURNEY_DEFINITIONS.map((item) => ({
      key: item.key,
      label: item.label,
      count: stageCounts[item.label] || 0,
    })),
    legacyJourneyCount,
    lastScanAt: lastScan?.createdAt?.toISOString() || null,
  };
}
