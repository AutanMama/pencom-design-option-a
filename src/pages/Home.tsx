import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowRight, ChevronLeft, ChevronRight, Pause, Play,
  Search, Users, Download, Calculator, TrendingUp,
  FileCheck, ArrowRightLeft, UserCircle, Heart,
  Calendar, MessageCircle, UserPlus,
  PlayCircle, AlertTriangle,
  Wallet, Building2, Briefcase, Armchair, Globe2,
  MapPin, FileText, Bell, Info, ChevronDown
} from "lucide-react";
import { heroSlides, latestNews, services, faqs } from "@/lib/data";
import { popularSearches } from "@/pages/Search";
import { latestCirculars, isNew } from "@/lib/library";
import ReportGovBadge from "@/components/ReportGovBadge";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CookieConsent from "@/components/CookieConsent";
import PortalHub from "@/components/PortalHub";

// Home page order follows the CCD questionnaire (DES-19):
// 1 audience shortcuts, 2 search + top tasks, 3 alerts, 4 latest circulars,
// 5 online services, 6 news and events, 7 industry figures, 8 FAQs and contacts.
// The large slider is reduced to a smaller feature area (DES-18, DES-19).

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

const openChat = () => window.dispatchEvent(new Event("pencom:open-chat"));

const serviceIcons: Record<string, React.ReactNode> = {
  ArrowRightLeft: <ArrowRightLeft className="w-6 h-6" />,
  UserCircle: <UserCircle className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  FileCheck: <FileCheck className="w-6 h-6" />,
  UserPlus: <UserPlus className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
};

// 1. "I am a..." shortcuts (retirees first, as the 13 Nov meeting asked)
const audiences = [
  { label: "Retiree", icon: Armchair, text: "Get your benefits, Pencare, programmed withdrawal or annuity", href: "/services#retirement", featured: true },
  { label: "Contributor", icon: Users, text: "Open or transfer your RSA, check your PFA, plan ahead", href: "/services" },
  { label: "Employer", icon: Briefcase, text: "Register staff, remit on time, get your PCC", href: "/services#pcc" },
  { label: "Operator", icon: Building2, text: "Circulars, regulations, returns and licensing", href: "/regulations" },
  { label: "Member of the public", icon: Globe2, text: "Learn about pensions, news and how to reach us", href: "/about" },
];

// 2. Top tasks (DES-20: these must be one click from home)
const topTasks = [
  { label: "Find your PFA", icon: Users, href: "/operators" },
  { label: "Lodge a complaint", icon: MessageCircle, href: "/connect#complaint" },
  { label: "Pension Clearance Certificate", icon: FileCheck, href: "/services#pcc" },
  { label: "Download forms", icon: Download, href: "/resources#downloads" },
  { label: "Pension calculator", icon: Calculator, href: "/services#calculator" },
  { label: "Zonal offices", icon: MapPin, href: "/connect#zonal" },
];

// 3. Alerts, highest level first (fraud warnings first)
const alerts = [
  { level: "Urgent", title: "Fraud alert: PenCom will never ask for your PIN", text: "Do not share your RSA PIN, passwords or bank card details with anyone who calls, texts or messages you claiming to be from PenCom.", date: "2026-11-14", href: "/connect#complaint" },
  { level: "Important", title: "Employers: remit within 7 working days of payday", text: "Late remittance attracts penalties under the Pension Reform Act 2014.", date: "2026-11-03", href: "/services" },
  { level: "Notice", title: "Update your KYC details before 31 December 2026", text: "Visit your PFA to update your Know Your Customer details.", date: "2026-10-28", href: "/operators" },
];
const alertStyle: Record<string, { bg: string; fg: string; icon: typeof AlertTriangle }> = {
  Urgent: { bg: "#FBEAE8", fg: "#9D2B1F", icon: AlertTriangle },
  Important: { bg: "#FBF4E8", fg: "#8A5E1C", icon: Bell },
  Notice: { bg: "#EEF3E8", fg: "#326206", icon: Info },
};

// 7. Industry figures, each with source and date (DES-21). Sample values until approved.
const figures = [
  { label: "Total pension assets", value: "₦20.5 trillion", icon: Wallet },
  { label: "RSA holders", value: "10.2 million+", icon: Users },
  { label: "Licensed PFAs (plus 4 PFCs)", value: "22", icon: Building2 },
  { label: "Years of the Contributory Pension Scheme", value: "22", icon: Calendar },
];

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

// The words and buttons of one hero slide (used for the visible slide and the hidden height-holders)
function SlideText({ s }: { s: (typeof heroSlides)[number] }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-0.5 bg-[#D9A04A]" aria-hidden="true" />
        <span className="text-xs font-semibold text-[#D9A04A] tracking-wider uppercase">{s.subtitle}</span>
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold !text-white leading-tight mb-4">{s.title}</h1>
      <p className="text-base md:text-lg text-white/85 mb-6 leading-relaxed max-w-xl">{s.description}</p>
      <div className="flex flex-wrap gap-3">
        {s.cta.href.startsWith("#chat") ? (
          <button onClick={openChat} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#234504] font-semibold rounded-lg hover:bg-[#EEF3E8] transition-colors">
            <MessageCircle className="w-4 h-4" /> {s.cta.label}
          </button>
        ) : (
          <Link to={s.cta.href} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#234504] font-semibold rounded-lg hover:bg-[#EEF3E8] transition-colors">
            {s.cta.label} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        <Link to={s.secondaryCta.href} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-colors">
          {s.secondaryCta.label}
        </Link>
      </div>
    </>
  );
}

function SectionTitle({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { to: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">{eyebrow}</span>
        <h2 className="text-2xl md:text-3xl font-bold mt-1">{title}</h2>
      </div>
      {link && (
        <Link to={link.to} className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#326206] hover:underline">
          {link.label} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!playing || hovering) return;
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 7000);
    return () => clearInterval(timer);
  }, [playing, hovering]);

  const slide = heroSlides[currentSlide];
  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <CookieConsent />

      {/* Feature area: smaller than before so it doesn't push key information down */}
      <section
        className="relative overflow-hidden pb-24"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-roledescription="carousel"
        aria-label="Featured"
      >
        {/* Crossfade: the new picture fades in ON TOP of the old one, which stays until it is covered.
            The banner never goes white between slides, so the white text is always readable. */}
        <div className="absolute inset-0 bg-[#1A3303]" aria-hidden="true" />
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 1, transition: { duration: 1 } }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {slide.image && <img src={slide.image} alt="" className="w-full h-full object-cover" />}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A3303]/95 via-[#234504]/85 to-[#326206]/50" aria-hidden="true" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 pt-3 flex items-center justify-between">
          <ReportGovBadge />
          <LanguageSwitcher />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 md:pt-8">
          {/* Fixed height: every slide's text sits in the same grid cell. The hidden copies
              hold the space of the tallest slide, so the banner and the "I am a…" box under it
              never jump when the slide changes. */}
          <div className="max-w-2xl grid" aria-live={playing ? "off" : "polite"}>
            {heroSlides.map((s, i) => (
              <div key={i} className="col-start-1 row-start-1 invisible" aria-hidden="true">
                <SlideText s={s} />
              </div>
            ))}
            <div className="col-start-1 row-start-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                >
                  <SlideText s={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Slide controls, with pause (WCAG 2.2: moving content must be pausable) */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 pt-5 flex items-center gap-2">
            {heroSlides.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
                aria-label={`Show slide ${i + 1}: ${s.title}`}
                aria-current={i === currentSlide}
              />
            ))}
            <button onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)} className="ml-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center" aria-label="Previous slide">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => setPlaying(!playing)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center" aria-label={playing ? "Pause slides" : "Play slides"}>
              {playing ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
            </button>
            <button onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center" aria-label="Next slide">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* 1. I am a... */}
      <section className="relative z-30 -mt-16 pb-4" aria-labelledby="audience-title">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4 md:p-5">
            <h2 id="audience-title" className="text-sm font-bold uppercase tracking-wider text-[#326206] mb-3 px-1">I am a…</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {audiences.map((a) => (
                <Link
                  key={a.label}
                  to={a.href}
                  className={`group rounded-xl p-4 border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    a.featured ? "bg-[#326206] border-[#326206] text-white col-span-2 md:col-span-1" : "bg-white border-gray-200 hover:border-[#326206]/40"
                  }`}
                >
                  <a.icon className={`w-7 h-7 mb-2 ${a.featured ? "text-white" : "text-[#326206]"}`} />
                  <p className={`font-heading font-bold ${a.featured ? "text-white" : "text-black group-hover:text-[#326206]"}`}>
                    {a.label} <ArrowRight className="inline w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </p>
                  <p className={`text-xs mt-1 leading-snug ${a.featured ? "text-white/85" : ""}`}>{a.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search + top tasks */}
      <section className="py-10 bg-white" aria-labelledby="search-title">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <h2 id="search-title" className="text-2xl md:text-3xl font-bold">How can we help you today?</h2>
            <form onSubmit={search} role="search" className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ADAEAF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search e.g. RSA transfer, PCC, circular"
                aria-label="Search the website"
                className="w-full pl-12 pr-24 py-3.5 rounded-xl border border-gray-300 focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#326206] text-white text-sm font-semibold rounded-lg hover:bg-[#234504]">Search</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs py-1">Popular:</span>
              {popularSearches.slice(0, 5).map((s) => (
                <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="text-xs px-2.5 py-1 rounded-full bg-[#EEF3E8] text-[#234504] font-medium hover:bg-[#326206] hover:text-white transition-colors">{s}</Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topTasks.map((t) => (
              <Link key={t.label} to={t.href} className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-[#326206]/40 hover:bg-[#EEF3E8]/50 transition-colors">
                <span className="w-10 h-10 rounded-lg bg-[#EEF3E8] text-[#326206] flex items-center justify-center shrink-0 group-hover:bg-[#326206] group-hover:text-white transition-colors">
                  <t.icon className="w-5 h-5" />
                </span>
                <span className="text-sm font-semibold text-black leading-tight">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Alerts + 4. Latest circulars */}
      <section className="py-12 bg-[#F7F8F5] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-5 gap-8">
          <motion.div {...fadeUp} className="lg:col-span-2">
            <SectionTitle eyebrow="Stay safe" title="Important alerts" />
            <ul className="space-y-3">
              {alerts.map((a) => {
                const s = alertStyle[a.level];
                return (
                  <li key={a.title}>
                    <Link to={a.href} className="block rounded-xl p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: s.fg }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.fg }}>
                          <s.icon className="w-3 h-3" /> {a.level}
                        </span>
                        <span className="text-[11px]">{shortDate(a.date)}</span>
                      </div>
                      <p className="font-semibold text-black leading-snug">{a.title}</p>
                      <p className="text-sm mt-1 leading-snug">{a.text}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div {...fadeUp} className="lg:col-span-3">
            <SectionTitle eyebrow="Regulatory updates" title="Latest circulars" link={{ to: "/regulations", label: "All circulars" }} />
            <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
              {latestCirculars.map((c) => (
                <li key={c.ref}>
                  <Link to={`/regulations/${c.id}`} className="group flex gap-4 p-4 hover:bg-[#EEF3E8]/40 transition-colors">
                    <FileText className="w-5 h-5 text-[#326206] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black group-hover:text-[#326206] leading-snug">{c.title}</p>
                      <p className="text-xs mt-1">
                        {c.ref} · {c.department} · Issued {shortDate(c.issued)}
                      </p>
                    </div>
                    <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-full ${isNew(c) ? "bg-[#326206] text-white" : "bg-[#EEF3E8] text-[#326206]"}`}>{isNew(c) ? "New" : "Current"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 5. Industry figures (right after alerts and circulars) */}
      <section className="py-12 bg-white relative overflow-hidden" aria-labelledby="figures-title">
        <div className="max-w-7xl mx-auto px-4 relative">
          <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">By the numbers</span>
          <h2 id="figures-title" className="text-2xl md:text-3xl font-bold mt-1 mb-6">Nigeria's pension industry</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {figures.map((f) => (
              <div key={f.label} className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col">
                <f.icon className="w-6 h-6 text-[#326206] mb-3" />
                <p className="font-heading text-2xl md:text-3xl font-extrabold text-[#326206]">{f.value}</p>
                <p className="text-sm font-medium text-black mt-1 mb-3">{f.label}</p>
                <p className="text-[11px] mt-auto pt-3 border-t border-gray-100">As at 30 Sep 2026 · PenCom monthly report</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4">
            Figures are updated every month after approval by the Research and Surveillance departments. <Link to="/resources#publications" className="font-semibold text-[#326206] underline">See full reports</Link>
          </p>
        </div>
      </section>

      {/* 6. Online services */}
      <section className="py-12 bg-[#F7F8F5] border-y border-gray-200/70" aria-labelledby="portals-title">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Online services</span>
              <h2 id="portals-title" className="text-2xl md:text-3xl font-bold mt-1">PenCom portals</h2>
              <p className="text-sm mt-1">Choose a portal to see what it is for and what you need before you go.</p>
            </div>
          </div>
          <PortalHub />
        </div>
      </section>

      {/* 7. News and events */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle eyebrow="News and events" title="Latest from PenCom" link={{ to: "/connect", label: "All news" }} />
          <div className="grid md:grid-cols-3 gap-6">
            {/* On phones the first story stays large and the others become short rows
                with a small picture (BBC / GOV.UK news style), to cut scrolling. */}
            {latestNews.map((news, i) => (
              <Link key={news.id} to="/connect" className={`group bg-white rounded-2xl overflow-hidden border border-gray-200/80 hover:shadow-xl hover:-translate-y-1 transition-all ${i > 0 ? "flex md:block" : "block"}`}>
                <div className={`bg-gray-200 overflow-hidden ${i > 0 ? "w-28 shrink-0 md:w-auto md:h-44" : "h-44"}`}>
                  <img src={news.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className={i > 0 ? "p-4 md:p-5" : "p-5"}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EEF3E8] text-[#326206] rounded-full">{news.category}</span>
                    <span className="text-[11px] flex items-center gap-1"><Calendar className="w-3 h-3" />{shortDate(news.date)}</span>
                  </div>
                  <h3 className="font-semibold text-black group-hover:text-[#326206]">{news.title}</h3>
                  {/* Full summary (one sentence), never cut in the middle of a word */}
                  <p className={`text-sm mt-1 ${i > 0 ? "hidden md:block" : ""}`}>{news.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* PenCom at Work video (kept from the original design) */}
          <div className="mt-8 grid lg:grid-cols-5 gap-6 items-center bg-[#514F50] rounded-2xl p-5 md:p-6">
            <div className="lg:col-span-3 relative rounded-xl overflow-hidden group">
              <video controls poster="./video-poster.jpg" className="w-full aspect-video object-cover" preload="metadata">
                <source src="./highlight-video2.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9A04A]">Video</span>
              <h3 className="text-2xl font-bold !text-white mt-1">PenCom at Work</h3>
              <p className="text-white/80 mt-2 text-sm leading-relaxed">See how the Commission protects retirement savings for millions of Nigerians. Watch past events and livestreams in the video archive.</p>
              <Link to="/connect" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4">Video archive <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services (kept from the original design) */}
      <section className="py-12 bg-[#F7F8F5] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle eyebrow="Our services" title="Pension services for everyone" link={{ to: "/services", label: "All services" }} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <Link key={s.title} to={s.href} className="group flex gap-4 p-5 bg-white rounded-2xl border border-gray-200/80 hover:border-[#326206]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#EEF3E8] flex items-center justify-center text-[#326206] shrink-0">{serviceIcons[s.icon] ?? <Shield className="w-6 h-6" />}</div>
                <div>
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <h3 className="font-semibold text-black group-hover:text-[#326206]">{s.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF3E8] text-[#326206]">{s.category}</span>
                  </div>
                  <p className="text-sm mt-1 leading-snug">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQs (contact details are in the footer and top bar, so no repeat here) */}
      <section className="py-12 bg-white" aria-labelledby="faq-title">
        <div className="max-w-7xl mx-auto px-4">
          <div>
            <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Help</span>
            <h2 id="faq-title" className="text-2xl md:text-3xl font-bold mt-1 mb-5">Frequently asked questions</h2>
            <div className="space-y-2">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.question} className="group rounded-xl border border-gray-200 open:border-[#326206]/40 open:bg-[#EEF3E8]/40">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 font-semibold text-black">
                    {f.question}
                    <ChevronDown className="w-4 h-4 shrink-0 text-[#326206] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
            <Link to="/resources/faq" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#326206] hover:underline">All FAQs <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
