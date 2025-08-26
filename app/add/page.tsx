"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}
interface UsedSpare {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function AddRequest() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [problem, setProblem] = useState("");
  const [notes, setNotes] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [usedSpares, setUsedSpares] = useState<UsedSpare[]>([]);
  const [spares, setSpares] = useState<Spare[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [spareWarning, setSpareWarning] = useState<string | undefined>(undefined);
  const router = useRouter();

  // جلب قطع الغيار من المخزن
  useEffect(() => {
    fetch("/api/spares").then(r=>r.json()).then((data: Spare[]) => {
      setSpares(data);
      if (data.some(s => s.quantity <= 5)) {
        setSpareWarning(
          "تحذير: بعض قطع الغيار على وشك النفاد: " +
          data.filter(s=>s.quantity<=5).map(s=>`${s.name} (المتبقي ${s.quantity})`).join('، ')
        );
      }
    });
  }, []);

  function addSpareRow() {
    setUsedSpares(old => ([...old, { id: "", name: "", price: 0, qty: 1 }]));
  }

  function updateSpareRow(idx: number, field: keyof UsedSpare, val: any) {
    setUsedSpares(old => {
      const copy = [...old];
      if (field === "id") {
        const found = spares.find(sp=>sp._id === val);
        if (found) {
          copy[idx] = { id: found._id, name: found.name, price: found.price, qty: copy[idx].qty };
        } else {
          copy[idx] = { id: val, name: "", price: 0, qty: copy[idx].qty };
        }
      } else if (field === "qty") {
        copy[idx].qty = Math.max(1, parseInt(val)||1);
      } else if (field === "price") {
        copy[idx].price = parseFloat(val) || 0;
      }
      return copy;
    });
  }
  function removeSpareRow(idx: number) {
    setUsedSpares(old => old.filter((_,i)=>i!==idx));
  }

  function calcTotal() {
    const parts = usedSpares.map(row => {
      const price = isNaN(Number(row.price))?0:Number(row.price);
      return price * row.qty;
    }).reduce((a,b)=>a+b,0);
    const main = parseFloat(repairCost)||0;
    return (parts+main).toString();
  }
  const total = calcTotal();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    // خصم الكميات للمخزون
    for (const row of usedSpares) {
      const spare = spares.find(s => s._id === row.id);
      if (spare && spare.quantity >= row.qty) {
        await fetch("/api/spares", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: spare._id, quantity: spare.quantity - row.qty })
        });
      }
    }
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName, phone, carType, carModel, carNumber, kilometers, problem,
        notes: notes || undefined,
        repairCost: repairCost || undefined,
        usedSpares: usedSpares.map(x=>({id:x.id, name:x.name, price:x.price, qty:x.qty})),
        total
      })
    });
    setLoading(false);
    setSuccess(true);
    setCustomerName(""); setPhone(""); setCarType(""); setCarModel(""); setCarNumber(""); setKilometers(""); setProblem("");
    setNotes(""); setRepairCost(""); setUsedSpares([]);
    setTimeout(() => { setSuccess(false); router.push("/"); }, 1200);
  }

  return (
    <div style={{
      direction: "rtl", fontFamily: 'Cairo, Arial', maxWidth: 700, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 2px 16px 0 #bbc6dd44',
    }}>
      <h1 style={{ color: '#286090', marginBottom: 25, textAlign: 'center', fontSize: 28 }}>إضافة طلب جديد</h1>
      {spareWarning && <div style={{color:'#e34a4a',padding:10,background:'#fff3f2',border:'1px solid #ffb0b0',borderRadius:6,marginBottom:10, textAlign:'center',fontWeight:'bold'}}>{spareWarning}</div>}
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16, fontSize: 16}}>
        <label style={lbl}>اسم العميل:
          <input required value={customerName} onChange={e=>setCustomerName(e.target.value)} style={inputStyle} autoFocus />
        </label>
        <label style={lbl}>رقم الهاتف:
          <input required value={phone} onChange={e=>setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={lbl}>نوع السيارة:
          <input required value={carType} onChange={e=>setCarType(e.target.value)} style={inputStyle} />
        </label>
        <label style={lbl}>موديل السيارة:
          <input required value={carModel} onChange={e=>setCarModel(e.target.value)} style={inputStyle} />
        </label>
        <label style={lbl}>نمرة السيارة:
          <input required value={carNumber} onChange={e=>setCarNumber(e.target.value)} style={inputStyle} />
        </label>
        <label style={lbl}>الكيلومتر الحالي:
          <input required type="number" min={0} value={kilometers} onChange={e=>setKilometers(e.target.value)} style={inputStyle} />
        </label>
        <label style={lbl}>المشكلة:
          <textarea required value={problem} onChange={e=>setProblem(e.target.value)} style={{...inputStyle, resize:'vertical'}} rows={3} />
        </label>
        <label style={lbl}>الملاحظات:
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{...inputStyle, resize:'vertical'}} rows={2} placeholder="اختياري" />
        </label>
        <div style={{ margin: '10px 0', background:'#f4f8fd', borderRadius: 7, padding: 8 }}>
          <div style={{fontWeight:600, fontSize:16, marginBottom:5}}>قطع الغيار المطلوبة:</div>
          {usedSpares.map((row, idx) => (
            <div key={idx} style={{display:'flex',gap:9,marginBottom:7, alignItems:'center'}}>
              <select value={row.id} onChange={e=>updateSpareRow(idx,"id",e.target.value)} style={inputStyle}>
                <option value="">اختر القطعة...</option>
                {spares.map(sp=> <option value={sp._id} key={sp._id} disabled={sp.quantity === 0}>
                  {sp.name} (سعر: {sp.price}ج - متوفر: {sp.quantity})
                </option> )}
              </select>
              <input
                type="number" min={1}
                style={{...inputStyle, width:75}}
                value={row.qty}
                onChange={e=>updateSpareRow(idx,'qty',e.target.value)}
                placeholder="الكمية"
                max={spares.find(sp=>sp._id===row.id)?.quantity||''}
              />
              <input
                type="number"
                min={0}
                style={{...inputStyle, width:90}}
                value={row.price}
                onChange={e=>updateSpareRow(idx,'price',e.target.value)}
                placeholder="سعر القطعة"
              />
              <span style={{color:'#888',fontWeight:'bold',fontSize:16}}>
                {row.price?(row.price*row.qty)+' ج': ''}
              </span>
              <button type="button" style={{background:'#e34a4a',color:'#fff', border:'none', borderRadius:7, padding:'5px 13px', fontWeight:700, marginRight:8, cursor:'pointer'}} onClick={()=>removeSpareRow(idx)}>حذف</button>
            </div>
          ))}
          <button type="button" onClick={addSpareRow} style={{background:'#286090', color:'#fff', padding:'7px 25px', fontWeight:'bold', borderRadius:7, marginTop:5, border:'none', fontFamily:'inherit', fontSize:15, cursor:'pointer'}}>+ إضافة قطعة جديدة</button>
        </div>
        <label style={lbl}>تكلفة الصيانة:
          <input type="number" min={0} value={repairCost} onChange={e=>setRepairCost(e.target.value)} style={inputStyle} placeholder="اختياري" />
        </label>
        <div style={{fontWeight:600, margin:'14px 0 0', fontSize:17}}>
          الإجمالي:&nbsp;
          <span style={{fontWeight:'bold', color:'#286090', background:'#f0f4ff',borderRadius:6,padding:'4px 16px'}}>{ total || 0 }</span> جنيه
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{background:'#286090', color:'#fff', fontWeight:700, padding: '12px', borderRadius:8, marginTop:8, fontSize:18, border:'none', cursor:'pointer', transition:'.2s'}}
        >
          {loading ? "...يتم الحفظ" : "إضافة الطلب"}
        </button>
        {success && <div style={{color:'#27853d',margin:'12px 0',fontWeight:'bold'}}>تم الحفظ بنجاح</div>}
      </form>
    </div>
  );
}

const lbl: React.CSSProperties = { fontWeight:600 };
const inputStyle: React.CSSProperties = {
  border: '1px solid #bbc6d3',
  borderRadius: 6,
  padding: '8px 11px',
  marginTop: 4,
  fontSize: 16,
  fontFamily: 'inherit',
  outline: 'none',
};
