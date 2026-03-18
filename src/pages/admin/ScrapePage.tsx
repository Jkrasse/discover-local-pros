import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Search, Loader2, CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react";
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

interface ScrapeJob {
  id: string;
  request_id: string;
  service_id: string;
  search_term: string;
  cities: string[];
  city_limit: number;
  status: string;
  summary: ImportSummary | null;
  results: ImportResult[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export default function ScrapePage() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [citiesInput, setCitiesInput] = useState<string>("");
  const [limit, setLimit] = useState<number>(20);
  const [isStarting, setIsStarting] = useState(false);
  const queryClient = useQueryClient();

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

  // Fetch active/recent scrape jobs
  const { data: jobs } = useQuery({
    queryKey: ["scrape-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scrape_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as unknown as ScrapeJob[]) || [];
    },
    refetchInterval: 5000, // Poll every 5s to catch status changes
  });

  // Poll outscraper-results for any processing jobs
  const processingJobs = jobs?.filter((j) => j.status === "processing") || [];

  const pollJob = useCallback(async (job: ScrapeJob) => {
    try {
      const { data, error } = await supabase.functions.invoke("outscraper-results", {
        body: {
          requestId: job.request_id,
          serviceId: job.service_id,
          cities: job.cities,
        },
      });

      if (error) throw error;

      if (data.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });
        toast.success(`Scraping klar: ${data.summary?.created || 0} skapade, ${data.summary?.updated || 0} uppdaterade`);
      }
      // If still pending, the refetchInterval on jobs query will keep checking
    } catch (err) {
      console.error("Error polling job:", err);
    }
  }, [queryClient]);

  // Poll processing jobs
  useEffect(() => {
    if (processingJobs.length === 0) return;

    // Poll each processing job
    processingJobs.forEach((job) => {
      pollJob(job);
    });

    const interval = setInterval(() => {
      processingJobs.forEach((job) => {
        pollJob(job);
      });
    }, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [processingJobs.map(j => j.id).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parse cities from input
  const parsedCities = citiesInput
    .split("\n")
    .map((city) => city.trim())
    .filter((city) => city.length > 0);

  const previewQueries = parsedCities.map(
    (city) => `${searchTerm} ${city}, Sweden`
  );

  const startScraping = async () => {
    if (!selectedService || !searchTerm || parsedCities.length === 0) {
      toast.error("Fyll i alla fält");
      return;
    }

    setIsStarting(true);

    try {
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

      toast.success(`Scraping startad för ${parsedCities.length} städer`);
      queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });

      // Reset form
      setSearchTerm("");
      setCitiesInput("");
      setSelectedService("");
    } catch (err) {
      console.error("Error starting scrape:", err);
      toast.error("Kunde inte starta scraping");
    } finally {
      setIsStarting(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    const { error } = await supabase.from("scrape_jobs").delete().eq("id", jobId);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["scrape-jobs"] });
    }
  };

  const getServiceName = (serviceId: string) => {
    return services?.find((s) => s.id === serviceId)?.name || "Okänd tjänst";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getElapsedMinutes = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / 60000);
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

        {/* Active Jobs Banner */}
        {processingJobs.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                {processingJobs.length} pågående scraping-jobb
              </CardTitle>
              <CardDescription>
                Du kan lämna sidan – jobben fortsätter i bakgrunden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {processingJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {job.search_term} – {getServiceName(job.service_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.cities.length} städer · Startad {getElapsedMinutes(job.created_at)} min sedan
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Bearbetar
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ny scraping</CardTitle>
              <CardDescription>
                Ange sökterm och städer för att hämta företagsdata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service">Tjänst</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchTerm">Sökterm</Label>
                <Input
                  id="searchTerm"
                  placeholder="t.ex. Flyttfirma, Städfirma, Tandläkare..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                />
              </div>

              <Button
                onClick={startScraping}
                disabled={!selectedService || !searchTerm || parsedCities.length === 0 || isStarting}
                className="w-full"
              >
                {isStarting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Startar...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Starta Scraping</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Förhandsgranskning</CardTitle>
              <CardDescription>Queries som kommer skickas till Outscraper</CardDescription>
            </CardHeader>
            <CardContent>
              {previewQueries.length > 0 && searchTerm ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-primary">💡 Credit-beräkning</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parsedCities.length} städer × {limit} resultat = max {parsedCities.length * limit} credits
                    </p>
                  </div>
                  {previewQueries.map((query, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted rounded flex items-center gap-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Job History */}
        {jobs && jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Senaste jobb</CardTitle>
              <CardDescription>Historik över scraping-jobb</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="mt-0.5">
                    {job.status === "processing" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : job.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{job.search_term}</span>
                      <Badge variant="outline" className="text-xs">
                        {getServiceName(job.service_id)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {job.cities.length} städer · Limit {job.city_limit}/stad · {formatTime(job.created_at)}
                    </p>

                    {job.status === "processing" && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Bearbetar... ({getElapsedMinutes(job.created_at)} min)
                        </div>
                        <Progress value={undefined} className="h-1.5" />
                      </div>
                    )}

                    {job.status === "completed" && job.summary && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="default" className="text-xs">
                          {(job.summary as ImportSummary).created} skapade
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(job.summary as ImportSummary).updated} uppdaterade
                        </Badge>
                        {(job.summary as ImportSummary).skipped > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {(job.summary as ImportSummary).skipped} skippade
                          </Badge>
                        )}
                        {(job.summary as ImportSummary).errors > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {(job.summary as ImportSummary).errors} fel
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Totalt {(job.summary as ImportSummary).total} företag
                        </span>
                      </div>
                    )}

                    {job.status === "error" && job.error_message && (
                      <p className="mt-1 text-xs text-destructive">{job.error_message}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
