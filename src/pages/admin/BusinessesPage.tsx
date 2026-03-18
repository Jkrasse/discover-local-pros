import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
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
import { Search, Star, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function BusinessesPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: businesses, isLoading, refetch } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select(`
          *,
          city:cities(id, name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: cities } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("businesses")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Kunde inte uppdatera status");
    } else {
      toast.success(currentStatus ? "Företag inaktiverat" : "Företag aktiverat");
      refetch();
    }
  };

  const exportCSV = () => {
    if (!filteredBusinesses?.length) {
      toast.error("Inga företag att exportera");
      return;
    }
    const headers = ["Namn", "E-post", "Telefon", "Webbplats", "Stad", "Adress", "Betyg", "Recensioner"];
    const rows = filteredBusinesses.map((b) => [
      b.name,
      b.email || "",
      b.phone || "",
      b.website || "",
      (b.city as any)?.name || "",
      b.address || "",
      b.rating ?? "",
      b.review_count ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foretag-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredBusinesses.length} företag exporterade`);
  };

  const filteredBusinesses = businesses?.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || b.city_id === cityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && b.is_active) ||
      (statusFilter === "inactive" && !b.is_active);
    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Företag
            </h1>
            <p className="text-muted-foreground">
              Hantera alla företag i katalogen
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {businesses?.length || 0} företag
          </Badge>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök företag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Alla städer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla städer</SelectItem>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="active">Aktiva</SelectItem>
              <SelectItem value="inactive">Inaktiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar företag...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Stad</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Omdömen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Inga företag hittades
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses?.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{business.name}</div>
                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              {new URL(business.website).hostname}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {business.city?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {business.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {business.rating.toFixed(1)}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{business.review_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={business.is_active ? "default" : "secondary"}>
                          {business.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(business.id, business.is_active)}
                        >
                          {business.is_active ? "Inaktivera" : "Aktivera"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
