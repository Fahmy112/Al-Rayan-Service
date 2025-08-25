import Link from "next/link";
import "../public/globals.css";

export const metadata = {
  title: "نظام إدارة مركز الصيانة",
  description: "لوحة تحكم مركز صيانة وخدمة العملاء"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "Cairo, Arial, sans-serif", background: "#f4f6fb" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside style={{ width: 220, background: '#242c3a', color: '#fff', padding: 0, display:'flex', flexDirection: 'column', boxShadow:'0 0 12px #0002' }}>
            <div style={{ textAlign: 'center', padding: '32px 0 22px', fontWeight: 900, fontSize: 22, letterSpacing: 1, borderBottom: '1px solid #29354b' }}>مركز الصيانة</div>
            <nav style={{ display:'flex', flexDirection:'column', gap: 8, marginTop:20, padding:24, fontSize:18 }}>
              <Link href="/" style={{ color: '#fff', textDecoration: 'none', padding: '10px 0', borderRadius: 6, display:'block' }}>الرئيسية</Link>
              <Link href="/add" style={{ color: '#fff', textDecoration: 'none', padding: '10px 0', borderRadius: 6, display:'block' }}>إضافة طلب جديد</Link>
              <Link href="/requests" style={{ color: '#fff', textDecoration: 'none', padding: '10px 0', borderRadius: 6, display:'block' }}>متابعة الطلبات</Link>
            </nav>
            <div style={{flex:1}}></div>
            <div style={{ fontSize: 12, textAlign: 'center', padding: 10, borderTop:'1px solid #29354b', opacity:.8}}>© {new Date().getFullYear()} AlRayan Service</div>
          </aside>
          <main style={{ flex: 1, padding: '0 0 0 0', background: "#f4f6fb" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
