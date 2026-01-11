import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  moving: "Flytt",
  cleaning: "Städning",
  dental: "Tandvård",
  other: "Övrigt",
};

const categoryOptions = [
  { value: "moving", label: "Flytt" },
  { value: "cleaning", label: "Städning" },
  { value: "dental", label: "Tandvård" },
  { value: "other", label: "Övrigt" },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ServiceForm {
  name: string;
  slug: string;
  category: string;
  icon: string;
  description: string;
  seo_title_template: string;
  seo_description_template: string;
}

const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  category: "other",
  icon: "",
  description: "",
  seo_title_template: "",
  seo_description_template: "",
};

export default function ServicesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deleteService, setDeleteService] = useState<any>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const { error } = await supabase.from("services").insert({
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        category: data.category as "moving" | "cleaning" | "dental" | "other",
        icon: data.icon || null,
        description: data.description || null,
        seo_title_template: data.seo_title_template || null,
        seo_description_template: data.seo_description_template || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Tjänst skapad");
      setForm(emptyForm);
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast.error("Kunde inte skapa tjänst: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceForm }) => {
      const { error } = await supabase
        .from("services")
        .update({
          name: data.name,
          slug: data.slug,
          category: data.category as "moving" | "cleaning" | "dental" | "other",
          icon: data.icon || null,
          description: data.description || null,
          seo_title_template: data.seo_title_template || null,
          seo_description_template: data.seo_description_template || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Tjänst uppdaterad");
      setEditingService(null);
      setForm(emptyForm);
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera tjänst: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Tjänst borttagen");
      setDeleteService(null);
    },
    onError: (error) => {
      toast.error("Kunde inte ta bort tjänst: " + error.message);
    },
  });

  const openEditDialog = (service: any) => {
    setForm({
      name: service.name,
      slug: service.slug,
      category: service.category,
      icon: service.icon || "",
      description: service.description || "",
      seo_title_template: service.seo_title_template || "",
      seo_description_template: service.seo_description_template || "",
    });
    setEditingService(service);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Ange ett namn för tjänsten");
      return;
    }
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const ServiceFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Namn *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Flyttfirmor"
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder={form.name ? generateSlug(form.name) : "flyttfirmor"}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Kategori</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger>
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
        </div>
        <div>
          <Label>Ikon (emoji)</Label>
          <Input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="🚚"
          />
        </div>
      </div>
      <div>
        <Label>Beskrivning</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Kort beskrivning av tjänsten..."
          rows={2}
        />
      </div>
      <div>
        <Label>SEO Titelmall</Label>
        <Input
          value={form.seo_title_template}
          onChange={(e) => setForm({ ...form, seo_title_template: e.target.value })}
          placeholder="Bästa {service} i {city} | Jämför & Hitta"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Använd {"{city}"} och {"{service}"} som variabler
        </p>
      </div>
      <div>
        <Label>SEO Beskrivningsmall</Label>
        <Textarea
          value={form.seo_description_template}
          onChange={(e) => setForm({ ...form, seo_description_template: e.target.value })}
          placeholder="Hitta och jämför {service} i {city}. Läs omdömen..."
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Tjänster
            </h1>
            <p className="text-muted-foreground">
              Hantera tjänster som erbjuds i katalogen
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {services?.length || 0} tjänster
            </Badge>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) setForm(emptyForm);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till tjänst
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Lägg till ny tjänst</DialogTitle>
                </DialogHeader>
                <ServiceFormFields />
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Skapar..." : "Skapa tjänst"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar tjänster...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Inga tjänster tillagda. Lägg till din första tjänst för att komma igång!
                    </TableCell>
                  </TableRow>
                ) : (
                  services?.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {service.icon && <span>{service.icon}</span>}
                          {service.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{service.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[service.category] || service.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteService(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingService} onOpenChange={(open) => {
          if (!open) {
            setEditingService(null);
            setForm(emptyForm);
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Redigera tjänst</DialogTitle>
            </DialogHeader>
            <ServiceFormFields />
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Sparar..." : "Spara ändringar"}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteService} onOpenChange={() => setDeleteService(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ta bort tjänst?</AlertDialogTitle>
              <AlertDialogDescription>
                Är du säker på att du vill ta bort "{deleteService?.name}"? Detta kan påverka
                kopplade företag och featured slots. Denna åtgärd kan inte ångras.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteService?.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ta bort
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
