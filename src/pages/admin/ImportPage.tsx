import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, AlertCircle, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutscraperBusiness {
  name: string;
  place_id?: string;
  phone?: string;
  website?: string;
  full_address?: string;
  city?: string;
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  working_hours?: Record<string, string>;
  category?: string;
}

interface ImportResult {
  success: boolean;
  businessName: string;
  action: 'created' | 'updated' | 'skipped';
  error?: string;
  cityMatched?: string;
}

interface ImportResponse {
  success: boolean;
  summary: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    citiesAffected: number;
  };
  results: ImportResult[];
}

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [parsedData, setParsedData] = useState<OutscraperBusiness[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResponse | null>(null);
  const { toast } = useToast();

  const { data: services } = useQuery({
    queryKey: ['services-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: cities } = useQuery({
    queryKey: ['cities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const importMutation = useMutation({
    mutationFn: async (data: { businesses: OutscraperBusiness[], serviceId: string }) => {
      const response = await supabase.functions.invoke('import-businesses', {
        body: {
          businesses: data.businesses,
          serviceId: data.serviceId,
          createFeaturedSlots: true
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data as ImportResponse;
    },
    onSuccess: (data) => {
      setImportResults(data);
      toast({
        title: "Import slutförd!",
        description: `${data.summary.created} nya, ${data.summary.updated} uppdaterade, ${data.summary.skipped} överhoppade`,
      });
    },
    onError: (error) => {
      toast({
        title: "Import misslyckades",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleParse = () => {
    setParseError(null);
    setParsedData(null);
    
    try {
      const data = JSON.parse(jsonInput);
      
      if (!Array.isArray(data)) {
        throw new Error("JSON måste vara en array av företag");
      }

      if (data.length === 0) {
        throw new Error("Arrayen är tom");
      }

      // Validate required fields
      const validated = data.filter((item: OutscraperBusiness) => {
        return item.name && typeof item.name === 'string';
      });

      if (validated.length === 0) {
        throw new Error("Inga giltiga företag hittades. Varje företag måste ha ett 'name'-fält.");
      }

      setParsedData(validated);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Ogiltigt JSON-format");
    }
  };

  const handleImport = () => {
    if (!parsedData || !selectedService) return;
    importMutation.mutate({
      businesses: parsedData,
      serviceId: selectedService
    });
  };

  const cityNames = new Set(cities?.map(c => c.name.toLowerCase()) || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importera företag</h1>
          <p className="text-muted-foreground mt-1">
            Importera företagsdata från Outscraper (Google My Business)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>1. Välj tjänst</CardTitle>
                <CardDescription>
                  Vilken tjänstekategori tillhör dessa företag?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj tjänst..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Klistra in JSON-data</CardTitle>
                <CardDescription>
                  Konverterad data från din Outscraper-export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`[
  {
    "name": "ABC Flytt AB",
    "place_id": "ChIJ...",
    "phone": "+46 8 123 45 67",
    "website": "https://abcflytt.se",
    "full_address": "Storgatan 1, Stockholm",
    "city": "Stockholm",
    "rating": 4.8,
    "reviews": 156,
    "latitude": 59.3293,
    "longitude": 18.0686
  }
]`}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button onClick={handleParse} className="w-full">
                  Förhandsgranska
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            {parseError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Parse-fel</AlertTitle>
                <AlertDescription>{parseError}</AlertDescription>
              </Alert>
            )}

            {parsedData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>3. Förhandsgranskning</CardTitle>
                    <CardDescription>
                      {parsedData.length} företag kommer att importeras
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Företag</TableHead>
                            <TableHead>Stad</TableHead>
                            <TableHead>Betyg</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, 50).map((business, i) => {
                            const cityFound = business.city && cityNames.has(business.city.toLowerCase());
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-medium">
                                  {business.name}
                                </TableCell>
                                <TableCell>{business.city || "-"}</TableCell>
                                <TableCell>
                                  {business.rating ? `${business.rating} ⭐` : "-"}
                                </TableCell>
                                <TableCell>
                                  {cityFound ? (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      OK
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Stad saknas
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {parsedData.length > 50 && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          ... och {parsedData.length - 50} till
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>4. Importera</CardTitle>
                    <CardDescription>
                      Kör importen för att lägga till företagen i databasen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Viktigt</AlertTitle>
                      <AlertDescription>
                        Företag med befintligt Google Place ID uppdateras. 
                        Nya företag skapas. Slumpmässiga "rekommenderade" platser 
                        skapas för städer som saknar en.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={handleImport} 
                      disabled={!selectedService || importMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {importMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importerar...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Importera {parsedData.length} företag
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {importResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Import slutförd
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{importResults.summary.created}</div>
                      <div className="text-sm text-muted-foreground">Nya företag</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{importResults.summary.updated}</div>
                      <div className="text-sm text-muted-foreground">Uppdaterade</div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{importResults.summary.skipped}</div>
                      <div className="text-sm text-muted-foreground">Överhoppade</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{importResults.summary.citiesAffected}</div>
                      <div className="text-sm text-muted-foreground">Städer påverkade</div>
                    </div>
                  </div>

                  {importResults.results.filter(r => !r.success).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Fel:</h4>
                      <div className="max-h-[200px] overflow-auto space-y-1">
                        {importResults.results.filter(r => !r.success).map((result, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span>{result.businessName}: {result.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* JSON Format Help */}
        <Card>
          <CardHeader>
            <CardTitle>JSON-format från Outscraper</CardTitle>
            <CardDescription>
              Exempel på hur din data ska formateras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
{`[
  {
    "name": "ABC Flytt AB",
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "phone": "+46 8 123 45 67",
    "website": "https://abcflytt.se",
    "full_address": "Storgatan 1, 111 22 Stockholm, Sverige",
    "city": "Stockholm",
    "rating": 4.8,
    "reviews": 156,
    "latitude": 59.3293,
    "longitude": 18.0686,
    "working_hours": {
      "monday": "08:00-17:00",
      "tuesday": "08:00-17:00",
      "wednesday": "08:00-17:00",
      "thursday": "08:00-17:00",
      "friday": "08:00-17:00",
      "saturday": "Stängt",
      "sunday": "Stängt"
    },
    "category": "Moving company"
  }
]`}
            </pre>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Obligatoriska fält:</strong> name, city</p>
              <p><strong>Rekommenderade fält:</strong> place_id (för att undvika dubbletter), rating, reviews</p>
              <p><strong>Valfria fält:</strong> phone, website, full_address, latitude, longitude, working_hours, category</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
