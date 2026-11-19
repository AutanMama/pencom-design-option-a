import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowRight, Pause, Play, CalendarDays } from "lucide-react";

// Announcement pop-up (13 Nov meeting, sections 4 and 5):
// "images that pop up when someone visits the website to highlight updates",
// "updates to work like the slider", and management information kept prominent.
// Not an advert: it shows approved PenCom updates only, in the CMS this would be an
// "Announcement" content type with an image, link, start date and end date.
// Shows on the Home page only, about 1 second after it opens (team decision),
// unless the person ticked "Don't show again". On other pages it opens only from the Updates bar. Easy to close (X, Esc, click outside), pauses on hover,
// can be reopened from the Updates bar. How often it shows can be adjusted later (e.g. once per visit).

const VERSION = "2026-11-17"; // change when new announcements are published, so people see them again
const HIDE = "pencom-updates-hide";

const slides = [
  { label: "From the Director General", date: "17 Nov 2026", title: "Faster, simpler service for retirees", text: "A message from the Director General on our priorities for retirees and contributors this year.", image: "./exec-dg.jpg", position: "object-[center_18%]", href: "/about#executive", cta: "Read the message" },
  { label: "New circular", date: "10 Nov 2026", title: "Pencare enrolment for retirees", text: "PFAs must now get each retiree's consent before enrolling them in Pencare health insurance.", image: "./news-circular.png", position: "object-center md:object-[20%_center]", href: "/regulations/pencare-consent-circular-2026", cta: "Read the circular" },
  { label: "Fraud alert", date: "14 Nov 2026", title: "PenCom will never ask for your PIN", text: "Do not share your RSA PIN, password or bank details with anyone who calls or messages you.", image: "./banner-elders.jpg", position: "object-[60%_center]", href: "/connect#complaint", cta: "Report a scam" },
  { label: "Personal Pension Plan", date: "22 Oct 2026", title: "Self-employed? Start saving today", text: "Traders, artisans and small business owners can now save for retirement in amounts that suit them.", image: "./banner-family.jpg", position: "object-[55%_center]", href: "/services#ppp", cta: "Find out more" },
];
const SLIDE_MS = 7000;

const read = (store: Storage, key: string) => { try { return store.getItem(key); } catch { return null; } };
const write = (store: Storage, key: string, v: string) => { try { store.setItem(key, v); } catch { /* storage blocked */ } };

export default function UpdatesPopup() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false); // the pause button
  const paused = hovering || stopped;
  const reduce = useReducedMotion();
  const [hideNext, setHideNext] = useState(false);
  // Focus goes to the pop-up itself (not the X), so no ring appears for mouse users;
  // keyboard users land inside the pop-up and can Tab to the X.
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const location = useLocation();
  const skipNext = useRef(false); // true when the person clicked a link inside the pop-up

  // Show on the Home page only, about 1 second after it opens, unless the person chose "Don't show again".
  // On the first visit to the home page the cookie banner comes first; the pop-up waits until it is answered,
  // so only one thing asks for attention at a time.
  useEffect(() => {
    setOpen(false);
    if (location.pathname !== "/") return; // Home page only
    if (read(localStorage, HIDE) === VERSION) return;
    if (skipNext.current) { skipNext.current = false; return; }
    let t: ReturnType<typeof setTimeout> | undefined;
    const show = (delay: number) => {
      t = setTimeout(() => {
        if (read(localStorage, HIDE) === VERSION) return;
        lastFocus.current = document.activeElement as HTMLElement;
        setI(0);
        setOpen(true);
      }, delay);
    };
    const cookieBannerComing = location.pathname === "/" && !read(localStorage, "pencom-cookie-consent");
    if (!cookieBannerComing) { show(1000); return () => clearTimeout(t); }
    const after = () => show(800);
    window.addEventListener("pencom:cookie-banner-closed", after, { once: true });
    return () => { window.removeEventListener("pencom:cookie-banner-closed", after); clearTimeout(t); };
  }, [location.pathname]);

  // The Updates bar can reopen it
  useEffect(() => {
    const reopen = () => { lastFocus.current = document.activeElement as HTMLElement; setI(0); setOpen(true); };
    window.addEventListener("pencom:open-updates", reopen);
    return () => window.removeEventListener("pencom:open-updates", reopen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => dialogRef.current?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % slides.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (hideNext) write(localStorage, HIDE, VERSION);
    setOpen(false);
    lastFocus.current?.focus?.();
  };

  const s = slides[i];
  const next = slides[(i + 1) % slides.length];
  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            ref={dialogRef} tabIndex={-1}
            role="dialog" aria-modal="true" aria-labelledby="updates-title" aria-roledescription="carousel"
            initial={{ y: 30, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
            className="relative outline-none w-full max-w-md md:max-w-3xl max-h-[calc(100vh-32px)] overflow-y-auto bg-white rounded-3xl shadow-2xl md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
          >
            <button onClick={close} className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-md" aria-label="Close updates">
              <X className="w-5 h-5 text-black" />
            </button>

            {/* Picture: tall on computers (fits portraits like the DG's photo), shorter on phones */}
            <div className="relative h-60 md:h-auto md:min-h-[460px] bg-[#1A3303] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={s.image} src={s.image} alt=""
                  className={`absolute inset-0 w-full h-full object-cover ${s.position}`}
                  initial={{ opacity: 0, scale: reduce ? 1 : 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.5 }, scale: { duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" } }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white rounded-xl pl-1.5 pr-2.5 py-1 shadow">
                <img src="./pencom-logo-sm.png" alt="" className="h-7" />
                <span className="text-[10px] font-extrabold tracking-wider text-black leading-tight">PENCOM<br />UPDATES</span>
              </div>
              <span className={`absolute bottom-4 left-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow ${/fraud/i.test(s.label) ? "bg-[#9D2B1F] text-white" : "bg-white text-[#326206]"}`}>{s.label}</span>
            </div>

            {/* Words */}
            <div className="p-6 md:p-8 flex flex-col" aria-live={paused ? "polite" : "off"}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#326206]">Latest from PenCom · {i + 1} of {slides.length}</p>
              <AnimatePresence mode="wait">
                <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mt-3">
                  <p className="text-xs flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {s.date}</p>
                  <h2 id="updates-title" className="mt-1.5 text-2xl md:text-[28px] font-extrabold leading-tight">{s.title}</h2>
                  <p className="mt-3 leading-relaxed">{s.text}</p>
                  <Link to={s.href} onClick={() => { skipNext.current = true; close(); }} className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#326206] text-white font-semibold rounded-xl hover:bg-[#234504] shadow-lg shadow-[#326206]/25 transition-colors">
                    {s.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Slider: progress bars show what's coming; the bar fills, then the next update appears */}
              <div className="mt-7 flex items-center gap-2">
                <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
                  {slides.map((x, n) => (
                    <button key={x.title} onClick={() => go(n)} aria-label={`Update ${n + 1} of ${slides.length}: ${x.title}`} aria-current={n === i} className="h-1.5 rounded-full bg-[#E5E7E2] overflow-hidden">
                      {n < i && <span className="block h-full bg-[#326206]" />}
                      {n === i && reduce && <span className="block h-full bg-[#326206]" />}
                      {n === i && !reduce && (
                        <span
                          key={`${i}-${open}`}
                          className="block h-full bg-[#326206] origin-left"
                          style={{ animation: `pencom-progress ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                          onAnimationEnd={() => go(i + 1)}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {!reduce && <button onClick={() => setStopped(!stopped)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#326206] flex items-center justify-center" aria-label={stopped ? "Play updates" : "Pause updates"}>
                  {stopped ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>}
                <button onClick={() => go(i - 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#326206] flex items-center justify-center" aria-label="Previous update"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => go(i + 1)} className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#326206] flex items-center justify-center" aria-label="Next update"><ChevronRight className="w-4 h-4" /></button>
              </div>

              {/* Up next: a small preview so people want to keep looking */}
              <button onClick={() => go(i + 1)} className="mt-4 group flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-[#F7F8F5] text-left">
                <img src={next.image} alt="" className={`w-14 h-14 rounded-lg object-cover ${next.position}`} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#514F50]">Up next</span>
                  <span className="block text-sm font-semibold text-black leading-snug group-hover:text-[#326206] line-clamp-2">{next.title}</span>
                </span>
              </button>

              <div className="mt-auto pt-5 flex items-center justify-between gap-3 border-t border-gray-100 md:mt-6">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={hideNext} onChange={(e) => setHideNext(e.target.checked)} className="w-4 h-4 accent-[#326206]" />
                  Don't show this again
                </label>
                <button onClick={close} className="text-sm font-semibold text-[#326206] hover:underline">Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
