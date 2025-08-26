"use client";
import Link from "next/link";
import DashboardSummary from "./DashboardSummary";

export default function Home() {
  return (
    <div style={{direction: "rtl", fontFamily: "Cairo, Arial", maxWidth: 800, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 12}}>
      <h1 style={{color: '#286090'}}>نظام إدارة مركز الصيانة</h1>
      <nav style={{marginBottom: 24}}>
        <Link href="/add" style={{marginLeft: 20, color: '#286090'}}>إضافة طلب صيانة جديد</Link>
        <Link href="/requests" style={{color: '#286090'}}>متابعة الطلبات الجارية</Link>
      </nav>
      <DashboardSummary />
    </div>
  );
}
