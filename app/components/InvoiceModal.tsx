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
  borderRadius: 12,
  padding: "16px 10px 12px 10px",
  minWidth: 220,
  maxWidth: 270,
  width: "100%",
  boxShadow: "0 2px 10px #bbc6dd33",
  position: "relative",
  fontFamily: "Cairo, Tahoma, Arial, sans-serif",
};

const labelStyle: React.CSSProperties = {
  color: "#286090",
  fontWeight: 600,
  marginBottom: 2,
  fontSize: 13,
  marginTop: 2,
};

const valueStyle: React.CSSProperties = {
  color: "#222",
  fontWeight: 400,
  fontSize: 13,
  marginBottom: 6,
};

const InvoiceModal: React.FC<InvoiceModalProps> = ({ open, onClose, request }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  if (!open || !request) return null;
  // دالة لتحميل الفاتورة كصورة
  const handleDownloadImage = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.download = `فاتورة_${request.customerName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <button onClick={onClose} style={{position:'absolute',top:6,right:8,fontSize:18,fontWeight:'bold',background:'none',border:'none',color:'#e34a4a',cursor:'pointer'}}>×</button>
        {/* زر تحميل الفاتورة كصورة */}
        <button onClick={handleDownloadImage} style={{position:'absolute',top:6,left:8,fontSize:13,background:'#286090',color:'#fff',border:'none',borderRadius:6,padding:'3px 10px',cursor:'pointer'}}>تحميل كصورة</button>
        {/* محتوى الفاتورة */}
  <div ref={invoiceRef} style={{background:'#fff', paddingRight: '18px', paddingLeft: '6px'}}>
          <div style={{textAlign:'center',color:'#27853d',fontWeight:'bold',fontSize:15,marginBottom:2,letterSpacing:0.5}}>  AlRayan Integrated Auto Service  </div>
          <div style={{textAlign:'center',color:'#286090',fontWeight:'bold',fontSize:11,marginBottom:7}}>نرحب بكم ونتمنى لكم تجربة خدمة مميزة معنا</div>
          <div style={{textAlign:'center',color:'#286090',marginBottom:10,fontWeight:'bold',fontSize:14}}>فاتورة العميل</div>
          <div style={labelStyle}>اسم العميل:</div>
          <div style={valueStyle}>{request.customerName}</div>
          <div style={labelStyle}>رقم التليفون:</div>
          <div style={valueStyle}>+20{request.phone?.replace(/^0+/, '').replace(/^20/, '')}</div>
          <div style={labelStyle}>المشكلة:</div>
          <div style={valueStyle}>{request.problem}</div>
          <div style={labelStyle}>الملاحظات:</div>
          <div style={valueStyle}>{request.notes || '-'}</div>
          <div style={labelStyle}>الإجمالي:</div>
          <div style={valueStyle}>{request.total || '-'}</div>
          <div style={labelStyle}>طريقة الدفع:</div>
          <div style={valueStyle}>{request.paymentStatus || '-'}</div>
          <div style={labelStyle}>المبلغ المتبقي:</div>
          <div style={valueStyle}>{request.remainingAmount || '-'}</div>
          <div style={labelStyle}>الكيلومتر:</div>
          <div style={valueStyle}>{request.kilometers || '-'}</div>
        </div>
        <button
          style={{marginTop:8,background:'#25D366',color:'#fff',fontWeight:'bold',fontSize:13,padding:'7px 0',border:'none',borderRadius:7,width:'100%',cursor:'pointer',letterSpacing:0.5}}
          onClick={() => {
            const phoneDisplay = '+20' + (request.phone || '').replace(/^0+/, '').replace(/^20/, '');
            const text = `مركز الرايان لخدمات السيارات\nنرحب بكم ونتمنى لكم تجربة خدمة مميزة معنا\n\nفاتورة العميل\n\nالاسم: ${request.customerName}\nرقم التليفون: ${phoneDisplay}\nالمشكلة: ${request.problem}\nالملاحظات: ${request.notes || '-'}\nالإجمالي: ${request.total || '-'}\nطريقة الدفع: ${request.paymentStatus || '-'}\nالمبلغ المتبقي: ${request.remainingAmount || '-'}\nالكيلومتر: ${request.kilometers || '-'}`;
            let phone = (request.phone || '').replace(/\D/g, '');
            if (phone.startsWith('0')) phone = phone.substring(1);
            if (!phone.startsWith('20')) phone = '20' + phone;
            let waUrl = '';
            if (phone.length >= 10 && phone.length <= 15) {
              waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
            } else {
              waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            }
            // محاولة فتح تطبيق واتساب على ويندوز أولاً
            let tried = false;
            const appUrl = waUrl.replace('https://wa.me/', 'whatsapp://send?phone=').replace('?text=', '&text=');
            const timeout = setTimeout(() => {
              if (!tried) {
                window.open(waUrl, '_blank');
                tried = true;
              }
            }, 800);
            window.location.href = appUrl;
            // إذا لم ينجح التحويل خلال 800ms، يفتح المتصفح تلقائياً
          }}
        >إرسال على واتساب</button>
      </div>
    </div>
  );
};

export default InvoiceModal;
