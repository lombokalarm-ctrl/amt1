import React, { useState } from "react";
import { BlogPost } from "../types";
import { BookOpen, Calendar, MapPin, Eye, ArrowRight, X, Sparkles, CheckCircle } from "lucide-react";

interface ArticlesProps {
  articles: BlogPost[];
  onSelectArticle: (slug: string) => void;
  onTrackClick: (action: string, path: string, city?: string) => void;
}

export default function Articles({ articles, onSelectArticle, onTrackClick }: ArticlesProps) {
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>("Semua");
  const [readingArticle, setReadingArticle] = useState<BlogPost | null>(null);

  const cities = [
    "Semua",
    "Mataram",
    "Lombok Barat",
    "Lombok Tengah",
    "Lombok Timur",
    "Sumbawa",
    "Bima"
  ];

  const handleOpenArticle = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blogs/${post.slug}`);
      if (response.ok) {
        const fullBlog = await response.json();
        setReadingArticle(fullBlog);
        onTrackClick("pageview", `Artikel: ${post.slug}`, post.city);
        onSelectArticle(post.slug);
      }
    } catch (e) {
      console.warn("Failed fetching blog view increment:", e);
      setReadingArticle(post); // Fallback
    }
  };

  const handleCloseArticle = () => {
    setReadingArticle(null);
  };

  const filteredArticles = selectedCityFilter === "Semua"
    ? articles
    : articles.filter(a => a.city.toLowerCase().includes(selectedCityFilter.toLowerCase()) || 
                           selectedCityFilter.toLowerCase().includes(a.city.toLowerCase()));

  return (
    <section id="artikel" className="py-20 bg-neutral-900 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-amber-400 font-bold uppercase tracking-widest text-xs block">Edukasi & Panduan Umrah</span>
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight sm:text-4xl italic">
            Sajian Informasi Haji & Umroh NTB
          </h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Artikel panduan dan regulasi pendaftaran untuk menjangkau jamaah terdekat di Mataram, Lombok Barat, Praya, Selong, Masbagik, Sumbawa, Bima, dan Dompu.
          </p>
        </div>

        {/* City Filter Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 pb-4 border-b border-emerald-900/40">
          <span className="text-xs text-emerald-300 font-bold uppercase mr-2">Pilih Wilayah Informasi:</span>
          {cities.map((city, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCityFilter(city)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all uppercase ${
                selectedCityFilter === city
                  ? "bg-emerald-600 text-white shadow-md border-none"
                  : "bg-emerald-950/50 text-emerald-200 hover:text-white hover:bg-emerald-900/60 border border-emerald-800/30"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Articles Grid list */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-neutral-950 rounded-2xl border border-neutral-800/40 text-neutral-500">
            Belum ada artikel yang ditayangkan khusus untuk kota pilihan ini. Gunakan CMS Admin untuk menambahkan artikel baru!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((post) => (
              <div 
                key={post.id}
                onClick={() => handleOpenArticle(post)}
                className="bg-neutral-950 hover:bg-neutral-950/80 rounded-2xl border border-emerald-950/80 overflow-hidden shadow-md hover:shadow-emerald-950/20 cursor-pointer flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  {post.imageUrl && (
                    <div className="h-44 w-full overflow-hidden relative border-b border-emerald-950/40">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent opacity-40"></div>
                    </div>
                  )}
                  
                  {/* Meta header ribbon */}
                  <div className="p-6 pb-2 space-y-4">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center gap-1 bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{post.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.date}</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white hover:text-emerald-400 transition-colors line-clamp-3 leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  {/* Content body snippet */}
                  <div className="px-6 text-sm text-neutral-400 leading-relaxed line-clamp-4">
                    {post.content.replace(/[#*`_]/g, "")}
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-6 pt-4 border-t border-neutral-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views} Views</span>
                    </span>
                    <span>• {post.readTimeMin} Min Baca</span>
                  </div>

                  <span className="flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Detailed Article Modal (SPA immersive reading) */}
        {readingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-emerald-800/60 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
              
              {/* Header image / ornament block */}
              <div 
                className="p-8 text-white relative min-h-[180px] flex flex-col justify-end bg-cover bg-center rounded-t-[22px]"
                style={
                  readingArticle.imageUrl 
                    ? { backgroundImage: `linear-gradient(rgba(4, 47, 31, 0.8), rgba(4, 47, 31, 0.95)), url('${readingArticle.imageUrl}')` }
                    : { backgroundImage: 'linear-gradient(to right, #064e3b, #0f766e)' }
                }
              >
                <button
                  onClick={handleCloseArticle}
                  className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 text-xs text-emerald-300 font-semibold mb-2">
                  <span className="bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-700/30 uppercase tracking-widest">{readingArticle.city}</span>
                  <span>• {readingArticle.date}</span>
                  <span>• {readingArticle.views} Views</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold leading-tight font-sans text-white">
                  {readingArticle.title}
                </h2>
              </div>

              {/* Story Content markdown representation wrapper */}
              <div className="p-8 space-y-6 text-neutral-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {readingArticle.content}
                
                {/* Embedded Call to Action in post */}
                <div className="bg-neutral-950 border border-emerald-900/60 p-6 rounded-2xl text-center space-y-4 my-8">
                  <h4 className="font-bold text-amber-300 font-sans text-base">Rencanakan Perjalanan Umroh Anda Dari {readingArticle.city} Sekarang!</h4>
                  <p className="text-xs text-neutral-400 max-w-xl mx-auto">
                    Hubungi perwakilan pendaftaran terdekat pendaftaran wilayah Amantubillahi untuk mendapatkan diskon rombongan serta prioritas seat keberangkatan umroh lombok terpercaya.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        handleCloseArticle();
                        onScrollToSection("#booking");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Daftar Booking Online
                    </button>
                    <a
                      href={`https://wa.me/6281907087999?text=Assalamu%27alaikum%20saya%20membaca%20artikel%20terkait%20wilayah%20${readingArticle.city}%20dan%20tertarik%20bertanya%20paket%20umroh.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-950 hover:bg-emerald-800 text-emerald-300 font-bold text-xs rounded-xl text-center border border-emerald-800/50"
                    >
                      Chat WhatsApp
                    </a>
                  </div>
                </div>

              </div>

              {/* Modal footer */}
              <div className="bg-neutral-950 py-4 px-8 border-t border-emerald-900/60 flex justify-end">
                <button
                  onClick={handleCloseArticle}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold"
                >
                  Tutup Artikel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function onScrollToSection(sectionId: string) {
  const element = document.querySelector(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
export { onScrollToSection };
