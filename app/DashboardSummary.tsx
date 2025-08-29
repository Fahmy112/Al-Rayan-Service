"use client";
import { useEffect, useState } from "react";
import React from "react";

export default function DashboardSummary() {
  const [summary, setSummary] = useState({ new: 0, inprogress: 0, done: 0, unpaid: 0 });
  const [error, setError] = useState("");
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [showInprogress, setShowInprogress] = useState(false);
  const [unpaidRequests, setUnpaidRequests] = useState<any[]>([]);
  const [inprogressRequests, setInprogressRequests] = useState<any[]>([]);

  async function fetchSummary() {
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error(`API status ${res.status}`);
      const requests = await res.json();
      setSummary({
        new: requests.filter((r: any) => r.status === "جديد").length,
        inprogress: requests.filter((r: any) => r.status === "تحت الإصلاح").length,
        done: requests.filter((r: any) => r.status === "تم التسليم").length,
        unpaid: requests.filter((r: any) => !r.paymentStatus || r.paymentStatus === "لم يتم").length,
      });
      setUnpaidRequests(requests.filter((r: any) => !r.paymentStatus || r.paymentStatus === "لم يتم"));
      setInprogressRequests(requests.filter((r: any) => r.status === "تحت الإصلاح"));
      setError("");
    } catch (err) {
      setError("API connection error");
      setSummary({ new: 0, inprogress: 0, done: 0, unpaid: 0 });
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
        <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center', cursor: 'pointer', border: showInprogress ? '2px solid #328bcf' : undefined}}
          onClick={() => setShowInprogress(v => !v)}>
          <div style={{fontWeight: 700, color: '#328bcf'}}>تحت الإصلاح</div>
          <div style={{color: '#286090', fontSize: 32}}>{summary.inprogress}</div>
        </div>
        <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
          <div style={{fontWeight: 700}}>تم التسليم</div>
          <div style={{color: '#286090', fontSize: 32}}>{summary.done}</div>
        </div>
        <div style={{background: '#ffeaea', borderRadius: 8, padding: 18, width: 140, textAlign: 'center', cursor: 'pointer', border: '2px solid #e34a4a'}} onClick={() => setShowUnpaid(u => !u)}>
          <div style={{fontWeight: 700, color: '#e34a4a'}}>طلبات غير مدفوعة</div>
          <div style={{color: '#e34a4a', fontSize: 32}}>{summary.unpaid} <span style={{fontSize:22}}>⏳</span></div>
        </div>
      </div>
      {showUnpaid && (
        <div style={{background:'#fff3f2', border:'1px solid #e34a4a', borderRadius:8, padding:16, marginTop:10}}>
          <h3 style={{color:'#e34a4a', marginBottom:10}}>الطلبات غير المدفوعة</h3>
          {unpaidRequests.length === 0 ? <div>لا يوجد طلبات غير مدفوعة</div> : (
            <table style={{width:'100%', fontSize:15}}>
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>الهاتف</th>
                  <th>السيارة</th>
                  <th>الإجمالي</th>
                  <th>المبلغ المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {unpaidRequests.map((r, i) => (
                  <tr key={r._id} style={{background:i%2?'#fff':'#ffeaea'}}>
                    <td>{r.customerName}</td>
                    <td>{r.phone}</td>
                    <td>{r.carType} {r.carModel}</td>
                    <td>{r.total || '-'}</td>
                    <td style={{color:'#e34a4a',fontWeight:'bold'}}>{r.remainingAmount || '-'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showInprogress && (
        <div style={{background:'#f0f4ff', border:'1px solid #328bcf', borderRadius:8, padding:16, marginTop:10}}>
          <h3 style={{color:'#328bcf', marginBottom:10}}>الطلبات تحت الإصلاح</h3>
          {inprogressRequests.length === 0 ? <div>لا يوجد طلبات تحت الإصلاح</div> : (
            <table style={{width:'100%', fontSize:15}}>
              <thead>
                <tr>
                  <th>اسم العميل</th>
                  <th>الهاتف</th>
                  <th>السيارة</th>
                  <th>الإجمالي</th>
                  <th>المبلغ المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {inprogressRequests.map((r, i) => (
                  <tr key={r._id} style={{background:i%2?'#fff':'#e6f0ff'}}>
                    <td>{r.customerName}</td>
                    <td>{r.phone}</td>
                    <td>{r.carType} {r.carModel}</td>
                    <td>{r.total || '-'}</td>
                    <td style={{color:'#328bcf',fontWeight:'bold'}}>{r.remainingAmount || '-'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
