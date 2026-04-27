import "./globals.css";
import { ToastProvider } from "@/components/common/Toast";

export const metadata = {
  title: "AI 培训 — 智能培训管理系统",
  description: "美容美业中小企业 AI 自主培训引擎，聚合任务、实战、角色权限、Skill 和审批治理",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
