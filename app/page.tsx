import Link from "next/link";

async function getSummary() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/requests`, { cache: "no-store" });
  const requests = await res.json();
  return {
    new: requests.filter((r: any) => r.status === "جديد").length,
    inprogress: requests.filter((r: any) => r.status === "تحت الإصلاح").length,
    done: requests.filter((r: any) => r.status === "تم التسليم").length,
  };
}

export default async function Home() {
  const { new: newCount, inprogress, done } = await getSummary();

  return (
    <div style={{direction: "rtl", fontFamily: "Cairo, Arial", maxWidth: 800, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 12}}>
      <h1 style={{color: '#286090'}}>نظام إدارة مركز الصيانة</h1>
      <nav style={{marginBottom: 24}}>
        <Link href="/add" style={{marginLeft: 20, color: '#286090'}}>إضافة طلب صيانة جديد</Link>
        <Link href="/requests" style={{color: '#286090'}}>متابعة الطلبات الجارية</Link>
      </nav>
      <section>
        <h2 style={{fontSize: '1.2em'}}>ملخص الحالات</h2>
        <div style={{display: 'flex', gap: 20, marginTop: 16, marginBottom: 20}}>
          <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
            <div style={{fontWeight: 700}}>الطلبات الجديدة</div>
            <div style={{color: '#286090', fontSize: 32}}>{newCount}</div>
          </div>
          <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
            <div style={{fontWeight: 700}}>تحت الإصلاح</div>
            <div style={{color: '#286090', fontSize: 32}}>{inprogress}</div>
          </div>
          <div style={{background: '#eee', borderRadius: 8, padding: 18, width: 140, textAlign: 'center'}}>
            <div style={{fontWeight: 700}}>تم التسليم</div>
            <div style={{color: '#286090', fontSize: 32}}>{done}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
