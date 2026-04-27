'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import reportStyles from './TrainingReportView.module.css';

const reportData = {
  stats: [
    ['今日任务', '42'],
    ['已完成', '35'],
    ['实战陪跑', '18'],
    ['补练复盘', '12'],
    ['待审批', '3'],
    ['证据作业', '28'],
  ],
  trendData: [
    { time: '09:00', messages: 12, aiReplies: 8 },
    { time: '11:00', messages: 22, aiReplies: 18 },
    { time: '14:00', messages: 35, aiReplies: 30 },
    { time: '16:00', messages: 48, aiReplies: 41 },
    { time: '18:00', messages: 56, aiReplies: 49 },
  ],
  funnelData: [
    { name: '任务', value: 42 },
    { name: '核心训练', value: 35 },
    { name: '实战陪跑', value: 28 },
    { name: '店长审核', value: 18 },
  ],
  highFreqKeywords: ['咨询诊断', '体验转卡', '30天落地', 'B档案补全', '六大流程', '5A体验'],
  keyEmployees: [
    { name: '新天地店-陈雨', reason: '咨询诊断和B档案补全低于80分', action: '生成补练' },
    { name: '徐家汇店-林可', reason: '六大流程通过，但体验转卡缺下一步动作', action: '店长示范' },
  ],
  suggestions: [
    { title: '明早晨会', desc: '围绕体验后未办卡做10分钟示范，先复盘体验再给轻选择。', link: '转任务' },
    { title: 'AI运营信号', desc: 'B档案缺失上升，建议增加顾客经营361补全陪练。', link: '转实战' },
  ],
};

export default function TrainingDailyReportView() {
  return (
    <div className={reportStyles.content}>
      <div className={`${reportStyles.card} animate-fadeInUp`}>
        <h3 className={reportStyles.cardTitle}>📊 培训日报概览</h3>
        <div className={reportStyles.statsGrid}>
          {reportData.stats.map(([label, value]) => (
            <div key={label} className={reportStyles.statBox}>
              <span className={reportStyles.statNum}>{value}</span>
              <span className={reportStyles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className={`${reportStyles.card} animate-fadeInUp delay-100`}>
          <h3 className={reportStyles.cardTitle}>📈 训练互动趋势</h3>
          <div style={{ width: '100%', height: 260, marginTop: '24px' }}>
            <ResponsiveContainer>
              <AreaChart data={reportData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="messages" name="训练消息" stroke="var(--color-primary)" fill="var(--color-primary-bg)" strokeWidth={3} />
                <Area type="monotone" dataKey="aiReplies" name="AI回复" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${reportStyles.card} animate-fadeInUp delay-100`}>
          <h3 className={reportStyles.cardTitle}>🔻 训练转化漏斗</h3>
          <div style={{ width: '100%', height: 260, marginTop: '24px' }}>
            <ResponsiveContainer>
              <BarChart data={reportData.funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 500, fill: 'var(--color-text-primary)' }} width={60} />
                <Tooltip cursor={{ fill: 'var(--color-bg-section)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" name="员工数量" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`${reportStyles.card} animate-fadeInUp delay-100`}>
        <h3 className={reportStyles.cardTitle}>🔑 高频训练主题</h3>
        <div className={reportStyles.keywords}>
          {reportData.highFreqKeywords.map((kw, i) => (
            <span key={kw} className={reportStyles.keyword} style={{ fontSize: `${Math.max(14, 20 - i * 2)}px`, opacity: 1 - i * 0.08 }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className={`${reportStyles.card} animate-fadeInUp delay-200`}>
        <h3 className={reportStyles.cardTitle}>⚡ 建议重点关注员工</h3>
        <div className={reportStyles.keyCustomers}>
          {reportData.keyEmployees.map((employee) => (
            <div key={employee.name} className={reportStyles.keyCustomerItem}>
              <div className={reportStyles.kcInfo}>
                <span className={reportStyles.kcName}>{employee.name}</span>
                <span className={reportStyles.kcReason}>{employee.reason}</span>
              </div>
              <button className={reportStyles.kcAction}>{employee.action}</button>
            </div>
          ))}
        </div>
      </div>

      <div className={`${reportStyles.card} ${reportStyles.aiCard} animate-fadeInUp delay-300`}>
        <h3 className={reportStyles.cardTitle}>🤖 AI培训总结</h3>
        <p className={reportStyles.aiSummary}>
          今日训练完成率稳定，咨询诊断、体验转卡和B档案补全仍是主要弱项。建议店长明早用优秀话术做示范，并把AI运营只读信号中的“体验后未办卡”和“B档案缺失”转成两轮实战陪跑。
        </p>
      </div>

      <div className={`${reportStyles.card} animate-fadeInUp delay-300`}>
        <h3 className={reportStyles.cardTitle}>💡 AI培训建议</h3>
        <div className={reportStyles.suggestions}>
          {reportData.suggestions.map((item) => (
            <div key={item.title} className={reportStyles.suggestionItem}>
              <div className={reportStyles.sugInfo}>
                <span className={reportStyles.sugTitle}>{item.title}</span>
                <span className={reportStyles.sugDesc}>{item.desc}</span>
              </div>
              <button className={reportStyles.sugAction}>{item.link}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
