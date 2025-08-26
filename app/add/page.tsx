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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        carType,
        carModel,
        carNumber,
        kilometers,
        problem
      })
    });
    setLoading(false);
    setSuccess(true);
    setCustomerName(""); setPhone(""); setCarType(""); setCarModel(""); setCarNumber(""); setKilometers(""); setProblem("");
    setTimeout(() => { setSuccess(false); router.push("/"); }, 1200);
  }

  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: 'Cairo, Arial',
        maxWidth: 600,
        margin: '40px auto',
        background: '#ffffff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 2px 16px 0 #bbc6dd44',
      }}
    >
      <h1 style={{ color: '#286090', marginBottom: 25, textAlign: 'center', fontSize: 28 }}>إضافة طلب جديد</h1>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16, fontSize: 16}}>
        <label style={{fontWeight:600}}>اسم العميل:
          <input required value={customerName} onChange={e=>setCustomerName(e.target.value)} style={inputStyle} autoFocus />
        </label>
        <label style={{fontWeight:600}}>رقم الهاتف:
          <input required value={phone} onChange={e=>setPhone(e.target.value)} style={inputStyle} />
        </label>
        <label style={{fontWeight:600}}>نوع السيارة:
          <input required value={carType} onChange={e=>setCarType(e.target.value)} style={inputStyle} />
        </label>
        <label style={{fontWeight:600}}>موديل السيارة:
          <input required value={carModel} onChange={e=>setCarModel(e.target.value)} style={inputStyle} />
        </label>
        <label style={{fontWeight:600}}>نمرة السيارة:
          <input required value={carNumber} onChange={e=>setCarNumber(e.target.value)} style={inputStyle} />
        </label>
        <label style={{fontWeight:600}}>الكيلومتر الحالي:
          <input required type="number" min={0} value={kilometers} onChange={e=>setKilometers(e.target.value)} style={inputStyle} />
        </label>
        <label style={{fontWeight:600}}>المشكلة:
          <textarea required value={problem} onChange={e=>setProblem(e.target.value)} style={inputStyle} rows={3} />
        </label>
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

const inputStyle: React.CSSProperties = {
  border: '1px solid #bbc6d3',
  borderRadius: 6,
  padding: '8px 11px',
  marginTop: 4,
  fontSize: 16,
  fontFamily: 'inherit',
  outline: 'none',
};
