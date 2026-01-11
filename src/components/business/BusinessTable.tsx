import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/types/database';

interface BusinessTableProps {
  businesses: Business[];
  serviceSlug: string;
  citySlug: string;
  cityName: string;
}

export function BusinessTable({
  businesses,
  serviceSlug,
  citySlug,
  cityName,
}: BusinessTableProps) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Andra flyttfirmor i {cityName}
          </h2>
          <p className="text-muted-foreground mb-8">
            Här är fler företag som erbjuder flyttjänster i {cityName}.
          </p>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Företag</TableHead>
                  <TableHead className="font-semibold">Omdöme</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Adress</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Kategorier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => (
                  <TableRow key={business.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <Link 
                        to={`/${serviceSlug}/${citySlug}/${business.slug}`}
                        className="font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {business.name}
                      </Link>
                      {business.verified && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Verifierad
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {business.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-featured fill-featured" />
                          <span className="font-medium">{business.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">
                            ({business.review_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Inga omdömen</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {business.address ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[200px]">{business.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {business.categories && business.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {business.categories.slice(0, 2).map((category, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {business.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{business.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
