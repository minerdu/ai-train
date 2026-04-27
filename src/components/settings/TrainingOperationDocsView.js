'use client';

import styles from './TrainingOperationDocsView.module.css';

const TYPE_CONFIG = {
  playbook: {
    name: '门店盈利模型',
    section: 'core',
    theme: 'iconBoxGreen',
    source: 'sourceLocal',
    sourceLabel: '本地私有',
    description: '沉淀人头、到店率、单客年价值、房间产能、美容师产能和顾客经营框架。',
  },
  campaign: {
    name: '30天落地计划',
    section: 'core',
    theme: 'iconBoxOrange',
    source: 'sourceWorkflow',
    sourceLabel: '工作流中心',
    description: '围绕功能区、咨询诊断、手法、品项卡项、五感体验、拓客、自查和验收的执行计划。',
  },
  coupon: {
    name: 'AI运营只读信号',
    section: 'core',
    theme: 'iconBoxBlue',
    source: 'sourceYouzan',
    sourceLabel: 'AI-OPS只读',
    description: '用于体验后未转卡、价格异议、老客沉默和复购下降等信号转训练建议。',
  },
  private_domain: {
    name: '角色与群组教学SOP',
    section: 'core',
    theme: 'iconBoxTeal',
    source: 'sourceWorkflow',
    sourceLabel: '工作流中心',
    description: '覆盖员工、店长、总部权限，以及群公告、群作业、@回复、店长确认和总部抽检。',
  },
  aftercare: {
    name: '风险话术',
    section: 'support',
    theme: 'iconBoxPink',
    source: 'sourceZhipu',
    sourceLabel: '智谱知识库',
    description: '聚焦医疗边界、功效承诺、客户投诉、公开排名和客户案例外发的训练边界。',
  },
  membership: {
    name: '店长带教',
    section: 'support',
    theme: 'iconBoxPurple',
    source: 'sourceYouzan',
    sourceLabel: '本地私有',
    description: '面向本店员工任务分配、晨会稿、补练名单、审批与门店日报的管理资料。',
  },
  training: {
    name: 'AI陪练题库',
    section: 'support',
    theme: 'iconBoxIndigo',
    source: 'sourceLocal',
    sourceLabel: '本地私有',
    description: '用于统一员工知识测验、场景陪练、评分Rubric和补练触发标准。',
  },
  dashboard: {
    name: '培训日报与复盘',
    section: 'support',
    theme: 'iconBoxYellow',
    source: 'sourceLocal',
    sourceLabel: '本地私有',
    description: '沉淀培训日报、门店周报、总部多店汇总和训练指标定义口径。',
  },
};

const MOCK_FILES = {
  playbook: [
    { id: 'p1', name: '中妆单店盈利模型_训练框架', format: 'pptx', size: '10.8 MB', date: '2026-04-08' },
    { id: 'p2', name: '门店盈利指标与训练目标拆解表', format: 'xlsx', size: '1.4 MB', date: '2026-04-09' },
    { id: 'p3', name: '九大保障系统Skill发布排期', format: 'xlsx', size: '2.1 MB', date: '2026-04-11' },
    { id: 'p4', name: '员工-店长-总部训练责任表', format: 'docx', size: '0.9 MB', date: '2026-04-13' },
  ],
  campaign: [
    { id: 'c1', name: '东方熏道30天门店落地训练计划', format: 'docx', size: '12.2 MB', date: '2026-04-10' },
    { id: 'c2', name: '咨询诊断与手法训练证据包', format: 'zip', size: '28.6 MB', date: '2026-04-12' },
    { id: 'c3', name: '六大流程与5A体验演练脚本', format: 'docx', size: '1.7 MB', date: '2026-04-14' },
    { id: 'c4', name: '30天自查整改与验收清单', format: 'pdf', size: '2.8 MB', date: '2026-04-16' },
  ],
  coupon: [
    { id: 'q1', name: '体验后未转卡信号字段说明', format: 'pdf', size: '1.2 MB', date: '2026-04-09' },
    { id: 'q2', name: '价格异议高发信号映射表', format: 'xlsx', size: '0.8 MB', date: '2026-04-15' },
    { id: 'q3', name: '老客沉默与复购下降训练建议', format: 'docx', size: '1.1 MB', date: '2026-04-17' },
    { id: 'q4', name: '培训系统不回写AI运营规则', format: 'pdf', size: '1.6 MB', date: '2026-04-18' },
  ],
  private_domain: [
    { id: 'd1', name: '培训群公告与作业SOP', format: 'pdf', size: '2.5 MB', date: '2026-04-08' },
    { id: 'd2', name: '@回复与角色权限链路图', format: 'pptx', size: '8.6 MB', date: '2026-04-10' },
    { id: 'd3', name: '作业催交流程与话术', format: 'docx', size: '1.3 MB', date: '2026-04-12' },
    { id: 'd4', name: '优秀作业点评模板', format: 'xlsx', size: '0.9 MB', date: '2026-04-19' },
  ],
  aftercare: [
    { id: 'a1', name: '功效承诺禁用话术清单', format: 'docx', size: '1.0 MB', date: '2026-04-07' },
    { id: 'a2', name: '医疗诊断与皮肤异常升级规则', format: 'pdf', size: '3.2 MB', date: '2026-04-09' },
    { id: 'a3', name: '公开排名审批说明', format: 'xlsx', size: '0.7 MB', date: '2026-04-13' },
    { id: 'a4', name: '客户投诉训练案例脱敏SOP', format: 'docx', size: '1.6 MB', date: '2026-04-15' },
  ],
  membership: [
    { id: 'm1', name: '店长晨会带教手册', format: 'pdf', size: '4.6 MB', date: '2026-04-11' },
    { id: 'm2', name: '员工补练名单模板', format: 'xlsx', size: '1.2 MB', date: '2026-04-12' },
    { id: 'm3', name: '门店训练周复盘脚本', format: 'docx', size: '0.9 MB', date: '2026-04-17' },
    { id: 'm4', name: '总部跨店Skill发布模板', format: 'docx', size: '1.1 MB', date: '2026-04-18' },
  ],
  training: [
    { id: 't1', name: 'AI陪练评分Rubric', format: 'pdf', size: '5.1 MB', date: '2026-04-08' },
    { id: 't2', name: '门店顾问禁用话术与红线清单', format: 'docx', size: '1.4 MB', date: '2026-04-10' },
    { id: 't3', name: '顾客异议处理百问百答', format: 'pdf', size: '3.8 MB', date: '2026-04-16' },
    { id: 't4', name: '低分自动补练触发规则', format: 'xlsx', size: '0.6 MB', date: '2026-04-20' },
  ],
  dashboard: [
    { id: 'r1', name: '培训日报指标定义口径', format: 'docx', size: '0.8 MB', date: '2026-04-12' },
    { id: 'r2', name: '门店周复盘模板与异常排查清单', format: 'xlsx', size: '1.0 MB', date: '2026-04-14' },
    { id: 'r3', name: 'AI陪练通关率监控说明', format: 'pdf', size: '1.5 MB', date: '2026-04-22' },
    { id: 'r4', name: '训练建议生成字段映射表', format: 'xlsx', size: '0.7 MB', date: '2026-04-23' },
  ],
};

function TypeIcon({ type }) {
  const props = {
    width: 32,
    height: 32,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (type) {
    case 'playbook':
      return <svg {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>;
    case 'campaign':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>;
    case 'coupon':
      return <svg {...props}><path d="M3 10V6a2 2 0 0 1 2-2h14v4a2 2 0 0 0 0 4v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 0 0-4Z" /><path d="M12 4v16" /></svg>;
    case 'private_domain':
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case 'aftercare':
      return <svg {...props}><path d="M12 21s-6.5-4.35-9-8.5C.67 8.63 3.3 4 8 4c2.48 0 4 1.5 4 1.5S13.52 4 16 4c4.7 0 7.33 4.63 5 8.5-2.5 4.15-9 8.5-9 8.5z" /></svg>;
    case 'membership':
      return <svg {...props}><circle cx="8" cy="8" r="2" /><path d="M8 10v12" /><path d="M16 8h.01" /><path d="M12 16h8" /><path d="M12 20h8" /><path d="M12 12h8" /></svg>;
    case 'training':
      return <svg {...props}><path d="M22 10v6M2 10v6" /><path d="M6 12v8" /><path d="M18 12v8" /><path d="M12 6v14" /><path d="M2 10c2.5-2 5.5-3 10-3s7.5 1 10 3" /><path d="M2 16c2.5 2 5.5 3 10 3s7.5-1 10-3" /></svg>;
    case 'dashboard':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    default:
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  }
}

function FileFormatIcon({ format }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { flexShrink: 0 },
  };
  const normalized = String(format || '').toLowerCase();

  if (normalized.includes('pdf')) return <svg {...props} color="#ef4444"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (normalized.includes('doc')) return <svg {...props} color="#2563eb"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (normalized.includes('xls')) return <svg {...props} color="#10b981"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (normalized.includes('ppt')) return <svg {...props} color="#f97316"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
  if (normalized.includes('zip')) return <svg {...props} color="#7c3aed"><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12v5" /><path d="M14 12v5" /></svg>;
  return <svg {...props} color="#6b7280"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}

export default function TrainingOperationDocsView() {
  const coreTypes = ['playbook', 'campaign', 'coupon', 'private_domain'];
  const supportTypes = ['aftercare', 'membership', 'training', 'dashboard'];

  const renderCard = (type) => {
    const config = TYPE_CONFIG[type];
    const files = MOCK_FILES[type] || [];
    if (!config) return null;

    return (
      <div key={type} className={styles.docCard}>
        <div className={styles.cardHeader}>
          <div className={`${styles.iconBox} ${styles[config.theme]}`}>
            <TypeIcon type={type} />
          </div>
          <div className={styles.metaBox}>
            <span className={`${styles.sourceTag} ${styles[config.source]}`}>
              {config.sourceLabel}
            </span>
            <div className={styles.docCount}>{files.length} 个文件</div>
          </div>
        </div>

        <h3 className={styles.cardTitle}>{config.name}</h3>
        <p className={styles.cardDesc}>{config.description}</p>

        <div className={styles.fileList}>
          {files.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <FileFormatIcon format={file.format} />
              <span className={styles.fileName} title={file.name}>{file.name}</span>
              <span className={styles.fileMeta}>{file.size}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.docsContainer}>
        <div className={styles.docsSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.greenPill}></span> 核心培训体系
          </h2>
          <div className={styles.grid}>
            {coreTypes.map(renderCard)}
          </div>
        </div>

        <div className={styles.docsSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.bluePill}></span> 执行与支持文档
          </h2>
          <div className={styles.grid}>
            {supportTypes.map(renderCard)}
          </div>
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
