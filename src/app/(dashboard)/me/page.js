'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SystemStatusPanel from '@/components/settings/SystemStatusPanel';
import PersonaSettings from '@/components/settings/PersonaSettings';
import AiModelSettings from '@/components/settings/AiModelSettings';
import RedLineConfigCard from '@/components/settings/RedLineConfigCard';
import MomentsAgentConfigCard from '@/components/settings/MomentsAgentConfigCard';
import AutonomousOpsSettings from '@/components/settings/AutonomousOpsSettings';
import TrainingOperationSkillCenterView from '@/components/settings/TrainingOperationSkillCenterView';
import TrainingOperationSopModelingView from '@/components/settings/TrainingOperationSopModelingView';
import TrainingOperationMetricsAlertsView from '@/components/settings/TrainingOperationMetricsAlertsView';
import TrainingDailyReportView from '@/components/settings/TrainingDailyReportView';
import TrainingOperationDocsView from '@/components/settings/TrainingOperationDocsView';
import TrainingOperationAccountManagementView from '@/components/settings/TrainingOperationAccountManagementView';
import TrainingOpsSystemAccessPanel from '@/components/settings/TrainingOpsSystemAccessPanel';
import TrainingOperationLoginChoiceView from '@/components/settings/TrainingOperationLoginChoiceView';
import TrainingPermissionManagementView from '@/components/settings/TrainingPermissionManagementView';
import styles from './page.module.css';

const DETAIL_VIEWS = {
  aiCoach: { title: 'AI教练设置', Component: PersonaSettings },
  aiModel: { title: 'AI大模型与知识库', Component: AiModelSettings },
  redLineRules: { title: '红线与安全规则', Component: RedLineConfigCard },
  groupAgent: { title: '群组智能体', Component: MomentsAgentConfigCard },
  skillCenter: { title: 'Skill中心', Component: TrainingOperationSkillCenterView },
  trainingSop: { title: '培训SOP建模', Component: TrainingOperationSopModelingView },
  trainingMetrics: { title: '指标与预警', Component: TrainingOperationMetricsAlertsView },
  autonomousTraining: { title: 'AI自主培训引擎', Component: AutonomousOpsSettings },
  trainingReport: { title: '培训日报', Component: TrainingDailyReportView },
  trainingDocs: { title: '培训文档', Component: TrainingOperationDocsView },
  accountManagement: { title: '账号管理', Component: TrainingOperationAccountManagementView },
  opsSystemAccess: { title: 'AI运营系统接入', Component: TrainingOpsSystemAccessPanel },
  loginChoice: { title: '登录选项', Component: TrainingOperationLoginChoiceView },
  permissionManagement: { title: '权限管理', Component: TrainingPermissionManagementView },
};

const TAB_ALIAS_MAP = {
  persona: 'aiCoach',
  aiModel: 'aiModel',
  redline: 'redLineRules',
  group: 'groupAgent',
  skill: 'skillCenter',
  sop: 'trainingSop',
  metrics: 'trainingMetrics',
  engine: 'autonomousTraining',
  report: 'trainingReport',
  docs: 'trainingDocs',
  account: 'accountManagement',
  ops: 'opsSystemAccess',
  login: 'loginChoice',
  permissions: 'permissionManagement',
};

function getRequestedView(searchParams) {
  const tabParam = searchParams.get('tab');
  if (!tabParam) return null;
  const resolvedKey = TAB_ALIAS_MAP[tabParam] || tabParam;
  return DETAIL_VIEWS[resolvedKey] ? resolvedKey : null;
}

function MePageInner() {
  const [viewState, setViewState] = useState('list');
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = getRequestedView(searchParams);
  const activeView = requestedView ?? viewState;

  const handleListAction = (item) => {
    if (item.route) {
      router.push(item.route);
      return;
    }
    setViewState(item.key);
  };

  const handleBack = () => {
    setViewState('list');
    if (requestedView) router.replace('/me');
  };

  if (activeView !== 'list') {
    const viewDef = DETAIL_VIEWS[activeView];
    if (viewDef) {
      const { title, Component } = viewDef;
      return (
        <div className={styles.settingsPage}>
          <div className={styles.header}>
            <button className={styles.backBtnIOS || styles.backBtn} onClick={handleBack}>
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6" /></svg>
              <span className={styles.backBtnText}>返回</span>
            </button>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.content}>
            <Component onBack={handleBack} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.listContent}>
        <div className={styles.listGroup}>
          <SystemStatusPanel />
        </div>

        <SettingsGroup
          title="AI 智能体配置"
          items={[
            { key: 'aiCoach', color: '#8b5cf6', label: 'AI教练设置', icon: userIcon() },
            { key: 'aiModel', color: '#3b82f6', label: 'AI大模型与知识库', icon: dbIcon() },
            { key: 'redLineRules', color: '#ef4444', label: '红线与安全规则', icon: shieldIcon() },
            { key: 'groupAgent', color: '#10b981', label: '群组智能体', icon: groupIcon() },
          ]}
          onAction={handleListAction}
        />

        <SettingsGroup
          title="标杆企业Skill设置"
          items={[
            { key: 'skillCenter', color: '#f59e0b', label: 'Skill中心', icon: skillIcon() },
            { key: 'trainingSop', color: '#14b8a6', label: '培训SOP建模', icon: cubeIcon() },
            { key: 'trainingMetrics', color: '#10b981', label: '指标与预警', icon: chartIcon() },
          ]}
          onAction={handleListAction}
        />

        <SettingsGroup
          title="AI 培训设置"
          items={[
            { key: 'autonomousTraining', color: '#14b8a6', label: 'AI自主培训引擎', icon: chipIcon() },
            { key: 'trainingReport', color: '#ca8a04', label: '培训日报', icon: reportIcon() },
            { key: 'trainingDocs', color: '#2563eb', label: '培训文档', icon: docIcon() },
          ]}
          onAction={handleListAction}
        />

        <SettingsGroup
          title="运营管理"
          items={[
            { key: 'accountManagement', color: '#f43f5e', label: '账号管理', icon: accountIcon() },
            { key: 'permissionManagement', color: '#8b5cf6', label: '权限管理', icon: permissionIcon() },
            { key: 'opsSystemAccess', color: '#06b6d4', label: 'AI运营系统接入', icon: linkIcon() },
            { key: 'loginChoice', color: '#6b7280', label: '登录选项', icon: lockIcon() },
          ]}
          onAction={handleListAction}
        />
      </div>
    </div>
  );
}

function SettingsGroup({ title, items, onAction }) {
  return (
    <div className={styles.listGroup}>
      <div className={styles.groupHead}>{title}</div>
      <div className={styles.groupItems}>
        {items.map((item) => (
          <div key={item.label} className={styles.listItem} onClick={() => onAction(item)}>
            <div className={styles.itemLeft}>
              <span className={styles.itemIcon} style={{ color: item.color, display: 'flex' }}>{item.icon}</span>
              <span className={styles.itemName}>{item.label}</span>
            </div>
            <span className={styles.itemArrow}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={null}>
      <MePageInner />
    </Suspense>
  );
}

function userIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function dbIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>; }
function shieldIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>; }
function groupIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>; }
function skillIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>; }
function cubeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /></svg>; }
function chartIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function chipIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>; }
function reportIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>; }
function docIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>; }
function accountIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>; }
function linkIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>; }
function lockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function permissionIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" /><path d="M9 12l2 2 4-4" /></svg>; }
