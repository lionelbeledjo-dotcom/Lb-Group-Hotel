import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, TrendingUp, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance — LB Group" }] }),
  component: FinancePage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  refunded: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  refunded: "Remboursé",
  cancelled: "Annulé",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  mobile_money: "Mobile Money",
  bank_transfer: "Virement",
};

function FinancePage() {
  const qc = useQueryClient();

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, reservations(guest_name, check_in, check_out)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, method }: { id: string; status: string; method?: string }) => {
      const update: any = { status: status as any };
      if (status === "paid") {
        update.paid_at = new Date().toISOString();
        if (method) update.method = method as any;
      }
      const { error } = await supabase.from("invoices").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture mise à jour");
    },
  });

  const totalRevenue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const pendingAmount = invoices.filter((i: any) => i.status === "pending").reduce((s: number, i: any) => s + Number(i.amount), 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const amount = invoices
      .filter((inv: any) => inv.status === "paid" && inv.paid_at?.slice(0, 10) === key)
      .reduce((s: number, inv: any) => s + Number(inv.amount), 0);
    return { d: label, v: amount };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Finance & Facturation</h1>
        <p className="text-sm text-muted-foreground">{invoices.length} factures</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <div><div className="text-2xl font-semibold gradient-text">€ {totalRevenue.toLocaleString()}</div><div className="text-xs text-muted-foreground">Revenus encaissés</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <div><div className="text-2xl font-semibold">€ {pendingAmount.toLocaleString()}</div><div className="text-xs text-muted-foreground">En attente</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Banknote className="h-5 w-5 text-blue-400" />
            <div><div className="text-2xl font-semibold">{invoices.filter((i: any) => i.status === "paid").length}</div><div className="text-xs text-muted-foreground">Factures payées</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle>Revenus — 7 derniers jours</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="d" stroke="oklch(0.7 0.03 300)" />
              <YAxis stroke="oklch(0.7 0.03 300)" />
              <Tooltip contentStyle={{ background: "oklch(0.17 0.025 290)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke="oklch(0.68 0.27 350)" strokeWidth={3} dot={{ fill: "oklch(0.68 0.27 350)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {invoices.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune facture pour le moment.
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Séjour</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.reservations?.guest_name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.reservations ? `${inv.reservations.check_in} → ${inv.reservations.check_out}` : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">€ {Number(inv.amount).toLocaleString()}</TableCell>
                  <TableCell>{inv.method ? METHOD_LABELS[inv.method] || inv.method : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_COLORS[inv.status]}>{STATUS_LABELS[inv.status]}</Badge></TableCell>
                  <TableCell>
                    {inv.status === "pending" && (
                      <Select onValueChange={(method) => updateStatus.mutate({ id: inv.id, status: "paid", method })}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Encaisser" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(METHOD_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
