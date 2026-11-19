import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, X } from "lucide-react";

// Latest updates shown in the bar under the main menu.
// In the real site these come from the CMS ("Announcement" content with start and end dates),
// so the bar only shows while there is something current.
// Order: alerts first (fraud, deadlines), then news, as the questionnaire asks (DES-30).
export const latestUpdates = [
  { label: "Fraud alert", text: "PenCom never asks for your RSA PIN or bank details by phone, SMS or social media", href: "/connect#complaint" },
  { label: "Deadline", text: "Employers must remit pension contributions within 7 working days of paying salaries (Pension Reform Act 2014)", href: "/services" },
  { label: "New circular", text: "Circular on retirees' consent for Pencare enrolment during programmed withdrawal", href: "/regulations" },
  { label: "Reminder", text: "RSA holders: update your KYC details with your PFA before 31 December 2026", href: "/operators" },
  { label: "New portal", text: "New online verification portal for retirees is now available", href: "/services#portals" },
];

export default function UpdatesTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const count = latestUpdates.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  // Phones: swipe the bar left/right to change update; holding a finger on it pauses it
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    setPaused(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
  };

  useEffect(() => {
    if (paused || hidden || latestUpdates.length < 2) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [paused, hidden]);

  if (hidden || latestUpdates.length === 0) return null;
  const item = latestUpdates[index];
  const isAlert = /alert|deadline/i.test(item.label);

  return (
    <div
      className="bg-[#EEF3E8] border-b border-[#326206]/15 text-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Latest updates"
    >
      <div className="max-w-7xl mx-auto px-4 h-[50px] sm:h-[34px] flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => window.dispatchEvent(new Event("pencom:open-updates"))}
          className="hidden sm:flex items-center gap-1.5 text-[#326206] font-semibold shrink-0 font-heading text-xs uppercase tracking-wide hover:underline"
          title="See all updates"
          aria-label="See all updates"
        >
          <Megaphone className="w-3.5 h-3.5" /> Updates
        </button>
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            isAlert ? "bg-[#9D2B1F] text-white" : "bg-[#326206] text-white"
          }`}
        >
          {isAlert && <span className="relative inline-flex w-1.5 h-1.5 shrink-0" aria-hidden="true"><span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-white opacity-75" /><span className="relative w-1.5 h-1.5 rounded-full bg-white" /></span>}
          {item.label}
        </span>
        {/* The whole update is one link. A visible "Read more" button shows it can be opened,
            so people don't have to hover to find out (on phones the text is cut short, so the button matters most) */}
        <Link to={item.href} className="group min-w-0 flex items-center gap-2" aria-live="polite">
          {/* Phones: two lines with the label in front, so the message can actually be read */}
          <span className="line-clamp-2 sm:line-clamp-1 text-[13px] sm:text-sm leading-snug text-black underline decoration-[#326206]/30 underline-offset-[3px] group-hover:decoration-[#326206] group-hover:text-[#326206]">
            <span className={`sm:hidden inline-flex items-center gap-1 align-[1px] mr-1 text-[9px] font-bold uppercase px-1.5 py-px rounded ${isAlert ? "bg-[#9D2B1F] text-white" : "bg-[#326206] text-white"}`}>{isAlert && <span className="relative inline-flex w-1.5 h-1.5 shrink-0" aria-hidden="true"><span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-white opacity-75" /><span className="relative w-1.5 h-1.5 rounded-full bg-white" /></span>}{item.label}</span>{" "}
            {item.text}
          </span>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white border border-[#326206]/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#326206] group-hover:bg-[#326206] group-hover:text-white group-hover:border-[#326206] transition-colors">
            Read<span className="hidden sm:inline"> more</span> <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </span>
        </Link>
        <div className="ml-auto flex items-center shrink-0">
          <button
            onClick={prev}
            className="hidden sm:block p-1 text-[#514F50] hover:text-[#326206]"
            aria-label="Previous update"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="hidden sm:inline text-[11px] text-[#514F50] tabular-nums w-7 text-center">
            {index + 1}/{count}
          </span>
          <button
            onClick={next}
            className="hidden sm:block p-1 text-[#514F50] hover:text-[#326206]"
            aria-label="Next update"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setHidden(true)} className="p-1 ml-1 text-[#514F50] hover:text-black" aria-label="Hide updates">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
