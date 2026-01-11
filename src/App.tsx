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
import ScrapePage from "./pages/admin/ScrapePage";
import BusinessesPage from "./pages/admin/BusinessesPage";
import AdminCitiesPage from "./pages/admin/CitiesPage";
import LeadsPage from "./pages/admin/LeadsPage";
import ServicesPage from "./pages/admin/ServicesPage";
import FeaturedPage from "./pages/admin/FeaturedPage";
import SettingsPage from "./pages/admin/SettingsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";

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
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/import" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
            <Route path="/admin/scrape" element={<ProtectedRoute><ScrapePage /></ProtectedRoute>} />
            <Route path="/admin/businesses" element={<ProtectedRoute><BusinessesPage /></ProtectedRoute>} />
            <Route path="/admin/cities" element={<ProtectedRoute><AdminCitiesPage /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            <Route path="/admin/featured" element={<ProtectedRoute><FeaturedPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
