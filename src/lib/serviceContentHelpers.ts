/**
 * Service Content Helpers
 * 
 * Generates grammatically correct Swedish titles and texts for service pages.
 * Uses parent service information from the database to properly format sub-service titles.
 * 
 * Example outputs:
 * - Main service: "Bästa städfirman i Stockholm 2026"
 * - Sub-service: "Bästa städfirmor som utför storstäd i Stockholm 2026"
 */

/**
 * Get the plural form of a parent service name
 * "Städfirma" -> "städfirmor"
 * "Flyttfirma" -> "flyttfirmor"
 */
function getPluralForm(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  if (lower.endsWith('a')) {
    return lower.slice(0, -1) + 'or';
  }
  if (lower.endsWith('or')) {
    return lower;
  }
  return lower + 'or';
}

/**
 * Get the singular definite form of a parent service name
 * "Städfirma" -> "städfirman"
 * "Flyttfirmor" -> "flyttfirman"
 */
function getSingularDefiniteForm(serviceName: string): string {
  const lower = serviceName.toLowerCase();
  if (lower.endsWith('or')) {
    return lower.slice(0, -2) + 'an';
  }
  if (lower.endsWith('a')) {
    return lower.slice(0, -1) + 'an';
  }
  return lower + 'n';
}

/**
 * Generate a dynamic H1 title based on service type
 * 
 * For sub-services with parent: "Bästa städfirmor som utför storstäd i Stockholm 2026"
 * For main services: "Bästa städfirman i Stockholm 2026"
 * 
 * @param serviceName - The name of the current service (e.g., "Storstäd")
 * @param cityName - The name of the city (e.g., "Stockholm")
 * @param year - The current year
 * @param parentServiceName - Optional: The parent service name (e.g., "Städfirma")
 */
export function generateServiceTitle(
  serviceName: string,
  cityName: string,
  year: number,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  // If this is a sub-service (has a parent), use parent plural + "som utför [undertjänst]"
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Bästa ${parentPlural} som utför ${lowerName} i ${cityName} ${year}`;
  }
  
  // For main services, use singular definite form
  const singular = getSingularDefiniteForm(serviceName);
  return `Bästa ${singular} i ${cityName} ${year}`;
}

/**
 * Generate quote form title
 * 
 * For sub-services: "Få offert på storstäd i Stockholm"
 * For main services: "Få offert från städfirmor i Stockholm"
 */
export function generateQuoteFormTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Få offert från ${parentPlural} som utför ${lowerName} i ${cityName}`;
  }
  
  // For main services
  return `Få offert från ${lowerName} i ${cityName}`;
}

/**
 * Generate info section title
 * 
 * For sub-services: "Allt du behöver veta om storstäd i Stockholm"
 * (Keep it simple - no need for parent service here)
 */
export function generateInfoSectionTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  // Keep this simple - just the service name works for all cases
  return `Allt du behöver veta om ${lowerName} i ${cityName}`;
}

/**
 * Generate business list title
 * 
 * For sub-services: "Alla städfirmor som utför storstäd i Stockholm"
 * For main services: "Alla städfirmor i Stockholm"
 */
export function generateBusinessListTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Alla ${parentPlural} som utför ${lowerName} i ${cityName}`;
  }
  
  // For main services, use the service name as-is (already plural)
  const plural = getPluralForm(serviceName);
  return `Alla ${plural} i ${cityName}`;
}

/**
 * Generate map section title
 * 
 * For sub-services: "Karta över städfirmor som utför storstäd i Stockholm"
 * For main services: "Karta över städfirmor i Stockholm"
 */
export function generateMapTitle(
  serviceName: string,
  cityName: string,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Karta över ${parentPlural} som utför ${lowerName} i ${cityName}`;
  }
  
  const plural = getPluralForm(serviceName);
  return `Karta över ${plural} i ${cityName}`;
}

/**
 * Generate map subtitle
 * 
 * For sub-services: "Se alla 22 städfirmor som erbjuder storstäd på kartan"
 * For main services: "Se var alla 22 städfirmor finns på kartan"
 */
export function generateMapSubtitle(
  serviceName: string,
  businessCount: number,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Se alla ${businessCount} ${parentPlural} som erbjuder ${lowerName} på kartan`;
  }
  
  const plural = getPluralForm(serviceName);
  return `Se var alla ${businessCount} ${plural} finns på kartan`;
}

/**
 * Generate a dynamic intro text based on service
 * 
 * This is a fallback - prefer AI-generated content from service_content table
 */
export function generateDefaultIntroText(
  serviceName: string,
  cityName: string,
  parentServiceName?: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (parentServiceName) {
    const parentPlural = getPluralForm(parentServiceName);
    return `Letar du efter ${parentPlural} som utför ${lowerName} i ${cityName}? Vi har samlat de bästa och mest pålitliga företagen för att hjälpa dig hitta rätt partner.`;
  }
  
  // Default intro for regular services
  const singular = getSingularDefiniteForm(serviceName);
  return `Letar du efter ${singular} i ${cityName}? Vi har samlat de bästa och mest pålitliga företagen för att hjälpa dig hitta rätt partner.`;
}
