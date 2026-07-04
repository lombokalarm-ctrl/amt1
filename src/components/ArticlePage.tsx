import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Clock3, Eye, MapPin, MessageSquare, Sparkles } from "lucide-react";
import { BlogPost } from "../types";
import { getArticleMiniFaqs, getArticleRelatedLinks } from "../content/articleEnhancements";

interface ArticlePageProps {
  slug: string;
  articles: BlogPost[];
  phone: string;
}

function renderInlineFormatting(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-strong-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={`${keyPrefix}-text-${index}`}>{part}</React.Fragment>;
  });
}

function renderArticleContent(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] || "";

    if (/^###\s+/.test(firstLine) && lines.length === 1) {
      return (
        <h2 key={`heading-${blockIndex}`} className="text-xl font-bold text-emerald-950 sm:text-2xl">
          {firstLine.replace(/^###\s+/, "")}
        </h2>
      );
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return (
        <ul key={`list-${blockIndex}`} className="space-y-3 pl-5 text-base leading-8 text-neutral-700">
          {lines.map((line, lineIndex) => (
            <li key={`list-${blockIndex}-${lineIndex}`} className="list-disc">
              {renderInlineFormatting(line.replace(/^[-*]\s+/, ""), `list-${blockIndex}-${lineIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return (
        <ol key={`ordered-${blockIndex}`} className="space-y-3 pl-5 text-base leading-8 text-neutral-700">
          {lines.map((line, lineIndex) => (
            <li key={`ordered-${blockIndex}-${lineIndex}`} className="list-decimal">
              {renderInlineFormatting(line.replace(/^\d+\.\s+/, ""), `ordered-${blockIndex}-${lineIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <div key={`paragraph-group-${blockIndex}`} className="space-y-4">
        {lines.map((line, lineIndex) => (
          <p key={`paragraph-${blockIndex}-${lineIndex}`} className="text-base leading-8 text-neutral-700">
            {renderInlineFormatting(line, `paragraph-${blockIndex}-${lineIndex}`)}
          </p>
        ))}
      </div>
    );
  });
}

export default function ArticlePage({ slug, articles, phone }: ArticlePageProps) {
  const [article, setArticle] = useState<BlogPost | null>(() => articles.find((item) => item.slug === slug) || null);

  useEffect(() => {
    setArticle(articles.find((item) => item.slug === slug) || null);
  }, [articles, slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadArticle() {
      try {
        const response = await fetch(`/api/blogs/${slug}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setArticle(data);
        }
      } catch (error) {
        console.warn("Failed loading article page:", error);
      }
    }

    void loadArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const articleMiniFaqs = useMemo(() => getArticleMiniFaqs(slug), [slug]);
  const articleRelatedLinks = useMemo(() => getArticleRelatedLinks(slug), [slug]);
  const relatedArticles = articleRelatedLinks
    .map((item) => ({
      ...item,
      article: articles.find((entry) => entry.slug === item.slug),
    }))
    .filter((item) => item.article);

  if (!article) {
    return (
      <section className="bg-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-900/40 bg-neutral-900 p-8 text-center shadow-2xl">
            <span className="inline-flex rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              Artikel Tidak Ditemukan
            </span>
            <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Halaman artikel ini belum tersedia</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
              URL artikel mungkin sudah berubah, belum tersinkron ke browser Anda, atau slug yang dibuka sudah tidak aktif.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/#artikel"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Kembali ke Daftar Artikel
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-800 px-5 py-3 text-sm font-bold text-emerald-200 transition-colors hover:bg-emerald-950"
              >
                Buka Beranda
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const whatsappHref = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Assalamu'alaikum Amantubillahi Tour, saya membaca artikel "${article.title}" dan ingin konsultasi paket umrah.`,
  )}`;
  const articleDescription = article.seoMetaDesc?.trim() || article.content.replace(/\s+/g, " ").trim().slice(0, 180);

  return (
    <section className="bg-neutral-950 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-emerald-300">
          <a href="/" className="inline-flex items-center gap-2 text-emerald-300 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </a>
          <span className="text-emerald-700">/</span>
          <a href="/#artikel" className="transition-colors hover:text-white">
            Artikel & SEO
          </a>
          <span className="text-emerald-700">/</span>
          <span className="text-amber-300">{article.city}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <article className="overflow-hidden rounded-[28px] border border-emerald-900/50 bg-white shadow-2xl">
            <div
              className="relative min-h-[260px] bg-cover bg-center px-6 py-10 sm:min-h-[340px] sm:px-10 sm:py-14"
              style={{
                backgroundImage: article.imageUrl
                  ? `linear-gradient(rgba(5, 46, 32, 0.72), rgba(5, 46, 32, 0.92)), url('${article.imageUrl}')`
                  : "linear-gradient(135deg, #064e3b, #0f766e)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="relative z-10 max-w-3xl space-y-5">
                <span className="inline-flex rounded-full bg-emerald-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200">
                  {article.seoFocusKeyword}
                </span>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-100 sm:text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    {article.city}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1">
                    <Clock3 className="h-4 w-4" />
                    {article.readTimeMin} menit baca
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1">
                    <Eye className="h-4 w-4" />
                    {article.views} views
                  </span>
                </div>

                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{article.title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-emerald-50 sm:text-base">{articleDescription}</p>
              </div>
            </div>

            <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-6">{renderArticleContent(article.content)}</div>

              {articleMiniFaqs.length > 0 && (
                <section className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 sm:p-8">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      FAQ Mini Artikel
                    </span>
                    <h2 className="text-2xl font-bold text-emerald-950">Pertanyaan yang sering muncul</h2>
                  </div>

                  <div className="space-y-4">
                    {articleMiniFaqs.map((faq) => (
                      <div key={faq.q} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                        <h3 className="text-base font-bold text-neutral-900">{faq.q}</h3>
                        <p className="mt-2 text-sm leading-7 text-neutral-700">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-amber-950">Siap konsultasi paket umrah?</h2>
                    <p className="max-w-2xl text-sm leading-7 text-amber-900">
                      Tim Amantubillahi siap membantu Anda membandingkan paket, memeriksa syarat pendaftaran, dan menentukan jadwal keberangkatan yang paling sesuai.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="/#booking"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                    >
                      Booking Konsultasi
                    </a>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-bold text-amber-950 transition-colors hover:bg-amber-100"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat WhatsApp
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-emerald-900/40 bg-neutral-900 p-6 shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Ringkasan Artikel</span>
              <div className="mt-5 space-y-4 text-sm text-neutral-300">
                <div className="flex items-start justify-between gap-3 border-b border-emerald-900/50 pb-4">
                  <span>Keyword Fokus</span>
                  <span className="text-right font-semibold text-white">{article.seoFocusKeyword}</span>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-emerald-900/50 pb-4">
                  <span>Wilayah</span>
                  <span className="text-right font-semibold text-white">{article.city}</span>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-emerald-900/50 pb-4">
                  <span>Publikasi</span>
                  <span className="text-right font-semibold text-white">{article.date}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>Estimasi Baca</span>
                  <span className="text-right font-semibold text-white">{article.readTimeMin} menit</span>
                </div>
              </div>
            </div>

            {relatedArticles.length > 0 && (
              <div className="rounded-[28px] border border-emerald-900/40 bg-neutral-900 p-6 shadow-2xl">
                <h2 className="text-sm font-bold uppercase tracking-widest text-amber-300">Artikel Terkait</h2>
                <div className="mt-5 space-y-3">
                  {relatedArticles.map(({ slug: relatedSlug, label, article: relatedArticle }) => (
                    <a
                      key={relatedSlug}
                      href={`/artikel/${relatedSlug}`}
                      className="block rounded-2xl border border-emerald-900/50 bg-neutral-950 p-4 transition-colors hover:border-emerald-700 hover:bg-neutral-950/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold leading-6 text-white">{label}</h3>
                          {relatedArticle && (
                            <p className="mt-1 text-xs leading-5 text-neutral-400">
                              {relatedArticle.city} • {relatedArticle.date}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
