"use client";
import { useEffect, useState } from "react";
import InvoiceModal from "../components/InvoiceModal";
import styles from "./requests.module.css";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

const statuses = ["جديد", "تحت الإصلاح", "تم التسليم "];

type Request = {
  _id: string;
  customerName: string;
  phone: string;
  phone2?: string;
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
  purchasesExternal?: string;
  purchasesExternalLabel?: string;
  netPurchasesRkha?: string;
  netPurchasesExternal?: string;
  sparePartName?: string;
  sparePartPrice?: string;
  total?: string;
  status: string;
  createdAt: number;
  usedSpares?: any[];
  paymentStatus?: "نقدي" | "تحويل" | "لم يتم";
  remainingAmount?: string;
  paidAmount?: string; // إضافة حقل جديد للمبلغ المدفوع
  netProfit?: string; // إضافة حقل جديد لصافي الربح
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
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceRequest, setInvoiceRequest] = useState<Request | null>(null);
  
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
    if (paymentFilter) {
      filtered = filtered.filter(r => r.paymentStatus === paymentFilter);
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
    const editObj: Partial<Request> = { ...row, paidAmount: row.total && row.remainingAmount ? String(Number(row.total) - Number(row.remainingAmount)) : row.total || '' };
    setEdit({ id: row._id, values: editObj });
    setEditValue(editObj);
    setShowEditModal(true);
  }

  function cancelEdit() {
    setEdit(null);
    setShowEditModal(false);
  }

  function onEditChange(field: keyof Request | "netPurchasesRkha" | "netPurchasesExternal", value: any) {
    setEditValue(ev => {
      const updated = { ...ev, [field]: value };
      
      // حساب الإجمالي تلقائياً
      let total = 0;
      let purchasesTotal = 0;
      let hasValue = false;
      
      if (Array.isArray(updated.usedSpares)) {
        const sparesTotal = updated.usedSpares.reduce((sum, row) => sum + ((Number(row.price) || 0) * (Number(row.qty) || 1)), 0);
        total += sparesTotal;
        purchasesTotal += sparesTotal;
        if (sparesTotal > 0) hasValue = true;
      }
      const repair = Number(updated.repairCost) || 0;
      const purchasesRkha = Number(updated.purchasesRkha) || 0;
      const purchasesFady = Number(updated.purchasesFady) || 0;
      const purchasesExternal = Number(updated.purchasesExternal) || 0;
      
      total += repair;
      purchasesTotal += purchasesRkha + purchasesFady + purchasesExternal;

      if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0 || purchasesExternal > 0) hasValue = true;
      
      updated.total = hasValue ? String(total) : '';
      updated.remainingAmount = updated.paidAmount ? String(total - (Number(updated.paidAmount) || 0)) : '';
      updated.netProfit = hasValue ? String(total - purchasesTotal) : '';
      
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

  async function updatePaymentStatus(idx: number, newStatus: "نقدي" | "تحويل" | "لم يتم") {
    const req = filtered[idx];
    if (!req) return;
    const updated = { ...req, paymentStatus: newStatus };
    setRequests(reqs => reqs.map(r => r._id === req._id ? updated : r));
    await fetch("/api/requests/" + req._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: newStatus })
    });
  }

  const filtered = filterRequests();

  // حساب الإجماليات للملخص المالي
  const totalRevenue = filtered.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  const totalPurchases = filtered.reduce((sum, r) => {
    const sparesCost = Array.isArray(r.usedSpares) ? r.usedSpares.reduce((s, x) => s + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0;
    return sum + (Number(r.purchasesRkha) || 0) + (Number(r.purchasesFady) || 0) + (Number(r.purchasesExternal) || 0) + sparesCost;
  }, 0);
  const totalRemainingAmount = filtered.reduce((sum, r) => sum + (Number(r.remainingAmount) || 0), 0);
  const netProfit = totalRevenue - totalPurchases;

  // دالة لتصدير البيانات إلى CSV
  const exportToCSV = () => {
    const headers = [
      "اسم العميل", "رقم الهاتف", "نوع السيارة", "موديل السيارة", "نمرة السيارة",
      "الكيلومتر", "المشكلة", "الملاحظات", "تكلفة الصيانة", "مشتريات رخا",
      "مشتريات الفادي", "اسم المشتريات الخارجية", "قيمة المشتريات الخارجية",
      "إجمالي القطع", "الإجمالي", "صافي الربح", "المبلغ المتبقي", "حالة الدفع",
      "حالة الطلب", "تاريخ الإنشاء"
    ];
    
    const rows = filtered.map(req => {
      const sparesCost = Array.isArray(req.usedSpares) ? req.usedSpares.reduce((sum, x) => sum + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0;
      const netProfit = (Number(req.total) || 0) - ((Number(req.purchasesRkha) || 0) + (Number(req.purchasesFady) || 0) + (Number(req.purchasesExternal) || 0) + sparesCost);

      return [
        req.customerName, req.phone, req.carType, req.carModel, req.carNumber,
        req.kilometers, req.problem, req.notes, req.repairCost, req.purchasesRkha,
        req.purchasesFady, req.purchasesExternalLabel, req.purchasesExternal,
        sparesCost, req.total, netProfit, req.remainingAmount, req.paymentStatus,
        req.status, new Date(req.createdAt).toLocaleDateString("ar-EG")
      ].map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const csvContent = "\ufeff" + headers.join(',') + "\n" + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_الحسابات_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles["page-title"]}>متابعة الطلبات</h1>
      {spareWarning && <div style={{ color: '#e34a4a', margin: '12px 0 14px', background: '#fff3f2', border: '1px solid #ffb0b0', borderRadius: 6, padding: 10, textAlign: 'center', fontWeight: 'bold' }}>{spareWarning}</div>}
      {editSuccess && <div style={{ color: '#27853d', margin: '10px 0', background: '#eaffea', border: '1px solid #b0ffb0', borderRadius: 6, padding: 8, textAlign: 'center', fontWeight: 'bold' }}>{editSuccess}</div>}
      
      {/* لوحة التحكم المالية */}
      <div style={{ background: '#f8f9fd', border: '1px solid #e0e6f2', borderRadius: 8, padding: '15px 20px', marginBottom: 20 }}>
        <h2 style={{ color: '#286090', fontSize: 18, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' }}>ملخص الأداء المالي (للطلبات المفلترة)</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>إجمالي الإيرادات</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#27853d' }}>{totalRevenue.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>إجمالي المشتريات</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e34a4a' }}>{totalPurchases.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>صافي الربح</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#286090' }}>{netProfit.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>المبلغ المتبقي</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e34a4a' }}>{totalRemainingAmount.toLocaleString()} ج.م</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <input
          type="text"
          placeholder="بحث: العميل، الهاتف، السيارة، النموذج، النمرة، المشكلة، الملاحظات..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className={styles.searchbar}
        />
        <button onClick={exportToCSV} style={{ background: '#286090', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>
          تصدير إلى CSV
        </button>
      </div>

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
            <div key={r._id} className={styles['request-card']} style={r.paymentStatus === "لم يتم" ? { border: '2px solid #e34a4a', background: '#fff3f2', position:'relative' } : { position:'relative' }}>
              {/* أيقونة الفاتورة */}
              <div
                title="عرض الفاتورة"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: '#f5f7fa',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 6px #bbc6dd33',
                  cursor: 'pointer',
                  border: '1.5px solid #286090',
                  zIndex: 2
                }}
                onClick={() => {
                  setInvoiceRequest(r);
                  setShowInvoice(true);
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="3" width="16" height="18" rx="3" fill="#fff" stroke="#286090" strokeWidth="2"/>
                  <path d="M7 7H17" stroke="#286090" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 11H17" stroke="#286090" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 15H13" stroke="#286090" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{fontSize:10, color:'#286090', fontWeight:'bold', marginRight:2}}>الفاتورة</span>
              </div>
              {/* نافذة الفاتورة */}
              <InvoiceModal
                open={showInvoice}
                onClose={() => setShowInvoice(false)}
                request={invoiceRequest}
              />
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6,color:'#e34a4a',fontWeight:'bold'}}>
                المبلغ المتبقي: {r.remainingAmount || "-"} جنيه
              </div>
              <div className={styles['request-title']} style={{fontSize:22,fontWeight:'bold',color:'#286090',marginBottom:8}}>{r.customerName}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>📞 {r.phone}{r.phone2 ? ` | هاتف إضافي: ${r.phone2}` : ''}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>🚗 {r.carType || "-"} | {r.carModel || "-"} | {r.carNumber || "-"}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>الكيلومتر: {r.kilometers || "-"}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>المشكلة: {r.problem}</div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>ملاحظات: {r.notes || "-"}</div>
              
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6, fontWeight:'bold', fontSize: 16}}>
                تفاصيل التكاليف:
                <ul>
                  <li>صيانة: {r.repairCost || "-"} ج</li>
                  <li>قطع غيار: {Array.isArray(r.usedSpares) ? r.usedSpares.reduce((sum, x) => sum + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0} ج</li>
                  <li>مشتريات رخا: {r.purchasesRkha || "-"} ج</li>
                  <li>مشتريات الفادي: {r.purchasesFady || "-"} ج</li>
                  <li>{r.purchasesExternalLabel || "مشتريات خارجية"}: {r.purchasesExternal || "-"} ج</li>
                </ul>
              </div>

              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                الإجمالي: <span className={styles.total}>{r.total || "-"}</span>
              </div>
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                صافي الربح: <span style={{ color: '#27853d', fontWeight: 'bold' }}>{r.netProfit || "-"} ج</span>
              </div>
              
              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                الدفع: 
                {r.paymentStatus === "نقدي" && <span title="نقدي" style={{marginLeft:4}}>💵</span>}
                {r.paymentStatus === "تحويل" && <span title="تحويل" style={{marginLeft:4}}>💳</span>}
                {r.paymentStatus === "لم يتم" && <span title="لم يتم" style={{marginLeft:4}}>⏳</span>}
                <span style={{marginRight:4}}>{r.paymentStatus || "-"}</span>
              </div>

              <div className={styles['request-row']} style={{borderBottom:'1px solid #e0e6f2',paddingBottom:6,marginBottom:6}}>
                <select value={r.status} onChange={e => updateStatus(i, e.target.value)} className={styles["status-select"]}>
                  {statuses.map(st => <option key={st}>{st}</option>)}
                </select>
                <span style={{marginRight:12}}>الدفع:</span>
                <select value={r.paymentStatus || "لم يتم"} onChange={e => updatePaymentStatus(i, e.target.value as any)} className={styles["status-select"]}>
                  <option value="لم يتم">لم يتم</option>
                  <option value="نقدي">نقدي</option>
                  <option value="تحويل">تحويل</option>
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
              <label>هاتف إضافي:<input value={editValue.phone2 || ""} onChange={e => onEditChange("phone2", e.target.value)} placeholder="هاتف إضافي (اختياري)" /></label>
              <label>نوع السيارة:<input value={editValue.carType || ""} onChange={e => onEditChange("carType", e.target.value)} placeholder="ادخل نوع السيارة" /></label>
              <label>موديل السيارة:<input value={editValue.carModel || ""} onChange={e => onEditChange("carModel", e.target.value)} placeholder="ادخل موديل السيارة" /></label>
              <label>نمرة السيارة:<input value={editValue.carNumber || ""} onChange={e => onEditChange("carNumber", e.target.value)} placeholder="ادخل نمرة السيارة" /></label>
              <label>الكيلومتر:<input value={editValue.kilometers || ""} onChange={e => onEditChange("kilometers", e.target.value)} placeholder="ادخل الكيلومتر" /></label>
              <label>المشكلة:<textarea value={editValue.problem || ""} onChange={e => onEditChange("problem", e.target.value)} placeholder="وصف المشكلة" style={{minHeight:60,width:'100%',resize:'vertical',fontSize:15}} /></label>
              <label>ملاحظات:<textarea value={editValue.notes || ""} onChange={e => onEditChange("notes", e.target.value)} placeholder="ملاحظات إضافية" style={{minHeight:60,width:'100%',resize:'vertical',fontSize:15}} /></label>
              <label>مشتريات رخا:<input value={editValue.purchasesRkha || ""} onChange={e => onEditChange("purchasesRkha", e.target.value)} placeholder="سعر مشتريات رخا بالجنيه" /></label>
              <label>مشتريات الفادي:<input value={editValue.purchasesFady || ""} onChange={e => onEditChange("purchasesFady", e.target.value)} placeholder="سعر مشتريات الفادي بالجنيه" /></label>
              <label>
                اسم المشتريات الخارجية:
                <input value={editValue.purchasesExternalLabel || "مشتريات خارجية"} onChange={e => onEditChange("purchasesExternalLabel", e.target.value)} placeholder="اسم المشتريات الخارجية" />
              </label>
              <label>
                قيمة المشتريات الخارجية:
                <input value={editValue.purchasesExternal || ""} onChange={e => {
                  const val = e.target.value;
                  setEditValue(ev => {
                    const newVal = { ...ev, purchasesExternal: val };
                    let total = 0;
                    let purchasesTotal = 0;
                    let hasValue = false;
                    if (Array.isArray(newVal.usedSpares)) {
                      const sparesTotal = newVal.usedSpares.reduce((sum, r) => sum + ((Number(r.price) || 0) * (Number(r.qty) || 1)), 0);
                      total += sparesTotal;
                      purchasesTotal += sparesTotal;
                      if (sparesTotal > 0) hasValue = true;
                    }
                    const repair = Number(newVal.repairCost) || 0;
                    const purchasesRkha = Number(newVal.purchasesRkha) || 0;
                    const purchasesFady = Number(newVal.purchasesFady) || 0;
                    const purchasesExternal = Number(val) || 0;
                    total += repair;
                    purchasesTotal += purchasesRkha + purchasesFady + purchasesExternal;
                    if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0 || purchasesExternal > 0) hasValue = true;
                    newVal.total = hasValue ? String(total) : '';
                    newVal.remainingAmount = newVal.paidAmount ? String(total - (Number(newVal.paidAmount) || 0)) : '';
                    newVal.netProfit = hasValue ? String(total - purchasesTotal) : '';
                    return newVal;
                  });
                }} placeholder="قيمة المشتريات الخارجية بالجنيه" />
              </label>
              <label>تكلفة الصيانة:<input value={editValue.repairCost || ""} onChange={e => onEditChange("repairCost", e.target.value)} placeholder="تكلفة الصيانة بالجنيه" /></label>
              <div style={{ margin: '10px 0', padding: '10px', background: '#f8f9fd', borderRadius: 8 }}>
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
                        let total = 0;
                        let purchasesTotal = 0;
                        let hasValue = false;
                        if (Array.isArray(newVal.usedSpares)) {
                          const sparesTotal = newVal.usedSpares.reduce((sum, r) => sum + ((Number(r.price) || 0) * (Number(r.qty) || 1)), 0);
                          total += sparesTotal;
                          purchasesTotal += sparesTotal;
                          if (sparesTotal > 0) hasValue = true;
                        }
                        const repair = Number(newVal.repairCost) || 0;
                        const purchasesRkha = Number(newVal.purchasesRkha) || 0;
                        const purchasesFady = Number(newVal.purchasesFady) || 0;
                        const purchasesExternal = Number(newVal.purchasesExternal) || 0;
                        total += repair;
                        purchasesTotal += purchasesRkha + purchasesFady + purchasesExternal;
                        if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0 || purchasesExternal > 0) hasValue = true;
                        newVal.total = hasValue ? String(total) : '';
                        newVal.remainingAmount = newVal.paidAmount ? String(total - (Number(newVal.paidAmount) || 0)) : '';
                        newVal.netProfit = hasValue ? String(total - purchasesTotal) : '';
                        return newVal;
                      });
                    }} placeholder="الكمية" max={row.id !== "custom" ? (spares.find(sp => sp._id === row.id)?.quantity || '') : ''} />
                    <input type="number" min={0} style={{width:80,fontSize:15}} value={row.price} onChange={e => {
                      const updated = [...(editValue.usedSpares || [])];
                      updated[idx].price = Number(e.target.value);
                      setEditValue(ev => {
                        const newVal = { ...ev, usedSpares: updated };
                        let total = 0;
                        let purchasesTotal = 0;
                        let hasValue = false;
                        if (Array.isArray(newVal.usedSpares)) {
                          const sparesTotal = newVal.usedSpares.reduce((sum, r) => sum + ((Number(r.price) || 0) * (Number(r.qty) || 1)), 0);
                          total += sparesTotal;
                          purchasesTotal += sparesTotal;
                          if (sparesTotal > 0) hasValue = true;
                        }
                        const repair = Number(newVal.repairCost) || 0;
                        const purchasesRkha = Number(newVal.purchasesRkha) || 0;
                        const purchasesFady = Number(newVal.purchasesFady) || 0;
                        const purchasesExternal = Number(newVal.purchasesExternal) || 0;
                        total += repair;
                        purchasesTotal += purchasesRkha + purchasesFady + purchasesExternal;
                        if (repair > 0 || purchasesRkha > 0 || purchasesFady > 0 || purchasesExternal > 0) hasValue = true;
                        newVal.total = hasValue ? String(total) : '';
                        newVal.remainingAmount = newVal.paidAmount ? String(total - (Number(newVal.paidAmount) || 0)) : '';
                        newVal.netProfit = hasValue ? String(total - purchasesTotal) : '';
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
                  setEditValue(ev => ({ ...ev, usedSpares: [...(editValue.usedSpares || []), { id: "", name: "", price: 0, qty: 1, category: "" }] }));
                }} style={{background:'#286090',color:'#fff',padding:'10px 0',fontWeight:'bold',borderRadius:7,marginTop:5,border:'none',fontFamily:'inherit',fontSize:16,cursor:'pointer',width:'100%'}}>+ إضافة قطعة جديدة</button>
                {/* مشتريات خارجية منفصلة */}
                {(editValue.purchasesExternal && Number(editValue.purchasesExternal) > 0) && (
                  <div style={{marginTop:8, color:'#286090', fontWeight:'bold'}}>
                    {editValue.purchasesExternalLabel || "مشتريات خارجية"}: {editValue.purchasesExternal} ج
                  </div>
                )}
              </div>
              <label>صافي مشتريات رخا:
                <input type="number" value={editValue.netPurchasesRkha || ""} onChange={e => onEditChange("netPurchasesRkha", e.target.value)} placeholder="صافي مشتريات رخا بالجنيه" />
              </label>
              <label>صافي المشتريات الخارجية:
                <input type="number" value={editValue.netPurchasesExternal || ""} onChange={e => onEditChange("netPurchasesExternal", e.target.value)} placeholder="صافي المشتريات الخارجية بالجنيه" />
              </label>
              <label>الإجمالي:<input value={editValue.total || ""} readOnly placeholder="الإجمالي بالجنيه" /></label>
              <label>المبلغ المدفوع:<input value={editValue.paidAmount || ""} onChange={e => onEditChange("paidAmount", e.target.value)} placeholder="المبلغ المدفوع بالجنيه" /></label>
              <label>المبلغ المتبقي:<input value={editValue.remainingAmount || ""} readOnly placeholder="المبلغ المتبقي بالجنيه" /></label>
              <label>صافي الربح:<input value={editValue.netProfit || ""} readOnly placeholder="صافي الربح بالجنيه" /></label>
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