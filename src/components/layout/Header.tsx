import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Truck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const cities = [
  { name: 'Stockholm', slug: 'stockholm' },
  { name: 'Göteborg', slug: 'goteborg' },
  { name: 'Malmö', slug: 'malmo' },
  { name: 'Uppsala', slug: 'uppsala' },
  { name: 'Västerås', slug: 'vasteras' },
  { name: 'Örebro', slug: 'orebro' },
];

const services = [
  { name: 'Flyttfirmor', slug: 'flyttfirmor', icon: Truck },
  { name: 'Flyttbil', slug: 'flyttbil', icon: Truck },
  { name: 'Flytthjälp', slug: 'flytthjalp', icon: Truck },
  { name: 'Magasinering', slug: 'magasinering', icon: Truck },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          <nav className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Flyttfirmor
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2">
                      {cities.map((city) => (
                        <li key={city.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/flyttfirmor/${city.slug}`}
                              className={cn(
                                'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors',
                                'hover:bg-accent/10 hover:text-accent focus:bg-accent/10'
                              )}
                            >
                              <div className="text-sm font-medium">
                                Flyttfirmor i {city.name}
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
                      {services.map((service) => (
                        <li key={service.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/${service.slug}`}
                              className={cn(
                                'flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors',
                                'hover:bg-accent/10 hover:text-accent focus:bg-accent/10'
                              )}
                            >
                              <service.icon className="h-5 w-5 text-accent" />
                              <span className="text-sm font-medium">
                                {service.name}
                              </span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    to="/hur-vi-rankar"
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent/10 hover:text-accent',
                      location.pathname === '/hur-vi-rankar' && 'text-accent'
                    )}
                  >
                    Så rankar vi
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    to="/om-oss"
                    className={cn(
                      'inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      'hover:bg-accent/10 hover:text-accent',
                      location.pathname === '/om-oss' && 'text-accent'
                    )}
                  >
                    Om oss
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/kontakt">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Kontakt
              </Button>
            </Link>
            <Link to="/fa-offert">
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                Få offert
              </Button>
            </Link>
          </div>

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
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
                    Flyttfirmor per stad
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        to={`/flyttfirmor/${city.slug}`}
                        className="px-3 py-2 text-sm rounded-md hover:bg-accent/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-3">
                    Tjänster
                  </h3>
                  <div className="space-y-1">
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        to={`/${service.slug}`}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <service.icon className="h-4 w-4 text-accent" />
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <Link
                    to="/hur-vi-rankar"
                    className="block px-3 py-2 text-sm rounded-md hover:bg-accent/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Så rankar vi
                  </Link>
                  <Link
                    to="/om-oss"
                    className="block px-3 py-2 text-sm rounded-md hover:bg-accent/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Om oss
                  </Link>
                  <Link
                    to="/kontakt"
                    className="block px-3 py-2 text-sm rounded-md hover:bg-accent/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kontakt
                  </Link>
                </div>

                <div className="border-t border-border pt-4">
                  <Link
                    to="/fa-offert"
                    className="block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-accent hover:bg-accent/90">
                      Få offert gratis
                    </Button>
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
