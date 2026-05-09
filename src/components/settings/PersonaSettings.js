'use client';

import { useState } from 'react';
import styles from '@/app/(dashboard)/me/page.module.css';

const MEMBERS = ['总部培训负责人', '新天地补鲜站店长', '徐家汇补鲜站店长', '美容顾问-陈雨'];

const BEST_PRACTICE_PROMPT = `## Role（角色定义）
你是樊文花总部的 AI 培训教练，负责员工任务拆解、知识训练、AI陪练、实战答疑、店长复盘与总部训练标准发布。
你的核心任务是：把樊文花标杆TrainingSkill转化为员工能执行的每日任务、训练卡、陪练评分、实战建议和店长带教动作。

### 核心人设
- **身份**：你是粒子空间培训中心的 AI 教练，熟悉门店SOP、项目知识、服务流程、转卡复购和店长带教。
- **性格**：专业、克制、可执行，不制造容貌焦虑，不夸大项目效果。
- **语言风格**：像店长带教一样清楚、短句、能落到下一步动作。
- **语言长度**：每次回复不超过150字，分段输出。
- **回复格式**：仅限纯文本，严禁 Markdown 格式。

## Task（具体任务）
1. 根据员工、店长、总部三类身份判断可见内容和可执行指令。
2. 员工侧优先输出学习卡、AI陪练题、话术纠偏和实战应对建议。
3. 店长侧可生成门店任务、晨会稿、补练安排和复盘报告。
4. 总部侧可发布跨店TrainingSkill、训练SOP、指标阈值和审批规则。
5. 涉及医疗判断、夸大功效、公开排名、客户触达或AI运营数据写回时，必须提示审批或升级。

### 特殊情况处理
- **质疑机器身份**："我是总部AI培训教练，负责把标准SOP拆成你今天能练、能用、能复盘的动作"
- **员工不会答**："先不用急，我会按顾客问题、推荐逻辑、风险边界三步帮你拆开，再给你一轮陪练"
- **店长要布置任务**："可以，我会按本店弱项生成今日任务、群组作业和补练名单，涉及公开排名会先提示审批"

## Guardrails（护栏）
- 不做医学诊断，不承诺一次见效、保证治好或永久改善。
- 不把训练评分直接等同于绩效结论，不公开员工排名。
- 不由培训系统直接触达客户或向AI运营系统写回客户数据。
- 每次回答需要明确下一步训练动作，并标注是否需要店长或总部确认。

## Format（输出格式）
- 每次最多推进一个核心问题。
- 默认短句分段，保持专业、克制、可信。
- 优先输出"当前判断 + 训练动作 + 实战话术 + 是否需要审批"。`;

export default function PersonaSettings({ onBack }) {
  const [form, setForm] = useState({
    personaSource: 'bestPractice',
    quickImportText: '',
    industry: '美容美业培训',
    position: '总部 AI 培训教练',
    introduction: '您好，我是总部 AI 培训教练，负责把樊文花标杆Skill拆解为每日任务、知识训练、AI陪练、实战应对和店长复盘，帮助员工、店长和总部在同一套训练标准下协同提升。',
    promptText: BEST_PRACTICE_PROMPT,
    selectedMembers: ['总部培训负责人', '新天地补鲜站店长'],
  });
  const [isGenerating, setIsGenerating] = useState({});

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAIGenerate = (field) => {
    setIsGenerating((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setIsGenerating((prev) => ({ ...prev, [field]: false }));
    }, 2000);
  };

  return (
    <>
      {/* AI教练人设来源 */}
      <div className={styles.agentFormContainer}>
        <div className={styles.agentFormSection} style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', marginBottom: '16px' }}>
          <span className={styles.agentFormLabel} style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            AI教练人设来源
          </span>
          <div className={styles.radioGroup}>
            <button
              className={`${styles.radioBtn} ${form.personaSource === 'custom' ? styles.activeFull : ''}`}
              onClick={() => update('personaSource', 'custom')}
            >自行配置</button>
            <button
              className={`${styles.radioBtn} ${form.personaSource === 'bestPractice' ? styles.activeFull : ''}`}
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  personaSource: 'bestPractice',
                  promptText: BEST_PRACTICE_PROMPT,
                }));
              }}
            >培训最佳实践配置</button>
          </div>
        </div>

        {/* 快速导入 */}
        <div className={styles.agentFormSection}>
          <div className={styles.labelRow}>
            <span className={styles.agentFormLabel}>快速导入（粘贴内容一键生成）</span>
            <button className={styles.aiBtn} onClick={() => handleAIGenerate('quickImport')} disabled={isGenerating.quickImport}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              <span>{isGenerating.quickImport ? '生成中...' : 'AI一键生成'}</span>
            </button>
          </div>
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.quickImportText}
            onChange={(e) => update('quickImportText', e.target.value)}
            placeholder="粘贴培训手册、门店SOP、项目知识卡、优秀话术等文本，AI 将自动提取关键信息并生成AI教练人设..."
          />
        </div>

        <div style={{ borderTop: '1px dashed var(--color-border-light)', margin: '4px 0' }}></div>

        {/* 基础信息 */}
        <div className={styles.agentFormSection} style={{ padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '8px', marginBottom: '16px' }}>
          <span className={styles.agentFormLabel} style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            基础信息
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label className={styles.miniLabel}>行业</label>
              <select
                className={styles.agentFormInput}
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">请选择行业</option>
                <option value="美容美业培训">美容美业培训</option>
                <option value="连锁门店培训">连锁门店培训</option>
                <option value="服务SOP培训">服务SOP培训</option>
                <option value="销售转化培训">销售转化培训</option>
                <option value="店长带教培训">店长带教培训</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className={styles.miniLabel}>岗位</label>
              <select
                className={styles.agentFormInput}
                value={form.position}
                onChange={(e) => update('position', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">请选择岗位</option>
                <option value="总部 AI 培训教练">总部 AI 培训教练</option>
                <option value="门店AI带教助手">门店AI带教助手</option>
                <option value="店长训练顾问">店长训练顾问</option>
                <option value="总部TrainingSkill管理员">总部TrainingSkill管理员</option>
              </select>
            </div>
          </div>
        </div>

        {/* 教练介绍 */}
        <div className={styles.agentFormSection} style={{ padding: '16px', backgroundColor: '#FDF2F8', borderRadius: '8px', marginBottom: '16px' }}>
          <div className={styles.labelRow}>
            <span className={styles.agentFormLabel} style={{ color: '#EC4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              AI教练介绍
            </span>
            <button className={styles.aiBtn} onClick={() => handleAIGenerate('introduction')} disabled={isGenerating.introduction}>
              <span>🤖</span>
              <span>{isGenerating.introduction ? '生成中...' : 'AI补全'}</span>
            </button>
          </div>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.introduction}
            onChange={(e) => update('introduction', e.target.value)}
            placeholder="例如：您好，我是总部 AI 培训教练，负责为您拆解任务、陪练评分和实战建议..."
          />
        </div>

        {/* 教练提示词 */}
        <div className={styles.agentFormSection} style={{ padding: '16px', backgroundColor: '#F5F3FF', borderRadius: '8px', marginBottom: '16px' }}>
          <div className={styles.labelRow}>
            <span className={styles.agentFormLabel} style={{ color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              AI教练提示词
            </span>
            <button className={styles.aiBtn} onClick={() => handleAIGenerate('promptText')} disabled={isGenerating.promptText}>
              <span>🤖</span>
              <span>{isGenerating.promptText ? '生成中...' : 'AI一键生成'}</span>
            </button>
          </div>
          <textarea
            className={styles.textarea}
            rows={10}
            value={form.promptText}
            onChange={(e) => update('promptText', e.target.value)}
            placeholder="使用 Markdown 格式编写详细的人设提示词..."
          />
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            支持 Markdown 格式 · AI 将根据此提示词理解角色定位并生成对话
          </span>
        </div>

        {/* 成员选择 */}
        <div className={styles.agentFormSection} style={{ padding: '16px', backgroundColor: '#F0FDFA', borderRadius: '8px', marginBottom: '16px' }}>
          <span className={styles.agentFormLabel} style={{ color: '#14B8A6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            应用成员
          </span>
          <div className={styles.memberList}>
            {MEMBERS.map((member) => (
              <label key={member} className={styles.memberItem}>
                <input
                  type="checkbox"
                  checked={form.selectedMembers.includes(member)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      update('selectedMembers', [...form.selectedMembers, member]);
                    } else {
                      update('selectedMembers', form.selectedMembers.filter((item) => item !== member));
                    }
                  }}
                />
                <span>{member}</span>
              </label>
            ))}
          </div>
        </div>

        <button className={styles.agentSaveBtn} onClick={onBack}>
          💾 保存设置
        </button>
      </div>
    </>
  );
}
