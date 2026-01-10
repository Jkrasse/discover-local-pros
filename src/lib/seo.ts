// SEO utilities for the directory

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function generateCityServiceTitle(
  serviceName: string,
  cityName: string,
  year: number = new Date().getFullYear()
): string {
  return `Bästa ${serviceName.toLowerCase()} i ${cityName} (${year}) | Jämför & Få Offert`;
}

export function generateCityServiceDescription(
  serviceName: string,
  cityName: string
): string {
  return `Hitta och jämför de bästa ${serviceName.toLowerCase()} i ${cityName}. ✓ Omdömen ✓ Priser ✓ Gratis offertförfrågan. Uppdaterat ${new Date().getFullYear()}.`;
}

export function generateBusinessTitle(
  businessName: string,
  cityName: string
): string {
  return `${businessName} - Omdömen & Kontakt | ${cityName}`;
}

export function generateBusinessDescription(
  businessName: string,
  serviceName: string,
  cityName: string,
  rating?: number,
  reviewCount?: number
): string {
  const ratingText = rating ? `★ ${rating}/5` : '';
  const reviewText = reviewCount ? `(${reviewCount} omdömen)` : '';
  return `${businessName} - ${serviceName} i ${cityName}. ${ratingText} ${reviewText}. Kontaktuppgifter, öppettider och kundomdömen.`.trim();
}

export function generateBreadcrumbs(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ label: string; href?: string }>
): object {
  const baseUrl = window.location.origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };
}

export function generateLocalBusinessSchema(business: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  openingHours?: Record<string, string>;
  image?: string;
}): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
  };

  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: business.address,
    };
  }

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (business.website) {
    schema.url = business.website;
  }

  if (business.rating && business.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (business.lat && business.lng) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.lat,
      longitude: business.lng,
    };
  }

  if (business.image) {
    schema.image = business.image;
  }

  return schema;
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateWebsiteSchema(
  siteName: string,
  siteUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/sok?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema(
  name: string,
  url: string,
  logo?: string
): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
  };

  if (logo) {
    schema.logo = logo;
  }

  return schema;
}
