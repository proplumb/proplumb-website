import type { ImageMetadata } from "astro";

export const SITE_URL = "https://proplumb.com.au";
export const SITE_NAME = "ProPlumb";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const DEFAULT_SEO_TITLE =
  "ProPlumb | Civil, Drainage & Plumbing Professionals";
export const DEFAULT_SEO_DESCRIPTION =
  "ProPlumb delivers structured civil, drainage, and plumbing solutions for builders and developers across residential, commercial, and development projects.";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export type JsonLdObject = { [key: string]: JsonLdValue | undefined };
export type SeoImage = string | ImageMetadata;
export type ServiceJsonLdInput = {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  areaServed?: string;
};

export const toAbsoluteUrl = (value = "/") => {
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
};

export const getImageUrl = (image?: SeoImage) => {
  if (!image) return undefined;
  const imageSource = typeof image === "string" ? image : image.src;
  return imageSource ? toAbsoluteUrl(imageSource) : undefined;
};

export const createOrganizationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Plumber"],
  "@id": ORGANIZATION_ID,
  name: "ProPlumb",
  url: SITE_URL,
  logo: toAbsoluteUrl("/favicon-v3.png"),
  image: toAbsoluteUrl("/favicon-v3.png"),
  telephone: "+61 3 5940 2477",
  email: "admin@proplumb.com.au",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "7B Evolution Dr",
    addressLocality: "Pakenham",
    addressRegion: "VIC",
    postalCode: "3810",
    addressCountry: "AU",
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Victoria, Australia",
  },
  knowsAbout: [
    "Civil drainage",
    "Plumbing",
    "Underground services coordination",
    "Residential construction plumbing",
    "Commercial plumbing",
  ],
  description: DEFAULT_SEO_DESCRIPTION,
});

export const createWebsiteJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: {
    "@id": ORGANIZATION_ID,
  },
});

export const createServiceJsonLd = ({
  name,
  description,
  url,
  serviceType,
  areaServed = "Melbourne South East and Victoria, Australia",
}: ServiceJsonLdInput): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${toAbsoluteUrl(url)}#service`,
  name,
  description,
  serviceType: serviceType || name,
  url: toAbsoluteUrl(url),
  provider: {
    "@id": ORGANIZATION_ID,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: areaServed,
  },
});

export const createBreadcrumbJsonLd = (
  items: Array<{ name: string; url: string }>,
): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.url),
  })),
});

export const createFaqJsonLd = (
  faqs: Array<{ question: string; answer: string }>,
): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    },
  })),
});
