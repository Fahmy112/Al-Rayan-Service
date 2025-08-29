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

  return (
    <div className={styles.wrapper} style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1 className={styles["page-title"]}>قائمة العملاء</h1>
      {loading ? (
        <div>...يتم التحميل</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 22 }}>لا يوجد عملاء</div>
      ) : (
        <table className={styles.table} style={{ background: "#fff" }}>
          <thead>
            <tr>
              <th>اسم العميل</th>
              <th>رقم الهاتف</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{c.customerName}</td>
                <td>
                  <a
                    href={`https://wa.me/2${c.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#25d366", fontWeight: 600, textDecoration: "none" }}
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
