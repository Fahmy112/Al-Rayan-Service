"use client";
import { useEffect, useState } from "react";
import styles from "./requests.module.css";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
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
  sparePartName?: string;
  sparePartPrice?: string;
  total?: string;
  status: string;
  createdAt: number;
  usedSpares?: any[];
};

type EditState = null | { id: string; values: Partial<Request> };

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>(""); // فلتر اليوم
  const [monthFilter, setMonthFilter] = useState<string>(""); // فلتر الشهر (yyyy-mm)
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
    } else setSpareWarning(undefined);
  }

  useEffect(() => {
    fetchRequests();
    fetchSpares();
  }, []);

  function filterRequests() {
    let filtered = [...requests];
    // بحث نصي
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
    // فلتر اليوم
    if (dateFilter) {
      const selectedTs = new Date(dateFilter);
      filtered = filtered.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === selectedTs.getFullYear() &&
          d.getMonth() === selectedTs.getMonth() &&
          d.getDate() === selectedTs.getDate();
      });
    }
    // فلتر الشهر
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
  }

  function cancelEdit() {
    setEdit(null);
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
    const req = filterRequests()[idx];
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
                {edit?.id === r._id ? (
                  <>
                    <td><input value={editValue.customerName || ""} onChange={e => onEditChange("customerName", e.target.value)} style={{ width: 80 }} /></td>
                    <td><input value={editValue.phone || ""} onChange={e => onEditChange("phone", e.target.value)} style={{ width: 80 }} /></td>
                    <td><input value={editValue.carType || ""} onChange={e => onEditChange("carType", e.target.value)} style={{ width: 60 }} /></td>
                    <td><input value={editValue.carModel || ""} onChange={e => onEditChange("carModel", e.target.value)} style={{ width: 60 }} /></td>
                    <td><input value={editValue.carNumber || ""} onChange={e => onEditChange("carNumber", e.target.value)} style={{ width: 60 }} /></td>
                    <td><input value={editValue.kilometers || ""} onChange={e => onEditChange("kilometers", e.target.value)} style={{ width: 50 }} /></td>
                    <td><input value={editValue.problem || ""} onChange={e => onEditChange("problem", e.target.value)} style={{ width: 80 }} /></td>
                    <td><input value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} style={{ width: 70 }} /></td>
                    <td><input value={editValue.repairCost || ""} onChange={e => onEditChange("repairCost", e.target.value)} style={{ width: 50 }} /></td>
                    <td>
                      {/* عمود قطع الغيار غير قابل للتعديل (عرض فقط) */}
                      {
                        Array.isArray(editValue.usedSpares) && editValue.usedSpares.length
                          ? (editValue.usedSpares as any[]).map((x: any) => `${x.name}${x.qty > 1 ? `×${x.qty}` : ''}`).join(', ')
                          : editValue.sparePartName || "-"
                      }
                    </td>
                    <td>
                      {
                        Array.isArray(editValue.usedSpares) && editValue.usedSpares.length
                          ? (editValue.usedSpares as any[]).reduce((sum: number, x: any) => sum + (parseFloat(x.price || 0) * parseFloat(x.qty || 1)), 0)
                          : editValue.sparePartPrice || "-"
                      }
                    </td>
                    <td><input value={editValue.total || ""} onChange={e => onEditChange("total", e.target.value)} style={{ width: 60 }} /></td>
                    <td>
                      <select value={editValue.status || "جديد"} onChange={e => onEditChange("status", e.target.value)} className={styles["status-select"]}>
                        {statuses.map(st => <option key={st}>{st}</option>)}
                      </select>
                    </td>
                    <td><input value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} style={{ width: 60 }} /></td>
                    <td>
                      <button className={styles["note-btn"]} style={{ background: '#27853d' }} onClick={handleEditSave} type="button" disabled={editLoading}>{editLoading ? "...يتم الحفظ" : "حفظ"}</button>
                      <button className={styles["action-btn"]} style={{ background: '#888' }} onClick={cancelEdit} type="button" disabled={editLoading}>إلغاء</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td data-label="اسم العميل">{r.customerName}</td>
                    <td data-label="رقم الهاتف">{r.phone}</td>
                    <td data-label="نوع السيارة">{r.carType || "-"}</td>
                    <td data-label="موديل السيارة">{r.carModel || "-"}</td>
                    <td data-label="نمرة السيارة">{r.carNumber || "-"}</td>
                    <td data-label="الكيلومتر">{r.kilometers || "-"}</td>
                    <td data-label="المشكلة">{r.problem}</td>
                    <td data-label="الملاحظات">{r.notes || "-"}</td>
                    <td data-label="تكلفة الصيانة">{r.repairCost || "-"}</td>
                    <td data-label="قطعة الغيار">{
                      Array.isArray((r as any).usedSpares) && (r as any).usedSpares.length
                        ? (r as any).usedSpares.map((x: any) => `${x.name}${x.qty > 1 ? `×${x.qty}` : ''}`).join(', ')
                        : r.sparePartName || "-"
                    }</td>
                    <td data-label="سعر القطعة">{
                      Array.isArray((r as any).usedSpares) && (r as any).usedSpares.length
                        ? (r as any).usedSpares.reduce((sum: number, x: any) => sum + (parseFloat(x.price || 0) * parseFloat(x.qty || 1)), 0)
                        : r.sparePartPrice || "-"
                    }</td>
                    <td data-label="الإجمالي"><span className={styles.total}>{r.total || "-"}</span></td>
                    <td data-label="الحالة">
                      <select value={r.status} onChange={e => updateStatus(i, e.target.value)} className={styles["status-select"]}>
                        {statuses.map(st => <option key={st}>{st}</option>)}
                      </select>
                    </td>
                    <td data-label="ملاحظات إضافية"><button className={styles["note-btn"]} onClick={() => updateNote(i)}>ملاحظات</button> {r.notes || "-"}</td>
                    <td data-label="إجراءات"><button className={styles["action-btn"]} onClick={() => deleteRequest(i)}>حذف</button> <button className={styles["note-btn"]} style={{ background: '#286090' }} onClick={() => startEdit(r)}>تعديل</button></td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={15} style={{ textAlign: 'center', padding: 22 }}>لا يوجد نتائج مطابقة</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
