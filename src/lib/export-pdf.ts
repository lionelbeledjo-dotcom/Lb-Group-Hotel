export function exportInvoicePDF(invoice: {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  amount: number;
  method?: string;
  status: string;
  paid_at?: string;
  created_at: string;
}) {
  const METHOD_LABELS: Record<string, string> = {
    cash: "Espèces",
    card: "Carte bancaire",
    mobile_money: "Mobile Money",
    bank_transfer: "Virement bancaire",
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: "En attente",
    paid: "Payé",
    refunded: "Remboursé",
    cancelled: "Annulé",
  };

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture ${invoice.id.slice(0, 8)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a2744; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #1a2744; padding-bottom: 20px; }
  .logo { font-size: 28px; font-weight: 700; }
  .logo span { color: #c8a45c; }
  .invoice-label { font-size: 12px; color: #666; margin-top: 4px; }
  .ref { text-align: right; }
  .ref .num { font-size: 18px; font-weight: 600; }
  .ref .date { font-size: 12px; color: #666; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 8px; }
  .client-name { font-size: 18px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #1a2744; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #1a2744; border-bottom: none; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">LB <span>Group</span></div>
    <div class="invoice-label">Gestion Hôtelière</div>
  </div>
  <div class="ref">
    <div class="num">FACTURE #${invoice.id.slice(0, 8).toUpperCase()}</div>
    <div class="date">Émise le ${new Date(invoice.created_at).toLocaleDateString("fr-FR")}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Client</div>
  <div class="client-name">${invoice.guest_name}</div>
</div>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Période</th>
      <th>Méthode</th>
      <th style="text-align:right">Montant</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Séjour hôtelier</td>
      <td>${invoice.check_in} → ${invoice.check_out}</td>
      <td>${invoice.method ? METHOD_LABELS[invoice.method] || invoice.method : "—"}</td>
      <td style="text-align:right">${Number(invoice.amount).toLocaleString("fr-FR")} FCFA</td>
    </tr>
    <tr class="total-row">
      <td colspan="3">TOTAL</td>
      <td style="text-align:right">${Number(invoice.amount).toLocaleString("fr-FR")} FCFA</td>
    </tr>
  </tbody>
</table>

<div class="section">
  <div class="section-title">Statut</div>
  <span class="status ${invoice.status === "paid" ? "status-paid" : "status-pending"}">${STATUS_LABELS[invoice.status] || invoice.status}</span>
  ${invoice.paid_at ? `<span style="margin-left:12px;font-size:12px;color:#666;">Payé le ${new Date(invoice.paid_at).toLocaleDateString("fr-FR")}</span>` : ""}
</div>

<div class="footer">
  <p>LB Group — Gestion Hôtelière Professionnelle</p>
  <p>Contact : +33 6 60 06 17 23 — lbcloudadmin@gmail.com</p>
</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}
