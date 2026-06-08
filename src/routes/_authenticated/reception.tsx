import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Headset, LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reception")({
  head: () => ({ meta: [{ title: "Réception — LB Group" }] }),
  component: ReceptionPage,
});

function ReceptionPage() {
  const qc = useQueryClient();

  const { data: todayReservations = [] } = useQuery({
    queryKey: ["reception-today"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("reservations")
        .select("*, rooms(number, category)")
        .or(`check_in.eq.${today},check_out.eq.${today},status.eq.checked_in`)
        .order("check_in");
      if (error) throw error;
      return data;
    },
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservations").update({ status: "checked_in" as any }).eq("id", id);
      if (error) throw error;
      const reservation = todayReservations.find((r: any) => r.id === id);
      if (reservation?.room_id) {
        await supabase.from("rooms").update({ status: "occupied" as any }).eq("id", reservation.room_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reception-today"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Check-in effectué !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const checkOut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservations").update({ status: "checked_out" as any }).eq("id", id);
      if (error) throw error;
      const reservation = todayReservations.find((r: any) => r.id === id);
      if (reservation?.room_id) {
        await supabase.from("rooms").update({ status: "cleaning" as any }).eq("id", reservation.room_id);
        await supabase.from("housekeeping_tasks").insert({ room_id: reservation.room_id, status: "pending" });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reception-today"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      qc.invalidateQueries({ queryKey: ["housekeeping-tasks"] });
      toast.success("Check-out effectué ! Tâche ménage créée.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const arrivals = todayReservations.filter((r: any) => r.status === "confirmed");
  const inHouse = todayReservations.filter((r: any) => r.status === "checked_in");
  const departures = todayReservations.filter((r: any) => r.status === "checked_in" && r.check_out === new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Réception</h1>
        <p className="text-sm text-muted-foreground">Check-in / Check-out — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <LogIn className="h-5 w-5 text-emerald-400" />
            <div><div className="text-2xl font-semibold">{arrivals.length}</div><div className="text-xs text-muted-foreground">Arrivées</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <User className="h-5 w-5 text-blue-400" />
            <div><div className="text-2xl font-semibold">{inHouse.length}</div><div className="text-xs text-muted-foreground">En séjour</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <LogOut className="h-5 w-5 text-amber-400" />
            <div><div className="text-2xl font-semibold">{departures.length}</div><div className="text-xs text-muted-foreground">Départs</div></div>
          </CardContent>
        </Card>
      </div>

      {arrivals.length > 0 && (
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5 text-emerald-400" /> Arrivées du jour</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Séjour</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arrivals.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.guest_name}</div>
                      <div className="text-xs text-muted-foreground">{r.guest_phone || "—"}</div>
                    </TableCell>
                    <TableCell>{r.rooms ? `N° ${r.rooms.number} (${r.rooms.category})` : "—"}</TableCell>
                    <TableCell className="text-sm">{r.check_in} → {r.check_out}</TableCell>
                    <TableCell className="font-medium">€ {Number(r.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" className="gradient-bg" onClick={() => checkIn.mutate(r.id)}>
                        <LogIn className="mr-1 h-3 w-3" /> Check-in
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {inHouse.length > 0 && (
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-blue-400" /> Clients en séjour</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Départ prévu</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inHouse.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.guest_name}</TableCell>
                    <TableCell>{r.rooms ? `N° ${r.rooms.number}` : "—"}</TableCell>
                    <TableCell>{r.check_out}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => checkOut.mutate(r.id)}>
                        <LogOut className="mr-1 h-3 w-3" /> Check-out
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {todayReservations.length === 0 && (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Headset className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune activité aujourd'hui.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
