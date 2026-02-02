import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  slug: string;
  parent_service_id: string | null;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface ServiceContent {
  service_id: string;
  city_id: string;
  generated_at: string | null;
}

export default function ContentGeneratorPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, slug, parent_service_id')
        .order('name');
      if (error) throw error;
      return data as Service[];
    },
  });

  // Fetch cities
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data as City[];
    },
  });

  // Fetch existing content status
  const { data: existingContent } = useQuery({
    queryKey: ['service-content-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_content')
        .select('service_id, city_id, generated_at');
      if (error) throw error;
      return data as ServiceContent[];
    },
  });

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async ({ serviceId, cityId }: { serviceId: string; cityId?: string }) => {
      const service = services?.find(s => s.id === serviceId);
      const city = cityId ? cities?.find(c => c.id === cityId) : undefined;
      const parentService = service?.parent_service_id 
        ? services?.find(s => s.id === service.parent_service_id)
        : undefined;

      const { data, error } = await supabase.functions.invoke('generate-service-content', {
        body: {
          serviceId,
          serviceName: service?.name,
          cityId,
          cityName: city?.name,
          parentServiceName: parentService?.name,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const city = variables.cityId ? cities?.find(c => c.id === variables.cityId) : undefined;
      const service = services?.find(s => s.id === variables.serviceId);
      
      toast({
        title: 'Innehåll genererat!',
        description: `Innehåll för ${service?.name}${city ? ` i ${city.name}` : ' (mall)'} har skapats.`,
      });
      queryClient.invalidateQueries({ queryKey: ['service-content-status'] });
      setGeneratingFor(null);
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast({
        title: 'Fel vid generering',
        description: 'Kunde inte generera innehåll. Försök igen.',
        variant: 'destructive',
      });
      setGeneratingFor(null);
    },
  });

  const handleGenerate = (serviceId: string, cityId?: string) => {
    const key = `${serviceId}-${cityId || 'template'}`;
    setGeneratingFor(key);
    generateMutation.mutate({ serviceId, cityId });
  };

  const handleBulkGenerate = async () => {
    if (!selectedService) return;
    
    const service = services?.find(s => s.id === selectedService);
    if (!service) return;

    // Generate for all cities
    for (const city of cities || []) {
      const key = `${selectedService}-${city.id}`;
      setGeneratingFor(key);
      
      try {
        await generateMutation.mutateAsync({ serviceId: selectedService, cityId: city.id });
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed for ${city.name}:`, error);
      }
    }
    
    setGeneratingFor(null);
    toast({
      title: 'Bulk-generering klar!',
      description: `Innehåll har genererats för ${service.name} i alla städer.`,
    });
  };

  const getContentStatus = (serviceId: string, cityId: string) => {
    const content = existingContent?.find(
      c => c.service_id === serviceId && c.city_id === cityId
    );
    return content?.generated_at ? 'generated' : 'pending';
  };

  const isLoading = servicesLoading || citiesLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI-innehållsgenerator</h1>
          <p className="text-muted-foreground mt-2">
            Generera unikt, SEO-optimerat innehåll för varje tjänst och stad
          </p>
        </div>

        {/* Quick generate section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-featured" />
              Snabbgenerering
            </CardTitle>
            <CardDescription>
              Välj en tjänst och stad för att generera innehåll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tjänst</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Välj tjänst..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.parent_service_id ? '↳ ' : ''}{service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stad (valfritt)</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Alla städer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla städer (bulk)</SelectItem>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  if (selectedCity === 'all') {
                    handleBulkGenerate();
                  } else if (selectedCity) {
                    handleGenerate(selectedService, selectedCity);
                  } else {
                    handleGenerate(selectedService);
                  }
                }}
                disabled={!selectedService || generateMutation.isPending}
                className="gap-2"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generera innehåll
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content status grid */}
        <Card>
          <CardHeader>
            <CardTitle>Innehållsstatus</CardTitle>
            <CardDescription>
              Översikt över genererat innehåll per tjänst och stad
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {services?.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {service.parent_service_id ? '↳ ' : ''}{service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">/{service.slug}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerate(service.id)}
                        disabled={generatingFor === `${service.id}-template`}
                        className="gap-2"
                      >
                        {generatingFor === `${service.id}-template` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Generera mall
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {cities?.map((city) => {
                        const status = getContentStatus(service.id, city.id);
                        const isGenerating = generatingFor === `${service.id}-${city.id}`;
                        
                        return (
                          <Badge
                            key={city.id}
                            variant={status === 'generated' ? 'default' : 'secondary'}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => !isGenerating && handleGenerate(service.id, city.id)}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : status === 'generated' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {city.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
