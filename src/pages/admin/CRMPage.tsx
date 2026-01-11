import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  Users, 
  MapPin, 
  Star, 
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Building2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface SlotWithDetails {
  id: string;
  city_id: string;
  service_id: string;
  business_id: string | null;
  status: string;
  is_placeholder: boolean;
  price_monthly: number | null;
  start_date: string | null;
  end_date: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  city: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  business: { id: string; name: string; rating: number | null } | null;
}

export default function CRMPage() {
  const [selectedSlot, setSelectedSlot] = useState<SlotWithDetails | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editForm, setEditForm] = useState({
    price_monthly: "",
    start_date: "",
    end_date: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
    is_placeholder: true,
  });
  const queryClient = useQueryClient();

  const { data: slots, isLoading } = useQuery({
    queryKey: ["admin-crm-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_slots")
        .select(`
          *,
          city:cities(id, name),
          service:services(id, name),
          business:businesses(id, name, rating)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SlotWithDetails[];
    },
  });

  const { data: services } = useQuery({
    queryKey: ["admin-services-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses } = useQuery({
    queryKey: ["admin-businesses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, city_id, rating")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("featured_slots")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-crm-slots"] });
      toast.success("Slot uppdaterad");
      setSelectedSlot(null);
    },
    onError: (error) => {
      toast.error("Kunde inte uppdatera: " + error.message);
    },
  });

  const openSlotDialog = (slot: SlotWithDetails) => {
    setEditForm({
      price_monthly: slot.price_monthly?.toString() || "",
      start_date: slot.start_date || "",
      end_date: slot.end_date || "",
      customer_name: slot.customer_name || "",
      customer_email: slot.customer_email || "",
      customer_phone: slot.customer_phone || "",
      notes: slot.notes || "",
      is_placeholder: slot.is_placeholder,
    });
    setSelectedSlot(slot);
  };

  const handleSave = () => {
    if (!selectedSlot) return;
    
    const isPaying = !editForm.is_placeholder && editForm.price_monthly;
    
    updateSlotMutation.mutate({
      id: selectedSlot.id,
      data: {
        price_monthly: editForm.price_monthly ? parseInt(editForm.price_monthly) : null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        customer_name: editForm.customer_name || null,
        customer_email: editForm.customer_email || null,
        customer_phone: editForm.customer_phone || null,
        notes: editForm.notes || null,
        is_placeholder: editForm.is_placeholder,
        status: isPaying ? "active" : (selectedSlot.business_id ? "active" : "pending"),
      },
    });
  };

  const markAsPaying = () => {
    setEditForm({ ...editForm, is_placeholder: false });
  };

  // Filter slots
  const filteredSlots = slots?.filter((slot) => {
    const matchesService = serviceFilter === "all" || slot.service_id === serviceFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paying" && !slot.is_placeholder && slot.status === "active") ||
      (statusFilter === "placeholder" && slot.is_placeholder && slot.status === "active") ||
      (statusFilter === "pending" && slot.status === "pending");
    return matchesService && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: slots?.length || 0,
    paying: slots?.filter((s) => !s.is_placeholder && s.status === "active").length || 0,
    placeholder: slots?.filter((s) => s.is_placeholder && s.status === "active").length || 0,
    pending: slots?.filter((s) => s.status === "pending").length || 0,
    revenue: slots
      ?.filter((s) => !s.is_placeholder && s.price_monthly)
      .reduce((sum, s) => sum + (s.price_monthly || 0), 0) || 0,
  };

  const getStatusBadge = (slot: SlotWithDetails) => {
    if (!slot.is_placeholder && slot.status === "active") {
      return <Badge className="bg-green-500 hover:bg-green-600">💰 Betalande</Badge>;
    }
    if (slot.is_placeholder && slot.status === "active") {
      return <Badge variant="secondary">🔄 Placeholder</Badge>;
    }
    return <Badge variant="outline">⚪ Ledig</Badge>;
  };

  const getBusinessesForSlot = (slot: SlotWithDetails) => {
    return businesses?.filter((b) => b.city_id === slot.city_id) || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              CRM - Kundhantering
            </h1>
            <p className="text-muted-foreground">
              Hantera betalande kunder och lediga platser per stad
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totala platser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Betalande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.paying}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Placeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.placeholder}</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Lediga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Månadsintäkt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats.revenue.toLocaleString("sv-SE")} kr
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Alla tjänster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla tjänster</SelectItem>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alla statusar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              <SelectItem value="paying">💰 Betalande</SelectItem>
              <SelectItem value="placeholder">🔄 Placeholder</SelectItem>
              <SelectItem value="pending">⚪ Lediga</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Slots Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stad</TableHead>
                  <TableHead>Tjänst</TableHead>
                  <TableHead>Företag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Pris/mån</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlots?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Inga slots hittades
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSlots?.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {slot.city?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{slot.service?.name || "-"}</TableCell>
                      <TableCell>
                        {slot.business ? (
                          <div>
                            <div className="font-medium">{slot.business.name}</div>
                            {slot.business.rating && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {slot.business.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Inget företag
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(slot)}</TableCell>
                      <TableCell>
                        {slot.customer_name ? (
                          <div>
                            <div className="font-medium">{slot.customer_name}</div>
                            {slot.customer_email && (
                              <div className="text-xs text-muted-foreground">{slot.customer_email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {slot.price_monthly ? (
                          <span className="font-medium">{slot.price_monthly.toLocaleString("sv-SE")} kr</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSlotDialog(slot)}
                        >
                          Hantera
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedSlot?.city?.name} - {selectedSlot?.service?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedSlot && (
              <div className="space-y-6">
                {/* Current Business */}
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-muted-foreground">Nuvarande företag</Label>
                  <div className="font-medium mt-1">
                    {selectedSlot.business?.name || "Inget företag tilldelat"}
                  </div>
                  {selectedSlot.business?.rating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedSlot.business.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Status</Label>
                    <div className="mt-2">
                      {editForm.is_placeholder ? (
                        <Badge variant="secondary">Placeholder</Badge>
                      ) : (
                        <Badge className="bg-green-500">Betalande kund</Badge>
                      )}
                    </div>
                  </div>
                  {editForm.is_placeholder && (
                    <Button onClick={markAsPaying} variant="default">
                      Markera som betalande
                    </Button>
                  )}
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Kundinformation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Kontaktperson</Label>
                      <Input
                        value={editForm.customer_name}
                        onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                        placeholder="Anna Andersson"
                      />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input
                        value={editForm.customer_phone}
                        onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                        placeholder="070-123 45 67"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editForm.customer_email}
                      onChange={(e) => setEditForm({ ...editForm, customer_email: e.target.value })}
                      placeholder="anna@foretag.se"
                    />
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Betalning
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Pris/månad (kr)</Label>
                      <Input
                        type="number"
                        value={editForm.price_monthly}
                        onChange={(e) => setEditForm({ ...editForm, price_monthly: e.target.value })}
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <Label>Startdatum</Label>
                      <Input
                        type="date"
                        value={editForm.start_date}
                        onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Slutdatum</Label>
                      <Input
                        type="date"
                        value={editForm.end_date}
                        onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label>Interna anteckningar</Label>
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Anteckningar om kunden, avtal, etc..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} disabled={updateSlotMutation.isPending} className="w-full">
                  {updateSlotMutation.isPending ? "Sparar..." : "Spara ändringar"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
