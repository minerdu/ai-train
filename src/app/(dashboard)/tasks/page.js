'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/basePath';
import styles from './page.module.css';

const tabs = [
  { key: 'pending', label: '待完成' },
  { key: 'running', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已逾期' },
];

const taskTypeLabels = {
  knowledge: '知识学习',
  practice: 'AI陪练',
  real_action: '实战陪跑',
  group: '群组教学',
  makeup: '补练任务',
  manager: '店长带教',
};

const sourceLabels = {
  training_plan: '训练计划',
  ai_generated: 'AI生成',
  group_tutor: '群组教学',
  ops_signal: '运营信号',
  autonomous_engine: '自主引擎',
  manual: '人工创建',
  manual_command: '人工指令',
};

const EMPTY_DASHBOARD = {
  tasks: [],
  skills: [],
  manager_cards: { weak_scenarios: [] },
  stats: {
    pending: 0,
    toExecute: 0,
    completed: 0,
    rejected: 0,
    rejectRate: 0,
  },
};

async function parseJsonResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error?.message || fallbackMessage);
  }
  return data;
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyTaskId, setBusyTaskId] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await parseJsonResponse(await apiFetch('/api/tasks'), '加载培训任务失败');
      setDashboard({
        ...EMPTY_DASHBOARD,
        ...data,
        manager_cards: {
          ...EMPTY_DASHBOARD.manager_cards,
          ...(data.manager_cards || {}),
        },
        stats: {
          ...EMPTY_DASHBOARD.stats,
          ...(data.stats || {}),
        },
      });
    } catch (error) {
      setLoadError(error.message || '加载培训任务失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasks = useMemo(() => dashboard.tasks || [], [dashboard.tasks]);
  const skills = useMemo(() => dashboard.skills || [], [dashboard.skills]);
  const stats = dashboard.stats || EMPTY_DASHBOARD.stats;

  const filteredTasks = useMemo(() => {
    if (activeTab === 'running') return tasks.filter((task) => task.status === 'running');
    if (activeTab === 'completed') return tasks.filter((task) => task.status === 'completed');
    if (activeTab === 'overdue') return tasks.filter((task) => task.status === 'overdue');
    return tasks.filter((task) => task.status === 'pending');
  }, [activeTab, tasks]);

  const toggleTask = (id) => {
    setSelectedTaskIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startTask = async (task) => {
    const taskId = task.task_id || task.id;
    setBusyTaskId(taskId);
    setLoadError('');
    try {
      await parseJsonResponse(
        await apiFetch(`/api/v1/training/tasks/${taskId}/start`, { method: 'POST' }),
        '启动培训任务失败',
      );
      await loadTasks();
      if (selectedTask?.task_id === taskId) setSelectedTask(null);
    } catch (error) {
      setLoadError(error.message || '启动培训任务失败');
    } finally {
      setBusyTaskId('');
    }
  };

  const askAi = async (task) => {
    const taskId = task.task_id || task.id;
    setBusyTaskId(taskId);
    setLoadError('');
    try {
      await parseJsonResponse(
        await apiFetch('/api/ai-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: `围绕「${task.title}」生成补练或实战复盘任务`,
            current_tab: 'tasks',
          }),
        }),
        'AI生成补练失败',
      );
      await loadTasks();
    } catch (error) {
      setLoadError(error.message || 'AI生成补练失败');
    } finally {
      setBusyTaskId('');
    }
  };

  return (
    <div className={styles.tasksPage}>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>待完成</span>
        </div>
        <div className={`${styles.statCard} ${styles.statExecute}`}>
          <span className={styles.statValue}>{stats.toExecute}</span>
          <span className={styles.statLabel}>进行中</span>
        </div>
        <div className={`${styles.statCard} ${styles.statDone}`}>
          <span className={styles.statValue}>{stats.completed}</span>
          <span className={styles.statLabel}>已完成</span>
        </div>
        <div className={`${styles.statCard} ${styles.statReject}`}>
          <span className={styles.statValue}>{stats.rejectRate}%</span>
          <span className={styles.statLabel}>逾期率</span>
        </div>
      </div>

      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
            disabled={isBatchMode}
          >
            {tab.label}
            {tab.key === 'pending' && stats.pending > 0 ? <span className={styles.tabBadge}>{stats.pending}</span> : null}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {activeTab === 'pending' ? (
          <button
            className={styles.tab}
            style={{ marginLeft: 16, background: isBatchMode ? 'var(--color-bg-page)' : 'transparent' }}
            onClick={() => {
              setIsBatchMode((current) => !current);
              setSelectedTaskIds(new Set());
            }}
          >
            {isBatchMode ? '退出批量' : '批量催办'}
          </button>
        ) : null}
      </div>

      {loadError ? (
        <div className={styles.emptyState} style={{ marginBottom: 12 }}>
          <p>{loadError}</p>
        </div>
      ) : null}

      <div className={styles.taskList}>
        <section className={styles.optimizationPanel}>
          <div className={styles.optimizationPanelHead}>
            <div>
              <strong className={styles.optimizationPanelTitle}>AI训练建议已进入当前任务队列</strong>
              <p className={styles.optimizationPanelDesc}>
                今日任务绑定 V3 Skill、30天落地计划、AI运营只读信号与角色权限，支持核心训练、实战陪跑、补练和店长带教。
              </p>
            </div>
          </div>
          <div className={styles.optimizationSummaryRow}>
            {(dashboard.manager_cards?.weak_scenarios || []).map((scenario) => (
              <span key={scenario} className={styles.optimizationSummaryChip}>
                <span>⚡ {scenario}</span>
                <strong>补练</strong>
              </span>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className={styles.emptyState}>
            <p>正在同步AI培训任务队列...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✅</span>
            <p>暂无{tabs.find((tab) => tab.key === activeTab)?.label}任务</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            const taskId = task.task_id || task.id;
            const skill = skills.find((item) => item.version_id === task.source_skill_version_id);
            return (
              <div
                key={taskId}
                className={`${styles.taskCard} animate-fadeInUp ${selectedTaskIds.has(taskId) ? styles.selectedTask : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => {
                  if (isBatchMode) toggleTask(taskId);
                  else setSelectedTask(task);
                }}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitleRow}>
                    {isBatchMode ? (
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(taskId)}
                        readOnly
                        style={{ marginRight: 12, transform: 'scale(1.2)' }}
                      />
                    ) : null}
                    <span className={styles.taskAvatar}>{taskTypeLabels[task.task_type]?.slice(0, 2) || '训'}</span>
                    <div className={styles.taskTitleInfo}>
                      <h3 className={styles.taskTitle}>{task.title}</h3>
                      <span className={styles.taskMeta}>
                        {sourceLabels[task.source_type] || 'AI培训'} · {taskTypeLabels[task.task_type] || task.task_type}
                      </span>
                      <div className={styles.originTagRow}>
                        <span className={styles.originBadge} style={{ color: '#2563eb', background: '#eff6ff' }}>
                          来自 {task.source_skill_name || skill?.skill_name || 'TrainingSkill'}
                        </span>
                        <span className={styles.originBadge} style={{ color: '#059669', background: '#ecfdf5' }}>
                          {task.source_agent_run_id || 'TrainingAgent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.status === 'pending' ? <span className={styles.statusBadgePending}>待完成</span> : null}
                  {task.status === 'running' ? <span className={styles.statusBadgeScheduled}>进行中</span> : null}
                  {task.status === 'completed' ? <span className={styles.statusBadgeSuccess}>已完成</span> : null}
                  {task.status === 'overdue' ? <span className={styles.statusBadgeRejected}>已逾期</span> : null}
                </div>

                <div className={styles.aiReason}>
                  <span className={styles.aiReasonIcon}>🤖</span>
                  <div className={styles.aiReasonBody}>
                    <p className={styles.aiReasonText}>{task.description}</p>
                  </div>
                </div>

                <div className={styles.messagePreview}>
                  <p>完成规则：{task.completion_rule}。预计 {task.estimated_minutes} 分钟，截止 {task.due_at}。</p>
                </div>

                <div className={styles.taskFooter}>
                  <span className={styles.taskTime}>⏰ {task.due_at}</span>
                  <span className={styles.taskCustomer}>📤 分配给 {task.assigned_to || '新天地补鲜站员工'}</span>
                </div>

                <div className={styles.taskActions} onClick={(event) => event.stopPropagation()}>
                  <button
                    className={styles.btnApprove}
                    onClick={() => startTask(task)}
                    disabled={busyTaskId === taskId || task.approvalStatus === 'pending'}
                    title={task.approvalStatus === 'pending' ? '审批通过后可执行' : '开始任务'}
                  >
                    {busyTaskId === taskId ? '处理中' : task.approvalStatus === 'pending' ? '待审批' : '开始任务'}
                  </button>
                  <button className={styles.btnEditApprove} onClick={() => askAi(task)} disabled={busyTaskId === taskId}>问AI</button>
                  <button className={styles.btnReject}>稍后提醒</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTask ? (
        <div className={styles.drawerOverlay} onClick={() => setSelectedTask(null)}>
          <div className={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>培训任务详情</h3>
              <button className={styles.drawerClose} onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            <div className={styles.drawerBody}>
              <div className={styles.drawerSection}>
                <label className={styles.drawerLabel}>任务</label>
                <div className={styles.drawerCustomer}>
                  <span className={styles.drawerAvatar}>{taskTypeLabels[selectedTask.task_type]?.slice(0, 2) || '训'}</span>
                  <span>{selectedTask.title}</span>
                </div>
              </div>
              <div className={styles.drawerSection}>
                <label className={styles.drawerLabel}>🤖 AI生成说明</label>
                <div className={styles.drawerAiBox}>
                  <p>{selectedTask.description}</p>
                  <span className={styles.drawerAiMeta}>
                    {sourceLabels[selectedTask.source_type] || 'AI培训'} · {selectedTask.source_agent_run_id || 'TrainingAgent'}
                  </span>
                </div>
              </div>
              <div className={styles.drawerSection}>
                <label className={styles.drawerLabel}>完成规则</label>
                <div className={styles.drawerInfo}>{selectedTask.completion_rule}</div>
              </div>
            </div>
            <div className={styles.drawerActions}>
              <button
                className={styles.drawerBtnPrimary}
                onClick={() => startTask(selectedTask)}
                disabled={busyTaskId === (selectedTask.task_id || selectedTask.id) || selectedTask.approvalStatus === 'pending'}
              >
                {selectedTask.approvalStatus === 'pending' ? '等待审批' : '开始任务'}
              </button>
              <button className={styles.drawerBtnDanger} onClick={() => askAi(selectedTask)}>生成补练</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
