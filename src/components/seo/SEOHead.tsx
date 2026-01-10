import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = '/og-image.png',
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  const siteUrl = 'https://flyttguide.se';
  const fullCanonical = canonical
    ? `${siteUrl}${canonical}`
    : typeof window !== 'undefined'
    ? window.location.href
    : siteUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:locale" content="sv_SE" />
      <meta property="og:site_name" content="FlyttGuide" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
