"use client";
import { useEffect, useState } from "react";
import styles from "../requests/requests.module.css";

const filterOptions = [
  { label: "يومي", value: "day" },
  { label: "أسبوعي", value: "week" },
  { label: "شهري", value: "month" }
];

export default function AccountsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("day");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [week, setWeek] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  });
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    totalNetProfit: 0,
    totalRemainingAmount: 0,
    totalRepair: 0,
    totalPurchasesRkha: 0,
    totalPurchasesFady: 0,
    totalPurchasesExternal: 0,
    totalSparesCost: 0,
    profitRkha: 0,
    profitExternal: 0,
    total: 0
  });

  useEffect(() => {
    fetch("/api/requests").then(r => r.json()).then(data => setRequests(data));
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (filter === "day") {
      filtered = requests.filter(r => {
        const d = new Date(r.createdAt);
        return d.toISOString().slice(0, 10) === date;
      });
    } else if (filter === "week") {
      const start = new Date(week);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      filtered = requests.filter(r => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
    } else if (filter === "month") {
      filtered = requests.filter(r => {
        const d = new Date(r.createdAt);
        return d.toISOString().slice(0, 7) === month;
      });
    }

    const totalRevenue = filtered.reduce((sum: any, r: any) => sum + (Number(r.total) || 0), 0);
    const totalSparesCost = filtered.reduce((sum: any, r: any) => {
      const sparesCost = Array.isArray(r.usedSpares) ? r.usedSpares.reduce((s: any, x: any) => s + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0;
      return sum + sparesCost;
    }, 0);
    const totalCosts = filtered.reduce((sum: any, r: any) => {
      const sparesCost = Array.isArray(r.usedSpares) ? r.usedSpares.reduce((s: any, x: any) => s + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0;
      return sum + (Number(r.purchasesRkha) || 0) + (Number(r.purchasesFady) || 0) + (Number(r.purchasesExternal) || 0) + sparesCost;
    }, 0);

    setTotals({
      totalRevenue,
      totalCosts,
      totalNetProfit: totalRevenue - totalCosts,
      totalRemainingAmount: filtered.reduce((sum: any, r: any) => sum + (Number(r.remainingAmount) || 0), 0),
      totalRepair: filtered.reduce((sum: any, r: any) => sum + (Number(r.repairCost) || 0), 0),
      totalPurchasesRkha: filtered.reduce((sum: any, r: any) => sum + (Number(r.purchasesRkha) || 0), 0),
      totalPurchasesFady: filtered.reduce((sum: any, r: any) => sum + (Number(r.purchasesFady) || 0), 0),
      totalPurchasesExternal: filtered.reduce((sum: any, r: any) => sum + (Number(r.purchasesExternal) || 0), 0),
      totalSparesCost,
      profitRkha: filtered.reduce((sum: any, r: any) => sum + ((Number(r.purchasesRkha) || 0) - (Number(r.netPurchasesRkha) || 0)), 0),
      profitExternal: filtered.reduce((sum: any, r: any) => sum + ((Number(r.purchasesExternal) || 0) - (Number(r.netPurchasesExternal) || 0)), 0),
      total: filtered.reduce((sum: any, r: any) => sum + (Number(r.total) || 0), 0)
    });
  }, [requests, filter, date, week, month]);

  const exportToCSV = () => {
    const filtered = requests.filter(r => {
      if (filter === "day") {
        return new Date(r.createdAt).toISOString().slice(0, 10) === date;
      } else if (filter === "week") {
        const start = new Date(week);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return new Date(r.createdAt) >= start && new Date(r.createdAt) <= end;
      } else if (filter === "month") {
        return new Date(r.createdAt).toISOString().slice(0, 7) === month;
      }
      return true;
    });

    const headers = [
      "اسم العميل", "رقم الهاتف", "نوع السيارة", "موديل السيارة", "نمرة السيارة",
      "الكيلومتر", "المشكلة", "الملاحظات", "تكلفة الصيانة", "إجمالي المشتريات",
      "مشتريات رخا", "مشتريات الفادي", "اسم المشتريات الخارجية", "قيمة المشتريات الخارجية",
      "إجمالي القطع", "الإجمالي", "صافي الربح", "المبلغ المتبقي", "حالة الدفع",
      "حالة الطلب", "تاريخ الإنشاء"
    ];

    const rows = filtered.map((req: any) => {
      const sparesCost = Array.isArray(req.usedSpares) ? req.usedSpares.reduce((s: any, x: any) => s + ((Number(x.price) || 0) * (Number(x.qty) || 1)), 0) : 0;
      const totalCosts = (Number(req.purchasesRkha) || 0) + (Number(req.purchasesFady) || 0) + (Number(req.purchasesExternal) || 0) + sparesCost;
      const netProfit = (Number(req.total) || 0) - totalCosts;

      return [
        req.customerName, req.phone, req.carType, req.carModel, req.carNumber,
        req.kilometers, req.problem, req.notes, req.repairCost, totalCosts,
        req.purchasesRkha, req.purchasesFady, req.purchasesExternalLabel, req.purchasesExternal,
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
    <div style={{maxWidth:600,margin:"30px auto",background:"#fff",borderRadius:14,padding:24,boxShadow:"0 2px 16px #bbc6dd33",fontFamily:'Cairo, Tahoma, Arial, sans-serif'}}>
      <h2 style={{color:'#286090',textAlign:'center',marginBottom:18,letterSpacing:0.5,fontWeight:800,fontSize:28}}>💰 الحسابات</h2>

      <div style={{ background: '#f8f9fd', border: '1px solid #e0e6f2', borderRadius: 8, padding: '15px 20px', marginBottom: 20 }}>
        <h3 style={{ color: '#286090', fontSize: 18, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' }}>ملخص الأداء المالي</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>إجمالي الإيرادات</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#27853d' }}>{totals.totalRevenue.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>إجمالي التكاليف</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e34a4a' }}>{totals.totalCosts.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>صافي الربح الإجمالي</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#286090' }}>{totals.totalNetProfit.toLocaleString()} ج.م</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 5 }}>المبلغ المتبقي</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e34a4a' }}>{totals.totalRemainingAmount.toLocaleString()} ج.م</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginBottom:18, justifyContent:'center',alignItems:'center'}}>
        <span style={{fontWeight:600,color:'#286090',fontSize:16}}>فلترة:</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{padding:'7px 18px',borderRadius:8,border:'1.5px solid #bbc6d3',fontSize:16,fontWeight:600,color:'#286090',background:'#f0f4ff'}}>
          {filterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {filter === "day" && (
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{padding:'7px 18px',borderRadius:8,border:'1.5px solid #bbc6d3',fontSize:16,background:'#f0f4ff'}} />
        )}
        {filter === "week" && (
          <input type="date" value={week} onChange={e => setWeek(e.target.value)} style={{padding:'7px 18px',borderRadius:8,border:'1.5px solid #bbc6d3',fontSize:16,background:'#f0f4ff'}} />
        )}
        {filter === "month" && (
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{padding:'7px 18px',borderRadius:8,border:'1.5px solid #bbc6d3',fontSize:16,background:'#f0f4ff'}} />
        )}
      </div>

      <button onClick={exportToCSV} style={{ background: '#286090', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15, width: '100%', marginBottom: 15 }}>
        تصدير إلى CSV
      </button>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0,marginTop:10,background:'#f8fafd',borderRadius:14,overflow:'hidden',boxShadow:'0 1px 6px #bbc6dd22',minWidth:900}}>
          <thead>
            <tr style={{background:'#e3f0fa',color:'#286090',fontWeight:'bold',fontSize:18}}>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2',minWidth:110}}>إجمالي الإيرادات</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي التكاليف</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>صافي الربح الإجمالي</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>المبلغ المتبقي</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي المصنعيات</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي قطع الغيار</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>مشتريات رخا</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>مشتريات الفادي</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>مشتريات خارجية</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2',background:'#e3f0fa'}}>مكسب رخا</th>
              <th style={{padding:'14px 0',border:'1px solid #e0e6f2',background:'#e3f0fa'}}>مكسب مشتريات خارجية</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{textAlign:'center',fontWeight:'bold',fontSize:20,color:'#27853d',background:'#fff'}}>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',background:'#f0f4ff',fontWeight:800}}>{totals.totalRevenue.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',color:'#e34a4a',fontWeight:800}}>{totals.totalCosts.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',color:'#286090',fontWeight:800}}>{totals.totalNetProfit.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',color:'#e34a4a',fontWeight:800}}>{totals.totalRemainingAmount.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.totalRepair.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.totalSparesCost.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.totalPurchasesRkha.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.totalPurchasesFady.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.totalPurchasesExternal.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',color:'#0a5',fontWeight:700,background:'#eafbe7'}}>{totals.profitRkha.toLocaleString()} ج</td>
              <td style={{padding:'14px 0',border:'1px solid #e0e6f2',color:'#0a5',fontWeight:700,background:'#eafbe7'}}>{totals.profitExternal.toLocaleString()} ج</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}