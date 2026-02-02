import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useCities } from '@/hooks/useCity';
import { useServices } from '@/hooks/useService';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: cities } = useCities();
  const { data: services } = useServices();

  const topLevelServices = (services || []).filter((s) => !s.parent_service_id).slice(0, 4);
  const topCities = (cities || []).slice(0, 4);

  return (
    <footer className="bg-[#1a2332] text-white">
      {/* Main footer content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                FlyttGuide
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sveriges ledande jämförelsetjänst för flyttfirmor. Vi hjälper dig hitta rätt företag för din flytt.
            </p>
          </div>

          {/* Tjänster */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Tjänster</h3>
            <ul className="space-y-2">
              {topLevelServices.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/${service.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Populära städer */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Populära städer</h3>
            <ul className="space-y-2">
              {topCities.map((city) => (
                <li key={city.id}>
                  <Link
                    to={topLevelServices[0] ? `/${topLevelServices[0].slug}/${city.slug}` : '/stader'}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Om oss */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Om oss</h3>
            <ul className="space-y-2">
              {[
                { name: 'Om FlyttGuide', href: '/om-oss' },
                { name: 'Så rankar vi', href: '/hur-vi-rankar' },
                { name: 'Kontakta oss', href: '/kontakt' },
                { name: 'För företag', href: '/kontakt' },
              ].map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© {currentYear} FlyttGuide. Alla rättigheter förbehållna.</p>
            <div className="flex items-center gap-6">
              <Link to="/integritetspolicy" className="hover:text-white transition-colors">
                Integritetspolicy
              </Link>
              <Link to="/anvandarvillkor" className="hover:text-white transition-colors">
                Användarvillkor
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
