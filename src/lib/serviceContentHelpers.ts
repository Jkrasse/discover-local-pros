/**
 * Detect if a service name is a sub-service that needs special handling
 */
function isSubService(serviceName: string): boolean {
  const lowerName = serviceName.toLowerCase();
  const subServiceKeywords = [
    'pianoflytt',
    'kontorsflytt',
    'utlandsflytt',
    'magasinering',
    'dödsbo',
    'bohagsflytt',
    'flyttstädning',
    'packhjälp',
    'fönsterputs',
    'hemstädning',
    'storstädning',
    'trappstädning',
    'byggstädning',
    'kontorsstädning',
    'kontorsstäd', // Short form
  ];
  
  return subServiceKeywords.some(s => lowerName.includes(s));
}

/**
 * Get the parent service type for a sub-service
 */
function getParentServiceType(serviceName: string): string {
  const lowerName = serviceName.toLowerCase();
  
  // Moving-related sub-services
  if (['pianoflytt', 'kontorsflytt', 'utlandsflytt', 'bohagsflytt', 'packhjälp', 'magasinering'].some(s => lowerName.includes(s))) {
    return 'flyttfirma';
  }
  
  // Cleaning-related sub-services (includes kontorsstäd)
  if (['fönsterputs', 'hemstädning', 'storstädning', 'trappstädning', 'byggstädning', 'kontorsstädning', 'kontorsstäd', 'flyttstädning'].some(s => lowerName.includes(s))) {
    return 'städfirma';
  }
  
  // Death estate
  if (lowerName.includes('dödsbo')) {
    return 'företag';
  }
  
  return 'företag';
}

/**
 * Generate a dynamic H1 title based on service type
 * For sub-services: "Bästa städfirman för fönsterputs i Stockholm 2026"
 * For main services: "Bästa flyttfirman i Stockholm 2026"
 */
export function generateServiceTitle(
  serviceName: string,
  cityName: string,
  year: number
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    const parentType = getParentServiceType(serviceName);
    return `Bästa ${parentType}n för ${lowerName} i ${cityName} ${year}`;
  }
  
  // For main services, adjust article ending based on the word
  // "Flyttfirmor" -> "Bästa flyttfirman"
  // "Städfirmor" -> "Bästa städfirman"
  if (lowerName.endsWith('or')) {
    const singular = lowerName.slice(0, -2) + 'an';
    return `Bästa ${singular} i ${cityName} ${year}`;
  }
  
  return `Bästa ${lowerName} i ${cityName} ${year}`;
}

/**
 * Generate quote form title - "Få offert på fönsterputs i Stockholm"
 */
export function generateQuoteFormTitle(
  serviceName: string,
  cityName: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    return `Få offert på ${lowerName} i ${cityName}`;
  }
  
  // For main services like "Flyttfirmor", use the plural form
  return `Få offert från ${lowerName} i ${cityName}`;
}

/**
 * Generate info section title - "Allt du behöver veta om att anlita städfirma för fönsterputs i Stockholm"
 */
export function generateInfoSectionTitle(
  serviceName: string,
  cityName: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    const parentType = getParentServiceType(serviceName);
    return `Allt du behöver veta om att anlita ${parentType} för ${lowerName} i ${cityName}`;
  }
  
  return `Allt du behöver veta om ${lowerName} i ${cityName}`;
}

/**
 * Generate business list title - "Alla företag som utför fönsterputs i Stockholm"
 */
export function generateBusinessListTitle(
  serviceName: string,
  cityName: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    const parentType = getParentServiceType(serviceName);
    // Pluralize: städfirma -> städfirmor
    const pluralType = parentType.endsWith('a') ? parentType.slice(0, -1) + 'or' : parentType;
    return `Alla ${pluralType} som utför ${lowerName} i ${cityName}`;
  }
  
  return `Alla ${lowerName} i ${cityName}`;
}

/**
 * Generate map section title - "Karta över städfirmor som utför fönsterputs i Stockholm"
 */
export function generateMapTitle(
  serviceName: string,
  cityName: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    const parentType = getParentServiceType(serviceName);
    const pluralType = parentType.endsWith('a') ? parentType.slice(0, -1) + 'or' : parentType;
    return `Karta över ${pluralType} som utför ${lowerName} i ${cityName}`;
  }
  
  return `Karta över ${lowerName} i ${cityName}`;
}

/**
 * Generate map subtitle
 */
export function generateMapSubtitle(
  serviceName: string,
  businessCount: number
): string {
  const lowerName = serviceName.toLowerCase();
  
  if (isSubService(serviceName)) {
    const parentType = getParentServiceType(serviceName);
    const pluralType = parentType.endsWith('a') ? parentType.slice(0, -1) + 'or' : parentType;
    return `Se alla ${businessCount} ${pluralType} som erbjuder ${lowerName} på kartan`;
  }
  
  return `Se var alla ${businessCount} ${lowerName} finns på kartan`;
}

/**
 * Generate a dynamic intro text based on service
 */
export function generateDefaultIntroText(
  serviceName: string,
  cityName: string
): string {
  const lowerName = serviceName.toLowerCase();
  
  // For specialized moving services
  if (lowerName.includes('piano')) {
    return `Letar du efter en pålitlig flyttfirma för pianoflytt i ${cityName}? Piano kräver specialhantering med rätt utrustning och erfarenhet. Vår rekommenderade partner har expertis inom pianotransport och hanterar ditt instrument med största omsorg.`;
  }
  
  if (lowerName.includes('kontor')) {
    return `Planerar du en kontorsflytt i ${cityName}? En professionell kontorsflytt minimerar driftstopp och säkerställer att känslig utrustning hanteras korrekt. Vår rekommenderade partner har erfarenhet av företagsflytt i alla storlekar.`;
  }
  
  if (lowerName.includes('utland')) {
    return `Ska du flytta utomlands från ${cityName}? Internationell flytt kräver kunskap om tullformaliteter och logistik. Vår rekommenderade partner har gedigen erfarenhet av utlandsflytt och hjälper dig hela vägen.`;
  }
  
  if (lowerName.includes('dödsbo')) {
    return `Behöver du hjälp med dödsbo i ${cityName}? Det är en känslig situation som kräver respekt och professionalism. Vår rekommenderade partner hanterar tömning och bortforsling med största hänsyn.`;
  }
  
  if (lowerName.includes('fönsterputs')) {
    return `Söker du professionell fönsterputs i ${cityName}? Skinande rena fönster gör stor skillnad för ditt hem eller kontor. Vår rekommenderade partner har erfarenhet och rätt utrustning för att ge dig ett perfekt resultat.`;
  }
  
  // Default intro for regular services
  return `Hitta en pålitlig ${lowerName.replace(/or$/, 'a')} i ${cityName}. Vår rekommenderade partner har granskats för kvalitet och pålitlighet.`;
}
