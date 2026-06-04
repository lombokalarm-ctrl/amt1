import React from "react";
import { UmrahPackage } from "../types";
import { Plane, Calendar, Shield, Hotel, Star, CheckCircle2, PhoneCall, HelpCircle } from "lucide-react";

interface PackagesProps {
  packages: UmrahPackage[];
  onOpenBooking: (pkg: UmrahPackage) => void;
  onWhatsappClick: (packageName: string) => void;
}

export default function Packages({ packages, onOpenBooking, onWhatsappClick }: PackagesProps) {
  
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const activePackages = packages.filter(p => p.active);

  return (
    <section id="paket" className="py-20 bg-[#F8FAF8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-amber-600 font-bold tracking-widest text-xs uppercase block">Jadwal Keberangkatan Umroh Lombok 2026/2027</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight italic">
            Pilihan Paket Umrah Terbaik Dari Lombok
          </h2>
          <div className="w-16 h-1 bg-emerald-600 mx-auto rounded-full"></div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Paket lengkap dengan penerbangan langsung, katering masakan nusantara 3h sehari, penginapan hotel berlisensi, manasik intensif sesuai Sunnah, dan mutawwif asli Lombok.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePackages.map((pkg) => (
            <div 
              key={pkg.id} 
              id={`pkg-card-${pkg.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-emerald-100/60 flex flex-col hover:-translate-y-1 duration-300"
            >
              
              {/* Card Image Cover */}
              <div className="relative h-56 bg-emerald-950/20 overflow-hidden">
                <img 
                  src={pkg.imageUrl} 
                  alt={pkg.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Float Duration Badge */}
                <div className="absolute top-4 right-4 bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-full shadow-md">
                  {pkg.duration}
                </div>

                {/* Stars Rating */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-amber-400 font-semibold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1">
                  <span className="text-white">Hotel:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: Number(pkg.hotelStars) || 0 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                
                <div className="space-y-3">
                  <h3 className="text-xl font-serif font-bold text-gray-900 leading-snug hover:text-emerald-700 transition-colors">
                    {pkg.title}
                  </h3>
                  
                  {/* Prices Display */}
                  <div className="py-2 border-b border-gray-100 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
                      {formatIDR(pkg.price)}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/ Jamaah All-In</span>
                  </div>

                  {/* Highlight Items */}
                  <div className="space-y-2.5 pt-3 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <Plane className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate" title={pkg.flights}><strong>Penerbangan:</strong> {pkg.flights}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Tanggal Berangkat:</strong> {pkg.departureDate}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hotel className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="block text-gray-600"><strong>Makkah:</strong> {pkg.hotelMakkah}</span>
                        <span className="block text-gray-600"><strong>Madinah:</strong> {pkg.hotelMadinah}</span>
                      </div>
                    </div>
                  </div>

                  {/* Included Facilities bullet sneak preview */}
                  <div className="pt-4 space-y-1.5">
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Fasilitas Utama:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {pkg.facilities.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Double CTA Buttons inside card */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onOpenBooking(pkg)}
                    className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors shadow-sm cursor-pointer text-center"
                  >
                    Booking Paket
                  </button>
                  
                  <button
                    onClick={() => onWhatsappClick(pkg.title)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-colors inline-flex items-center justify-center gap-1 hover:shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Tanya WA</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Local trust footnote */}
        <div className="mt-12 text-center text-xs text-gray-500 bg-white border border-gray-200/50 p-4 rounded-xl max-w-2xl mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
          <p className="text-left">
            Seluruh pendaftaran di Amantubillahi dilengkapi dengan Kuitansi Pembayaran Resmi & Sistem Kontrak Keberangkatan tertulis bermaterai guna menjamin keamanan dana suci jamaah secara hukum Indonesia.
          </p>
        </div>

      </div>
    </section>
  );
}
