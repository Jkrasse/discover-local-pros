import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Inställningar
          </h1>
          <p className="text-muted-foreground">
            Konfigurera webbplatsens inställningar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Webbplatsinställningar</CardTitle>
            <CardDescription>
              Här kommer du kunna konfigurera globala inställningar för katalogen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Inställningssidan är under utveckling. Kommande funktioner:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>SEO-standardinställningar</li>
              <li>Kontaktuppgifter</li>
              <li>Sociala medier-länkar</li>
              <li>E-postnotifieringar</li>
              <li>API-konfiguration</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
