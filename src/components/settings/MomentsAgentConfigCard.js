'use client';

import { useState } from 'react';
import { useToast } from '@/components/common/Toast';
import styles from '@/app/(dashboard)/me/page.module.css';

export default function MomentsAgentConfigCard({ onBack }) {
  const toast = useToast();
  
  const [enabled, setEnabled] = useState(true);
  const [dailyVolume, setDailyVolume] = useState(3);
  
  const [ratios, setRatios] = useState({
    ip: 30, // 训练提醒
    industry: 40, // 知识答疑
    franchise: 30, // 作业点评
  });

  const [timeSlots, setTimeSlots] = useState({
    '07:00-08:30': false,
    '11:30-13:00': false,
    '17:30-19:00': false,
    '20:00-22:00': true,
  });

  const [likeComment, setLikeComment] = useState({
    workTime: '24h', 
    autoLike: true,
    autoComment: true,
    style: 'enthusiastic', 
  });

  const [followEnabled, setFollowEnabled] = useState(false);

  const save = () => {
    toast.success('群组智能体配置已保存');
    if (onBack) onBack();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 启用群组智能体 */}
      <div className={styles.sectionCard} style={{ padding: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>启用群组智能体</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>AI 将根据权限和群规自动处理培训群消息</div>
          </div>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="momentsEnabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <label htmlFor="momentsEnabled"></label>
          </div>
        </div>

        {/* 每日群内主动提醒条数 */}
        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#3B82F6', marginBottom: '16px' }}>每日群内主动提醒条数: {dailyVolume}</div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={dailyVolume}
            onChange={(e) => setDailyVolume(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#10B981' }}
          />
        </div>

        {/* 群内消息类型比例 */}
        <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#10B981', marginBottom: '16px' }}>群内消息类型比例</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎯 训练任务提醒</span>
                <span style={{ color: '#10B981', fontWeight: '600' }}>{ratios.ip}%</span>
              </div>
              <input type="range" min="0" max="100" value={ratios.ip} onChange={(e) => setRatios({...ratios, ip: Number(e.target.value)})} style={{ width: '100%', accentColor: '#10B981' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📚 知识答疑与学习卡</span>
                <span style={{ color: '#10B981', fontWeight: '600' }}>{ratios.industry}%</span>
              </div>
              <input type="range" min="0" max="100" value={ratios.industry} onChange={(e) => setRatios({...ratios, industry: Number(e.target.value)})} style={{ width: '100%', accentColor: '#10B981' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>💼 作业点评与优秀案例</span>
                <span style={{ color: '#10B981', fontWeight: '600' }}>{ratios.franchise}%</span>
              </div>
              <input type="range" min="0" max="100" value={ratios.franchise} onChange={(e) => setRatios({...ratios, franchise: Number(e.target.value)})} style={{ width: '100%', accentColor: '#10B981' }} />
            </div>
          </div>
        </div>

        {/* 群组提醒时段 */}
        <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#D97706', marginBottom: '16px' }}>群组提醒时段</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {Object.keys(timeSlots).map(time => (
              <label key={time} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={timeSlots[time]} 
                  onChange={(e) => setTimeSlots({...timeSlots, [time]: e.target.checked})}
                  style={{ accentColor: '#10B981' }}
                />
                {time}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 群内回复设置 */}
      <div className={styles.sectionCard} style={{ padding: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span style={{ color: '#10B981' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>群内回复设置</div>
        </div>

        <div style={{ background: '#FAF5FF', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#A855F7', marginBottom: '12px' }}>工作时间</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setLikeComment({...likeComment, workTime: '24h'})}
              style={{ background: likeComment.workTime === '24h' ? '#10B981' : '#fff', color: likeComment.workTime === '24h' ? '#fff' : 'var(--color-text-secondary)', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {likeComment.workTime === '24h' && <span>✓</span>} 24小时
            </button>
            <button 
              onClick={() => setLikeComment({...likeComment, workTime: 'custom'})}
              style={{ background: likeComment.workTime === 'custom' ? '#10B981' : '#fff', color: likeComment.workTime === 'custom' ? '#fff' : 'var(--color-text-secondary)', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
            >
              时间段
            </button>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>被@时自动回复</div>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="autoLike" checked={likeComment.autoLike} onChange={(e) => setLikeComment({...likeComment, autoLike: e.target.checked})} />
            <label htmlFor="autoLike"></label>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>作业提交后自动点评</div>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="autoComment" checked={likeComment.autoComment} onChange={(e) => setLikeComment({...likeComment, autoComment: e.target.checked})} />
            <label htmlFor="autoComment"></label>
          </div>
        </div>

        <div style={{ background: '#FAF5FF', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#A855F7', marginBottom: '12px' }}>回复风格</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setLikeComment({...likeComment, style: 'enthusiastic'})}
              style={{ background: likeComment.style === 'enthusiastic' ? '#10B981' : '#fff', color: likeComment.style === 'enthusiastic' ? '#fff' : 'var(--color-text-secondary)', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {likeComment.style === 'enthusiastic' && <span>✓</span>} 热情鼓励
            </button>
            <button 
              onClick={() => setLikeComment({...likeComment, style: 'expert'})}
              style={{ background: likeComment.style === 'expert' ? '#10B981' : '#fff', color: likeComment.style === 'expert' ? '#fff' : 'var(--color-text-secondary)', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {likeComment.style === 'expert' && <span>✓</span>} AI教练
            </button>
            <button 
              onClick={() => setLikeComment({...likeComment, style: 'partner'})}
              style={{ background: likeComment.style === 'partner' ? '#10B981' : '#fff', color: likeComment.style === 'partner' ? '#fff' : 'var(--color-text-secondary)', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {likeComment.style === 'partner' && <span>✓</span>} 店长助手
            </button>
          </div>
        </div>
      </div>

      {/* 群消息处理方式 */}
      <div className={styles.sectionCard} style={{ padding: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span style={{ color: '#10B981' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>不同人群消息处理</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>启用角色化处理</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>员工问题只答本人权限，店长可生成群任务，总部可发布跨店TrainingSkill</div>
          </div>
          <div className={styles.toggleSwitch}>
            <input type="checkbox" id="followEnabled" checked={followEnabled} onChange={(e) => setFollowEnabled(e.target.checked)} />
            <label htmlFor="followEnabled"></label>
          </div>
        </div>
      </div>

      <button className={styles.agentSaveBtn} onClick={save}>保存设置</button>
    </div>
  );
}
