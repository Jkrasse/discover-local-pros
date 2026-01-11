import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase } from "lucide-react";

const categoryLabels: Record<string, string> = {
  moving: "Flytt",
  cleaning: "Städning",
  dental: "Tandvård",
  other: "Övrigt",
};

export default function ServicesPage() {
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
              Tjänster som erbjuds i katalogen
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {services?.length || 0} tjänster
          </Badge>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Inga tjänster tillagda
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
