"use client";
import Link from "next/link";
import styles from "../sidebar.module.css";
import { useState } from "react";

const navLinks = [
  { href: "/", icon: "🏠", name: "الرئيسية" },
  { href: "/add", icon: "➕", name: "إضافة طلب جديد" },
  { href: "/requests", icon: "📋", name: "متابعة الطلبات" },
  { href: "/accounts", icon: "💰", name: "الحسابات" },
  { href: "/customers", icon: "👤", name: "قائمة العملاء" },
];
const bottomLinks = [
  { href: "/spares", icon: "🛒", name: "إدارة قطع الغيار / المخزون" },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* Always show toggle button on mobile */}
      <button
        type="button"
        aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
        onClick={() => setSidebarOpen(o => !o)}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 100,
          background: '#328bcf',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 28,
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 12px #0003',
          display: 'block'
        }}
      >{sidebarOpen ? '×' : '☰'}</button>
      {/* Sidebar overlay for mobile */}
      <aside className={styles.sidebar + (sidebarOpen ? ' ' + styles.open : '')} style={sidebarOpen ? {
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        zIndex: 99,
        boxShadow: '0 0 0 100vw #0005',
        transition: 'width .2s',
      } : {}}>
        <div className={styles['sidebar-header']}>
          <span role="img" aria-label="gear">⚙️&nbsp;</span>
          <span style={{verticalAlign:'middle'}}>   AlRayan Auto Service</span>
        </div>
        <nav className={styles['sidebar-nav']}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles['sidebar-link']} onClick={() => setSidebarOpen(false)}>
              <span className="icon">{link.icon}</span>
              <span className={sidebarOpen ? styles['show-link-name'] : undefined}>{link.name}</span>
            </Link>
          ))}
          <div className={styles['sidebar-divider']} />
          {bottomLinks.map(link => (
            <Link key={link.href} href={link.href} className={styles['sidebar-link']} onClick={() => setSidebarOpen(false)}>
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
    </>
  );
}
