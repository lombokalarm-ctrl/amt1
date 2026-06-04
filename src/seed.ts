import { UmrahPackage, BlogPost, HeaderConfig, FooterConfig, Booking, StatsData, EmailReport } from "./types";

export const initialPackages: UmrahPackage[] = [
  {
    id: "pkg-1",
    title: "Paket Umroh Al-Haram Lombok (Bintang 5)",
    duration: "12 Hari",
    price: 34500000,
    hotelMakkah: "Pullman ZamZam Makkah",
    hotelMadinah: "Pullman Nokhba Madinah",
    hotelStars: 5,
    flights: "Direct Flight Lombok (LOP) ke Jeddah - Lion Air Premium / Saudia",
    departureDate: "15 September 2026",
    facilities: [
      "Tiket Pesawat Pulang Pergi Kelas Ekonomi",
      "Visa Umrah Resmi",
      "Hotel Bintang 5 Dekat dengan Masjidil Haram",
      "Makan 3x Sehari Menu Indonesia (Fullboard Catering)",
      "Ziarah Makkah & Madinah dengan Bus AC Executive",
      "Mutawwif Berpengalaman asal Lombok",
      "Air Zam-Zam 5 Liter",
      "Perlengkapan Umroh Lengkap (Koper, Kain Ihram/Mukena, Buku Panduan)",
      "Manasik Umroh Intensif di Hotel Mataram"
    ],
    description: "Paket Umroh Premium Amantubillahi dirancang khusus bagi jamaah asal Lombok yang mengutamakan kenyamanan maksimal. Jarak hotel yang sangat dekat dari Masjidil Haram (<100m) memudahkan jamaah lansia maupun keluarga untuk melaksanakan shalat fardhu dan ibadah sunnah 24 jam dengan nyaman.",
    imageUrl: "/src/assets/images/pilgrims_kaaba_1780615470405.png", // Taj Al Safwah / Kaaba view representation
    active: true
  },
  {
    id: "pkg-2",
    title: "Paket Umroh Berkah Syawal Lombok (Bintang 4)",
    duration: "12 Hari",
    price: 28500000,
    hotelMakkah: "Anjum Hotel Makkah",
    hotelMadinah: "Al Aqeeq Madinah",
    hotelStars: 4,
    flights: "Direct Transit Lombok (LOP) ke Madinah - Garuda Indonesia",
    departureDate: "20 Oktober 2026",
    facilities: [
      "Tiket Pesawat Garuda Indonesia Lombok - Jakarta - Madinah",
      "Visa Umrah Resmi & Asuransi",
      "Hotel Bintang 4 Berkualitas Tinggi",
      "Makan Buffet Hotel Nusantara 3x Sehari",
      "Bimbingan Ibadah Sesuai Sunnah oleh Ustadz Ahlussunnah Syar'i",
      "Ziarah Kota Masehi di Madinah & Makkah",
      "Manasik Umroh 2 Kali di Kota Mataram dan Selong",
      "Air Zam-Zam 5 Liter"
    ],
    description: "Paket terpopuler untuk masyarakat Lombok Timur, Lombok Tengah, dan Barat. Menyajikan perpaduan sempurna antara harga hemat terjangkau dan fasilitas berkelas berbintang empat. Menawarkan pengalaman ibadah yang tenang, teratur, dan penuh kekeluargaan.",
    imageUrl: "/src/assets/images/pilgrims_couple_1780615457585.png", // Medina Mosque representation
    active: true
  },
  {
    id: "pkg-3",
    title: "Paket Umroh Hemat Lailatul Qadr Lombok (Bintang 3)",
    duration: "10 Hari",
    price: 24900000,
    hotelMakkah: "Fajr Al Badea Makkah",
    hotelMadinah: "Al Madinah Concorde",
    hotelStars: 3,
    flights: "Lombok - Transit Kuala Lumpur - Jeddah (AirAsia / Lion)",
    departureDate: "05 November 2026",
    facilities: [
      "Tiket Penerbangan Internasional Lombok - Jeddah PP",
      "Visa Umrah Lengkap",
      "Hotel Nyaman Jarak +/- 400m dengan Layanan Shuttel Bus 24 Jam",
      "Makan Katering Masakan Indonesia",
      "Mutawwif Berbahasa Sasak & Indonesia",
      "Perlengkapan Dasar Umroh",
      "Air Zam-Zam 5 Liter"
    ],
    description: "Sangat direkomendasikan untuk Anda yang mencari travel umroh lombok termurah tanpa mengurangi keabsahan ibadah. Didampingi tour leader berpengalaman asal Mataram yang ramah dan siap membantu kebutuhan pribadi jamaah kapan pun.",
    imageUrl: "/src/assets/images/pilgrims_group_1780615485518.png", // Kaaba representation
    active: true
  }
];

export const initialBlogs: BlogPost[] = [
  {
    id: "blog-1",
    title: "Travel Umroh Lombok Terpercaya: Panduan Lengkap Jamaah Mataram & Lombok Barat",
    slug: "travel-umroh-lombok-mataram-barat",
    city: "Mataram",
    date: "2026-05-10",
    views: 342,
    readTimeMin: 6,
    tags: ["Travel Umroh Lombok", "Mataram", "Lombok Barat"],
    imageUrl: "/src/assets/images/pilgrims_airport_1780615443945.png",
    seoFocusKeyword: "travel umroh lombok",
    seoMetaTitle: "Travel Umroh Lombok Terpercaya - Amantubillahi Tour Mataram",
    seoMetaDesc: "Mencari travel umroh lombok terpercaya di Mataram dan Lombok Barat? Dapatkan panduan lengkap biaya, syarat pendaftaran, dan rincian hotel bintang Amantubillahi.",
    content: `Melaksanakan ibadah umrah ke baitullah adalah impian setiap Muslim, termasuk masyarakat di **Kota Mataram** dan Kabupaten **Lombok Barat**. Namun, untuk menjaga kekhusyukan dan kenyamanan selama beribadah, pemilihan agen **travel umroh lombok** yang amanah dan terpercaya menjadi faktor yang sangat vital.

Sebagai salah satu penyedia **travel umrah lombok** resmi yang berkantor di pusat Kota Mataram, **Amantubillahi** (amantubillahi.com) berkomitmen menyajikan bimbingan umrah yang sesuai dengan tuntunan sunnah Rasulullah Shallallahu 'Alaihi Wasallam, didukung fasilitas berkelas.

### Mengapa Memilih Travel Umroh Terpercaya Amantubillahi di Lombok?

1. **Izin Resmi Kementerian Agama**: Amantubillahi menjamin keamanan keberangkatan jamaah dengan legalitas lengkap. No izin PPUI terverifikasi, menjamin Anda terhindar dari penipuan travel bodong.
2. **Penerbangan Langsung dari bandara Lombok (LOP)**: Kami menyediakan paket penerbangan langsung atau transit minimalis untuk meminimalkan kelelahan jamaah, khususnya jamaah lanjut usia dari Ampenan, Narmada, Gerung, dan Sekotong.
3. **Pilihan Hotel Dekat Masjid**: Mulai hotel Bintang 3 hemat hingga Bintang 5 premium seperti Pullman Zamzam, memberikan kedekatan akses fisik ke Masjidil Haram dan Masjid Nabawi.

### Rute dan Manasik Intensif di Mataram
Sebelum keberangkatan, jamaah dari wilayah Mataram, Gerung, Kediri, Lingsar hingga Gunungsari akan mengikuti manasik umroh eksklusif sebanyak minimal 2 kali. Pembimbing ibadah kami siap membekali jamaah baik secara fikih ibadah maupun tips kesehatan fisik, sehingga ibadah umrah Anda berjalan lancar makbul dan mabrur.

Hubungi kantor pelayanan terdekat kami di Mataram atau klik tombol WhatsApp di pojok website untuk konsultasi gratis mengenai jadwal keberangkatan terdekat!`,
    seoScore: 92,
    seoFeedback: {
      keywordDensity: 1.8,
      keywordInTitle: true,
      keywordInMetaDesc: true,
      contentLengthOk: true,
      suggestions: [
        "Tambahkan tautan internal menuju halaman booking paket untuk memperkuat konversi.",
        "Gunakan variasi kata kunci 'travel umrah lombok termurah' satu kali lagi di paragraf penutup."
      ]
    }
  },
  {
    id: "blog-2",
    title: "Biaya dan Jadwal Keberangkatan Umrah Lombok Terbaru untuk warga Lombok Tengah & Praya",
    slug: "biaya-jadwal-umrah-lombok-tengah-praya",
    city: "Lombok Tengah",
    date: "2026-05-18",
    views: 289,
    readTimeMin: 5,
    tags: ["Umrah Lombok", "Praya", "Lombok Tengah"],
    imageUrl: "/src/assets/images/pilgrims_kaaba_1780615470405.png",
    seoFocusKeyword: "umrah lombok",
    seoMetaTitle: "Biaya Paket Umrah Lombok Terbaru 2026 - Amantubillahi Praya",
    seoMetaDesc: "Info jadwal keberangkatan dan biaya paket umrah lombok terbaru untuk warga Praya, Lombok Tengah. Hubungi travel umrah terdekat berizin resmi Kemenag.",
    content: `Bagi kaum muslimin di wilayah **Lombok Tengah**, khususnya yang bertempat tinggal di **Praya**, Kopang, Jonggat, Pujut, dan sekitarnya, kini merencanakan perjalanan ibadah suci semakin mudah. Lokasi bandara internasional Lombok yang berada di Lombok Tengah memberikan keuntungan tersendiri dalam kemudahan transportasi menuju bandara pendaftaran **umrah lombok**.

**Amantubillahi** menawarkan rincian harga paket umrah yang transparan secara komprehensif tanpa biaya tambahan tersembunyi.

### Rincian Biaya Umroh Lombok 2026/2027

Kami memahami bahwa setiap jamaah memiliki budget dan kebutuhan akomodasi berbeda:
- **Paket Hemat (Bintang 3)**: Mulai Rp 24,9 Juta. Cocok untuk jamaah yang menginginkan perjalanan low-budget namun tetap nyaman secara syar'i.
- **Paket Berkah (Bintang 4)**: Mulai Rp 28,5 Juta. Pilihan seimbang, menggunakan fasilitas akomodasi hotel bintang empat yang berlokasi strategis di Makkah dan Madinah.
- **Paket VIP (Bintang 5)**: Mulai Rp 34,5 Juta. Menyediakan fasilitas hotel terbaik dengan view menghadap Ka'bah serta menu makanan premium.

### Kemudahan bagi Jamaah Praya Lombok Tengah
Kami menyediakan layanan pick-up dokumen dan pendaftaran umrah langsung ke rumah Anda bagi warga Lombok Tengah yang sibuk. Tim Amantubillahi siap membantu Anda mulai dari pembuatan paspor di imigrasi, rekomendasi suntik vaksin, koper perlengkapan hingga bimbingan manasik di wilayah Praya.

Segera daftarkan diri Anda dan keluarga untuk mengamankan seat penerbangan umrah Lombok musim ini!`,
    seoScore: 88,
    seoFeedback: {
      keywordDensity: 1.5,
      keywordInTitle: true,
      keywordInMetaDesc: true,
      contentLengthOk: true,
      suggestions: [
        "Tambahkan sub-keyword 'travel umroh lombok terpercaya' di bagian tengah artikel.",
        "Gunakan penomoran daftar hotel di Praya atau lokasi manasik untuk meningkatkan readability."
      ]
    }
  },
  {
    id: "blog-3",
    title: "Tips Memilih Travel Umroh Terdekat di Lombok Timur: Fokus Selong & Masbagik",
    slug: "travel-umroh-terdekat-lombok-timur-selong-masbagik",
    city: "Lombok Timur",
    date: "2026-05-25",
    views: 412,
    readTimeMin: 7,
    tags: ["Travel Umroh Terdekat", "Lombok Timur", "Selong", "Masbagik"],
    imageUrl: "/src/assets/images/pilgrims_group_1780615485518.png",
    seoFocusKeyword: "travel umroh terdekat",
    seoMetaTitle: "Travel Umroh Terdekat di Lombok Timur - Selong & Masbagik",
    seoMetaDesc: "Cari travel umroh terdekat di Lombok Timur? Temukan Amantubillahi Tour di dekat Selong, Masbagik, Aikmel. Dapatkan layanan amanah resmi Kemenag.",
    content: `Kabupaten **Lombok Timur** dikenal sebagai daerah dengan tingkat religiusitas masyarakat yang sangat tinggi. Permintaan keberangkatan umroh dari wilayah **Selong**, **Masbagik**, Pancor, Aikmel, Sakra, hingga Pringgabaya selalu mendominasi setiap tahunnya.

Bagi jamaah di Lombok Timur, jarak fisik terkadang menjadi pertimbangan dalam mengurus administrasi pendaftaran. Oleh karena itu, mencari **travel umroh terdekat** yang memiliki perwakilan lokal yang kredibel adalah solusi terbaik.

### Amantubillahi hadir lebih dekat di Lombok Timur!

Kami menyediakan kemudahan konsultasi tatap muka dan penyerahan dokumen koper bagi jamaah di Selong dan Masbagik melalui perwakilan resmi khusus kami. Jamaah tidak perlu bolak-balik ke kota Mataram hanya untuk mengurus paspor atau melengkapi berkas administrasi.

### Keuntungan Memilih Agen Travel Rekomendasi Kami:
- **Pelayanan Lokal Terpercaya**: Mengurangi kebingungan jamaah pedesaan mengenai teknologi atau pengurusan berkas digital.
- **Pembimbing Asli Daerah Gumi Sasak**: Mutawwif dan pembimbing ibadah kami berlatar belakang asatidzah yang ramah, memahami kultur lokal suku Sasak, sehingga komunikasi selama di tanah suci terjalin penuh rasa kekeluargaan yang erat.
- **Transparansi Legalitas**: Menghindari resiko keberangkatan tertunda atau batal yang kerap terjadi pada agen umroh ilegal.

Dapatkan informasi terlengkap mengenai paket keberangkatan musim ini dengan mengisi form booking online kami atau langsung chat ke Customer support WhatsApp kami sekarang juga!`,
    seoScore: 90,
    seoFeedback: {
      keywordDensity: 1.6,
      keywordInTitle: true,
      keywordInMetaDesc: true,
      contentLengthOk: true,
      suggestions: [
        "Optimalkan judul dengan menambahkan kata 'Lombok' untuk hasil pencarian lokal.",
        "Sertakan alamat lengkap perwakilan Lombok Timur di bagian dalam konten."
      ]
    }
  },
  {
    id: "blog-4",
    title: "Rekomendasi Travel Umroh Lombok untuk Warga Sumbawa, Sumbawa Barat & Dompu",
    slug: "rekomendasi-travel-umrah-lombok-sumbawa-dompu",
    city: "Sumbawa",
    date: "2026-06-02",
    views: 198,
    readTimeMin: 5,
    tags: ["Travel Umrah Terpercaya", "Sumbawa", "Sumbawa Barat", "Dompu"],
    imageUrl: "/src/assets/images/man_ihram_pray_1780615496601.png",
    seoFocusKeyword: "travel umrah terpercaya",
    seoMetaTitle: "Travel Umrah Terpercaya Sumbawa, KSB & Dompu - Amantubillahi",
    seoMetaDesc: "Rekomendasi travel umrah terpercaya pendaftaran wilayah Sumbawa, Sumbawa Barat, Dompu dengan keberangkatan via Lombok. Simak bimbingan umroh syar'i Amantubillahi.",
    content: `Masyarakat di Pulau Sumbawa, baik itu dari Kabupaten **Sumbawa Besar**, **Sumbawa Barat (KSB)**, Dan **Dompu**, kini memiliki akses yang sangat lancar untuk beribadah umroh bersinergi dengan **travel umrah terpercaya** Amantubillahi Lombok.

Sebagai agen perjalanan umrah berizin terakreditasi, kami menyediakan skema akomodasi penjemputan dari Pelabuhan Poto Tano maupun bandara Sultan Muhammad Kaharuddin Sumbawa menuju bandara Lombok untuk penerbangan internasional umrah Anda.

### Layanan Istimewa Bagi Jamaah asal Pulau Sumbawa & Dompu:

1. **Akomodasi Terintegrasi**: Kami membantu mengoordinasikan tiket domestik atau penyeberangan feri cepat bagi rombongan jamaah asal Sumbawa Barat, Sumbawa, maupun Dompu.
2. **Manasik Desentralisasi / Online**: Memudahkan jamaah yang berada jauh dari Mataram demi efisiensi jarak dan waktu dengan metode manasik hibrida (gabungan tatap muka lokal dan pengiriman video panduan manasik).
3. **Pengurusan Paspor Kolektif**: Koordinasi kantor imigrasi Sumbawa Besar maupun imigrasi Bima untuk mempermudah pendaftaran berkas koper.

### Keutamaan Umroh Sesuai Sunnah Amantubillahi
Kami membimbing jamaah untuk benar-benar memahami rukun umroh sesuai petunjuk Al-Qur'an dan As-Sunnah. Pembimbing siap siaga menemani setiap langkah ibadah tawaf, sa'i, hingga tahallul demi kemantapan spiritual jasmani bathin Anda selama di tanah suci.

Hubungi hotline kami atau kirimkan form pemesanan booking online Anda untuk penjadwalan seat keberangkatan umroh Lombok Anda sekeluarga!`,
    seoScore: 85,
    seoFeedback: {
      keywordDensity: 1.4,
      keywordInTitle: true,
      keywordInMetaDesc: true,
      contentLengthOk: true,
      suggestions: [
        "Tambahkan keyword penelusuran lokal 'travel umroh lombok' untuk mengoptimalkan SEO regional NTB.",
        "Gunakan tag gambar islami yang menarik bertema Ka'bah untuk mencerahkan konten."
      ]
    }
  },
  {
    id: "blog-5",
    title: "Kemudahan Pendaftaran Umroh Lombok bagi Masyarakat Bima dan Sekitarnya",
    slug: "pendaftaran-umroh-lombok-bima",
    city: "Bima",
    date: "2026-06-03",
    views: 167,
    readTimeMin: 4,
    tags: ["Umrah Lombok", "Bima", "Kota Bima"],
    imageUrl: "/src/assets/images/pilgrims_couple_1780615457585.png",
    seoFocusKeyword: "travel umrah terdekat",
    seoMetaTitle: "Pendaftaran Travel Umrah Terdekat di Bima NTB | Amantubillahi",
    seoMetaDesc: "Daftar Umroh Lombok kini lebih praktis untuk jamaah Kota Bima & Kabupaten Bima. Amantubillahi Tour travel umrah terdekat yang amanah resmi Kemenag.",
    content: `Bagi jamaah muslim di **Kota Bima**, **Kabupaten Bima**, Sape, Woha, Bolo, dan sekitarnya yang berniat menunaikan umroh, Amantubillahi memberikan kemudahan maksimal. Kami hadir sebagai solusi **travel umrah terdekat** dengan layanan jemput berkas (Home-Service registration) langsung ke alamat rumah Anda.

Meskipun kota Bima terletak di ujung timur NTB, kerja sama rute penerbangan dan penanganan jamaah kami sangat solid demi kelancaran ibadah jamaah Dana Mbojo.

### Langkah Praktis Mendaftar Umrah Lombok dari Bima:

1. **Konsultasi Online / WhatsApp**: Diskusikan kebutuhan paket umroh Anda, apakah memilih paket hemat atau paket VIP bintang lima.
2. **Jemput Berkas Administrasi**: Tim representatif kami di Bima siap mengambil dokumen paspor, buku nikah, kartu keluarga, dan foto jamaah tanpa perlu ke Mataram.
3. **Manasik Terjadwal di Bima**: Menjelang keberangkatan, kami menyelenggarakan sesi manasik khusus di Bima yang dipandu asatidz pembimbing umroh kami yang berpengalaman luas di tanah suci.

### Mematangkan Niat Ibadah dengan Travel Terpercaya amantubillahi.com
Kami menjamin kepastian tanggal berangkat, penginapan hotel berizin akreditasi, dan pendampingan ekstra ramah bagi setiap jamaah. Kepercayaan Anda merupakan amanah mulia yang kami layani dengan sepenuh hati ketulusan ikhlas.

Gunakan fitur booking online di website kami hari ini untuk mengunci kuota keberangkatan Anda!`,
    seoScore: 89,
    seoFeedback: {
      keywordDensity: 1.5,
      keywordInTitle: true,
      keywordInMetaDesc: true,
      contentLengthOk: true,
      suggestions: [
        "Gunakan visualisasi map penjemputan Bima ke bandara Lombok untuk kemudahan visual jamaah.",
        "Sebutkan maskapai penerbangan transit domestik Bima-Lombok."
      ]
    }
  }
];

export const initialHeader: HeaderConfig = {
  logoText: "Amantubillahi",
  logoSub: "Tour & Travel Umroh Lombok",
  tagline: "Melayani dengan Hati, Membimbing sesuai Sunnah Rasulullah",
  phone: "6281907087999",
  phoneDisplay: "+62 819-0708-7999",
  menus: [
    { label: "Beranda", href: "#" },
    { label: "Paket Umrah", href: "#paket" },
    { label: "Keunggulan", href: "#keunggulan" },
    { label: "Artikel & SEO", href: "#artikel" },
    { label: "Booking Online", href: "#booking" }
  ],
  logoImageUrl: ""
};

export const initialFooter: FooterConfig = {
  aboutText: "Amantubillahi (amantubillahi.com) adalah agen travel umroh berizin resmi dan terpercaya di Lombok, Nusa Tenggara Barat. Kami melayani keberangkatan jamaah umrah dari seluruh wilayah NTB dengan komitmen pelayanan prima, akomodasi berbintang yang dekat dengan masjid, dan pendampingan ibadah murni sesuai sunnah.",
  address: "Jl. Langko No. 45, Ampenan, Kota Mataram, Nusa Tenggara Barat 83114 (Sebelah Barat Kantor Gubernur NTB)",
  phone: "+62 819-0708-7999",
  email: "info@amantubillahi.com",
  facebookUrl: "https://facebook.com/amantubillahi.umrohlombok",
  instagramUrl: "https://instagram.com/amantubillahi.umrohlombok",
  youtubeUrl: "https://youtube.com/amantubillahi.umrohlombok",
  copyrightText: "© 2026 amantubillahi.com. All Rights Reserved. Izin Umroh Kemenag No: 08022200332870003 | Travel Umroh Lombok Terpercaya."
};

export const initialStats: StatsData = {
  totalViews: 1408,
  viewsByPage: {
    "Beranda": 820,
    "Paket Umrah": 310,
    "Artikel: travel-umroh-lombok-mataram-barat": 142,
    "Artikel: biaya-jadwal-umrah-lombok-tengah-praya": 110,
    "Artikel: travel-umroh-terdekat-lombok-timur-selong-masbagik": 126
  },
  viewsByCity: {
    "Mataram": 412,
    "Lombok Barat": 180,
    "Lombok Tengah": 204,
    "Lombok Timur": 245,
    "Sumbawa": 120,
    "Bima": 95,
    "Dompu": 60,
    "Praya": 92
  },
  whatsappClicks: 184,
  bookingSubmissions: 32,
  bookings: [
    {
      id: "b-1",
      fullName: "Haji Ahmad Fauzi",
      phone: "081912345678",
      city: "Mataram",
      packageId: "pkg-1",
      packageName: "Paket Umroh Al-Haram Lombok (Bintang 5)",
      passengersCount: 2,
      notes: "Mohon kamar double untuk suami istri.",
      date: "2026-06-01",
      status: "Dihubungi"
    },
    {
      id: "b-2",
      fullName: "Siti Rahmawati",
      phone: "087865231900",
      city: "Selong, Lombok Timur",
      packageId: "pkg-2",
      packageName: "Paket Umroh Berkah Syawal Lombok (Bintang 4)",
      passengersCount: 4,
      notes: "Keluarga rombongan, mohon didekatkan kamarnya.",
      date: "2026-06-03",
      status: "Pending"
    },
    {
      id: "b-3",
      fullName: "Ustadz Lalu Yusuf",
      phone: "081299887766",
      city: "Praya, Lombok Tengah",
      packageId: "pkg-1",
      packageName: "Paket Umroh Al-Haram Lombok (Bintang 5)",
      passengersCount: 1,
      notes: "Keberangkatan pribadi.",
      date: "2026-06-04",
      status: "Pending"
    }
  ],
  dailyStats: [
    { date: "2026-05-29", views: 42, whatsapp: 5, bookings: 1 },
    { date: "2026-05-30", views: 48, whatsapp: 6, bookings: 0 },
    { date: "2026-05-31", views: 55, whatsapp: 7, bookings: 2 },
    { date: "2026-06-01", views: 64, whatsapp: 8, bookings: 1 },
    { date: "2026-06-02", views: 72, whatsapp: 10, bookings: 0 },
    { date: "2026-06-03", views: 85, whatsapp: 12, bookings: 2 },
    { date: "2026-06-04", views: 98, whatsapp: 15, bookings: 1 }
  ]
};

export const initialReports: EmailReport[] = [
  {
    id: "rep-1",
    period: "Mei 2026",
    dateGenerated: "2026-06-01T01:00:00Z",
    totalViews: 1210,
    totalBookings: 21,
    totalWhatsapp: 120,
    conversionRate: "11.6%",
    topPerformingContent: "Artikel Lombok Timur (Selong & Masbagik)",
    aiSeoInsights: "Artikel SEO Lombok Timur mendapatkan lonjakan organik tajam. Disarankan menambah kampanye paket khusus keberangkatan keluarga di Lombok Barat.",
    recipientEmail: "lombok.alarm@gmail.com",
    status: "Sent"
  }
];
