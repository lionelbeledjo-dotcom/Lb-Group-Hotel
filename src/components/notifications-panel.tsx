import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CalendarDays, Wrench, MessageSquare, UserCheck, Brush } from "lucide-react";

const TYPE_ICONS: Record<string, any> = {
  reservation: CalendarDays,
  check_in: UserCheck,
  maintenance: Wrench,
  housekeeping: Brush,
  guest_request: MessageSquare,
  general: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  reservation: "text-blue-500",
  check_in: "text-emerald-500",
  maintenance: "text-red-500",
  housekeeping: "text-purple-500",
  guest_request: "text-amber-500",
  general: "text-primary",
};

export function NotificationsPanel() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) return [];
      return data as any[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications" as any).update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("notifications" as any).update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gradient-bg text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => markAllRead.mutate()}>
              <Check className="mr-1 h-3 w-3" /> Tout marquer lu
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Aucune notification</p>
          ) : (
            <div className="space-y-1">
              {notifications.map((n: any) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer ${!n.read ? "bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => !n.read && markRead.mutate(n.id)}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${TYPE_COLORS[n.type] || "text-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}>{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>}
                      <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full gradient-bg mt-2 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
