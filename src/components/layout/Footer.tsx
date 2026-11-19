import { useState, type FormEvent, type SVGProps } from "react";
import { Link } from "react-router";
import {
  Mail, Phone, MapPin, ExternalLink, ArrowRight, ChevronDown, CheckCircle2,
  Apple, Play, Facebook, Linkedin, Instagram, Youtube, ShieldCheck, Accessibility
} from "lucide-react";
import { portals as allPortals, PortalLeaveDialog, type Portal } from "@/components/PortalHub";

// Current X logo (the old Twitter bird was retired in 2023)
function XLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Compact footer: three layers instead of six (main area, portals row, bottom bar).
// Brand touches: thin gold top line and the grey pillars watermark from the RE-BRAND guide.
// On phones the link columns fold up so the footer stays short.

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "About PenCom": [
    { label: "About the Commission", href: "/about" },
    { label: "Mission & Vision", href: "/about#mission" },
    { label: "Leadership", href: "/about#executive" },
    { label: "Service Charter", href: "/about#charter" },
  ],
  Services: [
    { label: "Pension Services", href: "/services" },
    { label: "RSA Transfer", href: "/services#rsa-transfer" },
    { label: "Personal Pension Plan", href: "/services#ppp" },
    { label: "Pension Clearance", href: "/services#pcc" },
  ],
  Resources: [
    { label: "Publications", href: "/resources#publications" },
    { label: "Circulars", href: "/resources#circulars" },
    { label: "Downloads", href: "/resources#downloads" },
    { label: "FAQs", href: "/resources/faq" },
    { label: "Regulations", href: "/regulations" },
  ],
};

const socialLinks = [
  { icon: XLogo, href: "https://x.com/PenComNig", label: "X (formerly Twitter)" },
  { icon: Instagram, href: "https://instagram.com/_pencom_", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/PenCom.gov", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@pencomyoutubechannel3230", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/national-pension-commission", label: "LinkedIn" },
];

// Same portal list and "Before you go" box as the portal cards on Home and Services
const footerPortals = ["eHub", "COBRA", "PENCAP", "PCRS", "Pencare", "PPP portal"]
  .map((n) => allPortals.find((p) => p.name === n))
  .filter((p): p is Portal => Boolean(p));

const legal = [
  { label: "Contact us", href: "/connect" },
  { label: "Report an employer", href: "/connect#report" },
  { label: "Privacy notice", href: "/privacy" },
  { label: "Cookie settings", href: "/cookies" },
];

const linkCls = "text-sm text-white/70 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded outline-none";

export default function Footer() {
  const [leaving, setLeaving] = useState<Portal | null>(null);
  // Newsletter: check the email, then thank the person (demo; nothing is sent)
  const [email, setEmail] = useState("");
  const [signup, setSignup] = useState<"idle" | "error" | "done">("idle");
  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    setSignup(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "done" : "error");
  };

  return (
    <footer className="relative bg-[#234504] text-white overflow-hidden">
      {/* Thin gold line along the top edge */}
      <div className="h-1 bg-gradient-to-r from-[#326206] via-[#CA8D32] to-[#326206]" aria-hidden="true" />

      {/* 1. Main area */}
      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-8 grid gap-8 lg:grid-cols-12">
        {/* Brand + contact + social */}
        <div className="lg:col-span-4">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="PenCom home">
            <span className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0"><img src="./pencom-logo-sm.png" alt="" className="h-9" /></span>
            <span className="leading-tight">
              <span className="block font-logo font-bold text-lg">PenCom</span>
              <span className="block text-[10px] tracking-[0.12em] text-white/70">NATIONAL PENSION COMMISSION</span>
            </span>
          </Link>
          <p className="mt-4 font-heading text-sm font-bold">We Regulate. We Protect. <span className="text-[#D9A04A]">We Serve.</span></p>
          <ul className="mt-4 space-y-1.5 text-sm text-white/70">
            <li className="flex gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />174, Adetokunbo Ademola Crescent, Wuse II, Abuja</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 shrink-0 mt-0.5" /><span><a href="tel:094611300" className="hover:text-white">09-4611300</a> · 0700-PENCOM</span></li>
            <li className="flex gap-2"><Mail className="w-4 h-4 shrink-0 mt-0.5" /><a href="mailto:info@pencom.gov.ng" className="hover:text-white">info@pencom.gov.ng</a></li>
          </ul>
          <div className="mt-4 flex items-center gap-2">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#CA8D32] transition-colors focus-visible:ring-2 focus-visible:ring-white outline-none">
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns: open lists on computers, fold-up sections on phones */}
        <nav aria-label="Footer" className="lg:col-span-5 grid sm:grid-cols-3 gap-x-6 gap-y-0 sm:gap-y-6">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <details className="group sm:hidden border-b border-white/10">
                <summary className="list-none flex items-center justify-between py-3 cursor-pointer font-semibold text-sm">
                  {title}<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="pb-3 space-y-2">{links.map((l) => <li key={l.label}><Link to={l.href} className={linkCls}>{l.label}</Link></li>)}</ul>
              </details>
              <div className="hidden sm:block">
                <h2 className="font-semibold text-sm mb-3">{title}</h2>
                <ul className="space-y-2">{links.map((l) => <li key={l.label}><Link to={l.href} className={linkCls}>{l.label}</Link></li>)}</ul>
              </div>
            </div>
          ))}
        </nav>

        {/* Stay updated: newsletter + app */}
        <div className="lg:col-span-3">
          <h2 className="font-semibold text-sm mb-3">Stay updated</h2>
          {signup === "done" ? (
            <p role="status" className="flex items-start gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#D9A04A] shrink-0" />
              <span>Thank you! You'll get news, circulars and deadlines by email.</span>
            </p>
          ) : (
            <>
              <form onSubmit={subscribe} noValidate className={`flex rounded-lg overflow-hidden ring-1 focus-within:ring-[#D9A04A] ${signup === "error" ? "ring-[#F2A193]" : "ring-white/20"}`}>
                <label className="flex-1 min-w-0"><span className="sr-only">Email address</span>
                  <input
                    type="email" value={email} placeholder="Your email"
                    onChange={(e) => { setEmail(e.target.value); if (signup === "error") setSignup("idle"); }}
                    aria-invalid={signup === "error"} aria-describedby="signup-hint"
                    className="w-full bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                </label>
                <button className="px-3 bg-[#CA8D32] hover:bg-[#B47D2A] text-[#1A3303] font-semibold text-sm flex items-center gap-1 shrink-0">Sign up <ArrowRight className="w-4 h-4" /></button>
              </form>
              <p id="signup-hint" className={`mt-2 text-[11px] ${signup === "error" ? "text-[#F2A193] font-medium" : "text-white/70"}`} aria-live="polite">
                {signup === "error" ? "Please enter a valid email address, for example name@example.com" : "News, circulars and deadlines. No spam."}
              </p>
            </>
          )}
          <p className="mt-5 text-xs text-white/70 mb-2">Get the PenCom app</p>
          <div className="flex gap-2">
            <a href="#/mobile" className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 hover:bg-black/40 transition-colors">
              <Apple className="w-5 h-5 shrink-0" /><span className="leading-none"><span className="block text-[9px] opacity-70">Download on the</span><span className="text-xs font-semibold">App Store</span></span>
            </a>
            <a href="#/mobile" className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 hover:bg-black/40 transition-colors">
              <Play className="w-5 h-5 shrink-0" /><span className="leading-none"><span className="block text-[9px] opacity-70">Get it on</span><span className="text-xs font-semibold">Google Play</span></span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Online services, one thin row */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-xs font-semibold text-white/80 mr-2">Online services</span>
          {footerPortals.map((p) => (
            <button key={p.name} type="button" onClick={() => setLeaving(p)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-white/85 hover:bg-white/20 transition-colors">
              {p.name}<ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bottom bar: official identity, trust, legal */}
      <div className="relative bg-[#1A3303]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-white/65">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0" aria-hidden="true"><img src="./pencom-logo-sm.png" alt="" className="h-3.5" /></span> Official website of the National Pension Commission</span>
            <Link to="/privacy" className="flex items-center gap-1.5 hover:text-white"><ShieldCheck className="w-4 h-4 text-[#D9A04A]" /> Data protected under the NDPA 2023</Link>
            <Link to="/accessibility" className="flex items-center gap-1.5 hover:text-white"><Accessibility className="w-4 h-4 text-[#D9A04A]" /> Accessibility</Link>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1 lg:mr-48">
            {legal.map((l) => <Link key={l.label} to={l.href} className="hover:text-white">{l.label}</Link>)}
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 pt-2.5 pb-24 sm:pb-2.5 flex flex-col sm:flex-row justify-between gap-1 text-[11px] text-white/55 sm:pr-4 lg:pr-48">
            <span>&copy; 2026 National Pension Commission. All rights reserved.</span>
            <span className="font-heading font-semibold tracking-wide text-white/80">Your Pension, Your Future</span>
          </div>
        </div>
      </div>
      <PortalLeaveDialog portal={leaving} onClose={() => setLeaving(null)} />
    </footer>
  );
}
