'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { currentUser, roleDashboardData } from '@/lib/trainingData';
import styles from './RoleDashboard.module.css';

const ACCOUNT_OPTIONS = [
  { key: 'employee', label: '员工账号', desc: '个人训练' },
  { key: 'manager', label: '店长账号', desc: '本店带教' },
  { key: 'hq', label: '总部账号', desc: '培训管理' },
];

const ROLE_VISIBILITY = {
  employee: ['employee'],
  manager: ['manager', 'employee'],
  hq: ['hq'],
};

const DEFAULT_VIEW = {
  employee: 'employee',
  manager: 'manager',
  hq: 'hq',
};

function getAllowedRoleKeys(accountRole) {
  return ROLE_VISIBILITY[accountRole] || ['employee'];
}

function getDefaultRoleKey(accountRole, allowedRoleKeys) {
  const defaultKey = DEFAULT_VIEW[accountRole] || allowedRoleKeys[0];
  return allowedRoleKeys.includes(defaultKey) ? defaultKey : allowedRoleKeys[0];
}

function makeSoftColor(color, opacity = '14') {
  return `${color}${opacity}`;
}

export default function RoleDashboard({ surface = 'roles' }) {
  const [demoAccountRole, setDemoAccountRole] = useState(currentUser.role || 'employee');
  const allowedRoleKeys = useMemo(() => getAllowedRoleKeys(demoAccountRole), [demoAccountRole]);
  const [activeRoleKey, setActiveRoleKey] = useState(() => {
    const initialAccountRole = currentUser.role || 'employee';
    return getDefaultRoleKey(initialAccountRole, getAllowedRoleKeys(initialAccountRole));
  });

  const role = roleDashboardData[activeRoleKey] || roleDashboardData.employee;
  const progress = Math.max(0, Math.min(100, role.currentStage.progress));
  const surfaceLabel = surface === 'ai' ? 'AI培训上下文' : '角色工作台';
  const primaryStat = role.progressStats[0];
  const primaryAction = role.focusPoints[0];
  const managementSummary = role.staffTrainingSummary || role.roleCompletionSummary || role.storeTrainingSummary;
  const summaryCards = [
    role.planOverview[0],
    role.gaps[0],
    managementSummary?.[0],
  ].filter(Boolean);

  const handleAccountSwitch = (accountRole) => {
    const nextAllowed = getAllowedRoleKeys(accountRole);
    setDemoAccountRole(accountRole);
    setActiveRoleKey(getDefaultRoleKey(accountRole, nextAllowed));
  };

  return (
    <main
      className={styles.page}
      style={{
        '--role-color': role.color,
        '--role-color-soft': makeSoftColor(role.color, '14'),
        '--role-color-line': makeSoftColor(role.color, '30'),
      }}
    >
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroIdentity}>
            <div className={styles.avatar}>{role.label}</div>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>{surfaceLabel} · {role.accountRole}</span>
              <h2>{role.owner} · {role.title}</h2>
              <p>{role.identitySummary}</p>
              <div className={styles.heroStats} aria-label="角色关键状态">
                {role.progressStats.map((item) => (
                  <span key={item.label} className={styles.heroStat}>
                    <em>{item.label}</em>
                    <strong>{item.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.accountPanel}>
            <span className={styles.accountLabel}>演示账号切换</span>
            <div className={styles.accountSwitch}>
              {ACCOUNT_OPTIONS.map((account) => (
                <button
                  key={account.key}
                  type="button"
                  className={`${styles.accountButton} ${demoAccountRole === account.key ? styles.accountButtonActive : ''}`}
                  onClick={() => handleAccountSwitch(account.key)}
                >
                  <strong>{account.label}</strong>
                  <span>{account.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {allowedRoleKeys.length > 1 ? (
          <div className={styles.viewSwitch}>
            <span>当前账号可见</span>
            <div>
              {allowedRoleKeys.map((key) => {
                const item = roleDashboardData[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.viewButton} ${activeRoleKey === key ? styles.viewButtonActive : ''}`}
                    onClick={() => setActiveRoleKey(key)}
                  >
                    {item.label}视图
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.viewSwitch}>
            <span>当前账号可见</span>
            <strong>{role.label}视图</strong>
          </div>
        )}

        <section className={styles.spotlight}>
          <div className={styles.spotlightMain}>
            <span className={styles.sectionKicker}>当前重点</span>
            <h3>{role.currentStage.title}</h3>
            <p>{role.currentStage.subtitle}</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.stageFoot}>
              <span>阶段进度 {progress}%</span>
              <span>{role.currentStage.next}</span>
            </div>
          </div>

          <div className={styles.spotlightMetric}>
            <span>{primaryStat.label}</span>
            <strong>{primaryStat.value}</strong>
            <Link href={primaryAction.href}>{primaryAction.action}</Link>
          </div>
        </section>

        <section className={styles.actionGrid} aria-label="AI推荐行动">
          {role.focusPoints.slice(0, 3).map((item, index) => (
            <Link key={item.title} href={item.href} className={`${styles.actionCard} ${styles[`actionTone${index + 1}`]}`}>
              <span className={styles.actionIndex}>0{index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
              <em>{item.action}</em>
            </Link>
          ))}
        </section>

        <section className={styles.signalPanel} aria-label="角色态势">
          <div className={styles.panelHead}>
            <div>
              <span className={styles.sectionKicker}>角色态势</span>
              <strong>从任务、实战和AI运营信号提炼</strong>
            </div>
            <span>{role.scope}</span>
          </div>
          <div className={styles.signalGrid}>
            {summaryCards.map((item, index) => (
              <div key={`${item.title || item.label || item.store}-${index}`} className={`${styles.signalCard} ${styles[`signalTone${index + 1}`]}`}>
                <span>{index === 0 ? '培训计划' : index === 1 ? role.gapsTitle : activeRoleKey === 'hq' ? '管理态势' : '训练态势'}</span>
                <strong>{item.title || item.label || item.store}</strong>
                <p>{item.desc || `进度 ${item.progress} · 风险 ${item.risk}`}</p>
                <em>{item.status || item.value || item.progress}</em>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.aiPanel}>
          <div className={styles.panelHead}>
            <div>
              <span className={styles.sectionKicker}>AI建议</span>
              <strong>按当前角色生成下一步指令</strong>
            </div>
            <span>{role.scope}</span>
          </div>
          <div className={styles.promptGrid}>
            {role.aiSuggestions.map((item) => (
              <Link key={item} href="/ai" className={styles.promptChip}>
                {item}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.permissionBand}>
          <div className={styles.permissionHead}>
            <div>
              <span className={styles.sectionKicker}>权限摘要</span>
              <strong>当前视图能做什么</strong>
            </div>
            <Link href="/me?tab=permissions">权限管理</Link>
          </div>
          <div className={styles.permissionList}>
            {role.permissionSummary.map((item, index) => (
              <span key={item} className={styles[`permissionTone${index + 1}`]}>{item}</span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
