"use client";
import { useEffect, useState } from "react";

interface Spare {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

type EditState = null | { id:string, name:string, price:number };

export default function SparesPage() {
  const [search, setSearch] = useState("");
  const [spares, setSpares] = useState<Spare[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
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
  'حشو فلتر زيت',
  'موبينة',
  'مواسير و اخري'
  ];
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [edit, setEdit] = useState<EditState>(null);
  const [editValue, setEditValue] = useState<{name:string, price:string, category:string}>({name:"", price:"", category:""});

  async function fetchSpares() {
    setLoading(true);
    const res = await fetch("/api/spares");
    const data = await res.json();
    setSpares(data);
    setLoading(false);
  }

  useEffect(() => { fetchSpares(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(undefined);
    const res = await fetch("/api/spares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, quantity, category })
    });
    const data = await res.json();
    if (data.error) setMessage(data.error);
    else {
  fetchSpares();
  setName(""); setPrice(""); setQuantity(""); setCategory("");
  setMessage("تمت الإضافة بنجاح!");
    }
  }

  async function handleUpdate(id: string, value: Partial<Spare>) {
    await fetch("/api/spares", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...value })
    });
    fetchSpares();
  }

  async function handleDelete(id: string) {
    if (window.confirm("تأكيد حذف القطعة؟")) {
      await fetch("/api/spares", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchSpares();
    }
  }

  function startEdit(sp: Spare) {
  setEdit({ id: sp._id, name: sp.name, price: sp.price });
  setEditValue({ name: sp.name, price: sp.price+"", category: sp.category || "" });
  }

  async function saveEdit() {
    if (!edit) return;
    await handleUpdate(edit.id, {
      name: editValue.name,
      price: parseFloat(editValue.price),
      category: editValue.category
    });
    setEdit(null);
  }

  return (
    <div style={{ direction: "rtl", fontFamily: "Cairo, Arial", maxWidth: 650, margin: "40px auto", background: "#fff", padding: 26, borderRadius: 12, boxShadow: '0 2px 8px #e9eefa66' }}>
      <h1 style={{ color: "#286090", fontWeight: 900, textAlign: "center", fontSize: 26 }}>مخزون قطع الغيار</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 11, margin: "15px 0 22px 0" }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث عن قطعة أو قسم..."
          style={{marginBottom:12, padding:8, borderRadius:7, border:'1px solid #bbc6d3', fontSize:16, width:'100%'}}
        />
        <div style={{ display: 'flex', gap: 11 }}>
          <input style={inputStyle} required value={name} onChange={e=>setName(e.target.value)} placeholder="اسم القطعة" />
          <select style={{...inputStyle, width:120}} required value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">اختر القسم...</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input style={{...inputStyle,width:90}} required type="number" min={0} value={price} onChange={e=>setPrice(e.target.value)} placeholder="السعر" />
          <input style={{...inputStyle,width:90}} required type="number" min={1} value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="الكمية" />
          <button style={btnStyle} type="submit">إضافة</button>
        </div>
        {message && <div style={{color: message.includes('نجاح')?'#27853d':'#e34a4a', fontWeight:'bold'}}>{message}</div>}
      </form>
      {loading ? <div>...يتم التحميل</div> : (
        <table style={{width:'100%', borderCollapse:'collapse',background:'#f7fafd', fontSize:15, borderRadius:8, overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#e7ecfa'}}>
              <th>اسم القطعة</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>الكمية</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {spares.filter(sp => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              return sp.name.toLowerCase().includes(q) || (sp.category?.toLowerCase().includes(q));
            }).map(sp => (
              <tr key={sp._id} style={sp.quantity <= 5 ? {background:'#ffeaea', color:'#cc1818', fontWeight:'bold'}:{}}>
                <td>
                  {edit?.id === sp._id
                    ? <input style={{...inputStyle, width:120, fontWeight:'bold'}} value={editValue.name} onChange={e=>setEditValue(v=>({...v,name:e.target.value}))} />
                    : <span>{sp.name}</span> }
                </td>
                <td>
                  {edit?.id === sp._id
                    ? <select style={{...inputStyle, width:100}} value={editValue.category} onChange={e=>setEditValue(v=>({...v,category:e.target.value}))}>
                        <option value="">اختر القسم...</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    : <span>{sp.category || '-'}</span> }
                </td>
                <td>
                  {edit?.id === sp._id
                    ? <input style={{...inputStyle, width:80, fontWeight:'bold'}} type="number" min={0} value={editValue.price} onChange={e=>setEditValue(v=>({...v,price:e.target.value}))} />
                    : <span>{sp.price}</span> }
                </td>
                <td>
                  <input
                    style={{width:55, border:'1px solid #bbc6d3',textAlign:'center', borderRadius:6, fontWeight:'bold',fontFamily:'inherit'}} value={sp.quantity}
                    onChange={e=>{
                      let num = parseInt(e.target.value)||0;
                      num = num < 0 ? 0 : num;
                      handleUpdate(sp._id, { quantity: num });
                    }}
                    type="number" min={0}
                  />
                  {sp.quantity <= 5 && <span style={{marginRight:5,color:'#e34a4a',fontWeight:'bold'}}>(منخفض!)</span>}
                </td>
                <td>
                  {edit?.id === sp._id ? (
                    <>
                      <button style={{...btnStyle,background:'#27853d',marginLeft:6}} onClick={saveEdit} type="button">حفظ</button>
                      <button style={{...btnStyle,background:'#888'}} onClick={()=>setEdit(null)} type="button">إلغاء</button>
                    </>
                  ) : (
                    <>
                      <button style={{...btnStyle,padding:'6px 12px', fontSize:15,marginLeft:5}} onClick={()=>startEdit(sp)} type="button">تعديل</button>
                      <button style={btnStyle} onClick={()=>handleDelete(sp._id)} type="button">حذف</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {spares.length === 0 && (
              <tr><td colSpan={4} style={{textAlign:'center', padding:16}}>لا يوجد قطع غيار بالمخزن</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #bbc6d3',
  borderRadius: 6,
  padding: '8px 11px',
  fontSize: 16,
  fontFamily: 'inherit',
  outline: 'none',
};
const btnStyle: React.CSSProperties = {
  background: '#2784be',
  color: '#fff',
  fontWeight: 700,
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 16,
  border: 'none',
  cursor: 'pointer',
  transition: '.2s',
  fontFamily: 'inherit',
};
