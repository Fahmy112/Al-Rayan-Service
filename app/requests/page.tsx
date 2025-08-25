"use client";
import { useEffect, useState } from "react";

const statuses = ["جديد", "تحت الإصلاح", "تم التسليم"];

type Request = {
  _id: string;
  customerName: string;
  phone: string;
  deviceType: string;
  problem: string;
  notes?: string;
  status: string;
  createdAt: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    setLoading(true);
    const res = await fetch("/api/requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => { fetchRequests(); }, []);

  async function updateStatus(idx: number, newStatus: string) {
    const req = requests[idx];
    await fetch("/api/requests/" + req._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchRequests();
  }

  async function updateNote(idx: number) {
    const req = requests[idx];
    const note = prompt("أدخل ملاحظة:", req.notes||'');
    if (note !== null) {
      await fetch("/api/requests/" + req._id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note })
      });
      fetchRequests();
    }
  }

  async function deleteRequest(idx: number) {
    const req = requests[idx];
    if(window.confirm("تأكيد حذف الطلب؟")) {
      await fetch("/api/requests/" + req._id, { method: "DELETE" });
      fetchRequests();
    }
  }

  return (
    <div style={{direction:"rtl", fontFamily:'Cairo, Arial', maxWidth:880, margin:'40px auto', background:'#fff', padding:24, borderRadius:12}}>
      <h1 style={{color:'#286090'}}>متابعة الطلبات</h1>
      {loading ? <div>...يتم التحميل</div> : (
      <table style={{width:'100%', borderCollapse:'collapse', background:'#f7fafd'}}>
        <thead>
          <tr style={{background:'#e7ecfa'}}>
            <th>اسم العميل</th>
            <th>رقم الهاتف</th>
            <th>نوع الجهاز</th>
            <th>المشكلة</th>
            <th>الحالة</th>
            <th>ملاحظات</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
        {requests.map((r, i) => (
            <tr key={r._id}>
              <td>{r.customerName}</td>
              <td>{r.phone}</td>
              <td>{r.deviceType}</td>
              <td>{r.problem}</td>
              <td>
                <select value={r.status} onChange={e=>updateStatus(i, e.target.value)}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </td>
              <td><button onClick={()=>updateNote(i)}>ملاحظات</button> {r.notes||"-"}</td>
              <td><button style={{background:'#e34a4a',color:'#fff'}} onClick={()=>deleteRequest(i)}>حذف</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}
