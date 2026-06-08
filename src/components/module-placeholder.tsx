import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ModulePlaceholder({ title, description, features, icon: Icon }: {
  title: string;
  description: string;
  features: string[];
  icon: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="glass">
        <CardContent className="py-12">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-bg glow">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Module en cours de construction</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              La structure et la base de données sont prêtes. Voici ce qui arrive :
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" />{f}
                </li>
              ))}
            </ul>
            <Button className="mt-8 gradient-bg">Demander ce module en priorité</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}