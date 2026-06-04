import React, { useState } from "react";
import { HeaderConfig } from "../types";
import { Phone, Menu, X, Landmark, Compass } from "lucide-react";

interface HeaderProps {
  config: HeaderConfig;
  onNavigate: (section: string) => void;
  onOpenCMS: () => void;
  activeSection: string;
  isCMSActive: boolean;
}

export default function Header({ config, onNavigate, onOpenCMS, activeSection, isCMSActive }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClick = (href: string) => {
    onNavigate(href);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 border-b-4 border-amber-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleMenuClick("#")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {config.logoImageUrl ? (
              <img 
                src={config.logoImageUrl} 
                alt={config.logoText} 
                className="w-11 h-11 object-cover rounded-full shrink-0 group-hover:scale-105 transition-transform shadow-lg border-2 border-amber-500 bg-emerald-950 p-0.5"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-emerald-900 font-bold text-xl shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                {config.logoText ? config.logoText.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            <div>
              <span className="block font-sans text-lg font-bold leading-none tracking-tight text-white group-hover:text-amber-300 transition-colors uppercase">
                {config.logoText}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-200 mt-1">
                {config.logoSub}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {config.menus.map((item, index) => {
              const isActive = activeSection === item.href && !isCMSActive;
              return (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "text-amber-400 bg-emerald-950/50 shadow-inner"
                      : "text-emerald-100 hover:text-amber-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <button
              onClick={onOpenCMS}
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                isCMSActive
                  ? "bg-amber-500 text-emerald-900 border-amber-400 shadow-md"
                  : "border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-emerald-950"
              }`}
            >
              CMS Admin
            </button>
          </nav>

          {/* WhatsApp Hotline Action */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={`https://wa.me/${config.phone}?text=Assalamu%27alaikum%20Amantubillahi%20Tour%2C%20saya%20tertarik%20dengan%20informasi%20paket%20umroh%20Lombok.`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-[#20ba5a] transition-all hover:scale-102"
            >
              <span>WhatsApp Konsultasi</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={onOpenCMS}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                isCMSActive
                  ? "bg-amber-500 text-emerald-950 border-amber-400"
                  : "border-amber-500/50 text-amber-300 hover:bg-amber-800"
              }`}
            >
              CMS
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-emerald-900 text-emerald-100 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-900 px-4 py-4 space-y-2 shadow-xl animate-fade-in">
          {config.menus.map((item, index) => {
            const isActive = activeSection === item.href && !isCMSActive;
            return (
              <button
                key={index}
                onClick={() => handleMenuClick(item.href)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${
                  isActive
                    ? "bg-emerald-800 text-emerald-100"
                    : "text-emerald-200/90 hover:bg-emerald-900/55 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-emerald-900/60 flex flex-col gap-3">
            <a
              href={`https://wa.me/${config.phone}?text=Assalamu%27alaikum%20Amantubillahi.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-emerald-950 font-bold rounded-xl text-sm"
            >
              <Phone className="w-4 h-4 fill-emerald-950" />
              <span>Hotline: {config.phoneDisplay}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
