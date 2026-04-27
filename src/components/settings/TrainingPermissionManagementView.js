'use client';

import { useMemo, useState } from 'react';
import { roleWorkspace } from '@/lib/trainingData';
import settingsStyles from '@/app/(dashboard)/me/page.module.css';
import practiceStyles from '@/app/(dashboard)/practice/page.module.css';

const ROLE_COLORS = {
  employee: '#0ea5e9',
  manager: '#10b981',
  hq: '#8b5cf6',
};

const ROLE_COLUMNS = [
  { key: 'employee', label: '员工' },
  { key: 'manager', label: '店长' },
  { key: 'hq', label: '总部' },
];

function TagList({ items, color }) {
  return (
    <div className={practiceStyles.leadTags} style={{ marginBottom: 0 }}>
      {items.map((item) => (
        <span
          key={item}
          className={practiceStyles.tagChip}
          style={{ borderColor: `${color}33`, color, background: `${color}10` }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ScopeSettingRow({ title, meta, items, color, status = '已启用' }) {
  return (
    <section
      className={settingsStyles.brandFieldGroup}
      style={{
        marginBottom: 0,
        background: '#fff',
        border: `1px solid ${color}22`,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.035)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className={settingsStyles.brandFieldTitle} style={{ marginBottom: 4 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: color,
                display: 'inline-flex',
              }}
            />
            {title}
          </div>
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: 12, lineHeight: 1.6 }}>
            {meta}
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            padding: '3px 9px',
            borderRadius: 999,
            background: `${color}12`,
            color,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>
      <TagList items={items} color={color} />
    </section>
  );
}

function MatrixRow({ row, role, color }) {
  return (
    <section
      className={settingsStyles.brandFieldGroup}
      style={{
        marginBottom: 0,
        background: '#fff',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <div className={settingsStyles.brandFieldTitle} style={{ marginBottom: 5 }}>
            {row.dimension}
          </div>
          <div style={{ color: 'var(--color-text-primary)', fontSize: 13, fontWeight: 750, lineHeight: 1.5 }}>
            当前{role.label}：{row[role.key]}
          </div>
        </div>
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 999,
            background: `${color}12`,
            color,
            fontSize: 11,
            fontWeight: 750,
            whiteSpace: 'nowrap',
          }}
        >
          当前视图
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {ROLE_COLUMNS.map((item) => {
          const tone = ROLE_COLORS[item.key];
          const active = item.key === role.key;
          return (
            <div
              key={item.key}
              style={{
                minHeight: 48,
                padding: '8px 10px',
                borderRadius: 10,
                border: `1px solid ${active ? `${tone}33` : 'rgba(148, 163, 184, 0.14)'}`,
                background: active ? `${tone}0F` : '#f8fafc',
              }}
            >
              <div style={{ color: active ? tone : 'var(--color-text-tertiary)', fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.45 }}>
                {row[item.key]}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function TrainingPermissionManagementView() {
  const [activeRole, setActiveRole] = useState(roleWorkspace.current_role);
  const role = useMemo(
    () => roleWorkspace.identities.find((item) => item.key === activeRole) || roleWorkspace.identities[0],
    [activeRole],
  );
  const color = ROLE_COLORS[role.key] || '#2563eb';

  return (
    <>
      <div className={settingsStyles.agentFormContainer}>
        <div className={settingsStyles.viewTabs}>
          {roleWorkspace.identities.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${settingsStyles.viewTab} ${activeRole === item.key ? settingsStyles.viewTabActive : ''}`}
              style={activeRole === item.key ? { background: ROLE_COLORS[item.key] } : undefined}
              onClick={() => setActiveRole(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className={settingsStyles.brandFieldGroup}
          style={{
            background: '#fff',
            border: `1px solid ${color}22`,
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.035)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <div className={settingsStyles.brandFieldTitle} style={{ marginBottom: 4 }}>
                {role.label}权限摘要
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {role.headline}。权限范围：{role.scope}；当前身份：{role.owner}。
              </div>
            </div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: `${color}12`,
                color,
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {role.owner}
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {role.stats.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                }}
              >
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 11, fontWeight: 750, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color, fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <TagList items={role.responsibilities} color={color} />
        </div>
      </div>

      <div className={settingsStyles.agentFormContainer}>
        <div className={settingsStyles.sectionBanner}>
          <span>页面、AI指令与越权限制</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ScopeSettingRow
            title={`${role.label}可见工作范围`}
            meta="页面与数据范围"
            items={role.visible}
            color="#2563eb"
          />
          <ScopeSettingRow
            title={`${role.label}可用AI指令`}
            meta="AI培训中枢按角色返回不同范围"
            items={role.ai_commands}
            color="#10b981"
          />
          <ScopeSettingRow
            title={`${role.label}禁止越权动作`}
            meta="系统拦截并进入审计"
            items={role.blocked}
            color="#ef4444"
            status="强拦截"
          />
        </div>
      </div>

      <div className={settingsStyles.agentFormContainer}>
        <div className={settingsStyles.sectionBanner}>
          <span>权限矩阵</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roleWorkspace.permission_matrix.map((row) => (
            <MatrixRow key={row.dimension} row={row} role={role} color={color} />
          ))}
        </div>
      </div>

      <div className={settingsStyles.agentFormContainer}>
        <div className={settingsStyles.sectionBanner}>
          <span>审核与责任动作</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roleWorkspace.approvals.map((item) => (
            <section
              key={item.title}
              className={settingsStyles.brandFieldGroup}
              style={{
                marginBottom: 0,
                background: '#fff',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className={settingsStyles.brandFieldTitle} style={{ marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                    {item.role}责任
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: '#fff7ed',
                    color: '#f97316',
                    fontSize: 11,
                    fontWeight: 750,
                  }}
                >
                  {item.status}
                </span>
              </div>
            </section>
          ))}
        </div>
      </div>

      <button className={settingsStyles.agentSaveBtn}>保存权限配置</button>
    </>
  );
}
