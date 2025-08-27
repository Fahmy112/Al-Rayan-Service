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
              <th>سعر المشتريات</th>
              <th>قطعة الغيار</th>
              <th>سعر القطعة</th>
              <th>الإجمالي</th>
              <th>الدفع</th>
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
                    <td><input value={editValue.purchasesCost || ""} onChange={e => onEditChange("purchasesCost", e.target.value)} style={{ width: 50 }} placeholder="سعر المشتريات" /></td>
                    <td><input value={editValue.purchasesCost || ""} onChange={e => onEditChange("purchasesCost", e.target.value)} style={{ width: 50 }} placeholder="سعر المشتريات" /></td>
                    <td colSpan={2}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Array.isArray(editValue.usedSpares) && editValue.usedSpares.map((row: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: 7, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                            <select value={row.category || ""} onChange={e => {
                              const updated = [...editValue.usedSpares!];
                              updated[idx].category = e.target.value;
                              updated[idx].id = "";
                              updated[idx].name = "";
                              updated[idx].price = 0;
                              updated[idx].qty = 1;
                              setEditValue(ev => ({ ...ev, usedSpares: updated }));
                            }} style={{ minWidth: 120, fontSize: 15 }}>
                              <option value="">اختر القسم...</option>
                              {["زيت الماتور","زيت الفتيس","فلتر الهواء","قلب طلمبة البنزين","فلتر زيت","فلتر تكييف","فلتر زيت فتيس","ماء تبريد","بوجيهات","فلتر بنزين","حشو فلتر زيت","موبينة","مواسير و اخري"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select value={row.id} onChange={e => {
                              const found = spares.find(sp => sp._id === e.target.value);
                              const updated = [...editValue.usedSpares!];
                              if (found) {
                                updated[idx] = { ...updated[idx], id: found._id, name: found.name, price: found.price };
                              } else if (e.target.value === "custom") {
                                updated[idx] = { ...updated[idx], id: "custom", name: row.name || "", price: 0 };
                              } else {
                                updated[idx] = { ...updated[idx], id: e.target.value, name: "", price: 0 };
                              }
                              setEditValue(ev => ({ ...ev, usedSpares: updated }));
                            }} style={{ minWidth: 120, fontSize: 15 }} disabled={!row.category}>
                              <option value="">اختر القطعة...</option>
                              {spares.filter(sp => sp.category === row.category).map(sp => <option value={sp._id} key={sp._id} disabled={sp.quantity === 0}>
                                {sp.name} (سعر: {sp.price}ج - متوفر: {sp.quantity})
                              </option>)}
                              <option value="custom">اسم مخصص (غير مسجل في المخزون)</option>
                            </select>
                            {row.id === "custom" && (
                              <input
                                type="text"
                                style={{ width: 120, fontSize: 15, zIndex: 9999, pointerEvents: "auto" }}
                                value={row.name}
                                onChange={e => {
                                  const updated = [...editValue.usedSpares!];
                                  updated[idx].name = e.target.value;
                                  setEditValue(ev => ({ ...ev, usedSpares: updated }));
                                }}
                                placeholder="اسم القطعة (خاص)"
                                readOnly={false}
                                disabled={false}
                              />
                            )}
                            <input
                              type="number"
                              min={1}
                              style={{ width: 65, fontSize: 15 }}
                              value={row.qty}
                              onChange={e => {
                                const updated = [...editValue.usedSpares!];
                                updated[idx].qty = Math.max(1, parseInt(e.target.value) || 1);
                                setEditValue(ev => ({ ...ev, usedSpares: updated }));
                              }}
                              placeholder="الكمية"
                              max={row.id !== "custom" ? (spares.find(sp => sp._id === row.id)?.quantity || "") : ""}
                            />
                            <input
                              type="number"
                              min={0}
                              style={{ width: 80, fontSize: 15 }}
                              value={row.price}
                              onChange={e => {
                                const updated = [...editValue.usedSpares!];
                                updated[idx].price = parseFloat(e.target.value) || 0;
                                setEditValue(ev => ({ ...ev, usedSpares: updated }));
                              }}
                              placeholder="سعر القطعة"
                            />
                            <span style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>
                              {row.price ? (row.price * row.qty) + ' ج' : ''}
                            </span>
                            <button type="button" style={{ background: '#e34a4a', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, marginRight: 0, marginTop: 5, cursor: 'pointer', fontSize: 15 }} onClick={() => {
                              setEditValue(ev => ({ ...ev, usedSpares: ev.usedSpares?.filter((_, i) => i !== idx) }));
                            }}>حذف</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          setEditValue(ev => ({ ...ev, usedSpares: [...(ev.usedSpares || []), { id: "", name: "", price: 0, qty: 1, category: "" }] }));
                        }} style={{ background: '#286090', color: '#fff', padding: '10px 0', fontWeight: 'bold', borderRadius: 7, marginTop: 5, border: 'none', fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', width: '100%' }}>+ إضافة قطعة جديدة</button>
                        <div style={{ fontWeight: 600, margin: '14px 0 0', fontSize: 16 }}>
                          الإجمالي:&nbsp;
                          <span style={{ fontWeight: 'bold', color: '#286090', background: '#f0f4ff', borderRadius: 6, padding: '4px 16px' }}>{
                            (Array.isArray(editValue.usedSpares) ? editValue.usedSpares.reduce((sum: number, row: any) => sum + (row.price * row.qty), 0) : 0)
                            + (parseFloat(editValue.repairCost || "0"))
                            + (parseFloat(editValue.purchasesCost || "0"))
                          }</span> جنيه
                        </div>
                      </div>
                    </td>
                    <td><input value={editValue.total || ""} onChange={e => onEditChange("total", e.target.value)} style={{ width: 60 }} /></td>
                    <td>
                      <select value={editValue.paymentStatus || "لم يتم"} onChange={e => onEditChange("paymentStatus", e.target.value as any)} style={{ fontSize: 15 }}>
                        <option value="لم يتم">لم يتم</option>
                        <option value="نقدي">نقدي</option>
                        <option value="تحويل">تحويل</option>
                      </select>
                    </td>
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
                    <td data-label="سعر المشتريات">{r.purchasesCost || "-"}</td>
                    <td data-label="سعر المشتريات">{r.purchasesCost || "-"}</td>
                    <td data-label="قطعة الغيار">{
                      Array.isArray((r as any).usedSpares) && (r as any).usedSpares.length
                        ? (r as any).usedSpares.map((x: any) => `${x.id === "custom" ? x.name : x.name}${x.qty > 1 ? `×${x.qty}` : ''}`).join(', ')
                        : r.sparePartName || "-"
                    }</td>
                    <td data-label="سعر القطعة">{
                      Array.isArray((r as any).usedSpares) && (r as any).usedSpares.length
                        ? (r as any).usedSpares.reduce((sum: number, x: any) => sum + (parseFloat(x.price || 0) * parseFloat(x.qty || 1)), 0)
                        : r.sparePartPrice || "-"
                    }</td>
                    <td data-label="الإجمالي"><span className={styles.total}>{
                      (Array.isArray(r.usedSpares) ? r.usedSpares.reduce((sum: number, row: any) => sum + (row.price * row.qty), 0) : 0)
                      + (parseFloat(r.repairCost || "0"))
                      + (parseFloat(r.purchasesCost || "0"))
                    }</span></td>
                    <td data-label="الدفع">
                      {r.paymentStatus === "نقدي" && <span title="نقدي" style={{fontSize:22}}>💵</span>}
                      {r.paymentStatus === "تحويل" && <span title="تحويل" style={{fontSize:22}}>💳</span>}
                      {(!r.paymentStatus || r.paymentStatus === "لم يتم") && <span title="لم يتم الدفع" style={{fontSize:22}}>⏳</span>}
                    </td>
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
