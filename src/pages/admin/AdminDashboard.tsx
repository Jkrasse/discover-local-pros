import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MapPin, Briefcase, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [businesses, cities, services, leads, featuredSlots] = await Promise.all([
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('cities').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('featured_slots').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      return {
        businesses: businesses.count || 0,
        cities: cities.count || 0,
        services: services.count || 0,
        leads: leads.count || 0,
        featuredSlots: featuredSlots.count || 0,
      };
    }
  });

  const statCards = [
    { 
      title: "Företag", 
      value: stats?.businesses || 0, 
      icon: Building2, 
      href: "/admin/businesses",
      description: "Totalt antal företag"
    },
    { 
      title: "Städer", 
      value: stats?.cities || 0, 
      icon: MapPin, 
      href: "/admin/cities",
      description: "Aktiva städer"
    },
    { 
      title: "Tjänster", 
      value: stats?.services || 0, 
      icon: Briefcase, 
      href: "/admin/services",
      description: "Tjänstekategorier"
    },
    { 
      title: "Leads", 
      value: stats?.leads || 0, 
      icon: Users, 
      href: "/admin/leads",
      description: "Inkomna förfrågningar"
    },
    { 
      title: "Featured Slots", 
      value: stats?.featuredSlots || 0, 
      icon: Star, 
      href: "/admin/featured",
      description: "Aktiva rekommenderade"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Översikt över din katalog
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => (
            <Link key={card.title} to={card.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Snabbåtgärder</CardTitle>
              <CardDescription>Vanliga uppgifter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link 
                to="/admin/import" 
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Importera företag</div>
                  <div className="text-sm text-muted-foreground">
                    Lägg till nya företag från Outscraper
                  </div>
                </div>
              </Link>
              <Link 
                to="/admin/leads" 
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Visa leads</div>
                  <div className="text-sm text-muted-foreground">
                    Hantera inkomna förfrågningar
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import-instruktioner</CardTitle>
              <CardDescription>Så här importerar du från Outscraper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</span>
                <p>Kör Outscraper för önskade sökord och städer</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</span>
                <p>Exportera till Google Sheets eller CSV</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</span>
                <p>Konvertera till JSON-format</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">4</span>
                <p>Gå till <Link to="/admin/import" className="text-primary underline">Import-sidan</Link> och klistra in</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
