"use client";
import { useEffect, useState } from "react";

const statuses = ["جديد", "تحت الإصلاح", "تم التسليم"];

type Request = {
  _id: string;
  customerName: string;
  phone: string;
  carType?: string;
  carModel?: string;
  carNumber?: string;
  kilometers?: string;
  problem: string;
  notes?: string;
  repairCost?: string;
  sparePartName?: string;
  sparePartPrice?: string;
  total?: string;
  status: string;
  createdAt: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function fetchRequests() {
    setLoading(true);
    const res = await fetch("/api/requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => { fetchRequests(); }, []);

  function filterRequests() {
    if (!query.trim()) return requests;
    const q = query.trim().toLowerCase();
    return requests.filter(r =>
      r.customerName?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.carType?.toLowerCase().includes(q) ||
      r.carModel?.toLowerCase().includes(q) ||
      r.carNumber?.toLowerCase().includes(q) ||
      (r.kilometers?.toString() ?? '').includes(q) ||
      r.problem?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q) ||
      r.sparePartName?.toLowerCase().includes(q)
    );
  }

  async function updateStatus(idx: number, newStatus: string) {
    const req = filterRequests()[idx];
    await fetch("/api/requests/" + req._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchRequests();
  }

  async function updateNote(idx: number) {
    const req = filterRequests()[idx];
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
    const req = filterRequests()[idx];
    if(window.confirm("تأكيد حذف الطلب؟")) {
      await fetch("/api/requests/" + req._id, { method: "DELETE" });
      fetchRequests();
    }
  }

  const filtered = filterRequests();

  return (
    <div style={{direction:"rtl", fontFamily:'Cairo, Arial', maxWidth:1200, margin:'40px auto', background:'#fff', padding:20, borderRadius:12}}>
      <h1 style={{color:'#286090'}}>متابعة الطلبات</h1>
      <input
        type="text"
        placeholder="بحث: العميل، الهاتف، السيارة، النموذج، النمرة، المشكلة، الملاحظات، الخ..."
        value={query}
        onChange={e=>setQuery(e.target.value)}
        style={{padding:8, width:'100%', marginBottom:18, borderRadius:7, border:'1px solid #d5dbe6', fontSize:15}}
      />
      {loading ? <div>...يتم التحميل</div> : (
      <table style={{width:'100%', borderCollapse:'collapse', background:'#f7fafd', fontSize:15}}>
        <thead>
          <tr style={{background:'#e7ecfa'}}>
            <th>اسم العميل</th>
            <th>رقم الهاتف</th>
            <th>نوع السيارة</th>
            <th>موديل</th>
            <th>نمرة السيارة</th>
            <th>الكيلومتر</th>
            <th>المشكلة</th>
            <th>الملاح��ات</th>
            <th>الصيانة (جنيه)</th>
            <th>قطعة الغيار</th>
            <th>سعر القطعة</th>
            <th>الإجمالي</th>
            <th>الحالة</th>
            <th>ملاحظات إضافية</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
        {filtered.map((r, i) => (
            <tr key={r._id}>
              <td>{r.customerName}</td>
              <td>{r.phone}</td>
              <td>{r.carType||"-"}</td>
              <td>{r.carModel||"-"}</td>
              <td>{r.carNumber||"-"}</td>
              <td>{r.kilometers||"-"}</td>
              <td>{r.problem}</td>
              <td>{r.notes||"-"}</td>
              <td>{r.repairCost||"-"}</td>
              <td>{r.sparePartName||"-"}</td>
              <td>{r.sparePartPrice||"-"}</td>
              <td>{r.total||"-"}</td>
              <td>
                <select value={r.status} onChange={e=>updateStatus(i, e.target.value)}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </td>
              <td><button onClick={()=>updateNote(i)}>ملاحظات</button> {r.notes||"-"}</td>
              <td><button style={{background:'#e34a4a',color:'#fff'}} onClick={()=>deleteRequest(i)}>حذف</button></td>
            </tr>
          ))}
        {filtered.length === 0 && !loading && (
          <tr><td colSpan={15} style={{textAlign:'center',padding:22}}>لا يوجد نتائج مطابقة</td></tr>
        )}
        </tbody>
      </table>
      )}
    </div>
  );
}
