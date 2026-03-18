

## Site Review & SEO Analysis for FlyttGuide

### A. Content Issues to Fix

**1. "Jämför" still appears in 3 files:**
- `src/pages/AboutPage.tsx` (line 77: "jämföra alternativ", line 122: "jämförelsetjänster")
- `src/pages/TermsPage.tsx` (line 15: "jämförelsetjänst", line 51: "jämföra", line 55: "jämförelse")
- `src/pages/admin/SettingsPage.tsx` (line 178: placeholder text)

**2. Hardcoded "FlyttGuide" in legal/static pages** instead of using dynamic `siteName`:
- `src/pages/TermsPage.tsx` – FlyttGuide appears 10+ times hardcoded
- `src/pages/CookiePolicyPage.tsx` – FlyttGuide hardcoded throughout
- `src/pages/PrivacyPolicyPage.tsx` – FlyttGuide hardcoded throughout
- `src/pages/CitiesPage.tsx` – SEO title says "FlyttGuide"
- `src/components/seo/SEOHead.tsx` – `og:site_name` hardcoded to "FlyttGuide"

**3. Placeholder org.nr** – TermsPage and PrivacyPolicyPage show "559XXX-XXXX" — needs real org number.

**4. Contact form doesn't actually send** – `ContactPage.tsx` line 35 simulates submission with `setTimeout`. Messages are lost.

**5. NotFound page is in English** – "Oops! Page not found" and "Return to Home" should be Swedish.

**6. OG image in index.html points to lovable.dev** – `https://lovable.dev/opengraph-image-p98pqg.png` should be your own image.

**7. No actual `/og-image.png` file** exists in `/public/`. SEOHead references it but it's missing.

---

### B. SEO Analysis

#### What's already in place (good)
- `react-helmet-async` with `<SEOHead>` on all pages — title, description, canonical, OG tags, Twitter cards
- JSON-LD structured data on ServiceCityPage: BreadcrumbList, FAQPage, LocalBusiness schemas
- `robots.txt` exists and allows all crawlers
- Breadcrumbs component on all content pages
- Swedish `lang="sv"` on `<html>`
- `og:locale` set to `sv_SE`

#### What's missing or broken

| Issue | Severity | Detail |
|-------|----------|--------|
| **No sitemap.xml** | High | No sitemap exists anywhere. Critical for Google to discover all city/service/business pages. |
| **No sitemap reference in robots.txt** | High | `robots.txt` has no `Sitemap:` directive. |
| **SPA without SSR/prerendering** | High | React SPA — Google can render JS but it's slower. No prerendering strategy in place. |
| **Missing OG image file** | Medium | `/og-image.png` doesn't exist in `/public/`. All pages reference a missing image. |
| **index.html OG image = lovable.dev URL** | Medium | Should be own branded image. |
| **No hreflang tags** | Low | Not critical since site is Swedish-only, but could add `hreflang="sv"`. |
| **Canonical on BusinessProfilePage missing** | Medium | `SEOHead` on BusinessProfilePage doesn't pass `canonical` prop — falls back to `window.location.href` which could cause duplicate issues. |
| **No structured data on Index page** | Medium | Homepage has no JSON-LD (WebSite schema, Organization schema). Functions exist in `seo.ts` but aren't used. |
| **No structured data on static pages** | Low | About, Contact, HowWeRank pages have no JSON-LD. |
| **Admin pages are indexable** | Medium | No `noindex` on `/admin/*` routes. Search engines could crawl them. |
| **Disallow admin in robots.txt** | Medium | Should add `Disallow: /admin`. |

---

### C. Implementation Plan

**Phase 1 – Content fixes:**
1. Replace remaining "jämför" wording in AboutPage, TermsPage, SettingsPage
2. Make legal pages use dynamic `siteName` via `useSiteSettings` (or at minimum fix the hardcoded name)
3. Translate NotFound page to Swedish
4. Wire up ContactPage form to actually save messages to a database table

**Phase 2 – SEO fixes:**
5. Create a dynamic sitemap via a backend function that queries all cities, services, and businesses to generate XML
6. Update `robots.txt` with `Sitemap:` directive and `Disallow: /admin`
7. Add `noindex` to admin pages
8. Create/upload a proper OG image to `/public/og-image.png`
9. Fix `index.html` OG image URL
10. Add WebSite + Organization JSON-LD to the homepage
11. Add `canonical` prop to BusinessProfilePage
12. Consider prerendering for SEO-critical pages (separate discussion)

**Phase 3 – Nice-to-haves:**
13. Fill in real org number in legal pages
14. Add `hreflang="sv"` tag

Shall I proceed with implementing these changes?

