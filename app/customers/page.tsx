"use client";
import { useEffect, useState } from "react";
import styles from "../requests/requests.module.css";

interface Customer {
  customerName: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      const res = await fetch("/api/requests");
      const data = await res.json();
      // استخراج العملاء الفريدين بناءً على الاسم ورقم الهاتف
      const unique: Record<string, Customer> = {};
      data.forEach((r: any) => {
        if (r.customerName && r.phone) {
          const key = r.customerName + "-" + r.phone;
          unique[key] = { customerName: r.customerName, phone: r.phone };
        }
      });
      setCustomers(Object.values(unique));
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  // فلترة العملاء حسب البحث
  const filtered = search.trim()
    ? customers.filter(c => c.customerName.toLowerCase().includes(search.trim().toLowerCase()))
    : customers;

  return (
    <div className={styles.wrapper} style={{ maxWidth: 600, margin: "40px auto", background: '#f7fafd', boxShadow: '0 2px 8px #e9eefa33', padding: 28 }}>
      <h1 className={styles["page-title"]} style={{ marginBottom: 18, fontSize: '2em', color: '#286090', textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 }}>قائمة العملاء</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <input
          type="text"
          placeholder="🔍 بحث باسم العميل..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '90%',
            maxWidth: 350,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1.5px solid #328bcf',
            fontSize: 16,
            background: '#fff',
            boxShadow: '0 1px 4px #e9eefa22',
            outline: 'none',
            transition: 'border .2s',
            margin: '0 auto',
            fontFamily: 'inherit',
            color: '#286090'
          }}
        />
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#286090', fontSize: 18 }}>...يتم التحميل</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 22, color: '#e34a4a', fontWeight: 600 }}>لا يوجد عملاء</div>
      ) : (
        <table className={styles.table} style={{ background: "#fff", borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px #e9eefa22' }}>
          <thead>
            <tr style={{ background: '#f0f4ff' }}>
              <th style={{ padding: '10px 0', fontSize: 16 }}>اسم العميل</th>
              <th style={{ padding: '10px 0', fontSize: 16 }}>رقم الهاتف</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fd' }}>
                <td style={{ fontWeight: 600, fontSize: 15 }}>{c.customerName}</td>
                <td>
                  <a
                    href={`https://wa.me/2${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#25d366", fontWeight: 600, textDecoration: "none", fontSize: 15 }}
                  >
                    {c.phone}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
