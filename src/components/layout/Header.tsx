import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Truck, Search, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/useCity';
import { useServices } from '@/hooks/useService';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { data: cities } = useCities();
  const { data: services } = useServices();

  const topLevelServices = useMemo(
    () => (services || []).filter((s) => !s.parent_service_id),
    [services]
  );

  const subServices = useMemo(
    () => (services || []).filter((s) => s.parent_service_id),
    [services]
  );

  const primaryService = topLevelServices[0] || (services || [])[0];

  const menuCities = useMemo(() => (cities || []).slice(0, 6), [cities]);
  const popularCities = useMemo(() => (cities || []).slice(0, 4), [cities]);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return (cities || [])
      .filter(city => city.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [cities, searchQuery]);

  const handleCitySelect = (citySlug: string) => {
    if (primaryService) {
      navigate(`/${primaryService.slug}/${citySlug}`);
    } else {
      navigate(`/stader`);
    }
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <header className="header-sticky">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Flytt<span className="text-accent">Guide</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    {primaryService?.name || 'Städer'}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2">
                      {menuCities.map((city) => (
                        <li key={city.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={primaryService ? `/${primaryService.slug}/${city.slug}` : '/stader'}
                              className={cn(
                                'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors',
                                'hover:bg-accent/10 hover:text-accent focus:bg-accent/10'
                              )}
                            >
                              <div className="text-sm font-medium">
                                {primaryService?.name || 'Företag'} i {city.name}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Jämför priser och omdömen
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Tjänster
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-1 p-4">
                      {topLevelServices.map((service) => (
                        <li key={service.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/${service.slug}`}
                              className={cn(
                                'flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors',
                                'hover:bg-accent/10 hover:text-accent focus:bg-accent/10'
                              )}
                            >
                              <Truck className="h-5 w-5 text-accent" />
                              <span className="text-sm font-medium">{service.name}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    to="/kontakt"
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent/10 hover:text-accent',
                      location.pathname === '/kontakt' && 'text-accent'
                    )}
                  >
                    Kontakta oss
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Öppna meny"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm lg:hidden z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-background z-50 overflow-y-auto">
            <div className="container py-6">
              {/* Search Section */}
              <div className="mb-6">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  Hitta flyttfirma i din stad
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Sök stad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    className="pl-12 h-12 text-base rounded-xl border-2 focus:border-accent"
                  />
                </div>
                
                {/* Search Results */}
                {searchQuery.trim() && (
                  <div className="mt-2 bg-secondary rounded-xl overflow-hidden">
                    {filteredCities.length > 0 ? (
                      <ul className="divide-y divide-border">
                        {filteredCities.map((city) => (
                          <li key={city.id}>
                            <button
                              onClick={() => handleCitySelect(city.slug)}
                              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                                <MapPin className="h-5 w-5 text-accent" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold">{city.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {primaryService?.name} i {city.name}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Ingen stad hittades för "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {/* Popular Cities (show when not searching) */}
                {!searchQuery.trim() && popularCities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city.slug)}
                        className="px-3 py-1.5 text-sm bg-secondary rounded-full hover:bg-accent/10 hover:text-accent transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {/* Main Service */}
                {primaryService && (
                  <Link
                    to={`/${primaryService.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:border-accent/30 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{primaryService.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Jämför firmor i alla städer
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                )}

                {/* Sub-services Accordion */}
                {subServices.length > 0 && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setServicesExpanded(!servicesExpanded)}
                      className="flex items-center justify-between w-full p-4 bg-background hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-semibold">Alla tjänster</span>
                      <ChevronDown 
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform duration-200",
                          servicesExpanded && "rotate-180"
                        )} 
                      />
                    </button>
                    
                    {servicesExpanded && (
                      <div className="border-t border-border bg-secondary/30">
                        {subServices.map((service) => (
                          <Link
                            key={service.slug}
                            to={`/${service.slug}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors border-b border-border last:border-0"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="h-2 w-2 rounded-full bg-accent" />
                            <span>{service.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Link */}
                <Link
                  to="/kontakt"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Kontakta oss</div>
                    <div className="text-sm text-muted-foreground">
                      Frågor eller feedback?
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
