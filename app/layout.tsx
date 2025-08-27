import Link from "next/link";
import "./globals.css";
import styles from "./sidebar.module.css";
import { useState } from "react";

export const metadata = {
  title: "AlRayan Auto Service",
  description: "لوحة تحكم مركز صيانة وخدمة العملاء"
};

const navLinks = [
  { href: "/", icon: "🏠", name: "الرئيسية" },
  { href: "/add", icon: "➕", name: "إضافة طلب جديد" },
  { href: "/requests", icon: "📋", name: "متابعة الطلبات" },
];
const bottomLinks = [
  { href: "/spares", icon: "🛒", name: "إدارة قطع الغيار / المخزون" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "Cairo, Arial, sans-serif", background: "#f4f6fb" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside className={styles.sidebar + (sidebarOpen ? ' ' + styles.open : '')}>
            <button
              type="button"
              aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
              onClick={() => setSidebarOpen(o => !o)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                background: '#328bcf',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 13px',
                fontSize: 22,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002',
                display: 'block'
              }}
            >{sidebarOpen ? '×' : '☰'}</button>
            <div className={styles['sidebar-header']}>
              <span role="img" aria-label="gear">⚙️&nbsp;</span>
              <span style={{verticalAlign:'middle'}}>   AlRayan Auto Service</span>
            </div>
            <nav className={styles['sidebar-nav']}>
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={styles['sidebar-link']}>
                  <span className="icon">{link.icon}</span>
                  <span className={sidebarOpen ? styles['show-link-name'] : undefined}>{link.name}</span>
                </Link>
              ))}
              <div className={styles['sidebar-divider']} />
              {bottomLinks.map(link => (
                <Link key={link.href} href={link.href} className={styles['sidebar-link']}>
                  <span className="icon">{link.icon}</span>
                  <span className={sidebarOpen ? styles['show-link-name'] : undefined}>{link.name}</span>
                </Link>
              ))}
            </nav>
            <div style={{flex:1}}></div>
            <div className={styles['sidebar-footer']}>
              © {new Date().getFullYear()} AlRayan Service
            </div>
          </aside>
          <main style={{ flex: 1, padding: '0 0 0 0', background: "#f4f6fb" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
