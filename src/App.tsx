import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServiceIndexPage from "./pages/ServiceIndexPage";
import ServiceCityPage from "./pages/ServiceCityPage";
import CitiesPage from "./pages/CitiesPage";
import AboutPage from "./pages/AboutPage";
import HowWeRankPage from "./pages/HowWeRankPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ImportPage from "./pages/admin/ImportPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Service routes */}
            <Route path="/:serviceSlug" element={<ServiceIndexPage />} />
            <Route path="/:serviceSlug/:citySlug" element={<ServiceCityPage />} />
            
            {/* Cities */}
            <Route path="/stader" element={<CitiesPage />} />
            
            {/* Trust pages */}
            <Route path="/om-oss" element={<AboutPage />} />
            <Route path="/hur-vi-rankar" element={<HowWeRankPage />} />
            <Route path="/kontakt" element={<ContactPage />} />
            <Route path="/integritetspolicy" element={<PrivacyPolicyPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/import" element={<ImportPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
