// Custom types for the directory database

export interface City {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  population: number | null;
  lat: number | null;
  lng: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: 'moving' | 'cleaning' | 'dental' | 'other';
  parent_service_id: string | null;
  icon: string | null;
  description: string | null;
  seo_title_template: string | null;
  seo_description_template: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  gbp_id: string | null;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city_id: string | null;
  rating: number | null;
  review_count: number;
  price_level: number | null;
  categories: string[] | null;
  lat: number | null;
  lng: number | null;
  opening_hours: OpeningHours | null;
  images: string[] | null;
  description: string | null;
  verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: City;
}

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface BusinessServiceCoverage {
  id: string;
  business_id: string;
  service_id: string;
  city_id: string;
  is_primary: boolean;
  created_at: string;
  business?: Business;
  service?: Service;
  city?: City;
}

export interface FeaturedSlot {
  id: string;
  city_id: string;
  service_id: string;
  business_id: string | null;
  status: 'active' | 'pending' | 'expired';
  start_date: string | null;
  end_date: string | null;
  plan: string | null;
  price_monthly: number | null;
  created_at: string;
  updated_at: string;
  business?: Business;
  city?: City;
  service?: Service;
}

export interface Lead {
  id: string;
  city_id: string | null;
  service_id: string | null;
  business_id: string | null;
  name: string;
  phone: string | null;
  email: string;
  move_date: string | null;
  from_area: string | null;
  to_area: string | null;
  housing_type: string | null;
  message: string | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  created_at: string;
}

export interface Page {
  id: string;
  route: string;
  title: string | null;
  meta_description: string | null;
  h1: string | null;
  content: string | null;
  faq: FAQItem[] | null;
  og_image: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface BusinessWithCoverage extends Business {
  services?: Service[];
  isFeatured?: boolean;
}

export interface CityServicePage {
  city: City;
  service: Service;
  businesses: BusinessWithCoverage[];
  featuredBusiness?: BusinessWithCoverage;
  page?: Page;
}
