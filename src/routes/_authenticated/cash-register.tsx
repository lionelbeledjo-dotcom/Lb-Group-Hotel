import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEMO_CASH_REGISTER } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/cash-register")({
  head: () => ({ meta: [{ title: "Fonds de caisse — LB Group" }] }),
  component: CashRegisterPage,
});

function CashRegisterPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: "", type: "in", description: "", category: "vente" });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["cash-register"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_register" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return DEMO_CASH_REGISTER;
      return (data as any[]).length > 0 ? data as any[] : DEMO_CASH_REGISTER;
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("cash_register" as any).insert({
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description || null,
        category: form.category,
        recorded_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ amount: "", type: "in", description: "", category: "vente" });
      qc.invalidateQueries({ queryKey: ["cash-register"] });
      toast.success("Mouvement enregistré !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalIn = entries.filter((e: any) => e.type === "in").reduce((s: number, e: any) => s + Number(e.amount), 0);
  const totalOut = entries.filter((e: any) => e.type === "out").reduce((s: number, e: any) => s + Number(e.amount), 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Fonds de caisse</h1>
        <p className="text-sm text-muted-foreground">Suivi des entrées et sorties de caisse</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div><div className="text-2xl font-semibold text-emerald-600">{totalIn.toLocaleString()} FCFA</div><div className="text-xs text-muted-foreground">Entrées</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <div><div className="text-2xl font-semibold text-red-600">{totalOut.toLocaleString()} FCFA</div><div className="text-xs text-muted-foreground">Sorties</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Wallet className="h-5 w-5 text-primary" />
            <div><div className="text-2xl font-semibold gradient-text">{balance.toLocaleString()} FCFA</div><div className="text-xs text-muted-foreground">Solde</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle>Nouveau mouvement</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div><Label>Montant (FCFA)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000" /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Entrée</SelectItem>
                  <SelectItem value="out">Sortie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vente">Vente</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="achat">Achat</SelectItem>
                  <SelectItem value="salaire">Salaire</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionnel" /></div>
            <Button className="gradient-bg text-white" onClick={() => addEntry.mutate()} disabled={!form.amount || addEntry.isPending}>
              {addEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : entries.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun mouvement</TableCell></TableRow>
            ) : entries.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell className="text-sm">{new Date(e.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={e.type === "in" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}>
                    {e.type === "in" ? "Entrée" : "Sortie"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm capitalize">{e.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.description || "—"}</TableCell>
                <TableCell className={`text-right font-medium ${e.type === "in" ? "text-emerald-600" : "text-red-600"}`}>
                  {e.type === "in" ? "+" : "-"}{Number(e.amount).toLocaleString()} FCFA
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
