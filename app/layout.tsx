import "./globals.css";
import Sidebar from "./components/Sidebar";

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
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "Cairo, Arial, sans-serif", background: "#f4f6fb" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '0 0 0 0', background: "#f4f6fb" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
