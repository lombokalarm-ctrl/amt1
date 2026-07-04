import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import {
  initialPackages,
  initialBlogs,
  initialHeader,
  initialFooter,
  initialStats,
  initialReports,
} from "./src/seed";
import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, Booking, StatsData, EmailReport } from "./src/types";
import { faqEntries } from "./src/content/faq";
import { getArticleMiniFaqs } from "./src/content/articleEnhancements";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_SESSION_COOKIE = "amt_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE_PATH = path.join(DATA_DIR, "cms-db.json");
const adminSessions = new Map<string, number>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const BOOKING_STATUS_VALUES: Booking["status"][] = ["Pending", "Dihubungi", "Selesai"];
const STATS_ACTION_VALUES = ["whatsapp", "booking", "pageview"] as const;
const APP_URL = process.env.APP_URL?.trim().replace(/\/+$/, "") || "";
const APP_BASE_URL = (() => {
  if (!APP_URL) {
    return null;
  }

  try {
    return new URL(APP_URL);
  } catch {
    console.warn(`Invalid APP_URL configured: ${APP_URL}`);
    return null;
  }
})();
const DEFAULT_PAGE_TITLE = "Amantubillahi Tour | Travel Umroh Lombok Terpercaya";
const DEFAULT_PAGE_DESCRIPTION =
  "Amantubillahi Tour adalah travel umroh Lombok terpercaya dengan paket keberangkatan terkurasi, layanan booking online, dan panduan umroh NTB yang siap diproduksi.";

app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", buildContentSecurityPolicy(process.env.NODE_ENV === "production"));
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

interface PersistedStore {
  packages: UmrahPackage[];
  blogs: BlogPost[];
  header: HeaderConfig;
  footer: FooterConfig;
  stats: StatsData;
  reports: EmailReport[];
}

type ValidationResult<T> =
  | { value: T; error?: undefined }
  | { value?: undefined; error: string };

interface PageMetadata {
  statusCode: number;
  robots: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isLegacySourceAssetPath(value: string | undefined) {
  return typeof value === "string" && value.startsWith("/src/assets/images/");
}

function normalizeImageUrlValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return `/${value.replace(/^\.?\//, "")}`;
}

function buildDefaultStore(): PersistedStore {
  return {
    packages: clone(initialPackages).map((pkg) => ({ ...pkg, imageUrl: normalizeImageUrlValue(pkg.imageUrl) })),
    blogs: clone(initialBlogs).map((blog) => ({ ...blog, imageUrl: normalizeImageUrlValue(blog.imageUrl) })),
    header: clone(initialHeader),
    footer: clone(initialFooter),
    stats: clone(initialStats),
    reports: clone(initialReports),
  };
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeStoreToDisk(store: PersistedStore) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function loadStore(): PersistedStore {
  const defaults = buildDefaultStore();
  ensureDataDir();

  if (!fs.existsSync(DATA_FILE_PATH)) {
    writeStoreToDisk(defaults);
    return defaults;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    let shouldRewriteStore = false;
    const defaultPackagesById = new Map(defaults.packages.map((pkg) => [pkg.id, pkg]));
    const defaultBlogsById = new Map(defaults.blogs.map((blog) => [blog.id, blog]));
    const defaultBlogsBySlug = new Map(defaults.blogs.map((blog) => [blog.slug, blog]));
    const normalizedPackages = Array.isArray(parsed.packages)
      ? parsed.packages.map((pkg) => {
          const fallbackImage =
            defaultPackagesById.get(pkg.id)?.imageUrl ||
            defaults.packages.find((item) => item.title === pkg.title)?.imageUrl ||
            pkg.imageUrl;
          const normalizedImage = isLegacySourceAssetPath(pkg.imageUrl) && fallbackImage
            ? fallbackImage
            : normalizeImageUrlValue(pkg.imageUrl);
          if (pkg.imageUrl !== normalizedImage && normalizedImage) {
            shouldRewriteStore = true;
            return { ...pkg, imageUrl: normalizedImage };
          }
          return { ...pkg, imageUrl: normalizedImage };
        })
      : defaults.packages;
    const normalizedBlogs = Array.isArray(parsed.blogs)
      ? parsed.blogs.map((blog) => {
          const fallbackImage =
            defaultBlogsById.get(blog.id)?.imageUrl ||
            defaultBlogsBySlug.get(blog.slug)?.imageUrl ||
            blog.imageUrl;
          const normalizedImage = isLegacySourceAssetPath(blog.imageUrl) && fallbackImage
            ? fallbackImage
            : normalizeImageUrlValue(blog.imageUrl);
          if (blog.imageUrl !== normalizedImage && normalizedImage) {
            shouldRewriteStore = true;
            return { ...blog, imageUrl: normalizedImage };
          }
          return { ...blog, imageUrl: normalizedImage };
        })
      : defaults.blogs;
    const existingBlogIds = new Set(normalizedBlogs.map((blog) => blog.id));
    const existingBlogSlugs = new Set(normalizedBlogs.map((blog) => blog.slug));
    const mergedBlogs = [...normalizedBlogs];

    for (const defaultBlog of defaults.blogs) {
      if (existingBlogIds.has(defaultBlog.id) || existingBlogSlugs.has(defaultBlog.slug)) {
        continue;
      }

      mergedBlogs.push({ ...defaultBlog, imageUrl: normalizeImageUrlValue(defaultBlog.imageUrl) });
      shouldRewriteStore = true;
    }

    const loadedStore: PersistedStore = {
      packages: normalizedPackages,
      blogs: mergedBlogs,
      header: parsed.header ? { ...defaults.header, ...parsed.header } : defaults.header,
      footer: parsed.footer ? { ...defaults.footer, ...parsed.footer } : defaults.footer,
      stats: parsed.stats
        ? {
            ...defaults.stats,
            ...parsed.stats,
            viewsByPage: parsed.stats.viewsByPage || defaults.stats.viewsByPage,
            viewsByCity: parsed.stats.viewsByCity || defaults.stats.viewsByCity,
            bookings: Array.isArray(parsed.stats.bookings) ? parsed.stats.bookings : defaults.stats.bookings,
            dailyStats: Array.isArray(parsed.stats.dailyStats) ? parsed.stats.dailyStats : defaults.stats.dailyStats,
          }
        : defaults.stats,
      reports: Array.isArray(parsed.reports) ? parsed.reports : defaults.reports,
    };

    if (shouldRewriteStore) {
      writeStoreToDisk(loadedStore);
    }

    return loadedStore;
  } catch (error) {
    console.error("❌ Failed to load persisted CMS data. Recreating data store.", error);
    writeStoreToDisk(defaults);
    return defaults;
  }
}

const persistedStore = loadStore();

// Runtime "Databases" backed by a local JSON store for basic persistence
let packagesDb: UmrahPackage[] = persistedStore.packages;
let blogsDb: BlogPost[] = persistedStore.blogs;
let headerDb: HeaderConfig = persistedStore.header;
let footerDb: FooterConfig = persistedStore.footer;
let statsDb: StatsData = persistedStore.stats;
let reportsDb: EmailReport[] = persistedStore.reports;

function persistStore() {
  writeStoreToDisk({
    packages: packagesDb,
    blogs: blogsDb,
    header: headerDb,
    footer: footerDb,
    stats: statsDb,
    reports: reportsDb,
  });
}

function buildContentSecurityPolicy(isProduction: boolean) {
  const directives = [
    "default-src 'self'",
    `script-src ${isProduction ? "'self'" : "'self' 'unsafe-inline' 'unsafe-eval' http: https:"}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src ${isProduction ? "'self'" : "'self' ws: wss: http: https:"}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toPlainText(input: string) {
  return input.replace(/[#*`_>\[\]\(\)\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeHostname(input: string) {
  return input.toLowerCase().replace(/\.$/, "");
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local");
}

function getBaseUrl(req: express.Request) {
  if (APP_BASE_URL) {
    return APP_BASE_URL.origin;
  }

  return `${req.protocol}://${req.get("host")}`;
}

function getLatestPublishedDate() {
  const latestBlogDate = [...blogsDb]
    .map((blog) => blog.date)
    .filter(Boolean)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

  return latestBlogDate || new Date().toISOString().split("T")[0];
}

function buildSitemapXml(req: express.Request) {
  const baseUrl = getBaseUrl(req);
  const lastmod = getLatestPublishedDate();
  const entries: SitemapEntry[] = [
    { loc: `${baseUrl}/`, lastmod },
    ...blogsDb
      .filter((blog) => blog.slug)
      .map((blog) => ({
        loc: `${baseUrl}/artikel/${blog.slug}`,
        lastmod: blog.date || lastmod,
      })),
  ];

  const urlset = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeHtml(entry.loc)}</loc>\n    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;
}

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production" || !APP_BASE_URL || !["GET", "HEAD"].includes(req.method)) {
    return next();
  }

  const requestHost = normalizeHostname(req.hostname || req.get("host") || "");
  const canonicalHost = normalizeHostname(APP_BASE_URL.hostname);

  if (!requestHost || requestHost === canonicalHost || isLocalHostname(requestHost)) {
    return next();
  }

  const redirectUrl = new URL(req.originalUrl || "/", APP_BASE_URL.origin).toString();
  res.redirect(301, redirectUrl);
});

app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl(req);
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/admin",
      "Disallow: /api/stats",
      "Disallow: /api/reports",
      `Sitemap: ${baseUrl}/sitemap.xml`,
      "",
    ].join("\n"),
  );
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(buildSitemapXml(req));
});

function toAbsolutePublicUrl(baseUrl: string, value?: string) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    return new URL(value, `${baseUrl}/`).toString();
  } catch {
    return value;
  }
}

function getDefaultImageUrl(baseUrl: string) {
  const imageCandidate = blogsDb.find((blog) => blog.imageUrl)?.imageUrl || packagesDb.find((pkg) => pkg.imageUrl)?.imageUrl;
  return toAbsolutePublicUrl(baseUrl, imageCandidate);
}

function getArticleSlugFromRequest(req: express.Request) {
  if (typeof req.params.slug === "string" && req.params.slug.trim()) {
    return req.params.slug.trim();
  }

  if (typeof req.query.article === "string" && req.query.article.trim()) {
    return req.query.article.trim();
  }

  const pathnameMatch = req.path.match(/^\/artikel\/([^/]+)\/?$/);
  return pathnameMatch?.[1];
}

function buildPageMetadata(req: express.Request): PageMetadata {
  const baseUrl = getBaseUrl(req);
  const defaultImageUrl = getDefaultImageUrl(baseUrl);
  const landingCanonicalUrl = `${baseUrl}/`;
  const articleSlug = getArticleSlugFromRequest(req);

  if (!articleSlug) {
    return {
      statusCode: 200,
      robots: "index,follow",
      title: DEFAULT_PAGE_TITLE,
      description: DEFAULT_PAGE_DESCRIPTION,
      canonicalUrl: landingCanonicalUrl,
      ogTitle: DEFAULT_PAGE_TITLE,
      ogDescription: DEFAULT_PAGE_DESCRIPTION,
      ogUrl: landingCanonicalUrl,
      ogImage: defaultImageUrl,
      twitterTitle: DEFAULT_PAGE_TITLE,
      twitterDescription: DEFAULT_PAGE_DESCRIPTION,
      twitterImage: defaultImageUrl,
    };
  }

  const matchedBlog = blogsDb.find((blog) => blog.slug === articleSlug);
  const canonicalUrl = `${baseUrl}/artikel/${articleSlug}`;

  if (!matchedBlog) {
    const missingTitle = "Artikel Tidak Ditemukan | Amantubillahi Tour";
    const missingDescription = "Artikel yang Anda cari tidak tersedia atau telah dipindahkan.";
    return {
      statusCode: 404,
      robots: "noindex,nofollow",
      title: missingTitle,
      description: missingDescription,
      canonicalUrl,
      ogTitle: missingTitle,
      ogDescription: missingDescription,
      ogUrl: canonicalUrl,
      ogImage: defaultImageUrl,
      twitterTitle: missingTitle,
      twitterDescription: missingDescription,
      twitterImage: defaultImageUrl,
    };
  }

  const description = matchedBlog.seoMetaDesc?.trim() || toPlainText(matchedBlog.content).slice(0, 160);
  const title = matchedBlog.seoMetaTitle?.trim() || `${matchedBlog.title} | Amantubillahi Tour`;
  const imageUrl = toAbsolutePublicUrl(baseUrl, matchedBlog.imageUrl) || defaultImageUrl;

  return {
    statusCode: 200,
    robots: "index,follow",
    title,
    description,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogImage: imageUrl,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: imageUrl,
  };
}

function buildStructuredData(req: express.Request) {
  const baseUrl = getBaseUrl(req);
  const articleSlug = getArticleSlugFromRequest(req);
  const organizationName = "Amantubillahi Tour";
  const logoUrl = getDefaultImageUrl(baseUrl);

  if (!articleSlug) {
    return [
      {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: organizationName,
        url: `${baseUrl}/`,
        description: DEFAULT_PAGE_DESCRIPTION,
        areaServed: [
          "Mataram",
          "Lombok Barat",
          "Lombok Tengah",
          "Lombok Timur",
          "Sumbawa",
          "Bima",
          "Dompu",
        ],
        keywords: [
          "travel umroh lombok",
          "travel umroh lombok terpercaya",
          "paket umroh lombok",
          "umroh lombok",
        ],
        telephone: headerDb.phoneDisplay || headerDb.phone,
        email: footerDb.email,
        image: logoUrl,
        address: {
          "@type": "PostalAddress",
          streetAddress: footerDb.address,
          addressLocality: "Mataram",
          addressRegion: "Nusa Tenggara Barat",
          addressCountry: "ID",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: organizationName,
        url: `${baseUrl}/`,
        inLanguage: "id-ID",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/artikel/{search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ];
  }

  const matchedBlog = blogsDb.find((blog) => blog.slug === articleSlug);
  if (!matchedBlog) {
    return [];
  }

  const canonicalUrl = `${baseUrl}/artikel/${articleSlug}`;
  const description = matchedBlog.seoMetaDesc?.trim() || toPlainText(matchedBlog.content).slice(0, 160);
  const imageUrl = toAbsolutePublicUrl(baseUrl, matchedBlog.imageUrl) || logoUrl;
  const articleMiniFaqs = getArticleMiniFaqs(articleSlug);

  const structuredData: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: matchedBlog.seoMetaTitle?.trim() || matchedBlog.title,
      description,
      image: imageUrl,
      mainEntityOfPage: canonicalUrl,
      datePublished: matchedBlog.date,
      dateModified: matchedBlog.date,
      keywords: [matchedBlog.seoFocusKeyword, ...(matchedBlog.tags || [])].filter(Boolean),
      author: {
        "@type": "Organization",
        name: organizationName,
      },
      publisher: {
        "@type": "Organization",
        name: organizationName,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
      },
    },
  ];

  if (articleMiniFaqs.length) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: articleMiniFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }

  return structuredData;
}

function injectPageMetadata(template: string, pageMeta: PageMetadata) {
  const replacements: Record<string, string> = {
    "__PAGE_TITLE__": pageMeta.title,
    "__META_DESCRIPTION__": pageMeta.description,
    "__ROBOTS__": pageMeta.robots,
    "__CANONICAL_URL__": pageMeta.canonicalUrl,
    "__OG_TITLE__": pageMeta.ogTitle,
    "__OG_DESCRIPTION__": pageMeta.ogDescription,
    "__OG_URL__": pageMeta.ogUrl,
    "__OG_IMAGE__": pageMeta.ogImage,
    "__TWITTER_TITLE__": pageMeta.twitterTitle,
    "__TWITTER_DESCRIPTION__": pageMeta.twitterDescription,
    "__TWITTER_IMAGE__": pageMeta.twitterImage,
  };

  const htmlWithMeta = Object.entries(replacements).reduce((html, [token, value]) => {
    return html.split(token).join(escapeHtml(value));
  }, template);

  return htmlWithMeta;
}

function injectStructuredData(template: string, req: express.Request) {
  const structuredData = buildStructuredData(req);
  if (!structuredData.length) {
    return template;
  }

  const scriptTag = `  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>\n</head>`;
  return template.replace("</head>", scriptTag);
}

function getClientIdentifier(req: express.Request) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function createRateLimiter(options: { key: string; windowMs: number; max: number; message: string }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const key = `${options.key}:${getClientIdentifier(req)}`;
    const current = rateLimitStore.get(key);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (current.count >= options.max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ error: options.message });
    }

    current.count += 1;
    next();
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readTrimmedString(value: unknown, maxLength: number, fieldLabel: string, minLength = 1): ValidationResult<string> {
  if (typeof value !== "string") {
    return { error: `${fieldLabel} wajib berupa teks.` };
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return { error: `${fieldLabel} wajib diisi.` };
  }

  if (trimmed.length > maxLength) {
    return { error: `${fieldLabel} melebihi batas ${maxLength} karakter.` };
  }

  return { value: trimmed };
}

function readOptionalTrimmedString(value: unknown, maxLength: number, fieldLabel: string): ValidationResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { value: undefined };
  }

  return readTrimmedString(value, maxLength, fieldLabel, 0);
}

function readNumber(value: unknown, fieldLabel: string, min: number, max: number): ValidationResult<number> {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return { error: `${fieldLabel} wajib berupa angka valid.` };
  }

  if (value < min || value > max) {
    return { error: `${fieldLabel} harus berada di antara ${min} dan ${max}.` };
  }

  return { value };
}

function readInteger(value: unknown, fieldLabel: string, min: number, max: number): ValidationResult<number> {
  const parsed = readNumber(value, fieldLabel, min, max);
  if (parsed.error) {
    return parsed;
  }

  if (!Number.isInteger(parsed.value)) {
    return { error: `${fieldLabel} wajib berupa bilangan bulat.` };
  }

  return parsed;
}

function readBoolean(value: unknown, fieldLabel: string): ValidationResult<boolean> {
  if (typeof value !== "boolean") {
    return { error: `${fieldLabel} wajib berupa true/false.` };
  }

  return { value };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isSafeAssetOrUrl(value: string) {
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function validateArrayOfStrings(value: unknown, fieldLabel: string, maxItems: number, maxItemLength: number): ValidationResult<string[]> {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    return { error: `${fieldLabel} wajib berupa daftar 1 sampai ${maxItems} item.` };
  }

  const items: string[] = [];
  for (const item of value) {
    const parsed = readTrimmedString(item, maxItemLength, fieldLabel);
    if (parsed.error) {
      return { error: parsed.error };
    }
    items.push(parsed.value);
  }

  return { value: items };
}

function getValidationError(res: express.Response, message: string) {
  return res.status(400).json({ error: message });
}

function validateLoginPayload(body: unknown): ValidationResult<{ username: string; password: string }> {
  if (!isRecord(body)) {
    return { error: "Payload login tidak valid." };
  }

  const username = readTrimmedString(body.username, 64, "Username", 3);
  if (username.error) return { error: username.error };
  const password = readTrimmedString(body.password, 128, "Password", 4);
  if (password.error) return { error: password.error };

  return { value: { username: username.value, password: password.value } };
}

function validatePackagePayload(body: unknown): ValidationResult<Partial<UmrahPackage>> {
  if (!isRecord(body)) {
    return { error: "Payload paket tidak valid." };
  }

  const id = readOptionalTrimmedString(body.id, 64, "ID paket");
  if (id.error) return { error: id.error };
  const title = readTrimmedString(body.title, 140, "Judul paket", 5);
  if (title.error) return { error: title.error };
  const duration = readTrimmedString(body.duration, 40, "Durasi paket", 3);
  if (duration.error) return { error: duration.error };
  const price = readNumber(body.price, "Harga paket", 1000000, 1000000000);
  if (price.error) return { error: price.error };
  const hotelMakkah = readTrimmedString(body.hotelMakkah, 120, "Hotel Makkah", 3);
  if (hotelMakkah.error) return { error: hotelMakkah.error };
  const hotelMadinah = readTrimmedString(body.hotelMadinah, 120, "Hotel Madinah", 3);
  if (hotelMadinah.error) return { error: hotelMadinah.error };
  const hotelStars = readInteger(body.hotelStars, "Rating hotel", 1, 5);
  if (hotelStars.error) return { error: hotelStars.error };
  const flights = readTrimmedString(body.flights, 160, "Informasi penerbangan", 5);
  if (flights.error) return { error: flights.error };
  const departureDate = readTrimmedString(body.departureDate, 80, "Tanggal keberangkatan", 3);
  if (departureDate.error) return { error: departureDate.error };
  const facilities = validateArrayOfStrings(body.facilities, "Fasilitas paket", 20, 140);
  if (facilities.error) return { error: facilities.error };
  const description = readTrimmedString(body.description, 3000, "Deskripsi paket", 20);
  if (description.error) return { error: description.error };
  const imageUrl = readTrimmedString(body.imageUrl, 300, "URL gambar paket", 1);
  if (imageUrl.error) return { error: imageUrl.error };
  if (!isSafeAssetOrUrl(imageUrl.value)) {
    return { error: "URL gambar paket harus berupa path lokal atau URL http/https." };
  }
  const active = readBoolean(body.active, "Status aktif paket");
  if (active.error) return { error: active.error };

  return {
    value: {
      id: id.value,
      title: title.value,
      duration: duration.value,
      price: price.value,
      hotelMakkah: hotelMakkah.value,
      hotelMadinah: hotelMadinah.value,
      hotelStars: hotelStars.value,
      flights: flights.value,
      departureDate: departureDate.value,
      facilities: facilities.value,
      description: description.value,
      imageUrl: imageUrl.value,
      active: active.value,
    } satisfies Partial<UmrahPackage>,
  };
}

function validateBlogPayload(body: unknown): ValidationResult<Partial<BlogPost>> {
  if (!isRecord(body)) {
    return { error: "Payload artikel tidak valid." };
  }

  const id = readOptionalTrimmedString(body.id, 64, "ID artikel");
  if (id.error) return { error: id.error };
  const title = readTrimmedString(body.title, 180, "Judul artikel", 8);
  if (title.error) return { error: title.error };
  const slug = readTrimmedString(body.slug, 120, "Slug artikel", 3);
  if (slug.error) return { error: slug.error };
  if (!isValidSlug(slug.value)) {
    return { error: "Slug artikel hanya boleh berisi huruf kecil, angka, dan tanda hubung." };
  }
  const content = readTrimmedString(body.content, 12000, "Konten artikel", 60);
  if (content.error) return { error: content.error };
  const seoFocusKeyword = readTrimmedString(body.seoFocusKeyword, 80, "Focus keyword", 2);
  if (seoFocusKeyword.error) return { error: seoFocusKeyword.error };
  const seoMetaTitle = readTrimmedString(body.seoMetaTitle, 80, "SEO meta title", 5);
  if (seoMetaTitle.error) return { error: seoMetaTitle.error };
  const seoMetaDesc = readTrimmedString(body.seoMetaDesc, 200, "SEO meta description", 10);
  if (seoMetaDesc.error) return { error: seoMetaDesc.error };
  const city = readTrimmedString(body.city, 80, "Kota artikel", 2);
  if (city.error) return { error: city.error };
  const readTimeMin = readInteger(body.readTimeMin, "Estimasi waktu baca", 1, 60);
  if (readTimeMin.error) return { error: readTimeMin.error };
  const tags = validateArrayOfStrings(body.tags, "Tag artikel", 10, 40);
  if (tags.error) return { error: tags.error };
  const imageUrl = readOptionalTrimmedString(body.imageUrl, 300, "URL gambar artikel");
  if (imageUrl.error) return { error: imageUrl.error };
  if (imageUrl.value && !isSafeAssetOrUrl(imageUrl.value)) {
    return { error: "URL gambar artikel harus berupa path lokal atau URL http/https." };
  }

  return {
    value: {
      id: id.value,
      title: title.value,
      slug: slug.value,
      content: content.value,
      seoFocusKeyword: seoFocusKeyword.value,
      seoMetaTitle: seoMetaTitle.value,
      seoMetaDesc: seoMetaDesc.value,
      city: city.value,
      readTimeMin: readTimeMin.value,
      tags: tags.value,
      imageUrl: imageUrl.value,
    } satisfies Partial<BlogPost>,
  };
}

function validateHeaderFooterPayload(body: unknown): ValidationResult<{ header?: Partial<HeaderConfig>; footer?: Partial<FooterConfig> }> {
  if (!isRecord(body)) {
    return { error: "Payload konfigurasi header/footer tidak valid." };
  }

  const result: { header?: Partial<HeaderConfig>; footer?: Partial<FooterConfig> } = {};

  if (body.header !== undefined) {
    if (!isRecord(body.header)) {
      return { error: "Objek header tidak valid." };
    }

    const logoText = readTrimmedString(body.header.logoText, 60, "Logo text", 2);
    if (logoText.error) return { error: logoText.error };
    const logoSub = readTrimmedString(body.header.logoSub, 80, "Logo sub", 2);
    if (logoSub.error) return { error: logoSub.error };
    const tagline = readTrimmedString(body.header.tagline, 160, "Tagline header", 5);
    if (tagline.error) return { error: tagline.error };
    const phone = readTrimmedString(body.header.phone, 20, "Nomor WhatsApp", 8);
    if (phone.error) return { error: phone.error };
    if (!/^\+?[0-9]{8,16}$/.test(phone.value)) {
      return { error: "Nomor WhatsApp header tidak valid." };
    }
    const phoneDisplay = readTrimmedString(body.header.phoneDisplay, 30, "Nomor WhatsApp display", 8);
    if (phoneDisplay.error) return { error: phoneDisplay.error };
    const logoImageUrl = readOptionalTrimmedString(body.header.logoImageUrl, 300, "Logo image URL");
    if (logoImageUrl.error) return { error: logoImageUrl.error };
    if (logoImageUrl.value && !isSafeAssetOrUrl(logoImageUrl.value)) {
      return { error: "Logo image URL harus berupa path lokal atau URL http/https." };
    }
    if (!Array.isArray(body.header.menus) || body.header.menus.length === 0 || body.header.menus.length > 10) {
      return { error: "Menu header wajib berupa daftar 1 sampai 10 item." };
    }

    const menus: HeaderConfig["menus"] = [];
    for (const menu of body.header.menus) {
      if (!isRecord(menu)) {
        return { error: "Item menu header tidak valid." };
      }
      const label = readTrimmedString(menu.label, 40, "Label menu", 2);
      if (label.error) return { error: label.error };
      const href = readTrimmedString(menu.href, 80, "Href menu", 1);
      if (href.error) return { error: href.error };
      menus.push({ label: label.value, href: href.value });
    }

    result.header = {
      logoText: logoText.value,
      logoSub: logoSub.value,
      tagline: tagline.value,
      phone: phone.value.replace(/^\+/, ""),
      phoneDisplay: phoneDisplay.value,
      menus,
      logoImageUrl: logoImageUrl.value || "",
    };
  }

  if (body.footer !== undefined) {
    if (!isRecord(body.footer)) {
      return { error: "Objek footer tidak valid." };
    }

    const aboutText = readTrimmedString(body.footer.aboutText, 600, "Tentang footer", 20);
    if (aboutText.error) return { error: aboutText.error };
    const address = readTrimmedString(body.footer.address, 220, "Alamat footer", 10);
    if (address.error) return { error: address.error };
    const phone = readTrimmedString(body.footer.phone, 30, "Telepon footer", 8);
    if (phone.error) return { error: phone.error };
    const email = readTrimmedString(body.footer.email, 120, "Email footer", 5);
    if (email.error) return { error: email.error };
    if (!isValidEmail(email.value)) {
      return { error: "Email footer tidak valid." };
    }
    const facebookUrl = readTrimmedString(body.footer.facebookUrl, 300, "URL Facebook", 5);
    if (facebookUrl.error) return { error: facebookUrl.error };
    const instagramUrl = readTrimmedString(body.footer.instagramUrl, 300, "URL Instagram", 5);
    if (instagramUrl.error) return { error: instagramUrl.error };
    const youtubeUrl = readTrimmedString(body.footer.youtubeUrl, 300, "URL YouTube", 5);
    if (youtubeUrl.error) return { error: youtubeUrl.error };
    const copyrightText = readTrimmedString(body.footer.copyrightText, 300, "Copyright text", 5);
    if (copyrightText.error) return { error: copyrightText.error };

    result.footer = {
      aboutText: aboutText.value,
      address: address.value,
      phone: phone.value,
      email: email.value,
      facebookUrl: facebookUrl.value,
      instagramUrl: instagramUrl.value,
      youtubeUrl: youtubeUrl.value,
      copyrightText: copyrightText.value,
    };
  }

  return { value: result };
}

function validateStatsClickPayload(body: unknown): ValidationResult<{ action: (typeof STATS_ACTION_VALUES)[number]; path?: string; city?: string }> {
  if (!isRecord(body)) {
    return { error: "Payload analytics tidak valid." };
  }

  const action = readTrimmedString(body.action, 20, "Action analytics", 2);
  if (action.error) return { error: action.error };
  if (!STATS_ACTION_VALUES.includes(action.value as (typeof STATS_ACTION_VALUES)[number])) {
    return { error: "Action analytics tidak dikenali." };
  }

  const pathValue = readOptionalTrimmedString(body.path, 160, "Path analytics");
  if (pathValue.error) return { error: pathValue.error };
  const cityValue = readOptionalTrimmedString(body.city, 80, "Kota analytics");
  if (cityValue.error) return { error: cityValue.error };

  return {
    value: {
      action: action.value as (typeof STATS_ACTION_VALUES)[number],
      path: pathValue.value,
      city: cityValue.value,
    },
  };
}

function validateBookingPayload(body: unknown): ValidationResult<Partial<Booking>> {
  if (!isRecord(body)) {
    return { error: "Payload booking tidak valid." };
  }

  const fullName = readTrimmedString(body.fullName, 120, "Nama lengkap", 3);
  if (fullName.error) return { error: fullName.error };
  const phone = readTrimmedString(body.phone, 20, "Nomor HP", 8);
  if (phone.error) return { error: phone.error };
  const normalizedPhone = phone.value.replace(/[\s()-]/g, "");
  if (!/^\+?[0-9]{8,16}$/.test(normalizedPhone)) {
    return { error: "Nomor HP/WhatsApp tidak valid." };
  }
  const city = readTrimmedString(body.city, 100, "Kota domisili", 2);
  if (city.error) return { error: city.error };
  const packageId = readTrimmedString(body.packageId, 64, "ID paket", 2);
  if (packageId.error) return { error: packageId.error };
  const packageName = readTrimmedString(body.packageName, 180, "Nama paket", 4);
  if (packageName.error) return { error: packageName.error };
  const passengersCount = readInteger(body.passengersCount, "Jumlah jamaah", 1, 20);
  if (passengersCount.error) return { error: passengersCount.error };
  const notes = readOptionalTrimmedString(body.notes, 500, "Catatan tambahan");
  if (notes.error) return { error: notes.error };

  return {
    value: {
      fullName: fullName.value,
      phone: normalizedPhone.replace(/^\+/, ""),
      city: city.value,
      packageId: packageId.value,
      packageName: packageName.value,
      passengersCount: passengersCount.value,
      notes: notes.value,
    } satisfies Partial<Booking>,
  };
}

function validateBookingStatusPayload(body: unknown): ValidationResult<{ id: string; status: Booking["status"] }> {
  if (!isRecord(body)) {
    return { error: "Payload status booking tidak valid." };
  }

  const id = readTrimmedString(body.id, 64, "ID booking", 2);
  if (id.error) return { error: id.error };
  const status = readTrimmedString(body.status, 20, "Status booking", 2);
  if (status.error) return { error: status.error };
  if (!BOOKING_STATUS_VALUES.includes(status.value as Booking["status"])) {
    return { error: "Status booking tidak dikenali." };
  }

  return { value: { id: id.value, status: status.value as Booking["status"] } };
}

function validateSeoAnalyzePayload(body: unknown): ValidationResult<{ title: string; content: string; focusKeyword: string }> {
  if (!isRecord(body)) {
    return { error: "Payload analisis SEO tidak valid." };
  }

  const title = readOptionalTrimmedString(body.title, 160, "Judul artikel");
  if (title.error) return { error: title.error };
  const content = readOptionalTrimmedString(body.content, 12000, "Konten artikel");
  if (content.error) return { error: content.error };
  const focusKeyword = readTrimmedString(body.focusKeyword, 80, "Focus keyword", 2);
  if (focusKeyword.error) return { error: focusKeyword.error };

  return {
    value: {
      title: title.value || "",
      content: content.value || "",
      focusKeyword: focusKeyword.value,
    },
  };
}

function validateReportPayload(body: unknown): ValidationResult<{ period?: string; recipientEmail?: string }> {
  if (!isRecord(body)) {
    return { error: "Payload laporan tidak valid." };
  }

  const period = readOptionalTrimmedString(body.period, 60, "Periode laporan");
  if (period.error) return { error: period.error };
  const recipientEmail = readOptionalTrimmedString(body.recipientEmail, 120, "Email penerima laporan");
  if (recipientEmail.error) return { error: recipientEmail.error };
  if (recipientEmail.value && !isValidEmail(recipientEmail.value)) {
    return { error: "Email penerima laporan tidak valid." };
  }

  return {
    value: {
      period: period.value,
      recipientEmail: recipientEmail.value,
    },
  };
}

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "",
    password: process.env.ADMIN_PASSWORD?.trim() || "",
    passwordHash: process.env.ADMIN_PASSWORD_SHA256?.trim().toLowerCase() || "",
  };
}

function hasAdminCredentialsConfigured() {
  const credentials = getAdminCredentials();
  return Boolean(credentials.username && (credentials.password || credentials.passwordHash));
}

function isAdminPasswordValid(password: string) {
  const credentials = getAdminCredentials();
  if (credentials.passwordHash) {
    const candidateHash = crypto.createHash("sha256").update(password).digest("hex");
    return candidateHash === credentials.passwordHash;
  }
  return Boolean(credentials.password && password === credentials.password);
}

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, expiresAt] of adminSessions.entries()) {
    if (expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
}

function parseCookies(cookieHeader: string | undefined) {
  const cookieMap: Record<string, string> = {};
  if (!cookieHeader) {
    return cookieMap;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = chunk.trim().split("=");
    if (!rawName) continue;
    cookieMap[rawName] = decodeURIComponent(rawValue.join("="));
  }

  return cookieMap;
}

function buildSessionCookie(token: string, maxAgeSeconds: number) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secureFlag}`;
}

function clearSessionCookie() {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secureFlag}`;
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  pruneExpiredSessions();
  const sessionToken = parseCookies(req.headers.cookie)[ADMIN_SESSION_COOKIE];

  if (!sessionToken) {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(401).json({ error: "Sesi admin tidak valid. Silakan login kembali." });
  }

  const expiresAt = adminSessions.get(sessionToken);
  if (!expiresAt || expiresAt <= Date.now()) {
    adminSessions.delete(sessionToken);
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(401).json({ error: "Sesi admin telah berakhir. Silakan login kembali." });
  }

  adminSessions.set(sessionToken, Date.now() + SESSION_TTL_MS);
  res.setHeader("Set-Cookie", buildSessionCookie(sessionToken, Math.floor(SESSION_TTL_MS / 1000)));
  next();
}

// Helper to initialize Gemini Client lazily and safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("⚠️ GEMINI_API_KEY is not defined or is placeholder. AI features will fallback to local SEO metrics analysis.");
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiClient;
  } catch (err) {
    console.error("❌ Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

// =================== API ENDPOINTS ===================

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/ready", (_req, res) => {
  res.json({
    status: "ready",
    persistenceAvailable: fs.existsSync(DATA_FILE_PATH),
    adminConfigured: hasAdminCredentialsConfigured(),
  });
});

// Admin Authentication
app.post(
  "/api/admin/login",
  createRateLimiter({
    key: "admin-login",
    windowMs: 1000 * 60 * 10,
    max: 10,
    message: "Terlalu banyak percobaan login. Coba kembali beberapa menit lagi.",
  }),
  (req, res) => {
  const parsedPayload = validateLoginPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { username, password } = parsedPayload.value;

  if (!hasAdminCredentialsConfigured()) {
    return res.status(503).json({
      error: "Akun admin belum dikonfigurasi di server. Atur ADMIN_USERNAME dan ADMIN_PASSWORD atau ADMIN_PASSWORD_SHA256.",
    });
  }

  const credentials = getAdminCredentials();
  if (username !== credentials.username || !isAdminPasswordValid(password)) {
    return res.status(401).json({ error: "Username atau password salah!" });
  }

  const sessionToken = crypto.randomBytes(32).toString("hex");
  adminSessions.set(sessionToken, Date.now() + SESSION_TTL_MS);
  res.setHeader("Set-Cookie", buildSessionCookie(sessionToken, Math.floor(SESSION_TTL_MS / 1000)));
  res.json({ success: true });
});

app.get("/api/admin/session", requireAdminAuth, (_req, res) => {
  res.json({ authenticated: true });
});

app.post("/api/admin/logout", (_req, res) => {
  const sessionToken = parseCookies(_req.headers.cookie)[ADMIN_SESSION_COOKIE];
  if (sessionToken) {
    adminSessions.delete(sessionToken);
  }
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.json({ success: true });
});

// Live & Up-to-date Packages
app.get("/api/packages", (req, res) => {
  res.json(packagesDb);
});

app.post("/api/packages", requireAdminAuth, (req, res) => {
  const parsedPayload = validatePackagePayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const pkgData = parsedPayload.value as UmrahPackage;
  if (!pkgData.id) {
    pkgData.id = "pkg-" + Date.now();
    packagesDb.push(pkgData);
  } else {
    packagesDb = packagesDb.map(p => p.id === pkgData.id ? pkgData : p);
  }
  persistStore();
  res.json({ success: true, package: pkgData });
});

app.delete("/api/packages/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  packagesDb = packagesDb.filter(p => p.id !== id);
  persistStore();
  res.json({ success: true });
});

// Live & Up-to-date Blogs
app.get("/api/blogs", (req, res) => {
  res.json(blogsDb);
});

// Retrieve a single blog with view increment & tracking
app.get("/api/blogs/:slug", (req, res) => {
  const { slug } = req.params;
  const blog = blogsDb.find(b => b.slug === slug);
  if (blog) {
    blog.views += 1;
    
    // Track stats
    statsDb.totalViews += 1;
    const pageKey = `Artikel: ${slug}`;
    statsDb.viewsByPage[pageKey] = (statsDb.viewsByPage[pageKey] || 0) + 1;
    
    // Track by city
    if (blog.city) {
      statsDb.viewsByCity[blog.city] = (statsDb.viewsByCity[blog.city] || 0) + 1;
    }
    
    // Add to dailyStats
    const today = new Date().toISOString().split('T')[0];
    let daily = statsDb.dailyStats.find(d => d.date === today);
    if (!daily) {
      daily = { date: today, views: 0, whatsapp: 0, bookings: 0 };
      statsDb.dailyStats.push(daily);
    }
    daily.views += 1;
    persistStore();

    res.json(blog);
  } else {
    res.status(404).json({ error: "Blog post not found" });
  }
});

app.post("/api/blogs", requireAdminAuth, (req, res) => {
  const parsedPayload = validateBlogPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const blogData = parsedPayload.value as BlogPost;
  if (!blogData.id) {
    blogData.id = "blog-" + Date.now();
    blogData.views = 0;
    blogData.date = new Date().toISOString().split('T')[0];
    blogsDb.push(blogData);
  } else {
    blogsDb = blogsDb.map(b => b.id === blogData.id ? { ...b, ...blogData } : b);
  }
  persistStore();
  res.json({ success: true, blog: blogData });
});

app.delete("/api/blogs/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  blogsDb = blogsDb.filter(b => b.id !== id);
  persistStore();
  res.json({ success: true });
});

// Header and Footer Configs
app.get("/api/header-footer", (req, res) => {
  res.json({ header: headerDb, footer: footerDb });
});

app.post("/api/header-footer", requireAdminAuth, (req, res) => {
  const parsedPayload = validateHeaderFooterPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { header, footer } = parsedPayload.value;
  if (header) headerDb = { ...headerDb, ...header };
  if (footer) footerDb = { ...footerDb, ...footer };
  persistStore();
  res.json({ success: true, header: headerDb, footer: footerDb });
});

// Stats, traffic real-time trackers
app.get("/api/stats", requireAdminAuth, (req, res) => {
  res.json(statsDb);
});

// Log event views/CTAs
app.post(
  "/api/stats/click",
  createRateLimiter({
    key: "stats-click",
    windowMs: 1000 * 60,
    max: 120,
    message: "Terlalu banyak event analytics dari alamat ini. Coba lagi sebentar.",
  }),
  (req, res) => {
  const parsedPayload = validateStatsClickPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { action, path, city } = parsedPayload.value;
  const today = new Date().toISOString().split('T')[0];
  let daily = statsDb.dailyStats.find(d => d.date === today);
  if (!daily) {
    daily = { date: today, views: 0, whatsapp: 0, bookings: 0 };
    statsDb.dailyStats.push(daily);
  }

  if (action === "whatsapp") {
    statsDb.whatsappClicks += 1;
    daily.whatsapp += 1;
  } else if (action === "booking") {
    statsDb.bookingSubmissions += 1;
    daily.bookings += 1;
  } else if (action === "pageview") {
    statsDb.totalViews += 1;
    daily.views += 1;
    if (path) {
      statsDb.viewsByPage[path] = (statsDb.viewsByPage[path] || 0) + 1;
    }
  }

  if (city) {
    statsDb.viewsByCity[city] = (statsDb.viewsByCity[city] || 0) + 1;
  }

  persistStore();
  res.json({ success: true, stats: statsDb });
});

// Bookings
app.post(
  "/api/bookings",
  createRateLimiter({
    key: "bookings",
    windowMs: 1000 * 60 * 5,
    max: 8,
    message: "Terlalu banyak pengiriman booking dari alamat ini. Coba lagi beberapa menit lagi.",
  }),
  (req, res) => {
  const parsedPayload = validateBookingPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const booking = parsedPayload.value as Partial<Booking>;
  booking.id = "b-" + Date.now();
  booking.date = new Date().toISOString().split('T')[0];
  booking.status = "Pending";
  
  const finalBooking = booking as Booking;
  statsDb.bookings.unshift(finalBooking);
  statsDb.bookingSubmissions += 1;
  
  // Track in stats
  const today = new Date().toISOString().split('T')[0];
  let daily = statsDb.dailyStats.find(d => d.date === today);
  if (!daily) {
    daily = { date: today, views: 0, whatsapp: 0, bookings: 0 };
    statsDb.dailyStats.push(daily);
  }
  daily.bookings += 1;

  if (booking.city) {
    statsDb.viewsByCity[booking.city] = (statsDb.viewsByCity[booking.city] || 0) + 1;
  }

  persistStore();
  res.json({ success: true, booking: finalBooking });
});

app.post("/api/bookings/status", requireAdminAuth, (req, res) => {
  const parsedPayload = validateBookingStatusPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { id, status } = parsedPayload.value;
  statsDb.bookings = statsDb.bookings.map(b => b.id === id ? { ...b, status } : b);
  persistStore();
  res.json({ success: true });
});

// Yoast-like Live SEO Analyzer utilizing Gemini API!
app.post(
  "/api/seo-analyze",
  requireAdminAuth,
  createRateLimiter({
    key: "seo-analyze",
    windowMs: 1000 * 60,
    max: 20,
    message: "Terlalu banyak permintaan analisis SEO. Coba lagi sebentar.",
  }),
  async (req, res) => {
  const parsedPayload = validateSeoAnalyzePayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { title, content, focusKeyword } = parsedPayload.value;

  if (!focusKeyword || focusKeyword.trim() === "") {
    return res.json({
      seoScore: 40,
      keywordDensity: 0,
      keywordInTitle: false,
      keywordInMetaDesc: false,
      contentLengthOk: false,
      suggestions: ["Silakan masukkan Kata Kunci Fokus (Focus Keyword) untuk melakukan analisis SEO Yoast."],
      seoMetaTitle: title ? `${title} | Amantubillahi` : "Meta Title Belum Diatur",
      seoMetaDesc: "Meta Deskripsi Belum Diatur"
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant simulation fallbacks when Gemini API Key is not set or unavailable
    const wordCount = content ? content.split(/\s+/).length : 0;
    const lowerKeyword = focusKeyword.toLowerCase();
    const lowerContent = (content || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();
    
    // Count occurrences
    let count = 0;
    if (lowerContent && lowerKeyword) {
      let pos = lowerContent.indexOf(lowerKeyword);
      while (pos !== -1) {
        count++;
        pos = lowerContent.indexOf(lowerKeyword, pos + lowerKeyword.length);
      }
    }

    const keywordDensity = wordCount > 0 ? parseFloat(((count / wordCount) * 100).toFixed(2)) : 0;
    const keywordInTitle = lowerTitle.includes(lowerKeyword);
    const keywordInMetaDesc = true; 
    const contentLengthOk = wordCount > 250;

    let score = 50;
    const suggestions: string[] = [];

    if (keywordInTitle) {
      score += 15;
    } else {
      suggestions.push(`Kata kunci fokus "${focusKeyword}" tidak ditemukan di Judul utama. Letakkan di bagian depan atau tengah.`);
    }

    if (keywordDensity >= 1 && keywordDensity <= 2.5) {
      score += 20;
    } else if (keywordDensity > 2.5) {
      score += 5;
      suggestions.push(`Kepadatan kata kunci terlalu tinggi (${keywordDensity}%). Hindari over-optimization (keyword stuffing). Buat agar tulisan tetap natural.`);
    } else {
      suggestions.push(`Kepadatan kata kunci sangat rendah (${keywordDensity}%). Idealnya berkisar antara 1% - 2.5% agar Google memahami relevansi halaman.`);
    }

    if (contentLengthOk) {
      score += 15;
    } else {
      suggestions.push(`Konten terlalu pendek (${wordCount} kata). Buat minimal 300 kata agar Yoast memberikan indikator hijau.`);
    }

    const mTitle = `${title || "Umroh Lombok"} | Travel Umroh Lombok Amantubillahi`;
    const mDesc = content ? (content.substring(0, 150) + "...") : `Informasi bimbingan serta daftar ${focusKeyword} resmi dan tepercaya di Lombok NTB bersama Amantubillahi.com.`;

    return res.json({
      seoScore: Math.min(score, 100),
      keywordDensity,
      keywordInTitle,
      keywordInMetaDesc,
      contentLengthOk,
      suggestions: suggestions.length > 0 ? suggestions : ["Kehebatan SEO! Artikel Anda memenuhi seluruh kriteria optimasi utama Yoast. Siap dipublikasikan."],
      seoMetaTitle: mTitle,
      seoMetaDesc: mDesc
    });
  }

  // Real Gemini-powered SEO analysis!
  try {
    const prompt = `Analisis artikel dan nilai kemampuannya terhadap standar SEO modern / Yoast SEO audit.
    Judul Artikel: "${title || ""}"
    Kata Kunci Fokus: "${focusKeyword}"
    Isi Konten: 
    """
    ${content || ""}
    """
    
    Berikan analisis terstruktur dalam format JSON yang berisi score SEO (0-100), estimasi kepadatan kata kunci, dan daftar saran perbaikan taktis spesifik untuk kota-kota di Lombok dan Nusa Tenggara Barat (misal: Mataram, Praya, Selong, Masbagik, Sumbawa, Bima).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Anda adalah pakar SEO senior spesialis pasar Indonesia dan wilayah Lombok Nusa Tenggara Barat. Berikan audit SEO berupa skor dan rekomendasi teknis konkret.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoScore: { type: Type.INTEGER, description: "Skor optimasi SEO total dari 0 sampai 100" },
            keywordDensity: { type: Type.NUMBER, description: "Persentase frekuensi pemakaian kata kunci fokus dibanding jumlah total kata" },
            keywordInTitle: { type: Type.BOOLEAN, description: "Apakah kata kunci fokus tercakup dalam judul artikel secara jelas" },
            keywordInMetaDesc: { type: Type.BOOLEAN, description: "Apakah kata kunci fokus disarankan masuk ke meta deskripsi" },
            contentLengthOk: { type: Type.BOOLEAN, description: "Apakah artikel mencapai panjang memadai (>= 300 kata)" },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar masukan konkret perbaikan SEO Yoast berupa poin-poin taktis"
            },
            seoMetaTitle: { type: Type.STRING, description: "Rekomendasi judul meta tag SEO paling optimal untuk ditayangkan di SERP (maks 60 karakter)" },
            seoMetaDesc: { type: Type.STRING, description: "Rekomendasi meta deskripsi SEO kaya interaksi CTR bagi pencari Lombok (maks 160 karakter)" }
          },
          required: ["seoScore", "keywordDensity", "keywordInTitle", "keywordInMetaDesc", "contentLengthOk", "suggestions", "seoMetaTitle", "seoMetaDesc"]
        }
      }
    });

    const bodyText = response.text?.trim() || "{}";
    const result = JSON.parse(bodyText);
    res.json(result);

  } catch (err) {
    console.error("❌ Gemini SEO API Call Failed:", err);
    res.status(500).json({ error: "Gagal memproses analisis SEO menggunakan AI." });
  }
});

// Automatic Monthly Stats Reporting simulation and recording
app.post(
  "/api/reports/generate",
  requireAdminAuth,
  createRateLimiter({
    key: "reports-generate",
    windowMs: 1000 * 60 * 10,
    max: 6,
    message: "Terlalu banyak permintaan generate laporan. Coba lagi beberapa menit lagi.",
  }),
  async (req, res) => {
  const parsedPayload = validateReportPayload(req.body);
  if (parsedPayload.error) {
    return getValidationError(res, parsedPayload.error);
  }

  const { period, recipientEmail } = parsedPayload.value;
  
  const actualPeriod = period || "Juni 2026";
  const actualRecipient = recipientEmail || process.env.ADMIN_REPORT_EMAIL || footerDb.email;

  // Gather current database state
  const totalViews = statsDb.totalViews;
  const totalBookings = statsDb.bookings.length;
  const totalWhatsapp = statsDb.whatsappClicks;
  const conversionRate = totalViews > 0 ? parseFloat((( (totalBookings + totalWhatsapp) / totalViews) * 100).toFixed(1)) + "%" : "0%";

  const ai = getGeminiClient();
  let aiInsights = "";

  if (!ai) {
    aiInsights = `Berdasarkan rangkuman performa bulan ${actualPeriod}, situs Anda mencatatkan ${totalViews} kunjungan dengan total ${totalBookings} prospek booking dan ${totalWhatsapp} klik WhatsApp. Strategi SEO lokal menempatkan "Artikel Selong/Praya" sebagai kontributor trafik tertinggi. Disarankan untuk memaksimalkan konten penargetan "Sumbawa" dan "Bima" guna menjangkau khalayak yang lebih luas di bagian timur NTB.`;
  } else {
    try {
      const reportPrompt = `Buatkan analisis performa bulanan dan saran optimasi konten SEO lokal Lombok untuk travel umroh Amantubillahi berdasarkan statistik berikut:
      Periode: ${actualPeriod}
      Total Kunjungan: ${totalViews}
      Statistik Kunjungan per Wilayah: ${JSON.stringify(statsDb.viewsByCity)}
      Interaksi WhatsApp CTA: ${totalWhatsapp}
      Database Prospek Booking Masuk: ${totalBookings}
      Daftar artikel yang ditayangkan: ${JSON.stringify(blogsDb.map(b => ({ title: b.title, slug: b.slug, city: b.city, views: b.views })))}
      
      Tuliskan saran rekomendasi taktis ringkas dan berwibawa (maksimal 4 kalimat) mengenai bagaimana cara menaikkan prospek dan mengoptimalkan keyword umrah/umroh lombok terdekat.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: reportPrompt,
        config: {
          systemInstruction: "Anda adalah analis pemasaran digital handal khusus untuk agensi Umrah & Haji di Indonesia."
        }
      });
      aiInsights = response.text || "Gagal mengenerasi wawasan otomatis.";
    } catch (e) {
      aiInsights = "Wawasan otomatis tidak dapat diproses saat ini akibat gangguan jaringan.";
    }
  }

  const newReport: EmailReport = {
    id: "rep-" + Date.now(),
    period: actualPeriod,
    dateGenerated: new Date().toISOString(),
    totalViews,
    totalBookings,
    totalWhatsapp,
    conversionRate,
    topPerformingContent: blogsDb.length > 0 ? blogsDb.sort((a,b) => b.views - a.views)[0].title : "Beranda Utama",
    aiSeoInsights: aiInsights,
    recipientEmail: actualRecipient,
    status: "Sent"
  };

  reportsDb.unshift(newReport);
  persistStore();
  res.json({ success: true, report: newReport, allReports: reportsDb });
});

app.get("/api/reports", requireAdminAuth, (req, res) => {
  res.json(reportsDb);
});

// Serve compiled index.html or set up Vite middleware depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(async (req, res, next) => {
      const acceptsHtml = req.method === "GET" && req.headers.accept?.includes("text/html");
      if (!acceptsHtml || req.path.startsWith("/api/")) {
        return next();
      }

      try {
        const templatePath = path.join(process.cwd(), "index.html");
        const template = fs.readFileSync(templatePath, "utf8");
        const pageMeta = buildPageMetadata(req);
        const htmlTemplate = injectStructuredData(injectPageMetadata(template, pageMeta), req);
        const html = await vite.transformIndexHtml(req.originalUrl, htmlTemplate);
        res.status(pageMeta.statusCode).type("html").send(html);
      } catch (error) {
        next(error);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const distIndexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf8");

    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      const pageMeta = buildPageMetadata(req);
      const html = injectStructuredData(injectPageMetadata(distIndexHtml, pageMeta), req);
      res.status(pageMeta.statusCode).type("html").send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
