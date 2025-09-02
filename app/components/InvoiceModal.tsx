import React, { useRef } from "react";
import html2canvas from "html2canvas";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  request: {
    customerName: string;
    phone: string;
    problem: string;
    notes?: string;
    total?: string;
    paymentStatus?: string;
    remainingAmount?: string;
    kilometers?: string;
  } | null;
}

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "#0008",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: "24px 18px 18px 18px",
  minWidth: 320,
  maxWidth: 420,
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 24px #bbc6dd44",
  position: "relative",
  fontFamily: "Cairo, Tahoma, Arial, sans-serif",
};

const labelStyle: React.CSSProperties = {
  color: "#286090",
  fontWeight: 700,
  marginBottom: 4,
  fontSize: 16,
  marginTop: 8,
  letterSpacing: 0.3,
};

const valueStyle: React.CSSProperties = {
  color: "#222",
  fontWeight: 500,
  fontSize: 15,
  marginBottom: 10,
  wordBreak: "break-word",
  letterSpacing: 0.2,
};

const InvoiceModal: React.FC<InvoiceModalProps> = ({ open, onClose, request }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  if (!open || !request) return null;

  const handleDownloadImage = async () => {
    if (invoiceRef.current) {
      buttonsRef.current.forEach(btn => {
        if (btn) btn.style.display = 'none';
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      buttonsRef.current.forEach(btn => {
        if (btn) btn.style.display = 'block';
      });

      const link = document.createElement("a");
      link.download = `فاتورة_${request.customerName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <button
          ref={el => { buttonsRef.current[0] = el; }}
          onClick={onClose}
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            fontSize: 18,
            fontWeight: "bold",
            background: "none",
            border: "none",
            color: "#e34a4a",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <button
          ref={el => { buttonsRef.current[1] = el; }}
          onClick={handleDownloadImage}
          style={{
            position: "absolute",
            top: 6,
            left: 8,
            fontSize: 13,
            background: "#286090",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "3px 10px",
            cursor: "pointer",
          }}
        >
          تحميل كصورة
        </button>
        <div
          ref={invoiceRef}
          style={{
            background: "#fff",
            padding: "18px 15px 15px 15px",
            minWidth: 280,
            maxWidth: 380,
            width: "100%",
            boxSizing: "border-box",
            border: "1.5px solid #e0e6f2",
            borderRadius: 12,
            direction: "rtl",
            // تم تغيير الخطوط لضمان التوافق مع html2canvas
            fontFamily: "Tahoma, Arial, 'Noto Sans Arabic', 'Simplified Arabic', sans-serif",
            lineHeight: 1.9,
            fontSize: 15,
            // تم زيادة تباعد الحروف والكلمات
            letterSpacing: "0.5px",
            wordSpacing: "2px",
            // أهم إضافة: تعطيل الترابط في الخطوط العربية
            fontVariantLigatures: "none",
            MozFontFeatureSettings: '"liga" 0', // لضمان التوافق مع Firefox
            textRendering: "optimizeLegibility",
            whiteSpace: "pre-line",
            color: "#222",
          }}
        >
          <div style={{ textAlign: "center", color: "#27853d", fontWeight: "bold", fontSize: 16, marginBottom: 4, letterSpacing: 0.6 }}>
            AlRayan Integrated Auto Service
          </div>
          <div style={{ textAlign: "center", color: "#286090", fontWeight: "bold", fontSize: 12, marginBottom: 10 }}>نرحب بكم ونتمنى لكم تجربة خدمة مميزة معنا</div>
          <div style={{ textAlign: "center", color: "#286090", marginBottom: 15, fontWeight: "bold", fontSize: 15 }}>فاتورة العميل</div>
          
          <div style={labelStyle}>اسم العميل:</div>
          <div style={valueStyle}>{request.customerName}</div>
          
          <div style={labelStyle}>رقم التليفون:</div>
          <div style={valueStyle}>+20{request.phone?.replace(/^0+/, "").replace(/^20/, "")}</div>
          
          <div style={labelStyle}>المشكلة:</div>
          <div style={valueStyle}>{request.problem}</div>
          
          <div style={labelStyle}>الملاحظات:</div>
          <div style={valueStyle}>{request.notes || "-"}</div>
          
          <div style={labelStyle}>الإجمالي:</div>
          <div style={valueStyle}>{request.total || "-"}</div>
          
          <div style={labelStyle}>طريقة الدفع:</div>
          <div style={valueStyle}>{request.paymentStatus || "-"}</div>
          
          <div style={labelStyle}>المبلغ المتبقي:</div>
          <div style={valueStyle}>{request.remainingAmount || "-"}</div>
          
          <div style={labelStyle}>الكيلومتر:</div>
          <div style={valueStyle}>{request.kilometers || "-"}</div>
          
          <div style={{ marginTop: 28, borderTop: "1px dashed #bbc6dd", paddingTop: 18, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e0f7fa", borderRadius: "50%", width: 24, height: 24 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#25D366" />
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff" />
                </svg>
              </span>
              <span style={{ fontWeight: "bold", color: "#286090", fontSize: 15, letterSpacing: 0.3 }}>01070090636</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fce4ec", borderRadius: "50%", width: 24, height: 24 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#e91e63" />
                  <path d="M12 7a4 4 0 0 0-4 4c0 2.25 4 7 4 7s4-4.75 4-7a4 4 0 0 0-4-4zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#fff" />
                </svg>
              </span>
              <span style={{ fontWeight: "bold", color: "#e91e63", fontSize: 15, letterSpacing: 0.3 }}>الموقع: <span style={{ textDecoration: 'underline', direction: 'ltr' }}>اضغط هنا</span></span>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>https://maps.app.goo.gl/pm3tvQvL8xLGVN8i6</div>
          </div>
        </div>
        <button
          ref={el => { buttonsRef.current[2] = el; }}
          style={{ marginTop: 10, background: "#25D366", color: "#fff", fontWeight: "bold", fontSize: 14, padding: "8px 0", border: "none", borderRadius: 7, width: "100%", cursor: "pointer", letterSpacing: 0.6 }}
          onClick={() => {
            const phoneDisplay = "+20" + (request.phone || "").replace(/^0+/, "").replace(/^20/, "");
            const text = `مركز الرايان لخدمات السيارات\nنرحب بكم ونتمنى لكم تجربة خدمة مميزة معنا\n\nفاتورة العميل\n\nالاسم: ${request.customerName}\nرقم التليفون: ${phoneDisplay}\nالمشكلة: ${request.problem}\nالملاحظات: ${request.notes || "-"}\nالإجمالي: ${request.total || "-"}\nطريقة الدفع: ${request.paymentStatus || "-"}\nالمبلغ المتبقي: ${request.remainingAmount || "-"}\nالكيلومتر: ${request.kilometers || "-"}`;
            let phone = (request.phone || "").replace(/\D/g, "");
            if (phone.startsWith("0")) phone = phone.substring(1);
            if (!phone.startsWith("20")) phone = "20" + phone;
            let waUrl = "";
            if (phone.length >= 10 && phone.length <= 15) {
              waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
            } else {
              waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            }
            let tried = false;
            const appUrl = waUrl.replace("https://wa.me/", "whatsapp://send?phone=").replace("?text=", "&text=");
            const timeout = setTimeout(() => {
              if (!tried) {
                window.open(waUrl, "_blank");
                tried = true;
              }
            }, 800);
            window.location.href = appUrl;
          }}
        >
          إرسال على واتساب
        </button>
      </div>
    </div>
  );
};

export default InvoiceModal;