import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, Shield, Search,
  Building2, ClipboardList, Users, BookOpen, Scale, Mail,
  Home, ArrowRightLeft, UserCircle, TrendingUp, FileCheck,
  UserPlus, Heart, Download, Calculator, Landmark,
  Phone, HelpCircle, MapPin, MessageSquareWarning, LayoutGrid
} from "lucide-react";
import UpdatesTicker from "@/components/UpdatesTicker";
import { navItems } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Scale: <Scale className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  ArrowRightLeft: <ArrowRightLeft className="w-4 h-4" />,
  UserCircle: <UserCircle className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  FileCheck: <FileCheck className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Download: <Download className="w-4 h-4" />,
  Calculator: <Calculator className="w-4 h-4" />,
  Landmark: <Landmark className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  // Dropdown timing: a short wait before opening (so a mouse just passing over
  // doesn't flash it open) and before closing (so moving into the panel doesn't lose it).
  const hoverTimer = useRef<number | undefined>(undefined);
  const openSoon = (label: string) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveMega(label), 150);
  };
  const closeSoon = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveMega(null), 200);
  };
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // Esc closes an open dropdown; a click anywhere outside the menu closes it too
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!activeMega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        navRef.current?.querySelector<HTMLElement>(`[data-toggle="${activeMega}"]`)?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMega(null);
    };
    // Safety checks so a dropdown never stays stuck open:
    // 1. the browser window loses focus (another app, a screenshot, a notification)
    // 2. the mouse leaves the browser window
    // 3. the mouse is anywhere outside the menu (in case a "mouse left" event was missed)
    const close = () => setActiveMega(null);
    const onWindowOut = (e: MouseEvent) => { if (!e.relatedTarget) close(); };
    let outTimer: number | undefined;
    const onMove = (e: PointerEvent) => {
      const inside = !!navRef.current?.contains(e.target as Node);
      if (inside) { window.clearTimeout(outTimer); outTimer = undefined; }
      else if (outTimer === undefined) outTimer = window.setTimeout(close, 250);
    };
    window.addEventListener("blur", close);
    document.addEventListener("mouseout", onWindowOut);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.clearTimeout(outTimer);
      window.removeEventListener("blur", close);
      document.removeEventListener("mouseout", onWindowOut);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [activeMega]);

  // Phone menu: only the main items show; tapping the arrow opens that section's pages.
  // The section of the page you are on starts open.
  const [openSection, setOpenSection] = useState<string | null>(null);
  useEffect(() => {
    if (mobileOpen) setOpenSection(navItems.find((n) => n.href !== "/" && location.pathname.startsWith(n.href))?.label ?? null);
  }, [mobileOpen, location.pathname]);

  // Share the header's real height as a CSS variable (--header-h),
  // so the page content and sticky bars sit right under it.
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasMega = (label: string) => {
    const item = navItems.find((n) => n.label === label);
    return item?.megaMenu?.columns && item.megaMenu.columns.length > 0;
  };

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Utility bar: same on every page */}
      <div className="bg-[#234504] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center gap-3">
          <div className="flex gap-3 items-center min-w-0">
            {/* Coat of arms + Federal Republic of Nigeria (top bar only; the footer says National Pension Commission) */}
            <span className="hidden sm:flex items-center gap-1.5">
              <img src="./coat-of-arms-sm.png" alt="" className="w-5 h-5 shrink-0" />
              <span className="opacity-90">Federal Republic of Nigeria</span>
            </span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <Link to="/connect#zonal-offices" className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Zonal Offices
            </Link>
            <a href="tel:094611300" className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1">
              <Phone className="w-3 h-3" /> 09-4611300
            </a>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/connect#complaint" className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1">
              <MessageSquareWarning className="w-3 h-3" /> <span className="hidden sm:inline">Lodge a complaint</span><span className="sm:hidden">Complaint</span>
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event("pencom:open-chat"))}
              className="opacity-80 hover:opacity-100 transition-opacity hidden md:flex items-center gap-1"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center" aria-hidden="true"><img src="./pencom-logo-sm.png" alt="" className="h-3" /></span> PenCom Assistant
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/10 rounded px-2 py-0.5"
              aria-label="Search the website"
            >
              <Search className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="PenCom Home">
              <img
                src="./pencom-logo-sm.png"
                alt="PenCom Logo"
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                className="hidden w-10 h-10 rounded-lg bg-gradient-to-br from-[#326206] to-[#234504] items-center justify-center"
                style={{ display: 'none' }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              {/* Official logo + "PenCom" in black, as in the logo itself */}
              <div className="border-l border-[#ADAEAF] pl-2.5">
                <div className="font-logo text-[22px] font-bold text-black leading-none">PenCom</div>
                <div className="font-logosub text-[8.5px] font-semibold text-black tracking-[0.06em] leading-tight mt-1">
                  NATIONAL PENSION COMMISSION
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div ref={navRef} className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => (hasMega(item.label) ? openSoon(item.label) : closeSoon())}
                  onMouseLeave={closeSoon}
                >
                  {/* Same look as before: the word goes to the page, the arrow opens the dropdown
                      (mouse, keyboard or touch screen). */}
                  <div
                    className={`flex items-center rounded-lg text-sm font-medium transition-all ${
                      location.pathname === item.href
                        ? "text-[#326206] bg-[#EEF3E8]"
                        : "text-gray-700 hover:text-[#326206] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    <Link to={item.href} className={`py-2 ${hasMega(item.label) ? "pl-3 pr-0.5" : "px-3"}`}>
                      {item.label}
                    </Link>
                    {hasMega(item.label) && (
                      <button
                        type="button"
                        data-toggle={item.label}
                        onClick={() => { window.clearTimeout(hoverTimer.current); setActiveMega(activeMega === item.label ? null : item.label); }}
                        aria-expanded={activeMega === item.label}
                        aria-label={`${item.label} pages`}
                        className="py-2 pl-0.5 pr-2.5 rounded-r-lg"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMega === item.label ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {activeMega === item.label && item.megaMenu && (
                      <motion.div
                        ref={megaRef}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
                      >
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 min-w-[640px]">
                          <div className="grid grid-cols-3 gap-6">
                            {item.megaMenu.columns.map((col) => (
                              <div key={col.title}>
                                <h4 className="text-xs font-semibold text-[#326206] uppercase tracking-wider mb-3">
                                  {col.title}
                                </h4>
                                <ul className="space-y-1.5">
                                  {col.links.map((link) => (
                                    <li key={link.label}>
                                      <Link
                                        to={link.href}
                                        className="text-sm text-gray-600 hover:text-[#326206] hover:bg-[#F5F5F5] rounded-md px-2 py-1.5 block transition-colors"
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/services"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[#326206] text-white text-sm font-semibold rounded-lg hover:bg-[#234504] transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                e-Services
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Latest updates bar under the menu (13 Nov meeting) */}
      <UpdatesTicker />

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <form
                role="search"
                className="relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
                  setSearchOpen(false);
                  navigate(`/search?q=${encodeURIComponent(q)}`);
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  aria-label="Search the website"
                  placeholder="Search services, forms, circulars, PFAs... (press Enter)"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isOpen = openSection === item.label;
                return (
                <div key={item.label}>
                  <div
                    className={`flex items-center rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? "text-[#326206] bg-[#EEF3E8]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Link to={item.href} className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium">
                      {iconMap[item.icon] || <Shield className="w-4 h-4" />}
                      {item.label}
                    </Link>
                    {item.megaMenu && (
                      <button
                        type="button"
                        onClick={() => setOpenSection(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${item.label} pages`}
                        className="px-4 py-3 self-stretch border-l border-gray-100"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {item.megaMenu && isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mt-1 mb-2 space-y-1">
                          {item.megaMenu.columns.flatMap((col) => col.links).map((link) => (
                            <Link
                              key={link.label}
                              to={link.href}
                              className="block px-3 py-2 text-sm text-gray-500 hover:text-[#326206] rounded-md"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                );
              })}
              <div className="pt-4 border-t mt-4">
                <Link
                  to="/services"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#326206] text-white font-semibold rounded-lg"
                >
                  <LayoutGrid className="w-5 h-5" />
                  Access e-Services
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
