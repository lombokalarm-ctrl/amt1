import React, { useState, useEffect } from "react";
import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, StatsData, Booking, EmailReport } from "../types";
import { 
  Building, BookOpen, Settings, BarChart3, MailCheck, Edit, Trash2, 
  Plus, Check, RefreshCw, Sparkles, Send, Eye, ShieldCheck, 
  HelpCircle, UserCheck, MessageCircle, AlertCircle, FileSpreadsheet, CheckSquare
} from "lucide-react";

interface AdminCMSProps {
  initialPackages: UmrahPackage[];
  initialBlogs: BlogPost[];
  initialHeader: HeaderConfig;
  initialFooter: FooterConfig;
  initialStats: StatsData;
  initialReports: EmailReport[];
  onUpdateHeaderFooter: (header: HeaderConfig, footer: FooterConfig) => void;
  onUpdatePackages: (pkgs: UmrahPackage[]) => void;
  onUpdateBlogs: (blogs: BlogPost[]) => void;
}

type TabType = "stats" | "packages" | "blogs" | "header_footer" | "reports";

export default function AdminCMS({
  initialPackages,
  initialBlogs,
  initialHeader,
  initialFooter,
  initialStats,
  initialReports,
  onUpdateHeaderFooter,
  onUpdatePackages,
  onUpdateBlogs
}: AdminCMSProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  
  // Data States
  const [packages, setPackages] = useState<UmrahPackage[]>(initialPackages);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [header, setHeader] = useState<HeaderConfig>(initialHeader);
  const [footer, setFooter] = useState<FooterConfig>(initialFooter);
  const [stats, setStats] = useState<StatsData>(initialStats);
  const [reports, setReports] = useState<EmailReport[]>(initialReports);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Editor States - Package
  const [editingPackage, setEditingPackage] = useState<Partial<UmrahPackage> | null>(null);
  
  // Form Editor States - Blog
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [seoResult, setSeoResult] = useState<{
    seoScore: number;
    keywordDensity: number;
    keywordInTitle: boolean;
    keywordInMetaDesc: boolean;
    contentLengthOk: boolean;
    suggestions: string[];
    seoMetaTitle: string;
    seoMetaDesc: string;
  } | null>(null);
  const [analyzingSeo, setAnalyzingSeo] = useState(false);

  // Form Editor States - HeaderFooter
  const [editHeaderLogo, setEditHeaderLogo] = useState(header.logoText);
  const [editHeaderSub, setEditHeaderSub] = useState(header.logoSub);
  const [editHeaderLogoUrl, setEditHeaderLogoUrl] = useState(header.logoImageUrl || "");
  const [editHeaderTagline, setEditHeaderTagline] = useState(header.tagline);
  const [editHeaderPhone, setEditHeaderPhone] = useState(header.phone);
  const [editHeaderDisplay, setEditHeaderDisplay] = useState(header.phoneDisplay);
  const [editFooterAbout, setEditFooterAbout] = useState(footer.aboutText);
  const [editFooterAddress, setEditFooterAddress] = useState(footer.address);
  const [editFooterPhone, setEditFooterPhone] = useState(footer.phone);
  const [editFooterEmail, setEditFooterEmail] = useState(footer.email);

  // Stats refresh timer / poll trigger
  const fetchLatestStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (e) {
      console.warn("Failed syncing real-time stats:", e);
    }
  };

  const syncAllData = async () => {
    setLoading(true);
    try {
      const resPkgs = await fetch("/api/packages");
      const resBlogs = await fetch("/api/blogs");
      const resHF = await fetch("/api/header-footer");
      const resReps = await fetch("/api/reports");
      
      if (resPkgs.ok) setPackages(await resPkgs.json());
      if (resBlogs.ok) setBlogs(await resBlogs.json());
      if (resHF.ok) {
        const data = await resHF.json();
        setHeader(data.header);
        setFooter(data.footer);
        setEditHeaderLogo(data.header.logoText);
        setEditHeaderSub(data.header.logoSub);
        setEditHeaderLogoUrl(data.header.logoImageUrl || "");
        setEditHeaderTagline(data.header.tagline);
        setEditHeaderPhone(data.header.phone);
        setEditHeaderDisplay(data.header.phoneDisplay);
        setEditFooterAbout(data.footer.aboutText);
        setEditFooterAddress(data.footer.address);
        setEditFooterPhone(data.footer.phone);
        setEditFooterEmail(data.footer.email);
      }
      if (resReps.ok) setReports(await resReps.json());
      await fetchLatestStats();

      setAlertMsg({ type: "success", text: "Seluruh basis data CMS & Analis berhasil disinkronkan secara real-time." });
    } catch (e) {
      setAlertMsg({ type: "error", text: "Gagal menghubungkan ke server sinkronisasi." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Poll stats occasionally to simulate real-time analytics
    const interval = setInterval(fetchLatestStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBookingStatus = async (bookingId: string, nextStatus: "Pending" | "Dihubungi" | "Selesai") => {
    try {
      const res = await fetch("/api/bookings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: nextStatus })
      });
      if (res.ok) {
        await fetchLatestStats();
        setAlertMsg({ type: "success", text: `Status registrasi booking #${bookingId} diperbarui menjadi: ${nextStatus}.` });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Package Actions
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPackage)
      });
      if (res.ok) {
        const data = await res.json();
        const updated = packages.some(p => p.id === data.package.id)
          ? packages.map(p => p.id === data.package.id ? data.package : p)
          : [...packages, data.package];
        setPackages(updated);
        onUpdatePackages(updated);
        setEditingPackage(null);
        setAlertMsg({ type: "success", text: "Paket umroh berhasil disimpan di server." });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: "Gagal menyimpan data paket." });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Hapus paket umroh ini secara permanen dari server?")) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = packages.filter(p => p.id !== id);
        setPackages(updated);
        onUpdatePackages(updated);
        setAlertMsg({ type: "success", text: "Paket umroh berhasil dihapus." });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: "Gagal menghapus data paket." });
    }
  };

  // Blog Actions
  const handleAnalyzeSeoYoast = async () => {
    if (!editingBlog || !editingBlog.seoFocusKeyword) {
      alert("Masukkan Kata Kunci Fokus (Focus Keyword) terlebih dahulu.");
      return;
    }
    
    setAnalyzingSeo(true);
    setSeoResult(null);
    try {
      const response = await fetch("/api/seo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingBlog.title || "",
          content: editingBlog.content || "",
          focusKeyword: editingBlog.seoFocusKeyword
        })
      });
      if (response.ok) {
        const result = await response.json();
        setSeoResult(result);
        setEditingBlog(prev => prev ? {
          ...prev,
          seoScore: result.seoScore,
          seoMetaTitle: result.seoMetaTitle,
          seoMetaDesc: result.seoMetaDesc
        } : null);
      }
    } catch (e) {
      console.error(e);
      alert("Koneksi AI terputus. Silakan coba sesaat lagi.");
    } finally {
      setAnalyzingSeo(false);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog)
      });
      if (res.ok) {
        const data = await res.json();
        const updated = blogs.some(b => b.id === data.blog.id)
          ? blogs.map(b => b.id === data.blog.id ? data.blog : b)
          : [...blogs, data.blog];
        setBlogs(updated);
        onUpdateBlogs(updated);
        setEditingBlog(null);
        setSeoResult(null);
        setAlertMsg({ type: "success", text: "Artikel SEO baru berhasil ditayangkan dan didistribusikan." });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: "Gagal menyimpan tulisan artikel." });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Hapus artikel ini secara permanen dari server?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = blogs.filter(b => b.id !== id);
        setBlogs(updated);
        onUpdateBlogs(updated);
        setAlertMsg({ type: "success", text: "Artikel berhasil dihapus." });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Header Footer Editor Save
  const handleSaveHeaderFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextHeader: HeaderConfig = {
      ...header,
      logoText: editHeaderLogo,
      logoSub: editHeaderSub,
      logoImageUrl: editHeaderLogoUrl,
      tagline: editHeaderTagline,
      phone: editHeaderPhone,
      phoneDisplay: editHeaderDisplay
    };
    const nextFooter: FooterConfig = {
      ...footer,
      aboutText: editFooterAbout,
      address: editFooterAddress,
      phone: editFooterPhone,
      email: editFooterEmail
    };

    try {
      const response = await fetch("/api/header-footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ header: nextHeader, footer: nextFooter })
      });
      if (response.ok) {
        setHeader(nextHeader);
        setFooter(nextFooter);
        onUpdateHeaderFooter(nextHeader, nextFooter);
        setAlertMsg({ type: "success", text: "Konfigurasi kustom Header dan Footer berhasil disimpan secara global." });
      }
    } catch (err) {
      setAlertMsg({ type: "error", text: "Gagal menyimpan konfigurasi tata letak." });
    }
  };

  // Automatic monthly report trigger
  const handleGenerateMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: "Juni 2026",
          recipientEmail: "lombok.alarm@gmail.com"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.allReports);
        setAlertMsg({ 
          type: "success", 
          text: "Sistem pelaporan otomatis berhasil dieksekusi secara periodik! Salinan laporan konten dialirkan secara aman melalui email simulasi ke lombok.alarm@gmail.com dan dicatatkan pada panel histori." 
        });
      }
    } catch (e) {
      setAlertMsg({ type: "error", text: "Koneksi AI pelaporan terputus." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-emerald-800/40 rounded-3xl overflow-hidden shadow-2xl text-white">
      
      {/* Top Banner Control Block */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 px-8 py-6 border-b border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span>Amantubillahi Custom CMS Panel</span>
            <span className="text-xs bg-amber-500/10 text-amber-300 font-mono font-bold py-1 px-2 rounded-md border border-amber-500/20">ADMIN MODE v4.0</span>
          </h2>
          <p className="text-xs text-neutral-400">Pengendali artikel SEO Yoast, real-time statistik, paket umroh Lombok, dan sistem pelaporan otomatis bulanan.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncAllData}
            disabled={loading}
            className="px-4 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all border border-emerald-600/30 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation Bar */}
      <div className="bg-neutral-950 border-b border-emerald-950/40 px-6 py-2 flex flex-wrap gap-1">
        <button
          onClick={() => { setActiveTab("stats"); setAlertMsg(null); }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all uppercase ${
            activeTab === "stats" ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real-Time Statistik</span>
        </button>

        <button
          onClick={() => { setActiveTab("blogs"); setAlertMsg(null); setEditingBlog(null); }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all uppercase ${
            activeTab === "blogs" ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artikel & Yoast SEO</span>
        </button>

        <button
          onClick={() => { setActiveTab("packages"); setAlertMsg(null); setEditingPackage(null); }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all uppercase ${
            activeTab === "packages" ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Kelola Paket</span>
        </button>

        <button
          onClick={() => { setActiveTab("header_footer"); setAlertMsg(null); }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all uppercase ${
            activeTab === "header_footer" ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Header & Footer</span>
        </button>

        <button
          onClick={() => { setActiveTab("reports"); setAlertMsg(null); }}
          className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all uppercase ${
            activeTab === "reports" ? "bg-emerald-900/40 text-emerald-300 border-b-2 border-emerald-500" : "text-neutral-400 hover:text-white"
          }`}
        >
          <MailCheck className="w-4 h-4" />
          <span>Sistem Laporan</span>
        </button>
      </div>

      {/* Dynamic Alerts Notifications */}
      {alertMsg && (
        <div className={`m-6 p-4 rounded-xl text-xs sm:text-sm border flex items-center gap-3 ${
          alertMsg.type === "success" ? "bg-emerald-950/60 border-emerald-800 text-emerald-400" : "bg-rose-950/60 border-rose-800 text-rose-400"
        }`}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Main CMS Contents Container */}
      <div className="p-8">

        {/* Tab 1: Real-Time Trafic & conversions details */}
        {activeTab === "stats" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Widget Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 relative overflow-hidden">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Total Kunjungan Organik</span>
                <span className="block font-sans text-3xl font-extrabold mt-1 text-white">{stats.totalViews}</span>
                <span className="block text-[10px] text-emerald-400 mt-2">● Real-time tracking aktif</span>
                <Eye className="absolute bottom-4 right-4 w-12 h-12 text-neutral-800/30" />
              </div>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 relative overflow-hidden">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Total Klik WhatsApp CTA</span>
                <span className="block font-sans text-3xl font-extrabold mt-1 text-emerald-400">{stats.whatsappClicks}</span>
                <span className="block text-[10px] text-emerald-300 mt-2">Target keyword umrah Lombok</span>
                <MessageCircle className="absolute bottom-4 right-4 w-12 h-12 text-neutral-800/30" />
              </div>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 relative overflow-hidden">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Total Reg Booking Online</span>
                <span className="block font-sans text-3xl font-extrabold mt-1 text-amber-400">{stats.bookingSubmissions}</span>
                <span className="block text-[10px] text-amber-300 mt-2">Konversi prospek langsung</span>
                <FileSpreadsheet className="absolute bottom-4 right-4 w-12 h-12 text-neutral-800/30" />
              </div>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 relative overflow-hidden">
                <span className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Rata-rata Konversi Total</span>
                <span className="block font-sans text-3xl font-extrabold mt-1 text-teal-300">
                  {stats.totalViews > 0 
                    ? (((stats.bookingSubmissions + stats.whatsappClicks) / stats.totalViews) * 100).toFixed(1) + "%" 
                    : "0%"}
                </span>
                <span className="block text-[10px] text-teal-400 mt-2">Konversi landing page murni</span>
                <Sparkles className="absolute bottom-4 right-4 w-12 h-12 text-neutral-800/30" />
              </div>
            </div>

            {/* Geographical City Views & Sections list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Traffic per City target list */}
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 space-y-4">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider h-6 border-b border-neutral-800">
                  Distribusi Kunjungan per Wilayah NTB
                </h3>
                <div className="space-y-3 pt-2 text-xs sm:text-sm">
                  {Object.entries(stats.viewsByCity).map(([city, v], idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-neutral-900">
                      <span className="text-neutral-300 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {city}
                      </span>
                      <span className="font-mono text-neutral-400 font-bold">{v} Views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic per individual page URLs */}
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 space-y-4">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider h-6 border-b border-neutral-800">
                  Analisis Kunjungan Landing Page & Artikel URL
                </h3>
                <div className="space-y-3 pt-2 text-xs sm:text-sm">
                  {Object.entries(stats.viewsByPage).slice(0, 5).map(([page, v], idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-neutral-900">
                      <span className="text-neutral-300 truncate max-w-[250px]" title={page}>{page}</span>
                      <span className="font-mono text-neutral-400 font-bold">{v} Views</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Booking Records Table (Leads management) */}
            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 space-y-4">
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span>Daftar Prospek Registrasi Masuk ({stats.bookings.length})</span>
                <span className="text-xs text-neutral-400">Silakan hubungi calon jamaah via WhatsApp</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 h-10 uppercase text-[10px]">
                      <th className="pb-2">Tanggal</th>
                      <th className="pb-2 col-span-2">Nama Calon Jamaah</th>
                      <th className="pb-2">Kota</th>
                      <th className="pb-2">Paket Pilihan</th>
                      <th className="pb-2 text-center">Pax</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-neutral-500">Belum ada booking online masuk dari Lombok.</td>
                      </tr>
                    ) : (
                      stats.bookings.map((b) => (
                        <tr key={b.id} className="border-b border-neutral-900 py-3 text-neutral-300 h-14 hover:bg-neutral-900/40">
                          <td>{b.date}</td>
                          <td>
                            <div className="font-bold text-white">{b.fullName}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{b.phone}</div>
                          </td>
                          <td>{b.city}</td>
                          <td className="truncate max-w-[150px]" title={b.packageName}>{b.packageName}</td>
                          <td className="text-center font-bold">{b.passengersCount}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                              b.status === "Pending" ? "bg-amber-950 text-amber-300 border border-amber-900" :
                              b.status === "Dihubungi" ? "bg-teal-950 text-teal-300 border border-teal-900" :
                              "bg-emerald-950 text-emerald-400 border border-emerald-900"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, "Dihubungi")}
                                className="px-2 py-1 bg-teal-900/50 hover:bg-teal-950 text-teal-300 rounded text-[10px] font-bold border border-teal-800/40"
                              >
                                Hubungi
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, "Selesai")}
                                className="px-2 py-1 bg-emerald-900/50 hover:bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold border border-emerald-800/40"
                              >
                                Selesai
                              </button>
                              <a
                                href={`https://wa.me/${b.phone.startsWith('0') ? '62' + b.phone.substring(1) : b.phone}?text=Assalamu%27alaikum%20Bpk%2FIbu%20${b.fullName}%2C%20saya%20Admin%20Amantubillahi%20Tour%20Lombok.%20Terima%20kasih%20sudah%20melakukan%20booking%20seat%20secara%20online.%20Berikut%20detail%20persyaratan...`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 px-2.5 bg-green-600 text-white hover:bg-green-700 rounded text-[10px] font-bold flex items-center gap-1"
                              >
                                <span>WA</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Manage Packages */}
        {activeTab === "packages" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-200 uppercase tracking-wider">
                Kelola Paket Kursi Umroh Lombok ({packages.length})
              </h3>
              <button
                onClick={() => setEditingPackage({
                  title: "",
                  duration: "12 Hari",
                  price: 25000000,
                  hotelMakkah: "",
                  hotelMadinah: "",
                  hotelStars: 4,
                  flights: "Lombok - Jeddah",
                  departureDate: "",
                  facilities: ["Tiket PP", "Visa resmi Kemenag", "Hotel Bintang 4", "Air Zam-zam 5L"],
                  description: "",
                  imageUrl: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format",
                  active: true
                })}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Paket Baru</span>
              </button>
            </div>

            {/* List packages with edits or lists */}
            {editingPackage ? (
              <form onSubmit={handleSavePackage} className="bg-neutral-950 p-6 rounded-2xl border border-emerald-900/40 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-amber-300 font-sans pb-2 border-b border-neutral-900">Form Sunting Paket</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Nama / Judul Paket</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.title || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, title: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Durasi Hari</label>
                      <input
                        type="text"
                        required
                        value={editingPackage.duration || ""}
                        onChange={(e) => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Harga Paket (IDR)</label>
                      <input
                        type="number"
                        required
                        value={editingPackage.price || 0}
                        onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Hotel Makkah</label>
                      <input
                        type="text"
                        required
                        value={editingPackage.hotelMakkah || ""}
                        onChange={(e) => setEditingPackage({ ...editingPackage, hotelMakkah: e.target.value })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Hotel Madinah</label>
                      <input
                        type="text"
                        required
                        value={editingPackage.hotelMadinah || ""}
                        onChange={(e) => setEditingPackage({ ...editingPackage, hotelMadinah: e.target.value })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Bintang Layanan Hotel</label>
                      <select
                        value={editingPackage.hotelStars || 4}
                        onChange={(e) => setEditingPackage({ ...editingPackage, hotelStars: Number(e.target.value) })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                      >
                        <option value={3}>Bintang 3 (Standard)</option>
                        <option value={4}>Bintang 4 (Berkah)</option>
                        <option value={5}>Bintang 5 (Premium)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Tanggal Keberangkatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: 15 September 2026"
                        required
                        value={editingPackage.departureDate || ""}
                        onChange={(e) => setEditingPackage({ ...editingPackage, departureDate: e.target.value })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-neutral-300 font-sans pb-2 border-b border-neutral-900">Akomodasi Maskapai & Deskripsi</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Penerbangan & Penerima Maskapai (Flight)</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.flights || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, flights: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">URL Gambar Cover</label>
                    <input
                      type="text"
                      required
                      value={editingPackage.imageUrl || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, imageUrl: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Deskripsi Ringkas</label>
                    <textarea
                      required
                      rows={3}
                      value={editingPackage.description || ""}
                      onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="activePkg"
                      checked={editingPackage.active ?? true}
                      onChange={(e) => setEditingPackage({ ...editingPackage, active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 bg-neutral-950"
                    />
                    <label htmlFor="activePkg" className="text-xs text-neutral-300">Tampilkan paket ini secara aktif di Landing Page</label>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Simpan Paket
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(p => (
                  <div key={p.id} className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${
                          p.active ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/40" : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                        }`}>
                          {p.active ? "Aktif" : "Draft"}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingPackage(p)}
                            className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-xs font-bold rounded-lg border border-neutral-800"
                          >
                            <Edit className="w-3 h-3 inline mr-1" /> Sunting
                          </button>
                          <button
                            onClick={() => handleDeletePackage(p.id)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-950 text-rose-400 rounded-lg border border-rose-900/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-white line-clamp-2 pr-6">{p.title}</h4>
                      <p className="text-emerald-400 font-mono font-bold text-sm mt-2">
                        {new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(p.price)}
                      </p>
                      
                      <div className="text-[10px] mt-4 space-y-1 text-neutral-400">
                        <p>✈️ Maskapai: {p.flights}</p>
                        <p>📍 Makkah: {p.hotelMakkah} (Bintang {p.hotelStars})</p>
                        <p>📅 Keberangkatan: {p.departureDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Kelola Blog Posts & Yoast SEO analysis tools */}
        {activeTab === "blogs" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-200 uppercase tracking-wider">
                Kelola Artikel Edukasi & Audit Yoast SEO ({blogs.length})
              </h3>
              <button
                onClick={() => {
                  setEditingBlog({
                    title: "",
                    slug: "",
                    content: "",
                    seoFocusKeyword: "",
                    seoMetaTitle: "",
                    seoMetaDesc: "",
                    city: "Mataram",
                    tags: ["Travel Umroh Lombok"],
                    seoScore: 60,
                    imageUrl: ""
                  });
                  setSeoResult(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publikasikan Artikel Baru</span>
              </button>
            </div>

            {editingBlog ? (
              <form onSubmit={handleSaveBlog} className="bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-emerald-900/40 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h4 className="font-bold text-amber-300 font-sans flex items-center gap-1.5">
                    <span>Pembuat & Editor Artikel Yoast SEO</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setEditingBlog(null); setSeoResult(null); }}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Batal Kembali
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Editor Inputs */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Target Kota Wilayah NTB</label>
                        <select
                          value={editingBlog.city || "Mataram"}
                          onChange={(e) => setEditingBlog({ ...editingBlog, city: e.target.value })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-200"
                        >
                          <option value="Mataram">Mataram</option>
                          <option value="Lombok Barat">Lombok Barat</option>
                          <option value="Lombok Tengah">Lombok Tengah</option>
                          <option value="Lombok Timur">Lombok Timur</option>
                          <option value="Sumbawa">Sumbawa</option>
                          <option value="Bima">Bima</option>
                          <option value="Dompu">Dompu</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Slug URL (Ramah SEO)</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.slug || ""}
                          placeholder="contoh-seo-url-lombok"
                          onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Judul Utama Tulisan (H1)</label>
                      <input
                        type="text"
                        required
                        value={editingBlog.title || ""}
                        placeholder="Contoh: Travel Umroh Lombok Terpercaya di Kota Mataram..."
                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                        className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">URL Gambar Sampul Artikel</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={editingBlog.imageUrl || ""}
                          placeholder="https://images.unsplash.com/photo-..."
                          onChange={(e) => setEditingBlog({ ...editingBlog, imageUrl: e.target.value })}
                          className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300"
                        />
                        {editingBlog.imageUrl && (
                          <img 
                            src={editingBlog.imageUrl} 
                            alt="Cover preview" 
                            className="w-12 h-10 object-cover rounded-lg border border-neutral-850 shrink-0 bg-neutral-900"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=600';
                            }}
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1 flex flex-wrap gap-2">
                        <span>Pilihan Preset Populer:</span>
                        <button 
                          type="button" 
                          onClick={() => setEditingBlog({ ...editingBlog, imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=600" })}
                          className="text-amber-400 underline hover:text-amber-300 pointer-events-auto"
                        >
                          Ka'bah Makkah
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingBlog({ ...editingBlog, imageUrl: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=600" })}
                          className="text-amber-400 underline hover:text-amber-300 pointer-events-auto"
                        >
                          Masjid Nabawi Madinah
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingBlog({ ...editingBlog, imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600" })}
                          className="text-amber-400 underline hover:text-amber-300 pointer-events-auto"
                        >
                          Kubah Indah
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingBlog({ ...editingBlog, imageUrl: "" })}
                          className="text-rose-400 underline hover:text-rose-300 pointer-events-auto"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Materi Konten Edukasi</label>
                      <textarea
                        required
                        rows={12}
                        value={editingBlog.content || ""}
                        placeholder="Tulis artikel bimbingan minimal 300 kata untuk kepuasan rujukan Google..."
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm font-sans whitespace-pre-wrap outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Yoast SEO Tools Section */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                      <h4 className="font-bold text-xs text-neutral-300 uppercase tracking-widest border-b border-neutral-900 pb-2 mb-4 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                        <span>Form Tools SEO (Yoast Audit)</span>
                      </h4>

                      <div className="space-y-4">
                        {/* Focus Keyword */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-300 uppercase block">Kata Kunci Fokus (Focus Keyword)</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: travel umroh lombok"
                            value={editingBlog.seoFocusKeyword || ""}
                            onChange={(e) => setEditingBlog({ ...editingBlog, seoFocusKeyword: e.target.value })}
                            className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-semibold text-emerald-300 outline-none"
                          />
                          <span className="block text-[10px] text-neutral-500">Kata kunci utama yang ingin ditargetkan pada mesin pencari Google.</span>
                        </div>

                        {/* Interactive Analyzer button */}
                        <button
                          type="button"
                          onClick={handleAnalyzeSeoYoast}
                          disabled={analyzingSeo}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 text-center mt-3"
                        >
                          {analyzingSeo ? (
                            <span>Menilai & Menganalisis Konten (AI)...</span>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Analisis dengan Yoast AI Validator</span>
                            </>
                          )}
                        </button>

                        <hr className="border-neutral-900" />

                        {/* SEO scoring feedback */}
                        {seoResult ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">Skor SEO Yoast:</span>
                              <span className={`px-2 py-1 rounded font-mono font-bold text-xs ${
                                seoResult.seoScore >= 80 ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300"
                              }`}>
                                {seoResult.seoScore} / 100
                              </span>
                            </div>

                            <p className="text-[10px] text-neutral-400">
                              Frekuensi Kepadatan Fokus: <strong>{seoResult.keywordDensity}%</strong>
                            </p>

                            <div className="space-y-1.5 text-[10px]">
                              <span className="block font-bold text-neutral-300 uppercase">Daftar Poin Rekomendasi:</span>
                              <ul className="space-y-1 list-disc pl-3 text-neutral-400 leading-normal">
                                {seoResult.suggestions.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-850 space-y-2 text-[10px]">
                              <p className="font-bold text-neutral-300 italic">Pratinjau Hasil Pencarian Google (SERP):</p>
                              <p className="text-blue-400 font-medium truncate shrink-0">{seoResult.seoMetaTitle}</p>
                              <p className="text-emerald-500 truncate text-[9px]">amantubillahi.com/blogs/{editingBlog.slug}</p>
                              <p className="text-neutral-400 line-clamp-2 leading-relaxed">{seoResult.seoMetaDesc}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-[11px] text-neutral-500 flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="w-8 h-8 text-neutral-700" />
                            <span>Silakan penuhi isi artikel lalu klik tombol di atas untuk menjalankan audit skor SEO otomatis.</span>
                          </div>
                        )}
                        
                        {/* Hidden SEO Metadata inputs for safety */}
                        <input type="hidden" name="seoMetaTitle" value={editingBlog.seoMetaTitle || ""} />
                        <input type="hidden" name="seoMetaDesc" value={editingBlog.seoMetaDesc || ""} />

                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-neutral-900">
                      <button
                        type="button"
                        onClick={() => { setEditingBlog(null); setSeoResult(null); }}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
                      >
                        Batal
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Terbitkan Artikel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 h-10 uppercase text-[10px]">
                        <th>Kab/Kota NTB</th>
                        <th>Judul Artikel</th>
                        <th>Views</th>
                        <th>Focus Keyword</th>
                        <th className="text-center">Skor SEO</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(b => (
                        <tr key={b.id} className="border-b border-neutral-900 h-12 text-neutral-300 hover:bg-neutral-900/30">
                          <td className="font-bold text-emerald-400 text-xs uppercase">{b.city}</td>
                          <td className="font-medium max-w-[250px] truncate" title={b.title}>{b.title}</td>
                          <td className="font-mono">{b.views} views</td>
                          <td>
                            <code className="bg-neutral-900 text-emerald-300 border border-neutral-850 px-1.5 py-0.5 rounded font-mono text-[10px]">
                              {b.seoFocusKeyword || "umroh lombok"}
                            </code>
                          </td>
                          <td className="text-center font-bold font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              (b.seoScore || 80) >= 85 ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300"
                            }`}>
                              {b.seoScore || 80}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingBlog(b);
                                  setSeoResult({
                                    seoScore: b.seoScore ?? 80,
                                    keywordDensity: 1.6,
                                    keywordInTitle: true,
                                    keywordInMetaDesc: true,
                                    contentLengthOk: true,
                                    suggestions: b.seoFeedback?.suggestions || ["Artikel sudah terbit."],
                                    seoMetaTitle: b.seoMetaTitle || b.title,
                                    seoMetaDesc: b.seoMetaDesc || ""
                                  });
                                }}
                                className="p-1 px-2.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-[10px] font-bold rounded border border-neutral-800"
                              >
                                Sunting
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="p-1.5 bg-rose-950/40 hover:bg-rose-950 text-rose-400 rounded-lg border border-rose-900/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: Customize Header & Footer */}
        {activeTab === "header_footer" && (
          <form onSubmit={handleSaveHeaderFooter} className="bg-neutral-950 p-6 sm:p-8 rounded-2xl border border-emerald-900/40 space-y-8 animate-fade-in max-w-4xl mx-auto">
            
            {/* Header section editing */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest border-b border-neutral-900 pb-2">
                Tata Letak Header Top & Hotline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Teks Logo Utama</label>
                  <input
                    type="text"
                    required
                    value={editHeaderLogo}
                    onChange={(e) => setEditHeaderLogo(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Sub-Slogan Pembantu Logo</label>
                  <input
                    type="text"
                    required
                    value={editHeaderSub}
                    onChange={(e) => setEditHeaderSub(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">URL Gambar Logo (Kosongkan bila menggunakan inisial teks)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={editHeaderLogoUrl}
                    onChange={(e) => setEditHeaderLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-300 font-mono"
                  />
                  {editHeaderLogoUrl && (
                    <img 
                      src={editHeaderLogoUrl} 
                      alt="Logo preview" 
                      className="w-10 h-10 object-cover rounded-full border-2 border-amber-500 bg-emerald-950 p-0.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=120&q=80';
                      }}
                    />
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Masukkan link URL gambar logo Anda. Klik: 
                  <button 
                    type="button" 
                    onClick={() => setEditHeaderLogoUrl("https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=120&q=80")}
                    className="text-amber-400 underline ml-1 hover:text-amber-300 pointer-events-auto"
                  >
                    Gunakan Preset Emas Islami
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditHeaderLogoUrl("")}
                    className="text-rose-450 underline ml-2 hover:text-rose-400 pointer-events-auto"
                  >
                    Hapus / Pakai Monogram
                  </button>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Slogan Kampanye Utama (Tagline)</label>
                <input
                  type="text"
                  required
                  value={editHeaderTagline}
                  onChange={(e) => setEditHeaderTagline(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">WhatsApp API Hotline (Format 62)</label>
                  <input
                    type="text"
                    required
                    value={editHeaderPhone}
                    onChange={(e) => setEditHeaderPhone(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Hotline Display Formats</label>
                  <input
                    type="text"
                    required
                    value={editHeaderDisplay}
                    onChange={(e) => setEditHeaderDisplay(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Footer section editing */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest border-b border-neutral-900 pb-2">
                Tata Letak Footer Bottom & Alamat Kantor
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Tentang Perusahaan</label>
                <textarea
                  required
                  rows={3}
                  value={editFooterAbout}
                  onChange={(e) => setEditFooterAbout(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Alamat Kantor Pusat Fisik Lombok</label>
                <input
                  type="text"
                  required
                  value={editFooterAddress}
                  onChange={(e) => setEditFooterAddress(e.target.value)}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">No Telepon Kantor</label>
                  <input
                    type="text"
                    required
                    value={editFooterPhone}
                    onChange={(e) => setEditFooterPhone(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Email Kantor Utama</label>
                  <input
                    type="email"
                    required
                    value={editFooterEmail}
                    onChange={(e) => setEditFooterEmail(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-900">
              <button
                type="submit"
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Transaksi Modifikasi Layout
              </button>
            </div>

          </form>
        )}

        {/* Tab 5: Monthly Reports History & Simulated email triggering */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            
            {/* Header layout */}
            <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-neutral-200 uppercase tracking-widest">Laporan Bulanan & Konversi Otomatis</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Menyederhanakan evaluasi performa SEO dan mendistribusikan laporan konversi prospek bulanan langsung menuju kotak surat admin utama (<strong className="text-neutral-300">lombok.alarm@gmail.com</strong>).
                </p>
              </div>

              <button
                onClick={handleGenerateMonthlyReport}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md shrink-0 flex items-center justify-center gap-1"
              >
                <Send className="w-4 h-4" />
                <span>Simulasi Kirim Laporan</span>
              </button>
            </div>

            {/* Historic Reports visual table */}
            <h4 className="font-bold text-xs text-neutral-400 uppercase tracking-wider">Histori Pengiriman Laporan</h4>
            
            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-neutral-950 p-6 rounded-2xl border border-neutral-850 relative overflow-hidden space-y-4">
                  
                  {/* Status header banner */}
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                    <div>
                      <span className="block font-bold text-sm text-amber-300">Laporan Berkala: {rep.period}</span>
                      <span className="block text-[10px] text-neutral-500">Tanggal Generasi: {new Date(rep.dateGenerated).toLocaleDateString()}</span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-semibold text-[10px] uppercase">
                      TERKIRIM KE: {rep.recipientEmail}
                    </span>
                  </div>

                  {/* Summary performance numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-850/50">
                      <span className="block text-[9px] uppercase text-neutral-500">Klik WhatsApp</span>
                      <span className="block font-bold text-emerald-400 text-base">{rep.totalWhatsapp}</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-850/50">
                      <span className="block text-[9px] uppercase text-neutral-500">Form Booking</span>
                      <span className="block font-bold text-amber-300 text-base">{rep.totalBookings}</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-850/50">
                      <span className="block text-[9px] uppercase text-neutral-500">Rasio Konversi</span>
                      <span className="block font-bold text-white text-base">{rep.conversionRate}</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-850/50">
                      <span className="block text-[9px] uppercase text-neutral-500">Top Content</span>
                      <span className="block font-bold text-teal-300 text-base truncate" title={rep.topPerformingContent}>{rep.topPerformingContent}</span>
                    </div>
                  </div>

                  {/* Gemini SEO advice panel */}
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-850 text-xs text-neutral-300 leading-relaxed pt-3 space-y-1.5 shadow-inner">
                    <span className="font-sans font-bold text-amber-400/90 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analisis & Rekomendasi SEO Strategis AI:</span>
                    </span>
                    <p>{rep.aiSeoInsights}</p>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
