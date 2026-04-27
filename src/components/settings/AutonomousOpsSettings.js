'use client';
import { useState } from 'react';
import styles from '@/app/(dashboard)/me/page.module.css';

const STAGES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    label: '门店盈利模型', desc: '经营指标与训练目标', time: '09:00-20:00', limit: 18, color: '#1890ff',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    label: '30天落地', desc: '每日任务、证据与验收', time: '09:00-20:00', limit: 30, color: '#52c41a',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    label: '六大服务流程', desc: '邀约、接待、参观、咨询、体验、售后', time: '10:00-18:00', limit: 18, color: '#fa8c16',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    label: '咨询诊断', desc: '需求、状态、顾虑与禁忌', time: '09:00-20:00', limit: 20, color: '#f5222d',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#722ed1" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    label: '手法项目', desc: '手法视频、项目表达与禁忌', time: '10:00-18:00', limit: 15, color: '#722ed1',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eb2f96" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    label: '品项卡项', desc: '拓留升转与卡项价值', time: '10:00-18:00', limit: 15, color: '#eb2f96',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#faad14" strokeWidth="2"><path d="M12 20V10"/><path d="m18 14-6-6-6 6"/></svg>,
    label: '顾客经营361', desc: 'B档案与月度服务计划', time: '10:00-20:00', limit: 15, color: '#faad14',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#13c2c2" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
    label: '5A体验', desc: '五感场景、体验复盘与风险边界', time: '10:00-18:00', limit: 20, color: '#13c2c2',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0d911" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    label: '角色带教', desc: '员工、店长、总部权限与抽检', time: '10:00-18:00', limit: 10, color: '#a0d911',
  },
];

export default function AutonomousOpsSettings({ onBack }) {
  const [enabled, setEnabled] = useState(true);
  const [stageEnabled, setStageEnabled] = useState(STAGES.map(() => true));
  const [approvalMode, setApprovalMode] = useState('auto');

  return (
    <>
      {/* 总开关 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--color-primary)' }}><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          AI 自主培训引擎
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
          基于V3培训旅程、员工/店长/总部角色、30天落地计划和AI运营只读信号，智能生成核心训练、实战陪跑、补练建议和审核动作。
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: enabled ? 'linear-gradient(135deg, #E6F7EF, #F0FFF4)' : '#f8fafc', borderRadius: 12, border: `1px solid ${enabled ? '#B7EB8F' : '#e2e8f0'}`, marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: enabled ? '#07C160' : '#94a3b8', boxShadow: enabled ? '0 0 8px #07C160' : 'none' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: enabled ? '#07C160' : '#64748b' }}>
              {enabled ? '引擎已启用' : '引擎已关闭'}
            </span>
          </div>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="opsEnabled" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
            <label htmlFor="opsEnabled"></label>
          </div>
        </div>
      </div>

      {/* 9阶段配置 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--color-primary)' }}><path d="M21 3L14.5 21a.55.55 0 0 1-1 0L10 14 3 10.5a.55.55 0 0 1 0-1L21 3z"></path></svg>
          AI自主培训旅程配置
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 12px 0' }}>每个阶段可独立开关，配置训练时段和每日上限</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STAGES.map((stage, i) => (
            <div key={i} className={styles.stageRow}>
              <span style={{ fontSize: 20, display: 'flex' }}>{stage.icon}</span>
              <div className={styles.stageInfo}>
                <div className={styles.stageName}>{stage.label}</div>
                <div className={styles.stageDesc}>{stage.desc}</div>
              </div>
              <div className={styles.stageMeta}>
                <span>{stage.time}</span>
                <span>上限 {stage.limit}条/日</span>
              </div>
              <div className={styles.toggleSwitch} style={{ flexShrink: 0 }}>
                <input type="checkbox" id={`stage_${i}`} checked={stageEnabled[i]}
                  onChange={e => {
                    const next = [...stageEnabled];
                    next[i] = e.target.checked;
                    setStageEnabled(next);
                  }} />
                <label htmlFor={`stage_${i}`}></label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 审批规则 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--color-primary)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          审批规则
        </div>
        <div style={{ padding: 12, background: '#F0FDF4', borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#059669' }}>训练任务审批</div>
          <div className={styles.radioGroup}>
            <button className={`${styles.radioBtn} ${approvalMode === 'auto' ? styles.activeFull : ''}`} onClick={() => setApprovalMode('auto')}>● 全自动（免审直通）</button>
            <button className={`${styles.radioBtn} ${approvalMode === 'manual' ? styles.activeFull : ''}`} onClick={() => setApprovalMode('manual')}>○ 需人工确认</button>
          </div>
        </div>
        <div style={{ padding: 12, background: '#FFFBEB', borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#D97706' }}>人工指令审批</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 80 }}>红线关键词:</span>
            <div style={{ flex: 1, padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 12, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}>
              一次见效, 保证治好, 公开排名, 客户触达, 跨店数据
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 80 }}>群发阈值:</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>≥</span>
            <div style={{ width: 60, padding: '6px 10px', background: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid var(--color-border-light)', textAlign: 'center' }}>5000</div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>条客户触达请求以上需人工审批</span>
          </div>
        </div>
      </div>

      {/* 执行统计 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: 'var(--color-primary)' }}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          近 7 天执行统计
        </div>
        <div className={styles.reportGrid}>
          <div className={styles.reportCard} style={{ background: 'linear-gradient(135deg, #E6F7EF, #D4EFDF)' }}>
            <div className={styles.reportNum} style={{ color: '#07C160' }}>156</div>
            <div className={styles.reportLabel} style={{ color: '#52c41a' }}>总执行任务</div>
          </div>
          <div className={styles.reportCard} style={{ background: 'linear-gradient(135deg, #E6F4FF, #D6E4FF)' }}>
            <div className={styles.reportNum} style={{ color: '#1890ff' }}>98%</div>
            <div className={styles.reportLabel} style={{ color: '#597ef7' }}>成功率</div>
          </div>
          <div className={styles.reportCard} style={{ background: 'linear-gradient(135deg, #FFF7E6, #FFE7BA)' }}>
            <div className={styles.reportNum} style={{ color: '#FA8C16' }}>89</div>
            <div className={styles.reportLabel} style={{ color: '#d48806' }}>覆盖员工</div>
          </div>
          <div className={styles.reportCard} style={{ background: 'linear-gradient(135deg, #F9F0FF, #EFDBFF)' }}>
            <div className={styles.reportNum} style={{ color: '#722ED1' }}>9</div>
            <div className={styles.reportLabel} style={{ color: '#9254de' }}>活跃阶段</div>
          </div>
        </div>
      </div>

      <button className={styles.agentSaveBtn} onClick={onBack}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          保存设置
        </span>
      </button>
    </>
  );
}
