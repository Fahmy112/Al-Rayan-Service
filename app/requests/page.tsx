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
  purchasesRkha?: string;
  purchasesFady?: string;
  sparePartName?: string;
  sparePartPrice?: string;
  total?: string;
  status: string;
  createdAt: number;
  usedSpares?: any[];
  paymentStatus?: "نقدي" | "تحويل" | "لم يتم";
  remainingAmount?: string;
};

type EditState = null | { id: string; values: Partial<Request> };

export default function RequestsPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
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
    if (paymentFilter) {
      filtered = filtered.filter(r => r.paymentStatus === paymentFilter);
    }
      const [yy, mm] = monthFilter.split("-").map(Number);
      filtered = filtered.filter(r => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === yy && (d.getMonth() + 1) === mm;
      });
    }
    return filtered;
  }

  function startEdit(row: Request) {
    const editObj: Partial<Request> = { ...row };
    if (row.purchasesRkha !== undefined && row.purchasesRkha !== "") {
      editObj.purchasesRkha = row.purchasesRkha;
    }
    if (row.purchasesFady !== undefined && row.purchasesFady !== "") {
      editObj.purchasesFady = row.purchasesFady;
    }
    setEdit({ id: row._id, values: editObj });
    setEditValue(editObj);
    setShowEditModal(true);
  }

  function cancelEdit() {
    setEdit(null);
    setShowEditModal(false);
  }

  function onEditChange(field: keyof Request, value: any) {
    setEditValue(ev => {
      const updated = { ...ev, [field]: value };
      // حساب الإجمالي تلقائياً
      let total = 0;
      let hasValue = false;
      if (Array.isArray(updated.usedSpares)) {
        const sparesTotal = updated.usedSpares.reduce((sum, row) => sum + ((Number(row.price) || 0) * (Number(row.qty) || 1)), 0);
        total += sparesTotal;
        if (sparesTotal > 0) hasValue = true;
      }
      const repair = Number(updated.repairCost) || 0;
  const purchasesRkha = Number(updated.purchasesRkha) || 0;
  const purchasesFady = Number(updated.purchasesFady) || 0;
  total += repair;
  total += purchasesRkha;
  total += purchasesFady;
  if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0) hasValue = true;
  updated.total = hasValue ? String(total) : '';
  return updated;
    });
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
        setShowEditModal(false);
        // تحديث الطلب المعدل في القائمة مباشرة
        setRequests(reqs => reqs.map(r => r._id === edit.id ? { ...r, ...editValue } : r));
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
        <div>
          <label style={{ fontWeight: 'bold', marginLeft: 8 }}>طريقة الدفع:</label>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #bbc6d3',fontSize:15}}>
            <option value="">الكل</option>
            <option value="نقدي">نقدي</option>
            <option value="تحويل">تحويل</option>
            <option value="لم يتم">لم يتم</option>
          </select>
        </div>
      </div>
      {loading ? <div>...يتم التحميل</div> : (
        <div style={{display:'flex',flexWrap:'wrap',gap:'18px',justifyContent:'center'}}>
          {filtered.map((r, i) => (
            <div key={r._id} className={styles['request-card']} style={r.paymentStatus === "لم يتم" ? { border: '2px solid #e34a4a', background: '#fff3f2' } : {}}>
              {r.paymentStatus === "لم يتم" && (
                <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6,color:'#e34a4a',fontWeight:'bold'}}>
                  المبلغ المتبقي: {r.remainingAmount || "-"} جنيه
                </div>
              )}
              <div className={styles['request-title']} style={{fontSize:22,fontWeight:'bold',color:'#286090',marginBottom:8}}>{r.customerName}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>📞 {r.phone}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>🚗 {r.carType || "-"} | {r.carModel || "-"} | {r.carNumber || "-"}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>الكيلومتر: {r.kilometers || "-"}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>المشكلة: {r.problem}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>ملاحظات: {r.notes || "-"}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>الصيانة: {r.repairCost || "-"} جنيه</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                سعر المشتريات:
                رخا: {r.purchasesRkha !== undefined && r.purchasesRkha !== "" ? r.purchasesRkha : (r.purchasesCost || 0)}ج
                | الفادي: {r.purchasesFady !== undefined && r.purchasesFady !== "" ? r.purchasesFady : 0}ج
              </div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                قطع الغيار:
                {Array.isArray(r.usedSpares) && r.usedSpares.length > 0
                  ? r.usedSpares.map((x: any) => `${x.id === "custom" ? x.name : x.name}${x.qty > 1 ? `×${x.qty}` : ''}` ).join(', ')
                  : r.sparePartName || "-"}
              </div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                سعر القطع: {
                  Array.isArray(r.usedSpares) && r.usedSpares.length > 0
                    ? r.usedSpares.reduce((sum, x) => sum + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0)
                    : 0
                } ج
              </div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>الإجمالي: <span className={styles.total}>{r.total || "-"}</span></div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                الدفع: 
                {r.paymentStatus === "نقدي" && <span title="نقدي" style={{marginLeft:4}}>💵</span>}
                {r.paymentStatus === "تحويل" && <span title="تحويل" style={{marginLeft:4}}>💳</span>}
                {r.paymentStatus === "لم يتم" && <span title="لم يتم" style={{marginLeft:4}}>⏳</span>}
                <span style={{marginRight:4}}>{r.paymentStatus || "-"}</span>
              </div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>الحالة:
                <select value={r.status} onChange={e => updateStatus(i, e.target.value)} className={styles["status-select"]}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
                {r.paymentStatus === "لم يتم" && <span style={{color:'#e34a4a',fontWeight:'bold',marginRight:7}}>لم يتم الدفع</span>}
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
          <div style={{background:'#fff',borderRadius:12,padding:'12px 8px 8px 8px',minWidth:280,maxWidth:370,width:'100%',boxShadow:'0 2px 12px #bbc6dd44',position:'relative',maxHeight:'92vh',overflowY:'auto'}}>
            <button onClick={cancelEdit} style={{position:'sticky',top:0,right:0,left:'unset',fontSize:22,fontWeight:'bold',background:'none',border:'none',color:'#e34a4a',cursor:'pointer',zIndex:10,marginLeft:'auto',display:'block'}}>×</button>
            <h2 style={{color:'#286090',marginBottom:12,fontSize:18,textAlign:'center'}}>تعديل الطلب</h2>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              <label>اسم العميل:<input value={editValue.customerName || ""} onChange={e => onEditChange("customerName", e.target.value)} placeholder="ادخل اسم العميل" /></label>
              <label>رقم الهاتف:<input value={editValue.phone || ""} onChange={e => onEditChange("phone", e.target.value)} placeholder="ادخل رقم الهاتف" /></label>
              <label>نوع السيارة:<input value={editValue.carType || ""} onChange={e => onEditChange("carType", e.target.value)} placeholder="ادخل نوع السيارة" /></label>
              <label>موديل السيارة:<input value={editValue.carModel || ""} onChange={e => onEditChange("carModel", e.target.value)} placeholder="ادخل موديل السيارة" /></label>
              <label>نمرة السيارة:<input value={editValue.carNumber || ""} onChange={e => onEditChange("carNumber", e.target.value)} placeholder="ادخل نمرة السيارة" /></label>
              <label>الكيلومتر:<input value={editValue.kilometers || ""} onChange={e => onEditChange("kilometers", e.target.value)} placeholder="ادخل الكيلومتر" /></label>
              <label>المشكلة:<input value={editValue.problem || ""} onChange={e => onEditChange("problem", e.target.value)} placeholder="وصف المشكلة" /></label>
              <label>ملاحظات:<input value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} placeholder="ملاحظات إضافية" /></label>
              <label>تكلفة الصيانة:<input value={editValue.repairCost || ""} onChange={e => onEditChange("repairCost", e.target.value)} placeholder="تكلفة الصيانة بالجنيه" /></label>
                <label>المشكلة:<textarea value={editValue.problem || ""} onChange={e => onEditChange("problem", e.target.value)} placeholder="وصف المشكلة" style={{minHeight:60,width:'100%',resize:'vertical',fontSize:15}} /></label>
                <label>ملاحظات:<textarea value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} placeholder="ملاحظات إضافية" style={{minHeight:60,width:'100%',resize:'vertical',fontSize:15}} /></label>
                <label>تكلفة الصيانة:<input value={editValue.repairCost || ""} onChange={e => onEditChange("repairCost", e.target.value)} placeholder="تكلفة الصيانة بالجنيه" /></label>
                <label>مشتريات رخا:<input value={editValue.purchasesRkha || ""} onChange={e => onEditChange("purchasesRkha", e.target.value)} placeholder="سعر مشتريات رخا بالجنيه" /></label>
                <label>مشتريات الفادي:<input value={editValue.purchasesFady || ""} onChange={e => onEditChange("purchasesFady", e.target.value)} placeholder="سعر مشتريات الفادي بالجنيه" /></label>
                <label>المبلغ المتبقي:<input value={editValue.remainingAmount || ""} onChange={e => onEditChange("remainingAmount", e.target.value)} placeholder="المبلغ المتبقي بالجنيه" /></label>
              <div style={{margin:'10px 0',padding:'10px',background:'#f8f9fd',borderRadius:8}}>
                <div style={{fontWeight:'bold',marginBottom:7}}>قطع الغيار:</div>
                {Array.isArray(editValue.usedSpares) && editValue.usedSpares.map((row, idx) => (
                  <div key={idx} style={{display:'flex',gap:7,marginBottom:7,alignItems:'center',flexWrap:'wrap'}}>
                    <select value={row.category || ""} onChange={e => {
                      const updated = [...(editValue.usedSpares || [])];
                      updated[idx].category = e.target.value;
                      updated[idx].id = "";
                      updated[idx].name = "";
                      updated[idx].price = 0;
                      updated[idx].qty = 1;
                      setEditValue(ev => ({ ...ev, usedSpares: updated }));
                    }} style={{minWidth:120,fontSize:15}}>
                      <option value="">اختر القسم...</option>
                      {["زيت الماتور","زيت الفتيس","فلتر الهواء","قلب طلمبة البنزين","فلتر زيت","فلتر تكييف","فلتر زيت فتيس","ماء تبريد","بوجيهات","فلتر بنزين","حشو فلتر زيت","موبينة","مواسير و اخري"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={row.id || ""} onChange={e => {
                      const found = spares.find(sp => sp._id === e.target.value);
                      const updated = [...(editValue.usedSpares || [])];
                      if (found) {
                        updated[idx] = { ...updated[idx], id: found._id, name: found.name, price: found.price };
                      } else if (e.target.value === "custom") {
                        updated[idx] = { ...updated[idx], id: "custom", name: row.name || "", price: 0 };
                      } else {
                        updated[idx] = { ...updated[idx], id: e.target.value, name: "", price: 0 };
                      }
                      setEditValue(ev => ({ ...ev, usedSpares: updated }));
                    }} style={{minWidth:120,fontSize:15}} disabled={!row.category}>
                      <option value="">اختر القطعة...</option>
                      {spares.filter(sp => sp.category === row.category).map(sp => <option value={sp._id} key={sp._id} disabled={sp.quantity === 0}>{sp.name} (سعر: {sp.price}ج - متوفر: {sp.quantity})</option>)}
                      <option value="custom">اسم مخصص (غير مسجل في المخزون)</option>
                    </select>
                    {row.id === "custom" && (
                      <input type="text" style={{width:120,fontSize:15}} value={row.name} onChange={e => {
                        const updated = [...(editValue.usedSpares || [])];
                        updated[idx].name = e.target.value;
                        setEditValue(ev => ({ ...ev, usedSpares: updated }));
                      }} placeholder="اسم القطعة (خاص)" />
                    )}
                    <input type="number" min={1} style={{width:65,fontSize:15}} value={row.qty} onChange={e => {
                      const updated = [...(editValue.usedSpares || [])];
                      updated[idx].qty = Number(e.target.value);
                      setEditValue(ev => {
                        const newVal = { ...ev, usedSpares: updated };
                        // إعادة حساب الإجمالي
                        let total = 0;
                        let hasValue = false;
                        if (Array.isArray(newVal.usedSpares)) {
                          const sparesTotal = newVal.usedSpares.reduce((sum, r) => sum + ((Number(r.price) || 0) * (Number(r.qty) || 1)), 0);
                          total += sparesTotal;
                          if (sparesTotal > 0) hasValue = true;
                        }
                        const repair = Number(newVal.repairCost) || 0;
                        const purchasesRkha = Number(newVal.purchasesRkha) || 0;
                        const purchasesFady = Number(newVal.purchasesFady) || 0;
                        total += repair;
                        total += purchasesRkha;
                        total += purchasesFady;
                        if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0) hasValue = true;
                        newVal.total = hasValue ? String(total) : '';
                        return newVal;
                      });
                    }} placeholder="الكمية" max={row.id !== "custom" ? (spares.find(sp => sp._id === row.id)?.quantity || '') : ''} />
                    <input type="number" min={0} style={{width:80,fontSize:15}} value={row.price} onChange={e => {
                      const updated = [...(editValue.usedSpares || [])];
                      updated[idx].price = Number(e.target.value);
                      setEditValue(ev => {
                        const newVal = { ...ev, usedSpares: updated };
                        // إعادة حساب الإجمالي
                        let total = 0;
                        let hasValue = false;
                        if (Array.isArray(newVal.usedSpares)) {
                          const sparesTotal = newVal.usedSpares.reduce((sum, r) => sum + ((Number(r.price) || 0) * (Number(r.qty) || 1)), 0);
                          total += sparesTotal;
                          if (sparesTotal > 0) hasValue = true;
                        }
                        const repair = Number(newVal.repairCost) || 0;
                        const purchasesRkha = Number(newVal.purchasesRkha) || 0;
                        const purchasesFady = Number(newVal.purchasesFady) || 0;
                        total += repair;
                        total += purchasesRkha;
                        total += purchasesFady;
                        if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0) hasValue = true;
                        newVal.total = hasValue ? String(total) : '';
                        return newVal;
                      });
                    }} placeholder="سعر القطعة" />
                    <span style={{color:'#888',fontWeight:'bold',fontSize:16}}>{row.price ? (row.price * row.qty) + ' ج' : ''}</span>
                    <button type="button" style={{background:'#e34a4a',color:'#fff',border:'none',borderRadius:7,padding:'7px 18px',fontWeight:700,marginRight:0,marginTop:5,cursor:'pointer',fontSize:15}} onClick={() => {
                      setEditValue(ev => ({ ...ev, usedSpares: (ev.usedSpares || []).filter((_, i) => i !== idx) }));
                    }}>حذف</button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  setEditValue(ev => ({ ...ev, usedSpares: [...(ev.usedSpares || []), { id: "", name: "", price: 0, qty: 1, category: "" }] }));
                }} style={{background:'#286090',color:'#fff',padding:'10px 0',fontWeight:'bold',borderRadius:7,marginTop:5,border:'none',fontFamily:'inherit',fontSize:16,cursor:'pointer',width:'100%'}}>+ إضافة قطعة جديدة</button>
              </div>
              <label>الإجمالي:<input value={editValue.total || ""} readOnly placeholder="الإجمالي بالجنيه" /></label>
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
            <div style={{display:'flex',gap:8,marginTop:13,justifyContent:'center'}}>
              <button onClick={cancelEdit} disabled={editLoading} style={{background:'#888',color:'#fff',fontWeight:'bold',padding:'7px 16px',borderRadius:8,fontSize:15,border:'none',cursor:'pointer'}}>إلغاء</button>
              <button onClick={handleEditSave} disabled={editLoading} style={{background:'#27853d',color:'#fff',fontWeight:'bold',padding:'7px 16px',borderRadius:8,fontSize:15,border:'none',cursor:'pointer'}}>{editLoading ? "...يتم الحفظ" : "حفظ التعديلات"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}