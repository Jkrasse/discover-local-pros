import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Clock, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Kontakt' },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: settings } = useSiteSettings();

  const siteName = settings?.site_name || 'Katalog';
  const contactEmail = settings?.contact_email || 'info@example.com';
  const partnerEmail = settings?.partner_email || 'partner@example.com';
  const companyName = settings?.company_name || 'Företaget AB';
  const companyAddress = settings?.company_address || 'Adress, Stad';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: 'Meddelande skickat',
      description: 'Vi återkommer till dig så snart som möjligt.',
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <SEOHead
        title={`Kontakta oss | ${siteName}`}
        description={`Kontakta ${siteName} för frågor, feedback eller företagssamarbeten. Vi svarar vanligtvis inom 24 timmar.`}
        canonical="/kontakt"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Kontakta oss
            </h1>
            <p className="text-lg text-muted-foreground">
              Har du frågor, feedback eller vill diskutera ett samarbete? 
              Vi hjälper dig gärna!
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">E-post</h3>
                    <a 
                      href={`mailto:${contactEmail}`} 
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adress</h3>
                    <p className="text-muted-foreground">
                      {companyName}<br />
                      {companyAddress.split(',').map((line, i) => (
                        <span key={i}>{line.trim()}<br /></span>
                      ))}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Svarstid</h3>
                    <p className="text-muted-foreground">
                      Vi svarar vanligtvis inom 24 timmar
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-accent/30 bg-accent/5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                    <Building2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">För företag</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Vill du bli Rekommenderad partner?
                    </p>
                    <a 
                      href={`mailto:${partnerEmail}`} 
                      className="text-accent hover:underline text-sm"
                    >
                      {partnerEmail}
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <Card className="p-6 lg:p-8">
                <h2 className="text-xl font-semibold mb-6">Skicka meddelande</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Namn *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        placeholder="Ditt namn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="din@email.se"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Ämne</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="Vad gäller det?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Meddelande *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      required 
                      rows={6}
                      placeholder="Beskriv ditt ärende..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Skickar...' : 'Skicka meddelande'}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
