'use client';

import { useMemo, useState } from 'react';
import { trainingSkills, trainingTasks, taskSummary, managerCards } from '@/lib/trainingData';
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
};

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  const stats = {
    pending: trainingTasks.filter((task) => task.status === 'pending').length,
    toExecute: trainingTasks.filter((task) => task.status === 'running').length,
    completed: taskSummary.completed_count,
    rejected: taskSummary.overdue_count,
    rejectRate: Math.round((taskSummary.overdue_count / Math.max(taskSummary.today_task_count, 1)) * 100),
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === 'running') return trainingTasks.filter((task) => task.status === 'running');
    if (activeTab === 'completed') return trainingTasks.filter((task) => task.status === 'completed');
    if (activeTab === 'overdue') return trainingTasks.filter((task) => task.status === 'overdue');
    return trainingTasks.filter((task) => task.status === 'pending');
  }, [activeTab]);

  const toggleTask = (id) => {
    setSelectedTaskIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
            {managerCards.weak_scenarios.map((scenario) => (
              <span key={scenario} className={styles.optimizationSummaryChip}>
                <span>⚡ {scenario}</span>
                <strong>补练</strong>
              </span>
            ))}
          </div>
        </section>

        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✅</span>
            <p>暂无{tabs.find((tab) => tab.key === activeTab)?.label}任务</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            const skill = trainingSkills.find((item) => item.version_id === task.source_skill_version_id);
            return (
              <div
                key={task.task_id}
                className={`${styles.taskCard} animate-fadeInUp ${selectedTaskIds.has(task.task_id) ? styles.selectedTask : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => {
                  if (isBatchMode) toggleTask(task.task_id);
                  else setSelectedTask(task);
                }}
              >
                <div className={styles.taskHeader}>
                  <div className={styles.taskTitleRow}>
                    {isBatchMode ? (
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.task_id)}
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
                          来自 {skill?.skill_name || 'TrainingSkill'}
                        </span>
                        <span className={styles.originBadge} style={{ color: '#059669', background: '#ecfdf5' }}>
                          {task.source_agent_run_id}
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
                  <span className={styles.taskCustomer}>📤 分配给 新天地店员工</span>
                </div>

                <div className={styles.taskActions} onClick={(event) => event.stopPropagation()}>
                <button className={styles.btnApprove}>开始任务</button>
                  <button className={styles.btnEditApprove}>问AI</button>
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
                    {sourceLabels[selectedTask.source_type]} · {selectedTask.source_agent_run_id}
                  </span>
                </div>
              </div>
              <div className={styles.drawerSection}>
                <label className={styles.drawerLabel}>完成规则</label>
                <div className={styles.drawerInfo}>{selectedTask.completion_rule}</div>
              </div>
            </div>
            <div className={styles.drawerActions}>
              <button className={styles.drawerBtnPrimary}>开始任务</button>
              <button className={styles.drawerBtnDanger}>生成补练</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
