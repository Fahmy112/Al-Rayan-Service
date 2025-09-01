"use client";
import { useEffect, useState } from "react";
import styles from "../requests/requests.module.css";

const filterOptions = [
  { label: "يومي", value: "day" },
  { label: "أسبوعي", value: "week" }
];

export default function AccountsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("day");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [week, setWeek] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  });
  const [totals, setTotals] = useState({
    repair: 0,
    netRkha: 0,
    netExternal: 0
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
    }
    setTotals({
      repair: filtered.reduce((sum, r) => sum + (Number(r.repairCost) || 0), 0),
      netRkha: filtered.reduce((sum, r) => sum + (Number(r.netPurchasesRkha) || 0), 0),
      netExternal: filtered.reduce((sum, r) => sum + (Number(r.netPurchasesExternal) || 0), 0)
    });
  }, [requests, filter, date, week]);

  return (
    <div style={{maxWidth:600,margin:"30px auto",background:"#fff",borderRadius:14,padding:24,boxShadow:"0 2px 16px #bbc6dd33",fontFamily:'Cairo, Tahoma, Arial, sans-serif'}}>
      <h2 style={{color:'#286090',textAlign:'center',marginBottom:18,letterSpacing:0.5,fontWeight:800,fontSize:28}}>💰 الحسابات</h2>
      <div style={{display:'flex',gap:12,marginBottom:18,justifyContent:'center',alignItems:'center'}}>
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
      </div>
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:10,background:'#f8fafd',borderRadius:10,overflow:'hidden',boxShadow:'0 1px 6px #bbc6dd22'}}>
        <thead>
          <tr style={{background:'#e3f0fa',color:'#286090',fontWeight:'bold',fontSize:18}}>
            <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي المصنعيات</th>
            <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي صافي مشتريات رخا</th>
            <th style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>إجمالي صافي المشتريات الخارجية</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{textAlign:'center',fontWeight:'bold',fontSize:20,color:'#27853d',background:'#fff'}}>
            <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.repair} ج</td>
            <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.netRkha} ج</td>
            <td style={{padding:'14px 0',border:'1px solid #e0e6f2'}}>{totals.netExternal} ج</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
