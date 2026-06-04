import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

import { 
  initialPackages, 
  initialBlogs, 
  initialHeader, 
  initialFooter, 
  initialStats, 
  initialReports 
} from "./src/seed";
import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, Booking, StatsData, EmailReport } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory "Databases" with default seeded values
let packagesDb: UmrahPackage[] = [...initialPackages];
let blogsDb: BlogPost[] = [...initialBlogs];
let headerDb: HeaderConfig = { ...initialHeader };
let footerDb: FooterConfig = { ...initialFooter };
let statsDb: StatsData = { ...initialStats };
let reportsDb: EmailReport[] = [...initialReports];

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

// Admin Authentication
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, token: "session_token_" + Date.now() });
  } else {
    res.status(401).json({ error: "Username atau Password salah!" });
  }
});

// Live & Up-to-date Packages
app.get("/api/packages", (req, res) => {
  res.json(packagesDb);
});

app.post("/api/packages", (req, res) => {
  const pkgData = req.body as UmrahPackage;
  if (!pkgData.id) {
    pkgData.id = "pkg-" + Date.now();
    packagesDb.push(pkgData);
  } else {
    packagesDb = packagesDb.map(p => p.id === pkgData.id ? pkgData : p);
  }
  res.json({ success: true, package: pkgData });
});

app.delete("/api/packages/:id", (req, res) => {
  const { id } = req.params;
  packagesDb = packagesDb.filter(p => p.id !== id);
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

    res.json(blog);
  } else {
    res.status(404).json({ error: "Blog post not found" });
  }
});

app.post("/api/blogs", (req, res) => {
  const blogData = req.body as BlogPost;
  if (!blogData.id) {
    blogData.id = "blog-" + Date.now();
    blogData.views = 0;
    blogData.date = new Date().toISOString().split('T')[0];
    blogsDb.push(blogData);
  } else {
    blogsDb = blogsDb.map(b => b.id === blogData.id ? { ...b, ...blogData } : b);
  }
  res.json({ success: true, blog: blogData });
});

app.delete("/api/blogs/:id", (req, res) => {
  const { id } = req.params;
  blogsDb = blogsDb.filter(b => b.id !== id);
  res.json({ success: true });
});

// Header and Footer Configs
app.get("/api/header-footer", (req, res) => {
  res.json({ header: headerDb, footer: footerDb });
});

app.post("/api/header-footer", (req, res) => {
  const { header, footer } = req.body;
  if (header) headerDb = { ...headerDb, ...header };
  if (footer) footerDb = { ...footerDb, ...footer };
  res.json({ success: true, header: headerDb, footer: footerDb });
});

// Stats, traffic real-time trackers
app.get("/api/stats", (req, res) => {
  res.json(statsDb);
});

// Log event views/CTAs
app.post("/api/stats/click", (req, res) => {
  const { action, path, city } = req.body;
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

  res.json({ success: true, stats: statsDb });
});

// Bookings
app.post("/api/bookings", (req, res) => {
  const booking = req.body as Partial<Booking>;
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

  res.json({ success: true, booking: finalBooking });
});

app.post("/api/bookings/status", (req, res) => {
  const { id, status } = req.body;
  statsDb.bookings = statsDb.bookings.map(b => b.id === id ? { ...b, status } : b);
  res.json({ success: true });
});

// Yoast-like Live SEO Analyzer utilizing Gemini API!
app.post("/api/seo-analyze", async (req, res) => {
  const { title, content, focusKeyword } = req.body;

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
app.post("/api/reports/generate", async (req, res) => {
  const { period, recipientEmail } = req.body;
  
  const actualPeriod = period || "Juni 2026";
  const actualRecipient = recipientEmail || "lombok.alarm@gmail.com";

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
  res.json({ success: true, report: newReport, allReports: reportsDb });
});

app.get("/api/reports", (req, res) => {
  res.json(reportsDb);
});

// Serve compiled index.html or set up Vite middleware depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
