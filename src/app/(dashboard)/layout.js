'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import ChatPanel from '@/components/layout/ChatPanel';
import CustomerDetail from '@/components/customer/CustomerDetail';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import AppSwitcher from '@/components/layout/AppSwitcher';
import useStore from '@/lib/store';

const TAB_META = {
  tasks: {
    title: '任务',
    subtitle: '今日任务、补练与群组教学',
    route: '/tasks',
    iconColor: '#f43f5e',
  },
  practice: {
    title: '实战',
    subtitle: '核心训练、实战陪跑与复盘',
    route: '/practice',
    iconColor: '#0ea5e9',
  },
  ai: {
    title: 'AI培训',
    subtitle: '自然语言训练指挥中枢',
    route: '/ai',
    iconColor: '#2563eb',
  },
  roles: {
    title: '角色',
    subtitle: '角色化培训工作台',
    route: '/roles',
    iconColor: '#84cc16',
  },
  me: {
    title: '我的',
    subtitle: 'Skill、权限、AI运营系统接入',
    route: '/me',
    iconColor: '#8b5cf6',
  },
};

function resolveCurrentTab(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const segment = segments[0] === 'train' ? segments[1] || 'tasks' : segments[0] || 'tasks';

  if (segment === 'tasks') return 'tasks';
  if (segment === 'practice' || segment === 'field') return 'practice';
  if (segment === 'ai' || segment === 'reports') return 'ai';
  if (segment === 'roles' || segment === 'approvals') return 'roles';
  if (segment === 'me' || segment === 'settings' || segment === 'materials') return 'me';

  return 'tasks';
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showAIPanelMobile, setShowAIPanelMobile] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobileViewport(media.matches);
    sync();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  const baseTab = useMemo(() => resolveCurrentTab(pathname), [pathname]);
  const currentTab = showAIPanelMobile ? 'ai' : baseTab;
  const currentMeta = TAB_META[currentTab];

  const selectedLeadId = useStore((s) => s.selectedLeadId);
  const leads = useStore((s) => s.leads);
  const allMessages = useStore((s) => s.allMessages);
  const clearSelection = useStore((s) => s.clearSelection);
  const activeWorkspace = useStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useStore((s) => s.setActiveWorkspace);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [selectedLeadId, leads]);

  const selectedMessages = useMemo(() => {
    if (!selectedLeadId) return [];
    return allMessages[selectedLeadId] || [];
  }, [selectedLeadId, allMessages]);

  const showRightPanelMobile = Boolean(selectedLeadId) || currentTab === 'ai';
  const hideMobileAiTopBar = isMobileViewport && currentTab === 'ai' && !selectedLead;

  const handleNavigate = (route) => {
    clearSelection();
    setShowDetailPanel(false);
    setShowAIPanelMobile(false);
    router.push(route);
  };

  const handleWorkspaceSwitch = (workspace) => {
    setActiveWorkspace(workspace);
    handleNavigate('/tasks');
  };

  const renderBottomNav = (extraClassName = '') => (
    <nav className={`${styles.bottomNav} ${extraClassName}`.trim()}>
      <button
        onClick={() => handleNavigate('/tasks')}
        className={`${styles.navItem} ${currentTab === 'tasks' ? styles.active : ''}`}
      >
        <span className={styles.navIcon} style={{ color: '#f43f5e', opacity: currentTab === 'tasks' ? 1 : 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 4h6"/>
            <rect x="5" y="3.5" width="14" height="17" rx="3"/>
            <path d="M8.5 9h7"/>
            <path d="M8.5 12.5h5"/>
            <path d="m8.5 16.5 1.6 1.5 3.4-4"/>
          </svg>
        </span>
        <span className={styles.navLabel} style={{ color: '#f43f5e', opacity: currentTab === 'tasks' ? 1 : 0.6 }}>任务</span>
      </button>
      <button
        onClick={() => handleNavigate('/practice')}
        className={`${styles.navItem} ${currentTab === 'practice' ? styles.active : ''}`}
      >
        <span className={styles.navIcon} style={{ color: '#0ea5e9', opacity: currentTab === 'practice' ? 1 : 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7"/>
            <circle cx="12" cy="12" r="2.7"/>
            <path d="M12 5V3"/>
            <path d="M19 12h2"/>
            <path d="m14.2 9.8 3.5-3.5"/>
          </svg>
        </span>
        <span className={styles.navLabel} style={{ color: '#0ea5e9', opacity: currentTab === 'practice' ? 1 : 0.6 }}>实战</span>
      </button>
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            setShowAIPanelMobile(true);
            clearSelection();
          } else {
            handleNavigate('/ai');
          }
        }}
        className={`${styles.navItem} ${currentTab === 'ai' ? styles.active : ''}`}
      >
        <span className={styles.navIcon} style={{ color: '#2563eb', opacity: currentTab === 'ai' ? 1 : 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 5.5h9a3.5 3.5 0 0 1 3.5 3.5v4.5a3.5 3.5 0 0 1-3.5 3.5H10l-4 3v-3.3A3.5 3.5 0 0 1 3 13.3V9a3.5 3.5 0 0 1 3.5-3.5Z"/>
            <path d="M8.5 10h6"/>
            <path d="M8.5 13h4"/>
            <path d="m17.5 3 .5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z"/>
          </svg>
        </span>
        <span className={styles.navLabel} style={{ color: '#2563eb', opacity: currentTab === 'ai' ? 1 : 0.6 }}>AI培训</span>
      </button>
      <button
        onClick={() => handleNavigate('/roles')}
        className={`${styles.navItem} ${currentTab === 'roles' ? styles.active : ''}`}
      >
        <span className={styles.navIcon} style={{ color: '#84cc16', opacity: currentTab === 'roles' ? 1 : 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="14" rx="3"/>
            <circle cx="10" cy="11" r="2"/>
            <path d="M7.4 16a3.1 3.1 0 0 1 5.2 0"/>
            <path d="M14.5 10h2.7"/>
            <path d="M14.5 14h2.2"/>
          </svg>
        </span>
        <span className={styles.navLabel} style={{ color: '#84cc16', opacity: currentTab === 'roles' ? 1 : 0.6 }}>角色</span>
      </button>
      <button
        onClick={() => handleNavigate('/me')}
        className={`${styles.navItem} ${currentTab === 'me' ? styles.active : ''}`}
      >
        <span className={styles.navIcon} style={{ color: '#8b5cf6', opacity: currentTab === 'me' ? 1 : 0.6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h9"/>
            <path d="M17 7h3"/>
            <circle cx="15" cy="7" r="2"/>
            <path d="M4 12h3"/>
            <path d="M11 12h9"/>
            <circle cx="9" cy="12" r="2"/>
            <path d="M4 17h11"/>
            <path d="M19 17h1"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </span>
        <span className={styles.navLabel} style={{ color: '#8b5cf6', opacity: currentTab === 'me' ? 1 : 0.6 }}>我的</span>
      </button>
    </nav>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppSwitcher />
      <div className={styles.dashboardLayout} style={{ flex: 1, minHeight: 0 }}>
      <div className={styles.accountsBar}>
        <div className={styles.accountsTop}>
          <div
            className={`${styles.accountBadge} ${activeWorkspace === 'main' ? styles.accountActive : ''}`}
            title="总控面板"
            onClick={() => handleWorkspaceSwitch('main')}
            style={{ background: '#2563eb' }}
          >
            <span className={styles.mainAccountIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
          </div>
          <div className={styles.mainAccountDivider} />
          <div
            className={`${styles.accountBadge} ${activeWorkspace === 'sub_1' ? styles.accountActive : ''}`}
            title="新天地店"
            onClick={() => handleWorkspaceSwitch('sub_1')}
            style={{ background: '#722ED1' }}
          >
            <span className={styles.mainAccountIcon} style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>新店</span>
            <div className={`${styles.accountStatus} ${styles.statusOnline}`} />
          </div>
          <div
            className={`${styles.accountBadge} ${activeWorkspace === 'sub_2' ? styles.accountActive : ''}`}
            title="徐家汇店"
            onClick={() => handleWorkspaceSwitch('sub_2')}
            style={{ background: '#FA8C16' }}
          >
            <span className={styles.mainAccountIcon} style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>徐店</span>
            <div className={`${styles.accountStatus} ${styles.statusOnline}`} />
          </div>
          <div
            className={`${styles.accountBadge} ${activeWorkspace === 'sub_3' ? styles.accountActive : ''}`}
            title="虹桥店"
            onClick={() => handleWorkspaceSwitch('sub_3')}
            style={{ background: '#13C2C2' }}
          >
            <span className={styles.mainAccountIcon} style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>虹店</span>
            <div className={`${styles.accountStatus} ${styles.statusOnline}`} />
          </div>
          <button className={styles.addAccountBtn} title="添加门店">+</button>
        </div>
        <div className={styles.accountsBottom}>
          <NotificationDropdown />
          <button onClick={() => handleNavigate('/me')} className={styles.bottomIcon} title="我的">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={`${styles.leftPanel} ${showRightPanelMobile ? styles.leftPanelHiddenMobile : ''}`}>
          <div className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <div className={styles.topBarAvatar} style={{ background: `linear-gradient(135deg, ${currentMeta.iconColor}, #0f172a)` }}>
                {currentMeta.title.slice(0, 2)}
              </div>
              <span className={styles.topBarName}>{currentMeta.title}</span>
              <span className={styles.topBarSource}>{currentMeta.subtitle}</span>
            </div>
          </div>

          <div className={styles.leftPanelContent}>{children}</div>

          {!isMobileViewport ? renderBottomNav(styles.panelBottomNav) : null}
        </div>

        <div className={`${styles.rightPanel} ${showRightPanelMobile ? styles.rightPanelVisibleMobile : ''}`}>
          {!hideMobileAiTopBar ? (
            <div className={styles.rightTopBar}>
              {selectedLead ? (
                <>
                  <button className={styles.backBtnIOS} onClick={() => { clearSelection(); setShowDetailPanel(false); }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span className={styles.backBtnText}>返回</span>
                  </button>
                  <div className={styles.rightTopBarCustomer}>
                    <span className={styles.rightTopBarTitle}>{selectedLead.name}</span>
                    <span className={styles.rightTopBarSub}>{selectedLead.company} · {selectedLead.city}</span>
                  </div>
                  <button className={styles.profileBtn} title="训练画像" onClick={() => setShowDetailPanel(!showDetailPanel)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className={styles.profileBtnText}>训练画像</span>
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: 44 }}>
                    {(showAIPanelMobile || currentTab === 'ai') && (
                      <button className={`${styles.backBtnIOS} ${styles.backBtnMobileOnly}`} onClick={() => {
                        setShowAIPanelMobile(false);
                        if (pathname === '/ai' || pathname === '/train/ai') router.push('/tasks');
                      }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        <span className={styles.backBtnText}>返回</span>
                      </button>
                    )}
                  </div>
                  <span className={styles.rightTopBarTitle}>{currentTab === 'ai' ? 'AI培训中枢' : 'AI智能培训中心'}</span>
                  <div style={{ width: 44 }} />
                </>
              )}
            </div>
          ) : null}
          <ChatPanel
            key={selectedLeadId || `command-${currentTab}`}
            leadName={selectedLead?.name}
            leadId={selectedLeadId}
            initialMessages={selectedMessages}
          />
        </div>

        {showDetailPanel && selectedLead && (
          <div className={styles.detailBackdrop} onClick={() => setShowDetailPanel(false)} />
        )}

        {selectedLead && showDetailPanel && (
          <div className={styles.detailPanelWrapper}>
            <CustomerDetail leadId={selectedLeadId} onClose={() => setShowDetailPanel(false)} />
          </div>
        )}
      </div>
      {isMobileViewport ? renderBottomNav(styles.mobileBottomNav) : null}
      </div>
    </div>
  );
}
