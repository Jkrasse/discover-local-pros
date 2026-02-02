import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import { Star, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Business } from '@/types/database';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const featuredIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BusinessMapProps {
  businesses: Business[];
  featuredBusinessId?: string;
  cityName: string;
  cityLat?: number | null;
  cityLng?: number | null;
  serviceSlug: string;
  citySlug: string;
}

export function BusinessMap({
  businesses,
  featuredBusinessId,
  cityName,
  cityLat,
  cityLng,
  serviceSlug,
  citySlug,
}: BusinessMapProps) {
  // Filter businesses with valid coordinates
  const businessesWithCoords = businesses.filter(
    (b) => b.lat != null && b.lng != null
  );

  if (businessesWithCoords.length === 0) {
    return null;
  }

  // Calculate center from businesses or use city coordinates
  const center: [number, number] = cityLat && cityLng
    ? [cityLat, cityLng]
    : [
        businessesWithCoords.reduce((sum, b) => sum + (b.lat || 0), 0) / businessesWithCoords.length,
        businessesWithCoords.reduce((sum, b) => sum + (b.lng || 0), 0) / businessesWithCoords.length,
      ];

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            Karta över företag i {cityName}
          </h2>
          <p className="text-muted-foreground mb-6">
            Se var alla {businessesWithCoords.length} företag finns på kartan
          </p>

          <div className="rounded-xl overflow-hidden border shadow-sm h-[400px] md:h-[500px]">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {businessesWithCoords.map((business) => (
                <Marker
                  key={business.id}
                  position={[business.lat!, business.lng!]}
                  icon={business.id === featuredBusinessId ? featuredIcon : defaultIcon}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-base mb-1">
                        {business.name}
                      </h3>
                      
                      {business.rating && (
                        <div className="flex items-center gap-1 text-sm mb-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{business.rating}</span>
                          {business.review_count > 0 && (
                            <span className="text-muted-foreground">
                              ({business.review_count} omdömen)
                            </span>
                          )}
                        </div>
                      )}

                      {business.address && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {business.address}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {business.phone && (
                          <a
                            href={`tel:${business.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            Ring
                          </a>
                        )}
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            Webbplats
                          </a>
                        )}
                      </div>

                      <Link
                        to={`/${serviceSlug}/${citySlug}/${business.slug}`}
                        className="block mt-3"
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Visa profil
                        </Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Guldmarkör = Rekommenderad partner • Klicka på en markör för mer information
          </p>
        </div>
      </div>
    </section>
  );
}
