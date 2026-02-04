import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Star, Phone, Globe, ExternalLink } from 'lucide-react';
import type { Business } from '@/types/database';
import { generateMapTitle, generateMapSubtitle } from '@/lib/serviceContentHelpers';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const featuredIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BusinessMapProps {
  businesses: Business[];
  featuredBusinessId?: string;
  serviceName: string;
  cityName: string;
  cityLat?: number | null;
  cityLng?: number | null;
  serviceSlug: string;
  citySlug: string;
}

function createPopupContent(
  business: Business, 
  serviceSlug: string, 
  citySlug: string
): string {
  const ratingHtml = business.rating 
    ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 14px; margin-bottom: 8px;">
        <span style="color: #f59e0b;">★</span>
        <strong>${business.rating}</strong>
        ${business.review_count > 0 ? `<span style="color: #6b7280;">(${business.review_count} omdömen)</span>` : ''}
      </div>`
    : '';

  const addressHtml = business.address 
    ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">${business.address}</p>` 
    : '';

  const phoneHtml = business.phone 
    ? `<a href="tel:${business.phone}" style="font-size: 12px; color: #2563eb; text-decoration: none; margin-right: 12px;">📞 Ring</a>` 
    : '';

  const websiteHtml = business.website 
    ? `<a href="${business.website}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #2563eb; text-decoration: none;">🌐 Webbplats</a>` 
    : '';

  const profileUrl = `/${serviceSlug}/${citySlug}/${business.slug}`;

  return `
    <div style="min-width: 200px; font-family: system-ui, sans-serif;">
      <h3 style="font-weight: 600; font-size: 15px; margin: 0 0 6px 0;">${business.name}</h3>
      ${ratingHtml}
      ${addressHtml}
      <div style="margin-bottom: 10px;">${phoneHtml}${websiteHtml}</div>
      <a href="${profileUrl}" style="display: block; text-align: center; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; color: #374151; text-decoration: none; font-size: 13px; font-weight: 500;">
        Visa profil →
      </a>
    </div>
  `;
}

export function BusinessMap({
  businesses,
  featuredBusinessId,
  serviceName,
  cityName,
  cityLat,
  cityLng,
  serviceSlug,
  citySlug,
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Filter businesses with valid coordinates
  const businessesWithCoords = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses]
  );

  // Calculate center from businesses or use city coordinates
  const center = useMemo((): [number, number] => {
    if (cityLat && cityLng) {
      return [cityLat, cityLng];
    }
    if (businessesWithCoords.length === 0) {
      return [59.3293, 18.0686]; // Stockholm as fallback
    }
    return [
      businessesWithCoords.reduce((sum, b) => sum + (b.lat || 0), 0) / businessesWithCoords.length,
      businessesWithCoords.reduce((sum, b) => sum + (b.lng || 0), 0) / businessesWithCoords.length,
    ];
  }, [cityLat, cityLng, businessesWithCoords]);

  useEffect(() => {
    if (!mapRef.current || businessesWithCoords.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create new map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: 12,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add markers
    businessesWithCoords.forEach((business) => {
      const icon = business.id === featuredBusinessId ? featuredIcon : defaultIcon;
      const marker = L.marker([business.lat!, business.lng!], { icon }).addTo(map);
      
      const popupContent = createPopupContent(business, serviceSlug, citySlug);
      marker.bindPopup(popupContent);
    });

    // Fit bounds to show all markers
    if (businessesWithCoords.length > 1) {
      const bounds = L.latLngBounds(
        businessesWithCoords.map((b) => [b.lat!, b.lng!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [businessesWithCoords, featuredBusinessId, center, serviceSlug, citySlug]);

  if (businessesWithCoords.length === 0) {
    return null;
  }

  const mapTitle = generateMapTitle(serviceName, cityName);
  const mapSubtitle = generateMapSubtitle(serviceName, businessesWithCoords.length);

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            {mapTitle}
          </h2>
          <p className="text-muted-foreground mb-6">
            {mapSubtitle}
          </p>

          <div 
            ref={mapRef}
            className="rounded-xl overflow-hidden border shadow-sm h-[400px] md:h-[500px]"
          />

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Guldmarkör = Rekommenderad partner • Klicka på en markör för mer information
          </p>
        </div>
      </div>
    </section>
  );
}
