import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Truck, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            className="mobile-menu-overlay lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-elevated z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="container py-4">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Sök efter stad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      className="pl-9 pr-4"
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery.trim() && (searchFocused || filteredCities.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-elevated z-50 overflow-hidden">
                      {filteredCities.length > 0 ? (
                        <ul>
                          {filteredCities.map((city) => (
                            <li key={city.id}>
                              <button
                                onClick={() => handleCitySelect(city.slug)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                              >
                                <MapPin className="h-4 w-4 text-accent shrink-0" />
                                <div>
                                  <div className="font-medium text-sm">{city.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {primaryService?.name || 'Företag'} i {city.name}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
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
                </div>

                {/* Main Service Link */}
                {primaryService && (
                  <Link
                    to={`/${primaryService.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Truck className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold">{primaryService.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Se alla städer
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                )}

                {/* Services Dropdown */}
                {subServices.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <button
                      onClick={() => setServicesExpanded(!servicesExpanded)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground"
                    >
                      <span>Tjänster</span>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          servicesExpanded && "rotate-180"
                        )} 
                      />
                    </button>
                    
                    {servicesExpanded && (
                      <div className="mt-2 space-y-1">
                        {subServices.map((service) => (
                          <Link
                            key={service.slug}
                            to={`/${service.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-accent/10 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="h-2 w-2 rounded-full bg-accent/50" />
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Link */}
                <div className="border-t border-border pt-4">
                  <Link
                    to="/kontakt"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kontakta oss
                  </Link>
                  <Link
                    to="/om-oss"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground rounded-md hover:bg-accent/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Om oss
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
