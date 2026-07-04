export interface ArticleMiniFaqEntry {
  q: string;
  a: string;
}

export interface ArticleRelatedLink {
  slug: string;
  label: string;
}

const articleMiniFaqs: Record<string, readonly ArticleMiniFaqEntry[]> = {
  "biaya-umrah-lombok-murah-2026": [
    {
      q: "Apakah biaya umrah Lombok murah sudah termasuk visa dan hotel?",
      a: "Tergantung paket yang dipilih. Jamaah perlu meminta rincian tertulis agar jelas apakah visa, hotel, makan, perlengkapan, dan manasik sudah termasuk di dalam harga paket umrah Lombok murah yang ditawarkan."
    },
    {
      q: "Kapan waktu terbaik mencari biaya umrah Lombok murah?",
      a: "Waktu terbaik biasanya saat mendaftar lebih awal sebelum musim ramai. Pendaftaran dini membantu jamaah mendapatkan seat penerbangan, pilihan hotel, dan harga paket yang lebih stabil."
    },
    {
      q: "Apa risiko memilih paket umrah yang terlalu murah?",
      a: "Risiko utamanya adalah rincian biaya tidak transparan, fasilitas tidak sesuai ekspektasi, atau ada komponen penting yang belum termasuk. Karena itu jamaah perlu membandingkan isi paket, bukan hanya harga paling rendah."
    }
  ],
  "cara-memilih-travel-umrah-lombok-murah": [
    {
      q: "Bagaimana cara mengecek travel umrah Lombok murah yang resmi?",
      a: "Jamaah perlu memastikan legalitas travel jelas, kantor atau alamat mudah diverifikasi, admin responsif, dan rincian program dijelaskan secara terbuka sebelum pembayaran dilakukan."
    },
    {
      q: "Apakah travel umrah murah selalu berisiko?",
      a: "Tidak selalu. Paket hemat tetap bisa aman bila travel memiliki izin resmi, jadwal keberangkatan realistis, dan rincian biaya dijelaskan dengan jujur serta tertulis."
    },
    {
      q: "Apa tanda travel umrah murah yang perlu diwaspadai?",
      a: "Waspadai harga yang terlalu rendah tanpa rincian, informasi yang sulit diverifikasi, dan tekanan untuk cepat transfer tanpa penjelasan lengkap mengenai paket, hotel, atau jadwal."
    }
  ],
  "syarat-pendaftaran-umrah-lombok-murah": [
    {
      q: "Dokumen apa yang biasanya dibutuhkan untuk daftar umrah Lombok murah?",
      a: "Secara umum jamaah perlu menyiapkan paspor, identitas, data keluarga, pas foto, dan dokumen pendukung lain sesuai permintaan travel agar proses verifikasi lebih lancar."
    },
    {
      q: "Apakah pembayaran DP wajib saat booking paket umrah?",
      a: "Pada banyak program, DP dipakai untuk mengunci seat dan memulai administrasi. Namun jamaah sebaiknya memastikan dulu nama paket, jadwal, nominal DP, dan skema pelunasan sebelum melakukan pembayaran."
    },
    {
      q: "Bagaimana agar proses pendaftaran umrah tidak terlambat?",
      a: "Siapkan dokumen sejak awal, minta checklist resmi dari admin, simpan bukti pembayaran, dan daftar lebih awal agar waktu untuk verifikasi berkas serta pelunasan lebih longgar."
    }
  ]
};

const articleRelatedLinks: Record<string, readonly ArticleRelatedLink[]> = {
  "biaya-umrah-lombok-murah-2026": [
    { slug: "cara-memilih-travel-umrah-lombok-murah", label: "Cara memilih travel umrah Lombok murah yang aman" },
    { slug: "syarat-pendaftaran-umrah-lombok-murah", label: "Syarat pendaftaran umrah Lombok murah" },
    { slug: "biaya-jadwal-umrah-lombok-tengah-praya", label: "Biaya dan jadwal keberangkatan umrah Lombok" }
  ],
  "cara-memilih-travel-umrah-lombok-murah": [
    { slug: "biaya-umrah-lombok-murah-2026", label: "Biaya umrah Lombok murah 2026" },
    { slug: "travel-umroh-lombok-mataram-barat", label: "Travel umroh Lombok terpercaya di Mataram" },
    { slug: "syarat-pendaftaran-umrah-lombok-murah", label: "Syarat pendaftaran umrah Lombok murah" }
  ],
  "syarat-pendaftaran-umrah-lombok-murah": [
    { slug: "biaya-umrah-lombok-murah-2026", label: "Biaya umrah Lombok murah 2026" },
    { slug: "cara-memilih-travel-umrah-lombok-murah", label: "Cara memilih travel umrah Lombok murah" },
    { slug: "pendaftaran-umroh-lombok-bima", label: "Panduan pendaftaran umroh Lombok dari Bima" }
  ]
};

export function getArticleMiniFaqs(slug?: string) {
  if (!slug) {
    return [];
  }

  return articleMiniFaqs[slug] ?? [];
}

export function getArticleRelatedLinks(slug?: string) {
  if (!slug) {
    return [];
  }

  return articleRelatedLinks[slug] ?? [];
}
