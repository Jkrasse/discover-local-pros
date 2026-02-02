/**
 * Generate a dynamic H1 title based on service type
 */
export function generateServiceTitle(
  serviceName: string,
  cityName: string,
  year: number
): string {
  // For sub-services or specialized services, use "for" format
  // e.g., "Bästa flyttfirman för pianoflytt i Stockholm 2026"
  const lowerName = serviceName.toLowerCase();
  
  // Check if it's a specialized service that should use "för" format
  const specializedServices = [
    'pianoflytt',
    'kontorsflytt', 
    'utlandsflytt',
    'magasinering',
    'dödsbo',
    'bohagsflytt',
    'flyttstädning',
    'packhjälp',
  ];
  
  const isSpecialized = specializedServices.some(s => lowerName.includes(s));
  
  if (isSpecialized) {
    return `Bästa flyttfirman för ${lowerName} i ${cityName} ${year}`;
  }
  
  // Default format for main services
  return `Bästa ${lowerName} i ${cityName} ${year}`;
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
  
  // Default intro for regular services
  return `Hitta en pålitlig ${lowerName.replace(/or$/, 'a')} i ${cityName}. Vår rekommenderade partner har granskats för kvalitet och pålitlighet.`;
}
