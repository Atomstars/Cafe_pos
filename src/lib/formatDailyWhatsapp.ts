export function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface DailyReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  peakHour: string;
  paymentSplit: {
    CASH?: number;
    UPI?: number;
    CARD?: number;
  };
  topItems?: TopItem[];
}

export function formatDailyReportMessage(report: DailyReport, aiSummary?: string) {
  const cash = report.paymentSplit?.CASH || 0;
  const upi = report.paymentSplit?.UPI || 0;
  const card = report.paymentSplit?.CARD || 0;

  const top = (report.topItems || [])
    .map(
      (i: TopItem, idx: number) =>
        `${idx + 1}. ${i.name} — ${i.quantity} sold | ${formatMoney(i.revenue)}`
    )
    .join("\n");

  return `
📊 Cafe Daily Report (${report.date})

✅ Orders: ${report.totalOrders}
💰 Revenue: ${formatMoney(report.totalRevenue)}
🕒 Peak Hour: ${report.peakHour}

💳 Payments:
• Cash: ${formatMoney(cash)}
• UPI: ${formatMoney(upi)}
• Card: ${formatMoney(card)}

🔥 Top Items:
${top || "No sales today"}

${aiSummary ? `\n🤖 AI Insights:\n${aiSummary}` : ""}
  `.trim();
}
