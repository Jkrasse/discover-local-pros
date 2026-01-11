import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { MapPin, Plus, Upload, Users } from "lucide-react";
import { toast } from "sonner";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CitiesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [newCity, setNewCity] = useState({ name: "", region: "", population: "" });
  const [bulkCities, setBulkCities] = useState("");
  const queryClient = useQueryClient();

  const { data: cities, isLoading } = useQuery({
    queryKey: ["admin-cities-with-counts"],
    queryFn: async () => {
      const { data: citiesData, error } = await supabase
        .from("cities")
        .select("*")
        .order("name");
      if (error) throw error;

      // Get business counts per city
      const { data: counts } = await supabase
        .from("businesses")
        .select("city_id")
        .eq("is_active", true);

      const countMap = new Map<string, number>();
      counts?.forEach((b) => {
        if (b.city_id) {
          countMap.set(b.city_id, (countMap.get(b.city_id) || 0) + 1);
        }
      });

      return citiesData.map((city) => ({
        ...city,
        businessCount: countMap.get(city.id) || 0,
      }));
    },
  });

  const addCityMutation = useMutation({
    mutationFn: async (city: { name: string; region: string; population: number | null }) => {
      const { error } = await supabase.from("cities").insert({
        name: city.name,
        slug: generateSlug(city.name),
        region: city.region || null,
        population: city.population,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities-with-counts"] });
      toast.success("Stad tillagd");
      setNewCity({ name: "", region: "", population: "" });
      setIsAddOpen(false);
    },
    onError: (error) => {
      toast.error("Kunde inte lägga till stad: " + error.message);
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (cityNames: string[]) => {
      const cities = cityNames.map((name) => ({
        name: name.trim(),
        slug: generateSlug(name.trim()),
      }));
      const { error } = await supabase.from("cities").insert(cities);
      if (error) throw error;
      return cities.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities-with-counts"] });
      toast.success(`${count} städer tillagda`);
      setBulkCities("");
      setIsBulkOpen(false);
    },
    onError: (error) => {
      toast.error("Kunde inte lägga till städer: " + error.message);
    },
  });

  const handleAddCity = () => {
    if (!newCity.name.trim()) {
      toast.error("Ange ett stadsnamn");
      return;
    }
    addCityMutation.mutate({
      name: newCity.name.trim(),
      region: newCity.region.trim(),
      population: newCity.population ? parseInt(newCity.population) : null,
    });
  };

  const handleBulkAdd = () => {
    const names = bulkCities
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length === 0) {
      toast.error("Ange minst en stad");
      return;
    }
    bulkAddMutation.mutate(names);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Städer
            </h1>
            <p className="text-muted-foreground">
              Hantera städer som finns i katalogen
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk-import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importera flera städer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Städer (en per rad)</Label>
                    <Textarea
                      value={bulkCities}
                      onChange={(e) => setBulkCities(e.target.value)}
                      placeholder="Stockholm&#10;Göteborg&#10;Malmö"
                      rows={10}
                    />
                  </div>
                  <Button onClick={handleBulkAdd} disabled={bulkAddMutation.isPending}>
                    {bulkAddMutation.isPending ? "Importerar..." : "Importera"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Lägg till stad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lägg till ny stad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Namn *</Label>
                    <Input
                      value={newCity.name}
                      onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                      placeholder="Stockholm"
                    />
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Input
                      value={newCity.region}
                      onChange={(e) => setNewCity({ ...newCity, region: e.target.value })}
                      placeholder="Stockholms län"
                    />
                  </div>
                  <div>
                    <Label>Befolkning</Label>
                    <Input
                      type="number"
                      value={newCity.population}
                      onChange={(e) => setNewCity({ ...newCity, population: e.target.value })}
                      placeholder="975000"
                    />
                  </div>
                  <Button onClick={handleAddCity} disabled={addCityMutation.isPending}>
                    {addCityMutation.isPending ? "Lägger till..." : "Lägg till"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Badge variant="secondary" className="text-lg px-4 py-2">
          {cities?.length || 0} städer
        </Badge>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Laddar städer...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Befolkning</TableHead>
                  <TableHead>Företag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Inga städer tillagda
                    </TableCell>
                  </TableRow>
                ) : (
                  cities?.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell className="text-muted-foreground">{city.slug}</TableCell>
                      <TableCell>{city.region || "-"}</TableCell>
                      <TableCell>
                        {city.population ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {city.population.toLocaleString("sv-SE")}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{city.businessCount}</Badge>
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
