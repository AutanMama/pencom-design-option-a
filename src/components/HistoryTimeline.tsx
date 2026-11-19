import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Vertical history timeline (top to bottom), animated as the user scrolls:
// - the green line fills down the page as you read
// - each milestone slides in when it reaches the screen
// - the milestone in the middle of the screen is highlighted and opens its details
// - the year list on the left lets people jump to (select) any year
// Animations switch off for people who have asked their device for less motion.

export type Milestone = { year: string; title: string; desc: string; detail: string };

export default function HistoryTimeline({ items }: { items: Milestone[] }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);

  // Green line grows with scroll progress through the timeline
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 70%", "end 50%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  // The milestone crossing the middle of the screen becomes the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // When the user scrolls on their own, the highlight follows the scroll again
  useEffect(() => { if (pinned !== null && pinned !== active) { const t = setTimeout(() => setPinned(null), 900); return () => clearTimeout(t); } }, [active, pinned]);

  const select = (i: number) => {
    setPinned(i);
    setActive(i);
    const el = refs.current[i];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
      window.scrollTo({ top: y, behavior: reduce ? ("instant" as ScrollBehavior) : "smooth" });
    }
  };
  const current = pinned ?? active;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-8 [&>*]:min-w-0">
      {/* Year selector */}
      <nav aria-label="Choose a year" className="lg:sticky lg:top-[calc(var(--header-h,126px)+72px)] self-start">
        <p className="hidden lg:block text-xs font-bold uppercase tracking-wider mb-3">Jump to a year</p>
        <ol className="flex lg:flex-col gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {items.map((m, i) => (
            <li key={m.year} className="shrink-0">
              <button
                onClick={() => select(i)}
                aria-current={current === i ? "step" : undefined}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${current === i ? "bg-[#326206] text-white" : "bg-white border border-gray-200 hover:border-[#326206] hover:text-[#326206]"}`}
              >
                <span className={`w-2 h-2 rounded-full ${current === i ? "bg-white" : i < current ? "bg-[#326206]" : "bg-[#ADAEAF]"}`} />
                {m.year}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Timeline */}
      <div ref={wrap} className="relative overflow-x-clip pl-3 -ml-3">
        <div className="absolute left-[33px] top-2 bottom-2 w-1 rounded-full bg-[#EEF3E8]" aria-hidden="true" />
        <motion.div className="absolute left-[33px] top-2 bottom-2 w-1 rounded-full bg-[#326206] origin-top" style={{ scaleY: reduce ? 1 : fill }} aria-hidden="true" />
        <ol className="space-y-6">
          {items.map((m, i) => {
            const on = current === i;
            const done = i < current;
            return (
              <motion.li
                key={m.year}
                ref={(el) => { refs.current[i] = el; }}
                data-i={i}
                initial={reduce ? false : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative pl-16"
              >
                {/* Dot */}
                <span className={`absolute left-0 top-3 w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white transition-all duration-300 ${on ? "bg-[#326206] text-white scale-110 shadow-lg" : done ? "bg-[#326206] text-white" : "bg-white text-[#326206] border-2 border-[#326206]/40"}`}>
                  {on && !reduce && <span className="absolute inset-0 rounded-full bg-[#326206]/40 animate-ping" aria-hidden="true" />}
                  <span className="relative">{m.year.slice(2)}</span>
                </span>

                {/* Card */}
                <button
                  onClick={() => select(i)}
                  aria-expanded={on}
                  className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 ${on ? "bg-white border-[#326206] shadow-xl" : "bg-white border-gray-200 hover:border-[#326206]/40 hover:shadow-md"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-heading font-extrabold transition-all ${on ? "text-3xl text-[#326206]" : "text-2xl text-[#326206]/80"}`}>{m.year}</p>
                      <h3 className="font-bold text-lg leading-snug mt-0.5">{m.title}</h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 mt-2 text-[#326206] shrink-0 transition-transform ${on ? "rotate-180" : ""}`} />
                  </div>
                  <p className="mt-2 leading-relaxed">{m.desc}</p>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.3 }}
                        className="overflow-hidden text-sm leading-relaxed"
                      >
                        <span className="block mt-3 pt-3 border-t border-gray-100">{m.detail}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
