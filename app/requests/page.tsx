"use client";
import { useEffect, useState } from "react";
import styles from "./requests.module.css";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

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
  purchasesCost?: string;
  sparePartName?: string;
  sparePartPrice?: string;
  total?: string;
  status: string;
  createdAt: number;
  usedSpares?: any[];
  paymentStatus?: "نقدي" | "تحويل" | "لم يتم";
};

type EditState = null | { id: string; values: Partial<Request> };

export default function RequestsPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [edit, setEdit] = useState<EditState>(null);
  const [editValue, setEditValue] = useState<Partial<Request>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string>("");
  const [spares, setSpares] = useState<Spare[]>([]);
  const [spareWarning, setSpareWarning] = useState<string | undefined>(undefined);
  
  async function fetchRequests() {
    setLoading(true);
    const res = await fetch("/api/requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  }

  async function fetchSpares() {
    const res = await fetch("/api/spares");
    const data = await res.json();
    setSpares(data);
    if (data.some((s: Spare) => s.quantity <= 5)) {
      setSpareWarning(
        "تنبيه: بعض قطع الغيار منخفضة الكمية: " +
        data.filter((s: Spare) => s.quantity <= 5).map((s: Spare) => `${s.name} (${s.quantity})`).join('، ')
      );
    } else {
      setSpareWarning(undefined);
    }
  }

  useEffect(() => {
    fetchRequests();
    fetchSpares();
  }, []);

  function filterRequests() {
    let filtered = [...requests];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(r =>
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
    if (dateFilter) {
      const selectedTs = new Date(dateFilter);
      filtered = filtered.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === selectedTs.getFullYear() &&
          d.getMonth() === selectedTs.getMonth() &&
          d.getDate() === selectedTs.getDate();
      });
    }
    if (monthFilter) {
      const [yy, mm] = monthFilter.split("-").map(Number);
      filtered = filtered.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === yy && (d.getMonth() + 1) === mm;
      });
    }
    return filtered;
  }

  function startEdit(row: Request) {
    setEdit({ id: row._id, values: row });
    setEditValue({ ...row });
    setShowEditModal(true);
  }

  function cancelEdit() {
    setEdit(null);
    setShowEditModal(false);
  }

  function onEditChange(field: keyof Request, value: any) {
    setEditValue(ev => ({ ...ev, [field]: value }));
  }
  
  async function handleEditSave() {
    if (!edit) return;
    setEditLoading(true);
    setEditSuccess("");
    try {
      const res = await fetch("/api/requests/" + edit.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValue)
      });
      if (res.ok) {
        setEditSuccess("تم حفظ التعديلات بنجاح!");
        setEdit(null);
        fetchRequests();
      } else {
        setEditSuccess("حدث خطأ أثناء الحفظ!");
      }
    } catch {
      setEditSuccess("حدث خطأ أثناء الحفظ!");
    }
    setEditLoading(false);
  }

  async function updateStatus(idx: number, newStatus: string) {
    const req = filtered[idx];
    await fetch("/api/requests/" + req._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchRequests();
  }

  async function updateNote(idx: number) {
    const req = filtered[idx];
    const note = prompt("أدخل ملاحظة:", req.notes || '');
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
    const req = filtered[idx];
    if (window.confirm("تأكيد حذف الطلب؟")) {
      await fetch("/api/requests/" + req._id, { method: "DELETE" });
      fetchRequests();
    }
  }

  const filtered = filterRequests();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles["page-title"]}>متابعة الطلبات</h1>
      {spareWarning && <div style={{ color: '#e34a4a', margin: '12px 0 14px', background: '#fff3f2', border: '1px solid #ffb0b0', borderRadius: 6, padding: 10, textAlign: 'center', fontWeight: 'bold' }}>{spareWarning}</div>}
      {editSuccess && <div style={{ color: '#27853d', margin: '10px 0', background: '#eaffea', border: '1px solid #b0ffb0', borderRadius: 6, padding: 8, textAlign: 'center', fontWeight: 'bold' }}>{editSuccess}</div>}
      <input
        type="text"
        placeholder="بحث: العميل، الهاتف، السيارة، النموذج، النمرة، المشكلة، الملاحظات..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={styles.searchbar}
      />
      <div style={{display:'flex', gap:12, marginTop:10, marginBottom:18}}>
        <div>
          <label style={{ fontWeight: 'bold', marginLeft: 8 }}>اليوم:</label>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', marginLeft: 8 }}>الشهر:</label>
          <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
        </div>
      </div>
      {loading ? <div>...يتم التحميل</div> : (
        <div style={{display:'flex',flexWrap:'wrap',gap:'18px',justifyContent:'center'}}>
          {filtered.map((r, i) => (
            <div key={r._id} className={styles['request-card']}>
              <div className={styles['request-title']}>{r.customerName}</div>
              <div className={styles['request-row']}>📞 {r.phone}</div>
              <div className={styles['request-row']}>🚗 {r.carType || "-"} | {r.carModel || "-"} | {r.carNumber || "-"}</div>
              <div className={styles['request-row']}>الكيلومتر: {r.kilometers || "-"}</div>
              <div className={styles['request-row']}>المشكلة: {r.problem}</div>
              <div className={styles['request-row']}>ملاحظات: {r.notes || "-"}</div>
              <div className={styles['request-row']}>الصيانة: {r.repairCost || "-"} جنيه</div>
              <div className={styles['request-row']}>سعر المشتريات: {r.purchasesCost || "-"} جنيه</div>
              <div className={styles['request-row']}>قطع الغيار: {Array.isArray(r.usedSpares) && r.usedSpares.length > 0 ? r.usedSpares.map((x: any) => `${x.id === "custom" ? x.name : x.name}${x.qty > 1 ? `×${x.qty}` : ''}`).join(', ') : r.sparePartName || "-"}</div>
              <div className={styles['request-row']}>سعر القطعة: {r.sparePartPrice || "-"}</div>
              <div className={styles['request-row']}>الإجمالي: <span className={styles.total}>{r.total || "-"}</span></div>
              <div className={styles['request-row']}>الدفع: {r.paymentStatus || "-"}</div>
              <div className={styles['request-row']}>الحالة:
                <select value={r.status} onChange={e => updateStatus(i, e.target.value)} className={styles["status-select"]}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </div>
              <div className={styles['request-actions']}>
                <button className={styles["action-btn"]} onClick={() => deleteRequest(i)}>حذف</button>
                <button className={styles["note-btn"]} style={{ background: '#286090' }} onClick={() => startEdit(r)}>تعديل</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{textAlign:'center',padding:22,width:'100%'}}>لا يوجد نتائج مطابقة</div>
          )}
        </div>
      )}
      {showEditModal && edit && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0008',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:12,padding:24,minWidth:350,maxWidth:600,boxShadow:'0 2px 12px #bbc6dd44',position:'relative'}}>
            <button onClick={cancelEdit} style={{position:'absolute',top:10,right:10,fontSize:22,fontWeight:'bold',background:'none',border:'none',color:'#e34a4a',cursor:'pointer'}}>×</button>
            <h2 style={{color:'#286090',marginBottom:18}}>تعديل الطلب</h2>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <label>اسم العميل:<input value={editValue.customerName || ""} onChange={e => onEditChange("customerName", e.target.value)} placeholder="ادخل اسم العميل" /></label>
              <label>رقم الهاتف:<input value={editValue.phone || ""} onChange={e => onEditChange("phone", e.target.value)} placeholder="ادخل رقم الهاتف" /></label>
              <label>نوع السيارة:<input value={editValue.carType || ""} onChange={e => onEditChange("carType", e.target.value)} placeholder="ادخل نوع السيارة" /></label>
              <label>موديل السيارة:<input value={editValue.carModel || ""} onChange={e => onEditChange("carModel", e.target.value)} placeholder="ادخل موديل السيارة" /></label>
              <label>نمرة السيارة:<input value={editValue.carNumber || ""} onChange={e => onEditChange("carNumber", e.target.value)} placeholder="ادخل نمرة السيارة" /></label>
              <label>الكيلومتر:<input value={editValue.kilometers || ""} onChange={e => onEditChange("kilometers", e.target.value)} placeholder="ادخل الكيلومتر" /></label>
              <label>المشكلة:<input value={editValue.problem || ""} onChange={e => onEditChange("problem", e.target.value)} placeholder="وصف المشكلة" /></label>
              <label>ملاحظات:<input value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} placeholder="ملاحظات إضافية" /></label>
              <label>تكلفة الصيانة:<input value={editValue.repairCost || ""} onChange={e => onEditChange("repairCost", e.target.value)} placeholder="تكلفة الصيانة بالجنيه" /></label>
              <label>سعر المشتريات:<input value={editValue.purchasesCost || ""} onChange={e => onEditChange("purchasesCost", e.target.value)} placeholder="سعر المشتريات بالجنيه" /></label>
              <label>الإجمالي:<input value={editValue.total || ""} onChange={e => onEditChange("total", e.target.value)} placeholder="الإجمالي بالجنيه" /></label>
              <label>الحالة:
                <select value={editValue.status || "جديد"} onChange={e => onEditChange("status", e.target.value)}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
              </label>
              <label>الدفع:
                <select value={editValue.paymentStatus || "لم يتم"} onChange={e => onEditChange("paymentStatus", e.target.value as any)}>
                  <option value="لم يتم">لم يتم</option>
                  <option value="نقدي">نقدي</option>
                  <option value="تحويل">تحويل</option>
                </select>
              </label>
            </div>
            <button onClick={handleEditSave} disabled={editLoading} style={{background:'#27853d',color:'#fff',fontWeight:'bold',padding:'10px 22px',borderRadius:8,marginTop:18,fontSize:17,border:'none',cursor:'pointer'}}>{editLoading ? "...يتم الحفظ" : "حفظ التعديلات"}</button>
          </div>
        </div>
      )}
    </div>
  );
}