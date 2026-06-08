import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Plus, CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reservations")({
  head: () => ({ meta: [{ title: "Réservations — LB Group" }] }),
  component: ReservationsPage,
});

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  checked_in: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  checked_out: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  no_show: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  checked_in: "Check-in",
  checked_out: "Check-out",
  cancelled: "Annulé",
  no_show: "No-show",
};

function ReservationsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    guest_name: "", guest_phone: "", guest_email: "",
    room_id: "", check_in: "", check_out: "",
    total_amount: "0", notes: "",
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(number, category)")
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-available"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, number, category").order("number");
      if (error) throw error;
      return data;
    },
  });

  const createReservation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reservations").insert({
        guest_name: form.guest_name,
        guest_phone: form.guest_phone || null,
        guest_email: form.guest_email || null,
        room_id: form.room_id || null,
        check_in: form.check_in,
        check_out: form.check_out,
        total_amount: parseFloat(form.total_amount) || 0,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Réservation créée");
      setOpen(false);
      setForm({ guest_name: "", guest_phone: "", guest_email: "", room_id: "", check_in: "", check_out: "", total_amount: "0", notes: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reservations").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Statut mis à jour");
    },
  });

  const filtered = reservations.filter((r: any) =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    r.guest_phone?.includes(search) ||
    r.guest_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Réservations</h1>
          <p className="text-sm text-muted-foreground">{reservations.length} réservations au total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="mr-2 h-4 w-4" /> Nouvelle réservation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nouvelle réservation</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nom du client *</Label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} /></div>
              <div><Label>Téléphone</Label><Input value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} /></div>
              <div>
                <Label>Chambre</Label>
                <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>N° {r.number} ({r.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Montant total (€)</Label><Input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} /></div>
              <div><Label>Check-in *</Label><Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
              <div><Label>Check-out *</Label><Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
              <div className="col-span-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createReservation.mutate()} disabled={!form.guest_name || !form.check_in || !form.check_out} className="gradient-bg">Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune réservation trouvée.
          </CardContent>
        </Card>
      ) : (
        <Card className="glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Chambre</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{r.guest_phone || r.guest_email || "—"}</div>
                  </TableCell>
                  <TableCell>{r.rooms ? `N° ${r.rooms.number}` : "—"}</TableCell>
                  <TableCell>{r.check_in}</TableCell>
                  <TableCell>{r.check_out}</TableCell>
                  <TableCell className="font-medium">€ {Number(r.total_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
