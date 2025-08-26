"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}
interface UsedSpare {
  id: string;
  name: string;
  price: number;
  qty: number;
  category?: string;
}

export default function AddRequest() {
  const categories = [
    'زيت الماتور',
    'زيت الفتيس',
    'فلتر الهواء',
    'قلب طلمبة البنزين',
    'فلتر زيت',
    'فلتر تكييف',
    'فلتر زيت فتيس',
    'ماء تبريد',
    'بوجيهات',
    'فلتر بنزين',
    'حشو فلتر زيت'
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const inputStyle: React.CSSProperties = {
    padding: '7px 8px',
    borderRadius: 7,
    border: '1px solid #bbc6d3',
    fontFamily: 'inherit',
    fontSize: 15,
    marginBottom: 4
  };
  const lbl: React.CSSProperties = { fontWeight: 600, marginBottom: 2 };
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
    fetch("/api/spares").then(r => r.json()).then((data: Spare[]) => {
      setSpares(data);
      if (data.some(s => s.quantity <= 5)) {
        setSpareWarning(
          "تحذير: بعض قطع الغيار على وشك النفاد: " +
          data.filter(s => s.quantity <= 5).map(s => `${s.name} (المتبقي ${s.quantity})`).join('، ')
        );
      }
    });
  }, []);

  function addSpareRow() {
    setUsedSpares(old => ([...old, { id: "", name: "", price: 0, qty: 1, category: "" }]));
  }

  function updateSpareRow(idx: number, field: keyof UsedSpare, val: any) {
    setUsedSpares(old => {
      const copy = [...old];
      if (field === "category") {
        copy[idx].category = val;
        copy[idx].id = "";
        copy[idx].name = "";
        copy[idx].price = 0;
        copy[idx].qty = 1;
      } else if (field === "id") {
        const found = spares.find(sp => sp._id === val);
        if (found) {
          copy[idx] = { ...copy[idx], id: found._id, name: found.name, price: found.price };
        } else {
          copy[idx] = { ...copy[idx], id: val, name: "", price: 0 };
        }
      } else if (field === "qty") {
        copy[idx].qty = Math.max(1, parseInt(val) || 1);
      } else if (field === "price") {
        copy[idx].price = parseFloat(val) || 0;
      }
      return copy;
    });
  }
  function removeSpareRow(idx: number) {
    setUsedSpares(old => old.filter((_, i) => i !== idx));
  }

  function calcTotal() {
    const parts = usedSpares.map(row => {
      const price = isNaN(Number(row.price)) ? 0 : Number(row.price);
      return price * row.qty;
    }).reduce((a, b) => a + b, 0);
    const main = parseFloat(repairCost) || 0;
    return (parts + main).toString();
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
        usedSpares: usedSpares.map(x => ({ id: x.id, name: x.name, price: x.price, qty: x.qty })),
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
      direction: "rtl",
      fontFamily: 'Cairo, Arial',
      maxWidth: 420,
      margin: '20px auto',
      background: '#fff',
      padding: '16px 7px',
      borderRadius: 12,
      boxShadow: '0 2px 12px 0 #bbc6dd44',
      minHeight: '100vh',
    }}>
      <h1 style={{ color: '#286090', marginBottom: 25, textAlign: 'center', fontSize: 28 }}>إضافة طلب جديد</h1>
      {spareWarning && <div style={{ color: '#e34a4a', padding: 10, background: '#fff3f2', border: '1px solid #ffb0b0', borderRadius: 6, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>{spareWarning}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, width: '100%' }}>
        <label style={lbl}>اسم العميل:
          <input required value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} autoFocus />
        </label>
        <label style={lbl}>رقم الهاتف:
          <input required value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} />
        </label>
        <label style={lbl}>نوع السيارة:
          <input required value={carType} onChange={e => setCarType(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} />
        </label>
        <label style={lbl}>موديل السيارة:
          <input required value={carModel} onChange={e => setCarModel(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} />
        </label>
        <label style={lbl}>نمرة السيارة:
          <input required value={carNumber} onChange={e => setCarNumber(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} />
        </label>
        <label style={lbl}>الكيلومتر الحالي:
          <input required type="number" min={0} value={kilometers} onChange={e => setKilometers(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} />
        </label>
        <label style={lbl}>المشكلة:
          <textarea required value={problem} onChange={e => setProblem(e.target.value)} style={{ ...inputStyle, resize: 'vertical', width: '100%', fontSize: 15 }} rows={3} />
        </label>
        <label style={lbl}>الملاحظات:
          <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inputStyle, resize: 'vertical', width: '100%', fontSize: 15 }} rows={2} placeholder="اختياري" />
        </label>
        <div style={{ margin: '10px 0', background: '#f4f8fd', borderRadius: 7, padding: 8, overflowX: 'auto' }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>قطع الغيار المطلوبة:</div>
          {usedSpares.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 7, marginBottom: 7, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={row.category || ""} onChange={e => updateSpareRow(idx, "category", e.target.value)} style={{ ...inputStyle, width: '100%', minWidth: 120, fontSize: 15 }}>
                <option value="">اختر القسم...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={row.id} onChange={e => updateSpareRow(idx, "id", e.target.value)} style={{ ...inputStyle, width: '100%', minWidth: 120, fontSize: 15 }} disabled={!row.category}>
                <option value="">اختر القطعة...</option>
                {spares.filter(sp => sp.category === row.category).map(sp => <option value={sp._id} key={sp._id} disabled={sp.quantity === 0}>
                  {sp.name} (سعر: {sp.price}ج - متوفر: {sp.quantity})
                </option>)}
              </select>
              <input
                type="number" min={1}
                style={{ ...inputStyle, width: 65, fontSize: 15 }}
                value={row.qty}
                onChange={e => updateSpareRow(idx, 'qty', e.target.value)}
                placeholder="الكمية"
                max={spares.find(sp => sp._id === row.id)?.quantity || ''}
              />
              <input
                type="number"
                min={0}
                style={{ ...inputStyle, width: 80, fontSize: 15 }}
                value={row.price}
                onChange={e => updateSpareRow(idx, 'price', e.target.value)}
                placeholder="سعر القطعة"
              />
              <span style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>
                {row.price ? (row.price * row.qty) + ' ج' : ''}
              </span>
              <button type="button" style={{ background: '#e34a4a', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 18px', fontWeight: 700, marginRight: 0, marginTop: 5, cursor: 'pointer', fontSize: 15 }} onClick={() => removeSpareRow(idx)}>حذف</button>
            </div>
          ))}
          <button type="button" onClick={addSpareRow} style={{ background: '#286090', color: '#fff', padding: '10px 0', fontWeight: 'bold', borderRadius: 7, marginTop: 5, border: 'none', fontFamily: 'inherit', fontSize: 16, cursor: 'pointer', width: '100%' }}>+ إضافة قطعة جديدة</button>
        </div>
        <label style={lbl}>تكلفة الصيانة:
          <input type="number" min={0} value={repairCost} onChange={e => setRepairCost(e.target.value)} style={{ ...inputStyle, width: '100%', fontSize: 15 }} placeholder="اختياري" />
        </label>
        <div style={{ fontWeight: 600, margin: '14px 0 0', fontSize: 16 }}>
          الإجمالي:&nbsp;
          <span style={{ fontWeight: 'bold', color: '#286090', background: '#f0f4ff', borderRadius: 6, padding: '4px 16px' }}>{total || 0}</span> جنيه
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#286090', color: '#fff', fontWeight: 700, padding: '12px', borderRadius: 8, marginTop: 8, fontSize: 18, border: 'none', cursor: 'pointer', transition: '.2s', width: '100%' }}
        >
          {loading ? "...يتم الحفظ" : "إضافة الطلب"}
        </button>
      </form>
    </div>
  )
}