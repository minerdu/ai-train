'use client';

import { useMemo, useState } from 'react';
import { abilityProfile, getPracticeOverviewDTO } from '@/lib/trainingData';
import styles from './page.module.css';

const STAGE_LABELS = {
  all: '全部内容',
  core: '核心训练',
  field: '实战陪跑',
  review: '复盘提升',
  history: '训练记录',
};

const STAGE_COLORS = {
  all: '#2563eb',
  core: '#0ea5e9',
  field: '#10b981',
  review: '#f59e0b',
  history: '#07C160',
};

export default function PracticePage() {
  const dto = getPracticeOverviewDTO();
  const [stageTab, setStageTab] = useState('all');
  const [viewTab, setViewTab] = useState('scenarios');
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const scenarios = useMemo(() => {
    let result = dto.scenarios;
    if (stageTab !== 'all' && stageTab !== 'history') {
      result = result.filter((scenario) => scenario.scenario_type === stageTab);
    }
    if (searchTerm) {
      result = result.filter((scenario) => scenario.scenario_name.includes(searchTerm));
    }
    return result;
  }, [dto.scenarios, searchTerm, stageTab]);

  const stageCounts = useMemo(() => {
    const counts = { all: dto.scenarios.length, history: dto.history.length };
    dto.scenarios.forEach((scenario) => {
      counts[scenario.scenario_type] = (counts[scenario.scenario_type] || 0) + 1;
    });
    return counts;
  }, [dto.history.length, dto.scenarios]);

  return (
    <div className={styles.leadsPage}>
      <div
        className={`${styles.sidebarBackdrop} ${showGroupMenu ? styles.sidebarBackdropOpen : ''}`}
        onClick={() => setShowGroupMenu(false)}
      />

      <div className={`${styles.groupSidebar} ${showGroupMenu ? styles.groupSidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>实战筛选</span>
          <button className={styles.sidebarCloseBtn} onClick={() => setShowGroupMenu(false)}>✕</button>
        </div>
        <div className={styles.sidebarSectionTitle}>训练与实战</div>
        <div className={styles.sidebarList}>
          {Object.entries(STAGE_LABELS).map(([key, label]) => (
            <div
              key={key}
              className={`${styles.sidebarItem} ${stageTab === key ? styles.sidebarItemActive : ''}`}
              onClick={() => { setStageTab(key); setShowGroupMenu(false); }}
            >
              <span className={styles.sidebarItemIcon} style={{ color: STAGE_COLORS[key] || 'var(--color-primary)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="4"/></svg>
              </span>
              <span className={styles.sidebarItemLabel}>{label}</span>
              {stageCounts[key] > 0 ? <span className={styles.sidebarItemCount}>{stageCounts[key]}</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.topTabs}>
          {['all', 'core', 'field', 'review', 'history'].map((key) => (
            <div
              key={key}
              className={`${styles.topTab} ${stageTab === key ? styles.topTabActive : ''}`}
              onClick={() => setStageTab(key)}
            >
              {STAGE_LABELS[key]}
              {stageCounts[key] > 0 ? <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 2 }}>({stageCounts[key]})</span> : null}
            </div>
          ))}
        </div>

        <div className={styles.profileTabs}>
            {[
            { key: 'scenarios', label: '实战训练' },
            { key: 'ability', label: '角色能力' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.profileTab} ${viewTab === item.key ? styles.profileTabActive : ''}`}
              onClick={() => setViewTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.searchSection}>
          <button className={styles.menuToggleBtn} onClick={() => setShowGroupMenu(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索核心训练、实战信号或复盘任务"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm ? (
              <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>✕</button>
            ) : (
              <svg className={styles.searchIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </div>
          <button type="button" className={styles.selectionModeBtn}>生成实战补练</button>
        </div>

        {viewTab === 'ability' ? (
          <section className={styles.groupSection} style={{ padding: '0 24px' }}>
            <div className={styles.groupSectionHead}>
              <strong>{abilityProfile.name} 角色能力画像</strong>
              <span>{abilityProfile.role_scope} · Assessment Agent 自动更新</span>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {Object.entries(abilityProfile.ability).map(([label, value]) => (
                <div key={label} className={styles.leadCard}>
                  <div className={styles.leadCardHeader}>
                  <div className={styles.leadAvatar} style={{ background: `linear-gradient(135deg, ${value < 70 ? '#f59e0b' : '#2563eb'}, #0f172a)` }}>
                    {String(value)}
                  </div>
                  <div className={styles.leadInfo}>
                    <div className={styles.leadNameRow}>
                      <span className={styles.leadName}>{label}</span>
                      <span className={styles.leadStage} style={{ background: value >= 80 ? '#ecfdf5' : '#fffbeb', color: value >= 80 ? '#047857' : '#b45309' }}>
                        {value >= 80 ? '已通关' : '需补练'}
                      </span>
                    </div>
                    <span className={styles.leadCompany}>最近训练：{abilityProfile.last_practice_at}</span>
                  </div>
                  </div>
                  <div className={styles.leadSummary}>Assessment Agent 根据核心训练、实战陪跑和店长审核更新分数，低于80分自动建议补练。</div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div style={{ padding: '0 24px 24px' }}>
            <section className={styles.groupSection} style={{ marginBottom: 12 }}>
              <div className={styles.groupSectionHead}>
                <strong>{dto.training_map.title}</strong>
                <span>{dto.training_map.modules.join(' / ')}</span>
              </div>
            </section>
            {scenarios.map((scenario) => (
              <div key={scenario.scenario_id} className={styles.leadCard}>
                <div className={styles.leadCardHeader}>
                  <div className={styles.leadAvatar} style={{ background: `linear-gradient(135deg, ${STAGE_COLORS[scenario.scenario_type] || '#2563eb'}, #0f172a)` }}>
                    {scenario.scenario_name.slice(0, 2)}
                  </div>
                  <div className={styles.leadInfo}>
                    <div className={styles.leadNameRow}>
                      <span className={styles.leadName}>{scenario.scenario_name}</span>
                      <span className={styles.leadStage} style={{ background: '#eff6ff', color: '#2563eb' }}>{scenario.difficulty_level}</span>
                    </div>
                    <span className={styles.leadCompany}>{scenario.customer_profile.state}</span>
                  </div>
                  <span className={styles.onlineDot} />
                </div>
                <div className={styles.leadScores}>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>历史得分</span>
                    <span className={styles.scoreValue}>{scenario.score}</span>
                  </div>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>场景类型</span>
                    <span className={styles.scoreValue}>{STAGE_LABELS[scenario.scenario_type] || '训练'}</span>
                  </div>
                </div>
                <div className={styles.leadTags}>
                  {scenario.must_cover_points.map((point) => (
                    <span key={point} className={styles.tagChip} style={{ borderColor: '#dbeafe', color: '#2563eb', background: '#eff6ff' }}>{point}</span>
                  ))}
                </div>
                <div className={styles.leadFooter}>
                  <span className={styles.leadTime}>点击进入AI陪练或实战复盘</span>
                  <span className={styles.leadRegion}>V3 Skill绑定</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
