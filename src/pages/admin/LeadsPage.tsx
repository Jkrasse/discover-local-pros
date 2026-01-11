import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

type LeadStatus = "new" | "contacted" | "closed";

const statusLabels: Record<LeadStatus, string> = {
  new: "Ny",
  contacted: "Kontaktad",
  closed: "Avslutad",
};

const statusVariants: Record<LeadStatus, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
};

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          city:cities(name),
          service:services(name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Status uppdaterad");
    },
    onError: () => {
      toast.error("Kunde inte uppdatera status");
    },
  });

  const filteredLeads = leads?.filter((lead) => {
    return statusFilter === "all" || lead.status === statusFilter;
  });

  const statusCounts = {
    all: leads?.length || 0,
    new: leads?.filter((l) => l.status === "new").length || 0,
    contacted: leads?.filter((l) => l.status === "contacted").length || 0,
    closed: leads?.filter((l) => l.status === "closed").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Leads
            </h1>
            <p className="text-muted-foreground">
              Inkomna förfrågningar från potentiella kunder
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">{statusCounts.new} nya</Badge>
            <Badge variant="secondary">{statusCounts.contacted} kontaktade</Badge>
            <Badge variant="outline">{statusCounts.closed} avslutade</Badge>
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alla leads" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla ({statusCounts.all})</SelectItem>
            <SelectItem value="new">Nya ({statusCounts.new})</SelectItem>
            <SelectItem value="contacted">Kontaktade ({statusCounts.contacted})</SelectItem>
            <SelectItem value="closed">Avslutade ({statusCounts.closed})</SelectItem>
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar leads...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Tjänst</TableHead>
                  <TableHead>Stad</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Inga leads hittades
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads?.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-sm hover:underline">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lead.service?.name || "-"}</TableCell>
                      <TableCell>{lead.city?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[lead.status as LeadStatus] || "outline"}>
                          {statusLabels[lead.status as LeadStatus] || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lead.created_at), "d MMM yyyy", { locale: sv })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          Visa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lead: {selectedLead?.name}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p>{selectedLead.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tjänst</label>
                    <p>{selectedLead.service?.name || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stad</label>
                    <p>{selectedLead.city?.name || "-"}</p>
                  </div>
                  {selectedLead.move_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Flyttdatum</label>
                      <p>{format(new Date(selectedLead.move_date), "d MMMM yyyy", { locale: sv })}</p>
                    </div>
                  )}
                  {selectedLead.from_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Från</label>
                      <p>{selectedLead.from_area}</p>
                    </div>
                  )}
                  {selectedLead.to_area && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Till</label>
                      <p>{selectedLead.to_area}</p>
                    </div>
                  )}
                  {selectedLead.housing_type && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Boendetyp</label>
                      <p>{selectedLead.housing_type}</p>
                    </div>
                  )}
                </div>
                {selectedLead.message && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Meddelande</label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedLead.message}</p>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Status:</label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({ id: selectedLead.id, status: value });
                      setSelectedLead({ ...selectedLead, status: value });
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Ny</SelectItem>
                      <SelectItem value="contacted">Kontaktad</SelectItem>
                      <SelectItem value="closed">Avslutad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
