import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEOHead
        title="Sidan hittades inte | 404"
        description="Sidan du letar efter finns inte eller har flyttats."
        noindex
      />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-2 text-xl font-semibold text-foreground">Sidan hittades inte</p>
          <p className="mb-8 text-muted-foreground">
            Sidan du letar efter finns inte eller har flyttats.
          </p>
          <a href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Tillbaka till startsidan
            </Button>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
