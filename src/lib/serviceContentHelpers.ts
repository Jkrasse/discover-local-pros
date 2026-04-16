/**
 * Service Content Helpers
 *
 * Generates grammatically correct Swedish titles and texts for service pages.
 *
 * Primary source: seo_keyword, seo_plural, seo_definite columns in the services table.
 * Fallback: simple suffix rules (works for -firma/-firmor pattern but not all Swedish nouns).
 *
 * Example outputs:
 * - Main service: "Bästa städfirman i Stockholm 2026"
 * - Sub-service: "Bästa städfirmor som utför hemstäd i Stockholm 2026"
 */

// ── Grammar helpers (fallback when DB columns are null) ──────────────────

function getPluralFormFallback(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  if (lower.endsWith('a')) return lower.slice(0, -1) + 'or';
  if (lower.endsWith('or')) return lower;
  return lower + 'or';
}

function getSingularDefiniteFallback(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  if (lower.endsWith('or')) return lower.slice(0, -2) + 'an';
  if (lower.endsWith('a')) return lower.slice(0, -1) + 'an';
  return lower + 'n';
}

// ── Public API: grammar lookups with DB-first, fallback second ───────────

export interface ServiceSEO {
  seo_keyword?: string | null;
  seo_plural?: string | null;
  seo_definite?: string | null;
}

/**
 * Get the plural form — DB value first, then suffix rule fallback
 */
export function getPluralForm(serviceName: string, seo?: ServiceSEO | null): string {
  if (seo?.seo_plural) return seo.seo_plural;
  return getPluralFormFallback(serviceName);
}

/**
 * Get the singular definite form — DB value first, then suffix rule fallback
 */
export function getSingularDefiniteForm(serviceName: string, seo?: ServiceSEO | null): string {
  if (seo?.seo_definite) return seo.seo_definite;
  return getSingularDefiniteFallback(serviceName);
}

/**
 * Get the keyword form for meta titles — DB value first, then service name as-is
 */
export function getKeywordForm(serviceName: string, seo?: ServiceSEO | null): string {
  if (seo?.seo_keyword) return seo.seo_keyword;
  return serviceName;
}

// ── Title generators ─────────────────────────────────────────────────────

/**
 * Generate a dynamic H1 title based on service type
 *
 * For sub-services with parent: "Bästa städfirmor som utför hemstäd i Stockholm 2026"
 * For main services: "Bästa städfirman i Stockholm 2026"
 */
export function generateServiceTitle(
  serviceName: string,
  cityName: string,
  year: number,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Bästa ${parentPlural} som utför ${keyword} i ${cityName} ${year}`;
  }

  const singular = getSingularDefiniteForm(serviceName, serviceSeo);
  return `Bästa ${singular} i ${cityName} ${year}`;
}

/**
 * Generate SEO meta title — keyword-first for search engine visibility
 *
 * Sub-service: "Hemstäd i Göteborg – Hitta bästa städfirman 2026 | Stadfirmor.nu"
 * Main service: "Städfirma i Göteborg – Jämför & få offert 2026 | Stadfirmor.nu"
 */
export function generateSeoTitle(
  serviceName: string,
  cityName: string,
  year: number,
  siteName: string,
  serviceSeo?: ServiceSEO | null,
  seoTitleTemplate?: string | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo);

  // If there's a custom template, use it with placeholder replacement
  if (seoTitleTemplate) {
    return seoTitleTemplate
      .replace('{keyword}', keyword)
      .replace('{keyword_lower}', keyword.toLowerCase())
      .replace('{city}', cityName)
      .replace('{year}', String(year))
      .replace('{site_name}', siteName);
  }

  // Default keyword-first format with CTA
  return `${keyword} i ${cityName} – Jämför & få offert ${year} | ${siteName}`;
}

/**
 * Generate SEO meta description
 *
 * Sub-service: "Behöver du hemstäd i Göteborg? Hitta den bästa städfirman..."
 * Main service: "Hitta den bästa städfirman i Göteborg..."
 */
export function generateSeoDescription(
  serviceName: string,
  cityName: string,
  year: number,
  serviceSeo?: ServiceSEO | null,
  seoDescriptionTemplate?: string | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo);

  if (seoDescriptionTemplate) {
    return seoDescriptionTemplate
      .replace('{keyword}', keyword)
      .replace('{keyword_lower}', keyword.toLowerCase())
      .replace('{city}', cityName)
      .replace('{year}', String(year));
  }

  // Default description
  return `Hitta den bästa ${keyword.toLowerCase()} i ${cityName}. ✓ Verifierade omdömen ✓ Jämför priser ✓ Få gratis offert. Uppdaterad lista ${year}.`;
}

/**
 * Generate quote form title
 */
export function generateQuoteFormTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Få offert från ${parentPlural} som utför ${keyword} i ${cityName}`;
  }

  return `Få offert från ${keyword} i ${cityName}`;
}

/**
 * Generate info section title
 */
export function generateInfoSectionTitle(
  serviceName: string,
  cityName: string,
  serviceSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();
  return `Allt du behöver veta om ${keyword} i ${cityName}`;
}

/**
 * Generate business list title
 */
export function generateBusinessListTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Alla ${parentPlural} som utför ${keyword} i ${cityName}`;
  }

  const plural = getPluralForm(serviceName, serviceSeo);
  return `Alla ${plural} i ${cityName}`;
}

/**
 * Generate map section title
 */
export function generateMapTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Karta över ${parentPlural} som utför ${keyword} i ${cityName}`;
  }

  const plural = getPluralForm(serviceName, serviceSeo);
  return `Karta över ${plural} i ${cityName}`;
}

/**
 * Generate map subtitle
 */
export function generateMapSubtitle(
  serviceName: string,
  businessCount: number,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Se alla ${businessCount} ${parentPlural} som erbjuder ${keyword} på kartan`;
  }

  const plural = getPluralForm(serviceName, serviceSeo);
  return `Se var alla ${businessCount} ${plural} finns på kartan`;
}

/**
 * Generate a dynamic intro text (fallback when no DB content exists)
 */
export function generateDefaultIntroText(
  serviceName: string,
  cityName: string,
  parentServiceName?: string,
  serviceSeo?: ServiceSEO | null,
  parentSeo?: ServiceSEO | null
): string {
  const keyword = getKeywordForm(serviceName, serviceSeo).toLowerCase();

  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName, parentSeo);
    return `Letar du efter ${parentPlural} som utför ${keyword} i ${cityName}? Vi har samlat de bästa och mest pålitliga företagen för att hjälpa dig hitta rätt partner.`;
  }

  const singular = getSingularDefiniteForm(serviceName, serviceSeo);
  return `Letar du efter ${singular} i ${cityName}? Vi har samlat de bästa och mest pålitliga företagen för att hjälpa dig hitta rätt partner.`;
}
