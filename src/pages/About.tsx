import { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import HistoryTimeline, { type Milestone } from "@/components/HistoryTimeline";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Target, Eye, Users, Award, Landmark, CheckCircle, ChevronRight, X,
  Gavel, FileCheck, Search, Scale, BookOpen, Database, MessageSquareWarning,
  Download, UserRound, Building2, History
} from "lucide-react";

// About page (13 Nov meeting + questionnaire sitemap):
// mission/vision/functions, values, organogram with full-profile pop-ups,
// timeline, past leadership, Service Charter as a web page with the signed PDF.

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

type Person = {
  name: string;
  title: string;
  image?: string;
  bio: string;
  duties: string[];
  departments?: string[];
};

// Board level. Name and photo come from CCD.
const chairman: Person = {
  name: "Chairman of the Board",
  title: "Chairman, Governing Board",
  bio: "Leads the Governing Board of the Commission, which sets policy direction and oversees the management of the Commission.",
  duties: ["Presides over Board meetings", "Approves the Commission's strategy and budget", "Oversees governance and accountability"],
};

// Executive management (names and photos from pencom.gov.ng, as in the original design)
const dg: Person = {
  name: "Omolola Oloworaran",
  title: "Director General",
  image: "./exec-dg.jpg",
  bio: "Chief Executive Officer of the National Pension Commission, responsible for the overall direction and administration of the Commission.",
  duties: ["Day-to-day management of the Commission", "Carries out the Board's decisions", "Represents the Commission to government, industry and the public"],
  departments: ["DG's Office", "Corporate Communications", "Internal Audit", "Strategy & Risk"],
};

const executives: Person[] = [
  {
    name: "Hon. Bello Abubakar Malabu", title: "Commissioner, Administration", image: "./exec-admin.jpg",
    bio: "Oversees administrative functions including human resources, corporate services, and general administration of the Commission.",
    duties: ["Staff and human resources", "Offices, facilities and zonal offices", "Procurement and general services"],
    departments: ["Human Resources", "Administration", "Zonal Offices"],
  },
  {
    name: "Dr. Charles Efe Sylvester Emukowhate", title: "Commissioner, Finance", image: "./exec-finance.jpg",
    bio: "Manages the Commission's financial operations, budgeting, accounting, and fiscal policy implementation.",
    duties: ["Budget and financial reporting", "Accounts and payments", "Financial controls"],
    departments: ["Finance & Accounts", "Budget"],
  },
  {
    name: "Hon. Hafiz Muhammad Kawu Ibrahim OON, Mni", title: "Commissioner, Technical", image: "./exec-tech.jpg",
    bio: "Responsible for technical operations including pension regulation, supervision, and industry standards development.",
    duties: ["Regulation and guidelines", "Investment supervision", "Research and industry data"],
    departments: ["Investment Supervision", "Research & Surveillance", "Benefits & Insurance", "Information Technology"],
  },
  {
    name: "Hon. Samuel Chigozie Uwandu, CPA", title: "Commissioner, Inspectorate", image: "./exec-insp.jpg",
    bio: "Leads the inspectorate division ensuring compliance and enforcement of pension regulations across operators.",
    duties: ["Inspection of pension operators", "Employer compliance and enforcement", "Recovery of unremitted contributions"],
    departments: ["Inspectorate", "Compliance & Enforcement", "Surveillance"],
  },
  {
    name: "Mr. Muhammad Sani Muhammad", title: "Commission Secretary / Legal Adviser", image: "./exec-sec.jpg",
    bio: "Provides legal counsel and secretariat services to the Commission, ensuring regulatory compliance and governance.",
    duties: ["Board secretariat", "Legal advice and litigation", "Licensing documentation"],
    departments: ["Legal Services", "Board Secretariat"],
  },
];

const functions = [
  { icon: Gavel, text: "Regulate and supervise the Contributory Pension Scheme (CPS)" },
  { icon: FileCheck, text: "License, regulate and supervise Pension Fund Administrators (PFAs) and Custodians (PFCs)" },
  { icon: BookOpen, text: "Issue regulations, guidelines and circulars for the pension industry" },
  { icon: Search, text: "Inspect operators and make sure employers remit contributions" },
  { icon: MessageSquareWarning, text: "Receive and investigate complaints about pension matters" },
  { icon: Scale, text: "Approve and monitor how pension funds are invested" },
  { icon: Database, text: "Keep a national data bank of pension matters" },
  { icon: Users, text: "Educate the public about pensions" },
];

const values = [
  { icon: Shield, title: "Integrity", desc: "We uphold the highest ethical standards in all our operations" },
  { icon: Target, title: "Professionalism", desc: "We deliver excellence through competence and diligence" },
  { icon: Eye, title: "Transparency", desc: "We maintain open communication with all stakeholders" },
  { icon: Users, title: "Service", desc: "We put the needs of pension contributors first" },
];

// Timeline (dates to be checked by CCD before publishing)
const timeline: Milestone[] = [
  { year: "2004", title: "Pension Reform Act 2004", desc: "The Contributory Pension Scheme (CPS) begins and the National Pension Commission is established to regulate it.", detail: "The Act replaced the old pension arrangements with personal Retirement Savings Accounts for workers in the public and private sectors, so each worker's pension is saved and invested in their own name." },
  { year: "2006", title: "First operators licensed", desc: "Pension Fund Administrators (PFAs) and Custodians (PFCs) are licensed, and workers start opening Retirement Savings Accounts (RSAs).", detail: "PFAs invest the money and PFCs keep it safe, so no single company both manages and holds a worker's pension." },
  { year: "2014", title: "Pension Reform Act 2014", desc: "The 2004 Act is repealed and re-enacted, with stronger penalties for employers who fail to remit and wider coverage.", detail: "Minimum contributions became 8% from the employee and 10% from the employer, and the scheme was opened to more workers." },
  { year: "2019", title: "Micro Pension Plan launched", desc: "Self-employed and informal sector workers can now save for retirement.", detail: "Traders, artisans and small business owners can save small amounts when they can, with part kept aside for emergencies. This is now the Personal Pension Plan." },
  { year: "2021", title: "RSA transfer window opens", desc: "Contributors can move their RSA to another PFA once a year.", detail: "Workers can choose a PFA based on its service and returns, and move at no cost, which encourages PFAs to serve contributors better." },
  { year: "2024", title: "New executive management", desc: "A new Director General and Commissioners take office.", detail: "The current leadership of the Commission. See their profiles in the Leadership section above." },
  { year: "2026", title: "New website and mobile app", desc: "A simpler website and app built around contributors, retirees and employers.", detail: "Guided services, a searchable regulatory library, the PenCom Assistant, and complaints you can track with a case reference." },
];

const charter = [
  "Respond to all enquiries within 48 hours",
  "Process RSA transfers within 5 working days",
  "Issue Pension Clearance Certificates within 10 working days",
  "Acknowledge and resolve complaints within 14 working days",
  "Publish quarterly industry reports promptly",
  "Keep our online services available and secure",
];

const sections = [
  { id: "mission", label: "Who we are" },
  { id: "values", label: "Values" },
  { id: "executive", label: "Leadership" },
  { id: "history", label: "History" },
  { id: "past-leadership", label: "Past leadership" },
  { id: "charter", label: "Service Charter" },
];

function Avatar({ p, className }: { p: Person; className: string }) {
  return p.image ? (
    <img src={p.image} alt="" className={`${className} object-cover object-top`} />
  ) : (
    <div className={`${className} bg-[#EEF3E8] text-[#326206] flex items-center justify-center`}>
      <UserRound className="w-1/2 h-1/2" />
    </div>
  );
}

// Organogram box
function OrgBox({ p, onOpen, highlight }: { p: Person; onOpen: (p: Person) => void; highlight?: boolean }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className={`group w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#326206] focus-visible:ring-offset-2 outline-none ${
        highlight ? "bg-[#326206] border-[#326206]" : "bg-white border-gray-200 hover:border-[#326206]/40"
      }`}
    >
      <Avatar p={p} className="w-12 h-12 rounded-lg shrink-0" />
      <span className="min-w-0">
        <span className={`block text-[10px] font-bold uppercase tracking-wider ${highlight ? "text-white/80" : "text-[#326206]"}`}>{p.title}</span>
        <span className={`block text-sm font-semibold leading-snug ${highlight ? "text-white" : "text-black group-hover:text-[#326206]"}`}>{p.name}</span>
        <span className={`text-[11px] inline-flex items-center gap-0.5 ${highlight ? "text-white/70" : ""}`}>View profile <ChevronRight className="w-3 h-3" /></span>
      </span>
    </button>
  );
}

function ProfileModal({ p, onClose }: { p: Person; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="profile-name"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-5">
          <div className="sm:col-span-2 relative h-64 sm:h-auto bg-[#EEF3E8]">
            <Avatar p={p} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="sm:col-span-3 p-6 relative">
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center" aria-label="Close profile">
              <X className="w-4 h-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#326206]">{p.title}</p>
            <h2 id="profile-name" className="text-xl font-bold mt-1 pr-8">{p.name}</h2>
            <p className="text-sm mt-3 leading-relaxed">{p.bio}</p>

            <h3 className="text-sm font-bold mt-5">Responsibilities</h3>
            <ul className="mt-2 space-y-1.5">
              {p.duties.map((d) => (
                <li key={d} className="flex gap-2 text-sm"><CheckCircle className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" />{d}</li>
              ))}
            </ul>

            {p.departments && (
              <>
                <h3 className="text-sm font-bold mt-5">Departments in this office</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.departments.map((d) => <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-[#EEF3E8] text-[#234504]">{d}</span>)}
                </div>
              </>
            )}

            <h3 className="text-sm font-bold mt-5">Background</h3>
            <p className="text-sm mt-1 italic">Full biography (education, career and appointment date) to be supplied by Corporate Communications.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function About() {
  const [selected, setSelected] = useState<Person | null>(null);

  return (
    <div>
      <PageBanner
        label="About Us"
        title="About PenCom"
        description="The National Pension Commission is the apex regulatory body for the Nigerian pension industry, established under the Pension Reform Act 2014."
        bgImage="./banner-abstract.jpg"
      />

      {/* In-page menu */}
      <nav aria-label="On this page" className="sticky top-[var(--header-h,126px)] z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
              className="shrink-0 px-3 py-3 text-sm font-medium border-b-2 border-transparent hover:border-[#326206] hover:text-[#326206]">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 [&>section]:scroll-mt-[calc(var(--header-h,126px)+56px)]">

        {/* Who we are: mission, vision, functions */}
        <section id="mission">
          <motion.div {...fadeUp} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-[#EEF3E8] flex items-center justify-center mb-4"><Target className="w-6 h-6 text-[#326206]" /></div>
              <h2 className="text-xl font-bold mb-2">Our Mission</h2>
              <p className="leading-relaxed">To regulate, supervise and ensure the effective administration of pension matters in Nigeria, while promoting a sustainable pension system that guarantees retirement benefits for all Nigerian workers.</p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-[#EEF3E8] flex items-center justify-center mb-4"><Eye className="w-6 h-6 text-[#326206]" /></div>
              <h2 className="text-xl font-bold mb-2">Our Vision</h2>
              <p className="leading-relaxed">To be a model pension regulatory authority in Africa, ensuring that every Nigerian worker receives their retirement benefits as and when due, through a well-regulated and supervised pension industry.</p>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="mt-6 rounded-2xl bg-[#F7F8F5] border border-gray-200 p-7 relative overflow-hidden">
            <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">What we do</span>
            <h2 className="text-2xl font-bold mt-1 mb-5">Our functions</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {functions.map((f) => (
                <li key={f.text} className="flex gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <f.icon className="w-5 h-5 text-[#326206] shrink-0 mt-0.5" />
                  <span className="text-sm leading-snug">{f.text}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs mt-4 relative">Full list in Section 24 of the Pension Reform Act 2014.</p>
          </motion.div>
        </section>

        {/* Values */}
        <section id="values">
          <motion.div {...fadeUp}>
            <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">What guides us</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 mb-6">Core values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#EEF3E8] flex items-center justify-center text-[#326206] mb-3"><v.icon className="w-6 h-6" /></div>
                  <h3 className="font-semibold mb-1">{v.title}</h3>
                  <p className="text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Leadership: organogram */}
        <section id="executive">
          <motion.div {...fadeUp}>
            <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Our leadership</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">How the Commission is organised</h2>
            <p className="mt-2 max-w-2xl">Click any person to see their full profile, responsibilities and the departments in their office.</p>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-[#F7F8F5] p-5 md:p-8">
              {/* Level 1: Board */}
              <div className="max-w-sm mx-auto">
                <p className="text-center text-[11px] font-bold uppercase tracking-wider mb-2">Governing Board</p>
                <OrgBox p={chairman} onOpen={setSelected} />
              </div>
              <div className="w-px h-8 bg-[#326206]/40 mx-auto" />

              {/* Level 2: DG */}
              <div className="max-w-sm mx-auto">
                <p className="text-center text-[11px] font-bold uppercase tracking-wider mb-2">Chief Executive</p>
                <OrgBox p={dg} onOpen={setSelected} highlight />
              </div>
              <div className="w-px h-8 bg-[#326206]/40 mx-auto" />

              {/* Level 3: Commissioners and Secretary */}
              <div className="hidden lg:block mx-[10%] h-px bg-[#326206]/40" />
              <p className="text-center text-[11px] font-bold uppercase tracking-wider my-2">Executive Commissioners and Commission Secretary</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {executives.map((p) => (
                  <div key={p.name} className="flex flex-col">
                    <div className="hidden lg:block w-px h-4 bg-[#326206]/40 mx-auto -mt-2 mb-1" />
                    <OrgBox p={p} onOpen={setSelected} />
                    {/* Level 4: departments */}
                    <ul className="mt-2 space-y-1 pl-3 border-l-2 border-[#326206]/20 ml-6">
                      {p.departments?.map((d) => (
                        <li key={d} className="text-xs flex items-center gap-1.5"><Building2 className="w-3 h-3 text-[#ADAEAF]" />{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-6 text-center">Department names are shown for layout; the final structure will come from Human Resources.</p>
            </div>
          </motion.div>
        </section>

        {/* History timeline */}
        <section id="history">
          <motion.div {...fadeUp}>
            <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Our journey</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 mb-8">Our history</h2>
            <p className="-mt-5 mb-6 max-w-2xl">Scroll down through our story, or pick a year to jump straight to it.</p>
            <HistoryTimeline items={timeline} />
            <p className="text-xs mt-4">Dates to be confirmed by Corporate Communications before publishing.</p>
          </motion.div>
        </section>

        {/* Past leadership */}
        <section id="past-leadership">
          <motion.div {...fadeUp} className="rounded-2xl border border-gray-200 p-7">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-[#326206]" />
              <h2 className="text-2xl font-bold">Past leadership</h2>
            </div>
            <p className="mt-2 max-w-2xl">Former Chairmen of the Board and Directors General since 2004, with their years in office.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {["Former Chairmen of the Board", "Former Directors General"].map((group) => (
                <div key={group}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#326206] mb-3">{group}</h3>
                  <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex items-center gap-3 p-3">
                        <span className="w-10 h-10 rounded-full bg-[#EEF3E8] text-[#326206] flex items-center justify-center"><UserRound className="w-5 h-5" /></span>
                        <span className="flex-1">
                          <span className="block h-3 w-40 rounded bg-gray-200" />
                          <span className="block h-2.5 w-24 rounded bg-gray-100 mt-1.5" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4">Names, photos and years in office will be added from Corporate Communications records.</p>
          </motion.div>
        </section>

        {/* Service Charter */}
        <section id="charter">
          <motion.div {...fadeUp} className="rounded-2xl bg-[#EEF3E8] p-7 border border-[#326206]/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><Award className="w-5 h-5 text-[#326206]" /></div>
                <div>
                  <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Our promise</span>
                  <h2 className="text-2xl font-bold">Service Charter</h2>
                </div>
              </div>
              <a href="#charter" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#326206] text-white text-sm font-semibold rounded-lg hover:bg-[#234504]">
                <Download className="w-4 h-4" /> Signed Service Charter (PDF)
              </a>
            </div>
            <p className="mt-4 max-w-3xl">PenCom is committed to efficient, transparent and courteous service. These are the standards you can expect. If we fall short, you can complain and we will put it right.</p>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {charter.map((c) => (
                <div key={c} className="flex items-start gap-3 p-3 rounded-xl bg-white">
                  <CheckCircle className="w-5 h-5 text-[#326206] shrink-0 mt-0.5" />
                  <span className="text-sm text-black">{c}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> The web version above is a summary; the signed PDF is the official document.</p>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>{selected && <ProfileModal p={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
