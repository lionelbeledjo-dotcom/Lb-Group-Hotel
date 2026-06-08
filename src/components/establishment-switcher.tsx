import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useEstablishment } from "@/hooks/use-establishment";

export function EstablishmentSwitcher() {
  const { currentId, setCurrentId } = useEstablishment();

  const { data: establishments = [] } = useQuery({
    queryKey: ["my-establishments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: owned } = await supabase
        .from("hotel_settings" as any)
        .select("id, name")
        .eq("owner_id", user.id);

      const { data: member } = await supabase
        .from("establishment_members" as any)
        .select("establishment_id, hotel_settings(id, name)")
        .eq("user_id", user.id);

      const list = [...(owned || [])];
      if (member) {
        for (const m of member as any[]) {
          if (m.hotel_settings && !list.find((e: any) => e.id === m.hotel_settings.id)) {
            list.push(m.hotel_settings);
          }
        }
      }
      return list as unknown as { id: string; name: string }[];
    },
  });

  if (establishments.length <= 1) return null;

  return (
    <Select value={currentId || ""} onValueChange={setCurrentId}>
      <SelectTrigger className="h-8 w-48 text-xs">
        <Building2 className="mr-1 h-3 w-3" />
        <SelectValue placeholder="Établissement" />
      </SelectTrigger>
      <SelectContent>
        {establishments.map((e) => (
          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
