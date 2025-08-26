"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddRequest() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [problem, setProblem] = useState("");
  // الحقول الجديدة (اختياري)
  const [notes, setNotes] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [sparePartName, setSparePartName] = useState("");
  const [sparePartPrice, setSparePartPrice] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // تحديث الاجما��ي تلقائيا
  function calculateTotal(cost: string, price: string) {
    const n1 = parseFloat(cost) || 0;
    const n2 = parseFloat(price) || 0;
    return (n1 + n2).toString();
  }

  function handleRepairCost(e: any) {
    setRepairCost(e.target.value);
    setTotal(calculateTotal(e.target.value, sparePartPrice));
  }
  function handleSparePartPrice(e: any) {
    setSparePartPrice(e.target.value);
    setTotal(calculateTotal(repairCost, e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName, phone, carType, carModel, carNumber, kilometers, problem,
        notes: notes || undefined,
        repairCost: repairCost || undefined,
        sparePartName: sparePartName || undefined,
        sparePartPrice: sparePartPrice || undefined,
        total: total || undefined
      })
    });
    setLoading(false);
    setSuccess(true);
    setCustomerName(""); setPhone(""); setCarType(""); setCarModel(""); setCarNumber(""); setKilometers(""); setProblem("");
    setNotes(""); setRepairCost(""); setSparePartName(""); setSparePartPrice(""); setTotal("");
    setTimeout(() => { setSuccess(false); router.push("/"); }, 1200);
  }

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: 'Cairo, Arial',
        maxWidth: 620,
        margin: '40px auto',
        background: '#ffffff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 2px 16px 0 #bbc6dd44',
      }}
    >
      <h1 style={{ color: '#286090', marginBottom: 25, textAlign: 'center', fontSize: 28 }}>إضافة طلب جديد</h1>
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
        <div style={{ display:'flex', gap:14 }}>
          <div style={{flex:1}}>
            <label style={lbl}>تكلفة الصيانة:
              <input type="number" min={0} value={repairCost} onChange={handleRepairCost} style={inputStyle} placeholder="اختياري" />
            </label>
          </div>
          <div style={{flex:1}}>
            <label style={lbl}>اسم قطعة الغيار:
              <input value={sparePartName} onChange={e=>setSparePartName(e.target.value)} style={inputStyle} placeholder="اختياري" />
            </label>
          </div>
          <div style={{flex:1}}>
            <label style={lbl}>سعر القطعة:
              <input type="number" min={0} value={sparePartPrice} onChange={handleSparePartPrice} style={inputStyle} placeholder="اختياري" />
            </label>
          </div>
        </div>
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
