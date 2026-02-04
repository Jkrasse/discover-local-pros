import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ImportResult {
  name: string;
  status: "created" | "updated" | "skipped" | "error";
  message?: string;
  city?: string;
}

interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  citiesAffected: number;
}

type ScrapeStatus = "idle" | "starting" | "processing" | "completed" | "error";

export default function ScrapePage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citiesInput, setCitiesInput] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);
  const [status, setStatus] = useState<ScrapeStatus>("idle");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch services
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Parse cities from input
  const parsedCities = citiesInput
    .split("\n")
    .map((city) => city.trim())
    .filter((city) => city.length > 0);

  // Generate preview queries
  const previewQueries = parsedCities.map(
    (city) => `${searchTerm} ${city}, Sweden`
  );

  const startScraping = async () => {
    if (!selectedService || !searchTerm || parsedCities.length === 0) {
      toast.error("Fyll i alla fält");
      return;
    }

    setStatus("starting");
    setErrorMessage(null);
    setSummary(null);
    setResults([]);

    try {
      // Start the scraping job
      const { data, error } = await supabase.functions.invoke("outscraper-search", {
        body: {
          searchTerm,
          cities: parsedCities,
          limit,
          serviceId: selectedService,
        },
      });

      if (error) throw error;

      if (!data.success || !data.requestId) {
        throw new Error(data.error || "Failed to start scraping");
      }

      setRequestId(data.requestId);
      setStatus("processing");
      toast.success(`Scraping startad för ${parsedCities.length} städer`);

      // Start polling for results
      pollForResults(data.requestId);
    } catch (err) {
      console.error("Error starting scrape:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      toast.error("Kunde inte starta scraping");
    }
  };

  const pollForResults = async (reqId: string) => {
    const maxAttempts = 60; // 5 minutes with 5 second intervals
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus("error");
        setErrorMessage("Timeout: Scraping tog för lång tid");
        return;
      }

      attempts++;

      try {
        const { data, error } = await supabase.functions.invoke("outscraper-results", {
          body: {
            requestId: reqId,
            serviceId: selectedService,
            cities: parsedCities, // Pass the original cities list to create them and match against
          },
        });

        if (error) throw error;

        if (data.status === "completed") {
          setStatus("completed");
          setSummary(data.summary);
          setResults(data.results || []);
          toast.success("Scraping och import klar!");
        } else {
          // Still processing, poll again after 5 seconds
          setTimeout(poll, 5000);
        }
      } catch (err) {
        console.error("Error polling results:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
      }
    };

    // Wait 5 seconds before first poll (give Outscraper time to start)
    setTimeout(poll, 5000);
  };

  const resetForm = () => {
    setStatus("idle");
    setRequestId(null);
    setSummary(null);
    setResults([]);
    setErrorMessage(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outscraper Scraping</h1>
          <p className="text-muted-foreground mt-2">
            Hämta företagsdata från Google Maps via Outscraper API
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Sökparametrar</CardTitle>
              <CardDescription>
                Ange sökterm och städer för att hämta företagsdata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service">Tjänst</Label>
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                  disabled={status !== "idle"}
                >
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchTerm">Sökterm</Label>
                <Input
                  id="searchTerm"
                  placeholder="t.ex. Flyttfirma, Städfirma, Tandläkare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={status !== "idle"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cities">Städer (en per rad)</Label>
                <Textarea
                  id="cities"
                  placeholder={"Stockholm\nGöteborg\nMalmö\nUppsala"}
                  value={citiesInput}
                  onChange={(e) => setCitiesInput(e.target.value)}
                  rows={8}
                  disabled={status !== "idle"}
                />
                <p className="text-xs text-muted-foreground">
                  {parsedCities.length} städer valda
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Resultat per stad</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  max={100}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                  disabled={status !== "idle"}
                />
              </div>

              {status === "idle" && (
                <Button
                  onClick={startScraping}
                  disabled={!selectedService || !searchTerm || parsedCities.length === 0}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Starta Scraping
                </Button>
              )}

              {status !== "idle" && status !== "completed" && status !== "error" && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    {status === "starting" ? "Startar scraping..." : "Väntar på resultat..."}
                  </span>
                </div>
              )}

              {(status === "completed" || status === "error") && (
                <Button onClick={resetForm} variant="outline" className="w-full">
                  Starta ny scraping
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preview / Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                {status === "completed" ? "Resultat" : status === "error" ? "Fel" : "Förhandsgranskning"}
              </CardTitle>
              <CardDescription>
                {status === "completed"
                  ? "Import sammanfattning"
                  : status === "error"
                  ? "Något gick fel"
                  : "Queries som kommer skickas till Outscraper"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error state */}
              {status === "error" && errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Fel uppstod</p>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Processing state */}
              {status === "processing" && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
                  <div className="text-center">
                    <p className="font-medium">Outscraper arbetar...</p>
                    <p className="text-sm text-muted-foreground">
                      Detta kan ta 1-5 minuter beroende på antal queries
                    </p>
                  </div>
                </div>
              )}

              {/* Completed state */}
              {status === "completed" && summary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-primary">{summary.created}</p>
                      <p className="text-sm text-muted-foreground">Skapade</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{summary.updated}</p>
                      <p className="text-sm text-muted-foreground">Uppdaterade</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-amber-600">{summary.skipped}</p>
                      <p className="text-sm text-muted-foreground">Skippade</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-destructive">{summary.errors}</p>
                      <p className="text-sm text-muted-foreground">Fel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Totalt {summary.total} företag bearbetade från {summary.citiesAffected} städer</span>
                  </div>

                  {results.length > 0 && (
                    <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                      {results.slice(0, 50).map((result, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                        >
                          <span className="truncate flex-1">{result.name}</span>
                          <div className="flex items-center gap-2">
                            {result.city && (
                              <span className="text-muted-foreground text-xs">{result.city}</span>
                            )}
                            <Badge
                              variant={
                                result.status === "created"
                                  ? "default"
                                  : result.status === "updated"
                                  ? "secondary"
                                  : result.status === "error"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {results.length > 50 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          ...och {results.length - 50} till
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Preview state (idle) */}
              {status === "idle" && (
                <>
              {previewQueries.length > 0 && searchTerm ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-primary">
                          💡 Credit-beräkning
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {parsedCities.length} städer × {limit} resultat = max {parsedCities.length * limit} credits
                        </p>
                      </div>
                      {previewQueries.map((query, idx) => (
                        <div
                          key={idx}
                          className="text-sm p-2 bg-muted rounded flex items-center gap-2"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{query}</span>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground pt-2">
                        ⚡ 1 sökning per stad för minimal credit-användning
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Fyll i sökterm och städer för att se förhandsgranskning</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Help section */}
        <Card>
          <CardHeader>
            <CardTitle>Hur det fungerar</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Välj vilken tjänst företagen ska kopplas till</li>
              <li>Skriv in söktermen (t.ex. "Flyttfirma" eller "Tandläkare")</li>
              <li>Klistra in städer, en per rad</li>
              <li>Systemet bygger queries som "Flyttfirma Stockholm, Sweden" etc.</li>
              <li>Outscraper söker på Google Maps och returnerar företagsdata</li>
              <li>Datan importeras automatiskt till databasen</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
