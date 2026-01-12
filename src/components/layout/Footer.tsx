import { Link } from 'react-router-dom';
import { Truck, Mail, MapPin, Shield, FileText, Scale } from 'lucide-react';
import { useCities } from '@/hooks/useCity';
import { useServices } from '@/hooks/useService';

  const { data: cities } = useCities();
  const { data: services } = useServices();

  const topLevelServices = (services || []).filter((s) => !s.parent_service_id).slice(0, 6);
  const topCities = (cities || []).slice(0, 6);

  const serviceLinks = topLevelServices.map((s) => ({ name: s.name, href: `/${s.slug}` }));
  const cityLinks = topCities.map((c) => ({
    name: c.name,
    href: topLevelServices[0] ? `/${topLevelServices[0].slug}/${c.slug}` : '/stader',
  }));

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Truck className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">
                Flytt<span className="text-accent">Guide</span>
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 mb-6">
              Vi hjälper dig hitta pålitliga flyttfirmor i hela Sverige. Jämför
              omdömen, priser och få gratis offerter.
            </p>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a
                href="mailto:hej@flyttguide.se"
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                hej@flyttguide.se
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Stockholm, Sverige
              </div>
            </div>
          </div>

          {/* Tjänster */}
          <div>
            <h3 className="font-semibold mb-4">Tjänster</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Städer */}
          <div>
            <h3 className="font-semibold mb-4">Städer</h3>
            <ul className="space-y-2">
              {cityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/stader"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Alla städer
                </Link>
              </li>
            </ul>
          </div>

          {/* Om oss */}
          <div>
            <h3 className="font-semibold mb-4">Om FlyttGuide</h3>
            <ul className="space-y-2">
              {[
                { name: 'Om oss', href: '/om-oss' },
                { name: 'Så rankar vi', href: '/hur-vi-rankar' },
                { name: 'Kontakta oss', href: '/kontakt' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Juridik */}
          <div>
            <h3 className="font-semibold mb-4">Juridik</h3>
            <ul className="space-y-2">
              {[{ name: 'Integritetspolicy', href: '/integritetspolicy' }].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Gratis & opartisk jämförelse</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>100% transparent metodik</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>GDPR-kompatibel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
            <p>© {currentYear} FlyttGuide. Alla rättigheter förbehållna.</p>
            <p>
              Rekommenderade partners kan vara sponsrade.{' '}
              <Link to="/hur-vi-rankar" className="underline hover:text-accent">
                Läs mer om hur vi rankar
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
