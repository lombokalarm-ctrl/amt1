import React, { useEffect, useRef, useState } from "react";
import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, Booking } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Packages from "./components/Packages";
import FAQ from "./components/FAQ";
import Articles, { onScrollToSection } from "./components/Articles";
import ArticlePage from "./components/ArticlePage";
import BookingForm from "./components/BookingForm";
import Footer from "./components/Footer";
import AdminCMS from "./components/AdminCMS";
import { 
  Landmark, ShieldCheck, HeartHandshake, MapPin, 
  Settings, Compass, FileSpreadsheet, Sparkles, MessageSquare 
} from "lucide-react";

import { 
  initialPackages, 
  initialBlogs, 
  initialHeader, 
  initialFooter,
  initialStats,
  initialReports
} from "./seed";

function getHashRoute() {
  if (typeof window === "undefined" || !window.location.hash) {
    return "#";
  }

  return window.location.hash === "#admin" ? "#admin" : window.location.hash;
}

function isArticlePath() {
  if (typeof window === "undefined") {
    return false;
  }

  return /^\/artikel\/[^/]+\/?$/.test(window.location.pathname);
}

function isBlogPath() {
  if (typeof window === "undefined") {
    return false;
  }

  return /^\/blog\/?$/.test(window.location.pathname);
}

function getCurrentArticleSlug() {
  if (!isArticlePath()) {
    return null;
  }

  const match = window.location.pathname.match(/^\/artikel\/([^/]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function getInitialSection() {
  const initialRoute = getHashRoute();
  if (initialRoute === "#admin") {
    return "#";
  }

  return isArticlePath() || isBlogPath() ? "/blog" : initialRoute;
}

function replaceHash(hash: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (hash === "#") {
    window.history.replaceState(null, "", "/");
    return;
  }

  window.history.replaceState(null, "", `/${hash}`);
}

export default function App() {
  const currentArticleSlug = getCurrentArticleSlug();
  const isArticleRoute = Boolean(currentArticleSlug);
  const isBlogRoute = isBlogPath();

  // CMS Configuration States
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(initialHeader);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(initialFooter);
  
  // Data States
  const [packages, setPackages] = useState<UmrahPackage[]>(initialPackages);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);

  // Layout UI States
  const [activeSection, setActiveSection] = useState(() => getInitialSection());
  const [isCMSActive, setIsCMSActive] = useState(() => getHashRoute() === "#admin");
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<UmrahPackage | null>(null);
  const initialPageViewLogged = useRef(false);

  // Syncing with Backend Server on mount
  useEffect(() => {
    async function initFetch() {
      try {
        let nextBlogs = initialBlogs;

        const resHF = await fetch("/api/header-footer");
        if (resHF.ok) {
          const data = await resHF.json();
          setHeaderConfig(data.header);
          setFooterConfig(data.footer);
        }

        const resPkgs = await fetch("/api/packages");
        if (resPkgs.ok) {
          const data = await resPkgs.json();
          setPackages(data);
        }

        const resBlogs = await fetch("/api/blogs");
        if (resBlogs.ok) {
          const data = await resBlogs.json();
          nextBlogs = data;
          setBlogs(data);
        }

        // StrictMode menjalankan effect dua kali di development; guard ini menjaga analytics tetap idempoten.
        if (!initialPageViewLogged.current) {
          initialPageViewLogged.current = true;
          const currentSlug = getCurrentArticleSlug();
          const currentArticle = currentSlug ? nextBlogs.find((blog) => blog.slug === currentSlug) : null;
          await fetch("/api/stats/click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "pageview",
              path: currentArticle ? `Artikel: ${currentArticle.slug}` : "Beranda",
              city: currentArticle?.city,
            })
          });
        }

      } catch (err) {
        console.warn("Express APIs are booting or loading from offline local seeds...", err);
      }
    }
    initFetch();
  }, []);

  useEffect(() => {
    const syncRouteFromHash = () => {
      const nextRoute = getHashRoute();
      if (nextRoute === "#admin") {
        setIsCMSActive(true);
        return;
      }

      setIsCMSActive(false);
      setActiveSection(isArticlePath() || isBlogPath() ? "/blog" : nextRoute);
    };

    window.addEventListener("hashchange", syncRouteFromHash);
    return () => window.removeEventListener("hashchange", syncRouteFromHash);
  }, []);

  // Track CTA user behavior click events (WhatsApp, Bookings etc)
  const trackCtaInteraction = async (action: string, path: string, city?: string) => {
    try {
      await fetch("/api/stats/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, path, city })
      });
    } catch (e) {
      console.warn("Analytics tracker offline:", e);
    }
  };

  const navigateToSection = (href: string) => {
    if (href === "/blog") {
      if (window.location.pathname !== "/blog") {
        window.location.assign("/blog");
        return;
      }

      setActiveSection("/blog");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if ((isArticleRoute || isBlogRoute) && href.startsWith("#")) {
      window.location.assign(href === "#" ? "/" : `/${href}`);
      return;
    }

    replaceHash(href);
    setIsCMSActive(false);
    setActiveSection(href);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        onScrollToSection(href);
      });
    });
  };

  const openCMSPanel = () => {
    replaceHash("#admin");
    setIsCMSActive(true);
  };

  const closeCMSPanel = () => {
    replaceHash("#");
    setIsCMSActive(false);
    setActiveSection("#");
    onScrollToSection("#");
  };

  const handleWhatsappCtaRedirect = (packageName: string) => {
    trackCtaInteraction("whatsapp", `WhatsApp Inquiry: ${packageName}`);
    const encodedMsg = encodeURIComponent(`Assalamu'alaikum Amantubillahi Tour, saya ingin menanyakan lebih detail mengenai paket umroh Lombok: "${packageName}".`);
    window.open(`https://wa.me/${headerConfig.phone}?text=${encodedMsg}`, "_blank");
  };

  const handleOpenBookingForPackage = (pkg: UmrahPackage) => {
    setSelectedPackageForBooking(pkg);
    onScrollToSection("#booking");
  };

  const handleBookingCompleted = (newBooking: Booking) => {
    trackCtaInteraction("booking", `Booking Completed ID: ${newBooking.id}`, newBooking.city);
  };

  const handleCMSHeaderFooterUpdate = (header: HeaderConfig, footer: FooterConfig) => {
    setHeaderConfig(header);
    setFooterConfig(footer);
  };

  const handleCMSPackagesUpdate = (updatedPkgs: UmrahPackage[]) => {
    setPackages(updatedPkgs);
  };

  const handleCMSBlogsUpdate = (updatedBlogs: BlogPost[]) => {
    setBlogs(updatedBlogs);
  };

  return (
    <div className="bg-[#F8FAF8] min-h-screen text-gray-800 flex flex-col justify-between selection:bg-emerald-800 selection:text-white">
      
      {/* 1. Header Top */}
      <Header
        config={headerConfig}
        activeSection={activeSection}
        isCMSActive={isCMSActive}
        showCMSAccess={import.meta.env.DEV || isCMSActive}
        onNavigate={navigateToSection}
        onOpenCMS={openCMSPanel}
      />

      {/* Main Container switch between CMS vs Landing Page */}
      {isCMSActive ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full animate-fade-in">
          
          {/* Breadcrumb back */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 block">PANEL ADMINISTRATOR</span>
              <h1 className="text-3xl font-extrabold font-sans text-neutral-900 tracking-tight">Kustomisasi & Manajemen Data</h1>
            </div>
            
            <button
              onClick={closeCMSPanel}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              ← Kembali ke Beranda Landing Page
            </button>
          </div>

          <AdminCMS
            initialPackages={packages}
            initialBlogs={blogs}
            initialHeader={headerConfig}
            initialFooter={footerConfig}
            initialStats={initialStats}
            initialReports={initialReports}
            onUpdateHeaderFooter={handleCMSHeaderFooterUpdate}
            onUpdatePackages={handleCMSPackagesUpdate}
            onUpdateBlogs={handleCMSBlogsUpdate}
          />
        </main>
      ) : isArticleRoute && currentArticleSlug ? (
        <main className="flex-1">
          <ArticlePage slug={currentArticleSlug} articles={blogs} phone={headerConfig.phone} />
        </main>
      ) : isBlogRoute ? (
        <main className="flex-1">
          <Articles articles={blogs} mode="archive" />
        </main>
      ) : (
        <main className="flex-1">
          
          {/* 1. Hero trust booster */}
          <Hero 
            phone={headerConfig.phone} 
            onScrollToSection={(sec) => {
              setActiveSection(sec);
              onScrollToSection(sec);
            }} 
          />

          <section className="bg-white border-b border-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="max-w-4xl space-y-4">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Travel Umroh Lombok
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 italic">
                  Solusi Travel Umroh Lombok untuk Jamaah Mataram, Lombok Barat, Praya, Selong, Sumbawa, dan Bima
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-neutral-700">
                  Amantubillahi menghadirkan layanan travel umroh Lombok yang fokus pada legalitas, transparansi biaya, jadwal keberangkatan yang jelas, dan pendampingan ibadah sejak manasik hingga kepulangan. Halaman ini dirancang untuk membantu calon jamaah menemukan paket umroh Lombok terpercaya sekaligus informasi pendaftaran dari seluruh wilayah NTB.
                </p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                  <a
                    href="/artikel/travel-umroh-lombok-mataram-barat"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                  >
                    Baca Panduan Travel Umroh Lombok
                  </a>
                  <a
                    href="#paket"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToSection("#paket");
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
                  >
                    Cek Paket & Jadwal
                  </a>
                  <a
                    href="#booking"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToSection("#booking");
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-100"
                  >
                    Booking Konsultasi Jamaah
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Micro Trust Banners */}
          <section className="bg-emerald-950 py-8 border-y border-emerald-800 text-center text-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-emerald-800/60">
              <div className="flex items-center justify-center gap-3.5 pb-4 md:pb-0">
                <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-sm tracking-tight text-white uppercase sm:text-xs">Berizin Kemenag RI</span>
                  <p className="text-[11px] leading-tight text-emerald-200/60">Izin PPIU No. 08022200332870003 Amanah & Sah Mulia</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3.5 py-4 md:py-0">
                <HeartHandshake className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-sm tracking-tight text-white uppercase sm:text-xs">Bimbingan Sunnah</span>
                  <p className="text-[11px] leading-tight text-emerald-200/60">Pembimbing Ustadz Berkompeten & Profesional</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3.5 pt-4 md:pt-0">
                <Landmark className="w-8 h-8 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-sm tracking-tight text-white uppercase sm:text-xs">Transparan All-In</span>
                  <p className="text-[11px] leading-tight text-emerald-200/60">Tanpa Tambahan Biaya Gelap di Belakang</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Packages lists section */}
          <Packages 
            packages={packages} 
            onOpenBooking={handleOpenBookingForPackage}
            onWhatsappClick={handleWhatsappCtaRedirect}
          />

          {/* 4. Why us showcase */}
          <section className="bg-white py-20 border-y border-gray-100 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto pb-16 space-y-3">
                <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs block">Mengapa Memilih Amantubillahi Lombok?</span>
                <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight italic">Ketenangan Ibadah Adalah Komitmen Kami</h2>
                <div className="w-12 h-1 bg-emerald-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm leading-relaxed">
                <div className="p-8 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 space-y-3">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">1</div>
                  <h3 className="font-bold text-gray-900 text-base">Izin Resmi Terakreditasi</h3>
                  <p className="text-gray-600">Amantubillahi memiliki legalitas hukum resmi dari kementerian serta kemudahan verifikasi fisik secara terbuka pada kantor Mataram.</p>
                </div>

                <div className="p-8 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 space-y-3">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">2</div>
                  <h3 className="font-bold text-gray-900 text-base">Hotel Terdekat Strategis</h3>
                  <p className="text-gray-600">Akomodasi pilihan kami mengutamakan kenyamanan langkah fisik (<span className="font-semibold italic">Walking-Distance</span>) menuju Masjidil Haram dan Masjid Nabawi.</p>
                </div>

                <div className="p-8 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 space-y-3">
                  <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">3</div>
                  <h3 className="font-bold text-gray-900 text-base">Bimbingan Umroh Eksklusif</h3>
                  <p className="text-gray-600">Membekali jamaah melalui sesi manasik intensif berlandaskan rujukan dalil sharih yang mutawatir sesuai As-Sunnah.</p>
                </div>
              </div>

            </div>
          </section>

          {/* 5. Localized Articles list (Lombok city target search engine pages) */}
          <Articles 
            articles={blogs} 
            mode="homepage"
            onSelectArticle={(slug) => {
              // Navigation callbacks or custom slug logs
              trackCtaInteraction("pageview", `Artikel Baca: ${slug}`);
            }}
            onTrackClick={(action, path, city) => trackCtaInteraction(action, path, city)}
          />

          {/* 6. Online Booking Seat forms */}
          <BookingForm 
            packages={packages} 
            selectedPrePackage={selectedPackageForBooking}
            onBookingSuccess={handleBookingCompleted}
          />

          {/* 7. FAQ Block details */}
          <FAQ />

        </main>
      )}

      {/* 2. Footer layout */}
      <Footer config={footerConfig} />

    </div>
  );
}
