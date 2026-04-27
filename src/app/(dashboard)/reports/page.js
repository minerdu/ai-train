import styles from '../field/page.module.css';
import { agentRuns, managerCards, practiceHistory, stores, trainingTasks } from '@/lib/trainingData';

const reportStats = [
  { label: '今日训练任务', value: trainingTasks.length },
  { label: '已完成任务', value: trainingTasks.filter((task) => task.status === 'completed').length },
  { label: '门店完成率', value: `${Math.round(managerCards.store_completion_rate * 100)}%` },
  { label: '待审批动作', value: managerCards.pending_approval_count },
  { label: 'AI运行中', value: agentRuns.length },
];

export default function ReportsPage() {
  return (
    <main className={styles.pageShell}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>Training Report</span>
          <h1 className={styles.heroTitle}>训练报告</h1>
          <p className={styles.heroDesc}>
            延续同一套报告入口与工作流卡片结构，汇总门店训练完成、员工弱项、AI自主任务和店长下一步动作。
          </p>
        </section>

        <section className={styles.statGrid}>
          {reportStats.map((item) => (
            <div key={item.label} className={styles.statCard}>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>门店训练概览</h2>
              <span className={styles.sectionMeta}>按门店查看本周训练完成与待补练情况</span>
            </div>
            <span className={styles.pill}>店长视图</span>
          </div>
          <div className={styles.moduleGrid}>
            {stores.map((store) => (
              <div key={store.store_id} className={styles.moduleCard}>
                <div className={styles.moduleTop}>
                  <h3 className={styles.moduleName}>{store.name}</h3>
                  <span className={styles.pill}>{store.city}</span>
                </div>
                <p className={styles.moduleDesc}>训练完成率 {Math.round(store.completion_rate * 100)}%，建议继续推进低分场景补练。</p>
                <div className={styles.metricRow}>
                  {managerCards.weak_scenarios.map((scenario) => (
                    <span key={scenario} className={styles.metricChip}>{scenario}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.splitGrid}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>AI建议</h2>
                <span className={styles.sectionMeta}>可一键转成任务或审批动作</span>
              </div>
            </div>
            <div className={styles.flatList}>
              {managerCards.ai_recommendations.map((item, index) => (
                <div key={item} className={styles.flatRow}>
                  <div className={styles.flatRowMain}>
                    <span className={styles.flatRowLabel}>建议 {index + 1}</span>
                    <span className={styles.flatRowTitle}>{item}</span>
                    <span className={styles.flatRowDesc}>来自训练任务、陪练评分和门店只读信号的综合判断。</span>
                  </div>
                  <div className={styles.flatRowMeta}>
                    <span className={styles.flatTag}>可执行</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>最近陪练记录</h2>
                <span className={styles.sectionMeta}>训练Tab同步数据</span>
              </div>
            </div>
            <div className={styles.timeline}>
              {practiceHistory.map((item) => (
                <div key={item.session_id} className={styles.timelineItem}>
                  <span className={styles.timelineTime}>{item.finished_at}</span>
                  <div className={styles.timelineBody}>
                    <span className={styles.timelineTitle}>{item.scenario}</span>
                    <span className={styles.timelineText}>{item.score}分 · {item.passed ? '已通关' : '需补练'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
