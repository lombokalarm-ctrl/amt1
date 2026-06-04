import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Notebook } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah Amantubillahi memiliki izin resmi PPIU Kemenag?",
      a: "Ya, Amantubillahi memiliki Izin Resmi Penyelenggara Perjalanan Ibadah Umrah (PPIU) dari Kementerian Agama RI dengan No. 08022200332870003. Alamat kantor pusat kami sangat jelas berlokasi di pusat Kota Mataram sebelah barat Kantor Gubernur NTB, sehingga jamaah dari Selong, Praya, Gerung, maupun Sumbawa dapat dengan mudah memverifikasi keaslian izin kami langsung."
    },
    {
      q: "Bagaimana rute penerbangan umroh dari bandara Lombok (LOP)?",
      a: "Tergantung pilihan paket, kami menyediakan rute penerbangan langsung (direct-flight) Lombok ke Jeddah menggunakan sewaan maskapai seperti Lion Air Premium Premium, atau dengan transit minimal yang nyaman seperti Garuda Indonesia melalui Jakarta atau AirAsia melalui Kuala Lumpur menuju Madinah."
    },
    {
      q: "Bagaimana cara melakukan pendaftaran umroh bagi warga di luar kota Mataram (seperti Selong, Bima, Sumbawa)?",
      a: "Sangat mudah! Amantubillahi menyediakan layanan pendaftaran online (Booking Online melalui form di website ini), dilanjutkan dengan pengiriman dokumen fisik melalui kurir atau tim perwakilan koper lokal kami yang tersebar di Selong, Masbagik, Praya, Sumbawa Besar, dan Kota Bima yang siap mengambil berkas/koper langsung di kediaman Anda."
    },
    {
      q: "Apakah biaya yang tertera di website sudah termasuk perlengkapan dan manasik?",
      a: "Ya, seluruh biaya paket yang kami rilis di Amantubillahi bersifat All-In (sudah termasuk perlengkapan umroh seperti koper premium, kain ihram/mukena, tas selempang, buku doa, visa resmi, makan Fullboard Catering Nusantara, air zam-zam 5L, serta bimbingan manasik intensif 2x di NTB sebelum bertolak ke Saudi)."
    },
    {
      q: "Apakah ada diskon atau paket khusus untuk pendaftaran rombongan keluarga?",
      a: "Benar sekali. Kami menyediakan kebijakan diskon khusus atau penyesuaian kamar (Double / Triple room) bagi pendaftaran rombongan keluarga atau rombongan jamaah minimal 4 orang dari satu desa/kecamatan di Lombok. Konsultasikan rombongan Anda ke tim Admin representatif kami via WhatsApp!"
    }
  ];

  return (
    <section id="keunggulan" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Block */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-emerald-700 font-bold uppercase tracking-widest text-xs block">Pusat Bantuan Jamaah Lombok</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight italic">
            Pertanyaan Yang Sering Diajukan (FAQ)
          </h2>
          <div className="w-12 h-0.5 bg-emerald-600 mx-auto"></div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen ? "border-emerald-600 bg-emerald-50/20 shadow-sm" : "border-gray-200 bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 gap-4"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-emerald-100/60 transition-all duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Help Desk Card */}
        <div className="mt-12 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-emerald-700/30">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Butuh Bantuan Personal?</span>
              <h3 className="text-xl font-bold font-sans">Masih Ada Pertanyaan Mengenai Syarat Visa & Paspor Pasca Pandemi?</h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Asisten pendaftaran khusus kami siap bertamu ke kediaman Anda di seluruh Lombok untuk memberikan penjelasan tatap muka yang tenang dan mendalam demi membina kemantapan niat ibadah Anda.
              </p>
            </div>
            
            <div className="md:col-span-4 text-left md:text-right">
              <a
                href="https://wa.me/6281907087999?text=Assalamu%27alaikum%20saya%20butuh%20tanya-tanya%20detail%20syarat%20paspor%20dan%20visa%20umroh."
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors w-full md:w-auto text-center"
              >
                Hubungi Petugas Izin
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
