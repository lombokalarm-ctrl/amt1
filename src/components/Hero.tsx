import React from "react";
import { ArrowRight, ShieldCheck, HeartHandshake, Compass, Users2, Landmark } from "lucide-react";

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
  phone: string;
}

export default function Hero({ onScrollToSection, phone }: HeroProps) {
  return (
    <section className="relative overflow-hidden text-white min-h-[580px] lg:min-h-[640px] flex items-center justify-center py-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(6, 78, 59, 0.90), rgba(6, 78, 59, 0.90)), url('/src/assets/images/pilgrims_group_1780615485518.png')" }}>
      
      {/* Absolute Decorative Geometric Shapes */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>
      
      {/* Islamic Dome Vector Silhouette Backplate ornament */}
      <div className="absolute bottom-0 right-0 left-0 h-40 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Tagline / Micro Trust Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 border border-emerald-700/50 rounded-full text-xs text-emerald-300 font-semibold shadow-inner">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Izin Resmi Kemenag No. 08022200332870003 | Travel Umroh Lombok Terpercaya</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight italic">
              Wujudkan Niat Suci ke Baitullah <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-sans font-extrabold not-italic">
                Bersama Amantubillahi
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-50 leading-relaxed opacity-90">
              Penyelenggara Umroh Resmi & Terpercaya di Nusa Tenggara Barat. Melayani Jamaah dengan bimbingan murni sesuai Sunnah langsung dari berbagai wilayah Lombok & Sumbawa.
            </p>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onScrollToSection("#booking")}
                className="bg-amber-500 text-emerald-950 hover:bg-amber-400 font-extrabold px-8 py-4 rounded-xl text-base shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Daftar Booking Online</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <a
                href={`https://wa.me/${phone}?text=Assalamu%27alaikum%20Amantubillahi%20Tour%2C%20saya%20tertarik%20dengan%20informasi%20paket%20umroh%20Lombok.`}
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 font-bold text-base rounded-xl transition-all border border-emerald-600/40 text-center flex items-center justify-center gap-2 hover:shadow-md"
              >
                <span>Konsultasi WhatsApp</span>
                <span className="inline-block w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
              </a>
            </div>

            {/* SEO Keyword Tag Cloud for Search Crawlers */}
            <div className="pt-4 border-t border-emerald-900/50">
              <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-400/85 mb-2.5">
                Cakupan Layanan Terdekat Lombok:
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-emerald-200/70">
                <span className="px-2.5 py-1 bg-emerald-950/60 rounded-md border border-emerald-900/60">Mataram</span>
                <span className="px-2.5 py-1 bg-emerald-950/60 rounded-md border border-emerald-900/60">Lombok Barat</span>
                <span className="px-2.5 py-1 bg-emerald-950/60 rounded-md border border-emerald-900/60">Lombok Tengah & Praya</span>
                <span className="px-2.5 py-1 bg-emerald-950/60 rounded-md border border-emerald-900/60">Lombok Timur (Selong, Masbagik)</span>
                <span className="px-2.5 py-1 bg-emerald-950/60 rounded-md border border-emerald-900/60">Sumbawa & Bima</span>
              </div>
            </div>

          </div>

          {/* Right Trust Column / Bento Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[400px] lg:max-w-none">
              
              {/* Outer Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur-xl"></div>
              
              {/* Main Decorative Container */}
              <div className="relative bg-gradient-to-b from-emerald-900/90 to-neutral-900/90 border border-emerald-700/40 p-8 rounded-2xl shadow-2xl space-y-6">
                
                <h3 className="text-xl font-bold text-amber-300 flex items-center gap-2 border-b border-emerald-800/60 pb-3">
                  <Landmark className="w-5 h-5" />
                  <span>5 Pilar Utama Amantubillahi</span>
                </h3>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pasti Izin & Legalitas</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Izin PPIU No: 08022200332870003 resmi Kementerian Agama RI.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 mt-0.5">
                      <HeartHandshake className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pasti Jadwal & Boarding</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Tanggal keberangkatan dirilis awal dengan seat pesawat ter-booking.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 mt-0.5">
                      <Compass className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pimbingan Sesuai Sunnah</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Mutawwif bersertifikat Kemenag membantun kemurnian rukun ibadah.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 mt-0.5">
                      <Users2 className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pasti Pelayanan Terbaik</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Hotel strategis bintang dekat pelataran masjid, katering khas masakan nusantara.</p>
                    </div>
                  </li>
                </ul>

                {/* Local Lombok support badge */}
                <div className="bg-emerald-950/80 border border-emerald-800/40 p-4 rounded-xl text-center space-y-1">
                  <span className="block text-[10px] text-amber-300 uppercase tracking-widest font-semibold">Tingkat Kepuasan Jamaah</span>
                  <span className="font-sans font-bold text-3xl text-white">99.4%</span>
                  <span className="block text-xs text-emerald-200/60">Telah Melayani Ribuan Jamaah Lombok Sejak 2018</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
