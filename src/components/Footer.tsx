import React from "react";
import { FooterConfig } from "../types";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, Award, ShieldCheck } from "lucide-react";

interface FooterProps {
  config: FooterConfig;
}

export default function Footer({ config }: FooterProps) {
  const cities = [
    { name: "Mataram", href: "#artikel" },
    { name: "Lombok Barat (Gerung, Narmada)", href: "#artikel" },
    { name: "Lombok Tengah (Praya, Pujut)", href: "#artikel" },
    { name: "Lombok Timur (Selong, Masbagik)", href: "#artikel" },
    { name: "Sumbawa Besar", href: "#artikel" },
    { name: "Sumbawa Barat (KSB)", href: "#artikel" },
    { name: "Bima & Sape", href: "#artikel" },
    { name: "Dompu", href: "#artikel" }
  ];

  return (
    <footer className="bg-gradient-to-b from-emerald-950 to-neutral-950 border-t-2 border-emerald-800 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold tracking-tight text-white italic">
                Amantubillahi<span className="text-amber-500 font-sans font-normal">.com</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              {config.aboutText}
            </p>
            <div className="flex space-x-4">
              <a href={config.facebookUrl} target="_blank" rel="noreferrer" className="p-2 bg-emerald-900/30 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors border border-emerald-800/40">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={config.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-emerald-900/30 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors border border-emerald-800/40">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={config.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 bg-emerald-900/30 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors border border-emerald-800/40">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-bold text-white border-l-4 border-amber-500 pl-3 italic">
              Kontak & Kantor Pusat
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-mono">{config.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{config.email}</span>
              </li>
            </ul>
          </div>

          {/* SEO Local Coverage */}
          <div className="space-y-6 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-serif font-bold text-white border-l-4 border-amber-500 pl-3 italic">
              Layanan Umroh Lombok NTB
            </h3>
            <p className="text-xs text-neutral-400">
              Kami melayani pendaftaran langsung, bimbingan manasik prima, dan penjemputan berkas jamaah di seluruh kabupaten/kota se-Nusa Tenggara Barat:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
              {cities.map((city, idx) => (
                <a 
                  key={idx} 
                  href={city.href}
                  className="flex items-center gap-2 hover:text-emerald-400 text-neutral-400 transition-colors"
                >
                  <span className="text-emerald-500 text-xs">✦</span> {city.name}
                </a>
              ))}
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-emerald-900/40">
              <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 py-1.5 px-3 rounded-lg text-xs border border-emerald-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Travel Berizin Kemenag RI No. 08022200332870003</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 py-1.5 px-3 rounded-lg text-xs border border-emerald-800/40">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Bimbingan Sesuai Sunnah Rasulullah</span>
              </div>
            </div>
          </div>

        </div>

        {/* Corporate Legal & Bottom */}
        <div className="mt-16 pt-8 border-t border-emerald-900/60 text-center text-xs text-neutral-500 space-y-4">
          <p>
            Amantubillahi melayani kebutuhan <strong className="text-neutral-400">travel umroh Lombok</strong>, paket umroh Lombok, konsultasi keberangkatan, dan pendaftaran jamaah dari seluruh wilayah Nusa Tenggara Barat.
          </p>
          <p>
            {config.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
