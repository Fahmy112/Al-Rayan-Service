"use client";
import Link from "next/link";
import DashboardSummary from "./DashboardSummary";

export default function Home() {
  return (
    <div style={{direction: "rtl", fontFamily: "Cairo, Arial", maxWidth: 800, margin: "auto", background: "#fff", padding: 24, borderRadius: 12}}>
      <h1 style={{color: '#286090'}}> Welcome To AlRayan Auto Service  </h1>
      <nav style={{marginBottom: 24}}>
      </nav>
      <DashboardSummary />
    </div>
  );
}
