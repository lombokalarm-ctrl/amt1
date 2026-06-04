import React, { useState, useEffect } from "react";
import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, StatsData, Booking, EmailReport } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Packages from "./components/Packages";
import FAQ from "./components/FAQ";
import Articles, { onScrollToSection } from "./components/Articles";
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

export default function App() {
  // CMS Configuration States
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(initialHeader);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(initialFooter);
  
  // Data States
  const [packages, setPackages] = useState<UmrahPackage[]>(initialPackages);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [stats, setStats] = useState<StatsData>(initialStats);
  const [reports, setReports] = useState<EmailReport[]>(initialReports);

  // Layout UI States
  const [activeSection, setActiveSection] = useState("#");
  const [isCMSActive, setIsCMSActive] = useState(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState<UmrahPackage | null>(null);

  // Syncing with Backend Server on mount
  useEffect(() => {
    async function initFetch() {
      try {
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
          setBlogs(data);
        }

        const resStats = await fetch("/api/stats");
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data);
        }

        const resReps = await fetch("/api/reports");
        if (resReps.ok) {
          const data = await resReps.json();
          setReports(data);
        }

        // Log initial organic mount landing page view
         await fetch("/api/stats/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pageview", path: "Beranda" })
        });

      } catch (err) {
        console.warn("Express APIs are booting or loading from offline local seeds...", err);
      }
    }
    initFetch();
  }, []);

  // Track CTA user behavior click events (WhatsApp, Bookings etc)
  const trackCtaInteraction = async (action: string, path: string, city?: string) => {
    try {
      await fetch("/api/stats/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, path, city })
      });
      // Refresh local analytics numbers dynamically
      const resStats = await fetch("/api/stats");
      if (resStats.ok) {
        setStats(await resStats.json());
      }
    } catch (e) {
      console.warn("Analytics tracker offline:", e);
    }
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
        onNavigate={(href) => {
          setIsCMSActive(false);
          setActiveSection(href);
          onScrollToSection(href);
        }}
        onOpenCMS={() => {
          setIsCMSActive(!isCMSActive);
        }}
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
              onClick={() => setIsCMSActive(false)}
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
            initialStats={stats}
            initialReports={reports}
            onUpdateHeaderFooter={handleCMSHeaderFooterUpdate}
            onUpdatePackages={handleCMSPackagesUpdate}
            onUpdateBlogs={handleCMSBlogsUpdate}
          />
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
