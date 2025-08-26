import Link from "next/link";
import "./globals.css";
import styles from "./sidebar.module.css";

export const metadata = {
  title: "نظام إدارة مركز الصيانة",
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
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "Cairo, Arial, sans-serif", background: "#f4f6fb" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside className={styles.sidebar}>
            <div className={styles['sidebar-header']}>
              <span role="img" aria-label="gear">⚙️&nbsp;</span>
              <span style={{verticalAlign:'middle'}}>نظام إدارة مركز الصيانة</span>
            </div>
            <nav className={styles['sidebar-nav']}>
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={styles['sidebar-link']}>
                  <span className="icon">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className={styles['sidebar-divider']} />
              {bottomLinks.map(link => (
                <Link key={link.href} href={link.href} className={styles['sidebar-link']}>
                  <span className="icon">{link.icon}</span>
                  <span>{link.name}</span>
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
