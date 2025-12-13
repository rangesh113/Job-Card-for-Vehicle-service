import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generateInvoice = (bill, job) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Vehicle Service Invoice", 14, 20);

  doc.setFontSize(12);
  doc.text(`Customer Name: ${job.customerName}`, 14, 35);
  doc.text(`Vehicle Number: ${job.vehicleNumber}`, 14, 45);
  doc.text(`Complaint: ${job.complaint}`, 14, 55);

  // ✅ CORRECT WAY
  autoTable(doc, {
    startY: 70,
    head: [["Description", "Amount"]],
    body: [
      ["Service Charge", bill.serviceCharge],
      ["Spare Parts Charge", bill.sparePartsCharge],
      ["Total Amount", bill.totalAmount]
    ]
  });

  doc.text(
    `Payment Status: ${bill.paymentStatus}`,
    14,
    doc.lastAutoTable.finalY + 15
  );

  doc.save(`Invoice-${job.vehicleNumber}.pdf`);
};

export default generateInvoice;
