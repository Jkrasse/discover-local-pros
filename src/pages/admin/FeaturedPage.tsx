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
import { Award, Star, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function FeaturedPage() {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: featuredSlots, isLoading } = useQuery({
    queryKey: ["admin-featured-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_slots")
        .select(`
          *,
          city:cities(id, name),
          service:services(id, name),
          business:businesses(id, name, rating, review_count)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses } = useQuery({
    queryKey: ["admin-all-businesses"],
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

  const updateFeaturedMutation = useMutation({
    mutationFn: async ({ slotId, businessId }: { slotId: string; businessId: string | null }) => {
      const { error } = await supabase
        .from("featured_slots")
        .update({
          business_id: businessId,
          status: businessId ? "active" : "pending",
          is_placeholder: !businessId,
        })
        .eq("id", slotId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-slots"] });
      toast.success("Featured slot uppdaterad");
      setSelectedSlot(null);
    },
    onError: () => {
      toast.error("Kunde inte uppdatera");
    },
  });

  const assignRandomMutation = useMutation({
    mutationFn: async (slot: any) => {
      // Get businesses for this city and service
      const { data: coverages } = await supabase
        .from("business_service_coverage")
        .select("business_id")
        .eq("city_id", slot.city_id)
        .eq("service_id", slot.service_id);

      if (!coverages || coverages.length === 0) {
        throw new Error("Inga företag hittades för denna stad/tjänst");
      }

      // Pick random
      const randomIndex = Math.floor(Math.random() * coverages.length);
      const randomBusinessId = coverages[randomIndex].business_id;

      const { error } = await supabase
        .from("featured_slots")
        .update({
          business_id: randomBusinessId,
          status: "active",
          is_placeholder: true,
        })
        .eq("id", slot.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-slots"] });
      toast.success("Slumpmässigt företag tilldelat");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Kunde inte tilldela");
    },
  });

  const getStatusVariant = (status: string, isPlaceholder: boolean) => {
    if (status === "active" && !isPlaceholder) return "default";
    if (status === "active" && isPlaceholder) return "secondary";
    return "outline";
  };

  const getStatusLabel = (status: string, isPlaceholder: boolean) => {
    if (status === "active" && !isPlaceholder) return "Betalande";
    if (status === "active" && isPlaceholder) return "Placeholder";
    return status === "pending" ? "Ledig" : status;
  };

  const getBusinessesForSlot = (slot: any) => {
    return businesses?.filter((b) => b.city_id === slot.city_id) || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6" />
              Rekommenderade
            </h1>
            <p className="text-muted-foreground">
              Hantera rekommenderade företag per stad och tjänst
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">
              {featuredSlots?.filter((s) => s.status === "active" && !s.is_placeholder).length || 0} betalande
            </Badge>
            <Badge variant="secondary">
              {featuredSlots?.filter((s) => s.is_placeholder).length || 0} placeholders
            </Badge>
            <Badge variant="outline">
              {featuredSlots?.filter((s) => s.status === "pending").length || 0} lediga
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar featured slots...
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
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredSlots?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Inga featured slots
                    </TableCell>
                  </TableRow>
                ) : (
                  featuredSlots?.map((slot) => (
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
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {slot.business.rating?.toFixed(1) || "-"} ({slot.business.review_count || 0})
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Inget företag</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(slot.status, slot.is_placeholder)}>
                          {getStatusLabel(slot.status, slot.is_placeholder)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!slot.business && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignRandomMutation.mutate(slot)}
                            disabled={assignRandomMutation.isPending}
                          >
                            Slumpa
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setSelectedBusinessId(slot.business_id || "");
                          }}
                        >
                          Byt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Byt rekommenderat företag för {selectedSlot?.city?.name} - {selectedSlot?.service?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj företag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inget företag (ledig plats)</SelectItem>
                  {selectedSlot && getBusinessesForSlot(selectedSlot).map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name} {business.rating && `(${business.rating.toFixed(1)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  updateFeaturedMutation.mutate({
                    slotId: selectedSlot.id,
                    businessId: selectedBusinessId === "none" ? null : selectedBusinessId || null,
                  });
                }}
                disabled={updateFeaturedMutation.isPending}
              >
                {updateFeaturedMutation.isPending ? "Sparar..." : "Spara"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
