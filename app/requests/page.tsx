"use client";
import { useEffect, useState } from "react";
import styles from "./requests.module.css";

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
    <div className={styles.wrapper}>
      <h1 className={styles["page-title"]}>متابعة الطلبات</h1>
      <input
        type="text"
        placeholder="بحث: العميل، الهاتف، السيارة، النموذج، النمرة، المشكلة، الملاحظات..."
        value={query}
        onChange={e=>setQuery(e.target.value)}
        className={styles.searchbar}
      />
      {loading ? <div>...يتم التحميل</div> : (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>اسم العميل</th>
            <th>رقم الهاتف</th>
            <th>نوع السيارة</th>
            <th>موديل</th>
            <th>نمرة السيارة</th>
            <th>الكيلومتر</th>
            <th>المشكلة</th>
            <th>الملاحظات</th>
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
              <td data-label="اسم العميل">{r.customerName}</td>
              <td data-label="رقم الهاتف">{r.phone}</td>
              <td data-label="نوع السيارة">{r.carType||"-"}</td>
              <td data-label="موديل السيارة">{r.carModel||"-"}</td>
              <td data-label="نمرة السيارة">{r.carNumber||"-"}</td>
              <td data-label="الكيلومتر">{r.kilometers||"-"}</td>
              <td data-label="المشكلة">{r.problem}</td>
              <td data-label="الملاحظات">{r.notes||"-"}</td>
              <td data-label="تكلفة الصيانة">{r.repairCost||"-"}</td>
              <td data-label="قطعة الغيار">{r.sparePartName||"-"}</td>
              <td data-label="سعر القطعة">{r.sparePartPrice||"-"}</td>
              <td data-label="الإجمالي"><span className={styles.total}>{r.total||"-"}</span></td>
              <td data-label="الحالة">
                <select value={r.status} onChange={e=>updateStatus(i, e.target.value)} className={styles["status-select"]}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </td>
              <td data-label="ملاحظات إضافية"><button className={styles["note-btn"]} onClick={()=>updateNote(i)}>ملاحظا��</button> {r.notes||"-"}</td>
              <td data-label="إجراءات"><button className={styles["action-btn"]} onClick={()=>deleteRequest(i)}>حذف</button></td>
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
