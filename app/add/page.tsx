"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRequest() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, phone, deviceType, problem })
    });
    setLoading(false);
    setSuccess(true);
    setCustomerName(""); setPhone(""); setDeviceType(""); setProblem("");
    setTimeout(() => { setSuccess(false); router.push("/"); }, 1200);
  }

  return (
    <div style={{direction: "rtl", fontFamily: 'Cairo, Arial', maxWidth: 600, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 12}}>
      <h1 style={{color: '#286090'}}>إضافة طلب صيانة جديد</h1>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <label>اسم العميل:<input required value={customerName} onChange={e=>setCustomerName(e.target.value)} /></label>
        <label>رقم الهاتف:<input required value={phone} onChange={e=>setPhone(e.target.value)} /></label>
        <label>نوع الجهاز:<input required value={deviceType} onChange={e=>setDeviceType(e.target.value)} /></label>
        <label>المشكلة:<textarea required value={problem} onChange={e=>setProblem(e.target.value)} /></label>
        <button type="submit" disabled={loading} style={{background:'#286090',color:'#fff',padding:10,marginTop:10}}>{loading ? "...يتم الحفظ" : "إضافة الطلب"}</button>
        {success && <div style={{color:'#27853d'}}>تم الحفظ بنجاح</div>}
      </form>
    </div>
  );
}
