import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Globe, Mail, Phone, Briefcase, Save } from "lucide-react";
import { toast } from "sonner";

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  primary_service_category: string;
}

const defaultSettings: SiteSettings = {
  site_name: "",
  site_description: "",
  contact_email: "",
  contact_phone: "",
  primary_service_category: "other",
};

const categoryOptions = [
  { value: "moving", label: "Flytt" },
  { value: "cleaning", label: "Städning" },
  { value: "dental", label: "Tandvård" },
  { value: "other", label: "Övrigt" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      data?.forEach((row) => {
        settingsMap[row.key] = typeof row.value === "string" ? row.value : JSON.stringify(row.value);
      });
      return settingsMap;
    },
  });

  useEffect(() => {
    if (dbSettings) {
      setSettings({
        site_name: parseValue(dbSettings.site_name) || "",
        site_description: parseValue(dbSettings.site_description) || "",
        contact_email: parseValue(dbSettings.contact_email) || "",
        contact_phone: parseValue(dbSettings.contact_phone) || "",
        primary_service_category: parseValue(dbSettings.primary_service_category) || "other",
      });
    }
  }, [dbSettings]);

  function parseValue(value: any): string {
    if (!value) return "";
    try {
      // Handle double-encoded JSON strings
      const parsed = JSON.parse(value);
      return typeof parsed === "string" ? parsed : value;
    } catch {
      return value;
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: update.key, value: update.value }, { onConflict: "key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Inställningar sparade");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error("Kunde inte spara: " + error.message);
    },
  });

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-muted-foreground">
          Laddar inställningar...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Inställningar
            </h1>
            <p className="text-muted-foreground">
              Konfigurera webbplatsens grundinställningar
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Sparar..." : "Spara ändringar"}
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Site Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Webbplatsidentitet
              </CardTitle>
              <CardDescription>
                Grundläggande information om din katalog. Ändra dessa för att anpassa till din nisch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Webbplatsnamn</Label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => handleChange("site_name", e.target.value)}
                  placeholder="Hitta Flyttfirma"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Visas i sidhuvudet och som standardtitel
                </p>
              </div>
              <div>
                <Label>Beskrivning</Label>
                <Textarea
                  value={settings.site_description}
                  onChange={(e) => handleChange("site_description", e.target.value)}
                  placeholder="Jämför och hitta de bästa flyttfirmorna i Sverige"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Standard meta-beskrivning för SEO
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Nischkonfiguration
              </CardTitle>
              <CardDescription>
                Välj vilken typ av tjänster din katalog fokuserar på.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Primär tjänstekategori</Label>
                <Select
                  value={settings.primary_service_category}
                  onValueChange={(v) => handleChange("primary_service_category", v)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Påverkar standardfilter och kategorisering
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Kontaktuppgifter
              </CardTitle>
              <CardDescription>
                Kontaktinformation som visas på webbplatsen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-postadress</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange("contact_email", e.target.value)}
                    placeholder="info@example.com"
                  />
                </div>
                <div>
                  <Label>Telefonnummer</Label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => handleChange("contact_phone", e.target.value)}
                    placeholder="08-123 45 67"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>📋 Template-information</CardTitle>
              <CardDescription>
                Detta projekt är byggt som en remixbar template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>För att skapa en ny nisch:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Remixa detta projekt</li>
                  <li>Rensa databasen (ta bort alla städer, tjänster, företag)</li>
                  <li>Uppdatera inställningarna ovan för din nya nisch</li>
                  <li>Lägg till nya tjänster via Tjänster-sidan</li>
                  <li>Lägg till städer via Städer-sidan</li>
                  <li>Importera företag via Scrape eller Import</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
