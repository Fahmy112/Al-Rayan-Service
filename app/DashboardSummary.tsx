"use client";
import { useEffect, useState } from "react";
import React from "react";

export default function DashboardSummary() {
  const [summary, setSummary] = useState({ new: 0, inprogress: 0, done: 0 });
  const [error, setError] = useState("");

  async function fetchSummary() {
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error(`API status ${res.status}`);
      const requests = await res.json();
      setSummary({
        new: requests.filter((r: any) => r.status === "جديد").length,
        inprogress: requests.filter((r: any) => r.status === "تحت الإصلاح").length,
        done: requests.filter((r: any) => r.status === "تم التسليم").length,
      });
      setError("");
    } catch (err) {
      setError("API connection error");
      setSummary({ new: 0, inprogress: 0, done: 0 });
    }
  }

  useEffect(() => {
    fetchSummary();
    const timer = setInterval(fetchSummary, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section>
      <h2 style={{fontSize: '1.2em'}}>ملخص الحالات</h2>
      {error && <div style={{color:'red'}}>خطأ في جلب البيانات: {error}</div>}
      <div style={{display: 'flex', gap: 20, marginTop: 16, marginBottom: 20}}>
        <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
          <div style={{fontWeight: 700}}>الطلبات الجديدة</div>
          <div style={{color: '#286090', fontSize: 32}}>{summary.new}</div>
        </div>
        <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
          <div style={{fontWeight: 700}}>تحت الإصلاح</div>
          <div style={{color: '#286090', fontSize: 32}}>{summary.inprogress}</div>
        </div>
        <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
          <div style={{fontWeight: 700}}>تم التسليم</div>
          <div style={{color: '#286090', fontSize: 32}}>{summary.done}</div>
        </div>
      </div>
    </section>
  );
}
