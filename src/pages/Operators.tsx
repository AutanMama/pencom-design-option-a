import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Search, Landmark, Phone, MapPin, Users, Shield, Building2, Globe, Mail,
  ShieldCheck, ShieldAlert, ShieldX, Map as MapIcon, Info, ArrowRight, BarChart3, ExternalLink
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { operators } from "@/lib/data";
import { pfaRankings, fundReturns } from "@/pages/Performance";

// Operator directory (questionnaire DES-28, DES-29 + 13 Nov meeting):
// name, type, licence status, address, phone (Call), email, website (Visit), map.
// Closed or restricted operators are clearly marked. "Compare PFAs" removed as the meeting asked.
// All contact details are sample data until the licensing department confirms them.

type Status = "Licensed" | "Restricted" | "Closed";
type Kind = "PFA" | "PFC" | "CPFA" | "Related";
type Operator = { name: string; kind: Kind; status: Status; address: string; city: string; phone?: string; email?: string; website?: string; about?: string };

const pfaWebsites: Record<string, string> = {
  "ARM Pension Managers (PFA) Limited": "https://armpension.com",
  "Leadway Pensure PFA Limited": "https://www.leadway-pensure.com",
  "FCMB Pensions Limited": "https://www.fcmbpensions.com",
  "AIICO Pension Managers Limited": "https://www.aiicopension.com",
};

const directory: Operator[] = [
  ...operators.map((o) => ({
    name: o.name, kind: "PFA" as const, status: "Licensed" as const, address: o.address, city: o.address, phone: o.phone, website: pfaWebsites[o.name],
  })),
  { name: "First Pension Custodian Nigeria Limited", kind: "PFC", status: "Licensed", address: "Victoria Island, Lagos", city: "Lagos", phone: "01-2774880" },
  { name: "UBA Pensions Custodian Limited", kind: "PFC", status: "Licensed", address: "Marina, Lagos", city: "Lagos", phone: "01-2808222" },
  { name: "Zenith Pensions Custodian Limited", kind: "PFC", status: "Licensed", address: "Victoria Island, Lagos", city: "Lagos", phone: "01-2787000" },
  { name: "Nestle Nigeria Trust (CPFA) Limited", kind: "CPFA", status: "Licensed", address: "Ilupeju, Lagos", city: "Lagos" },
  { name: "Progress Trust (CPFA) Limited", kind: "CPFA", status: "Licensed", address: "Iganmu, Lagos", city: "Lagos" },
  { name: "Chevron Nigeria Pension Plan Limited", kind: "CPFA", status: "Licensed", address: "Lekki, Lagos", city: "Lagos" },
  { name: "Shell Nigeria Closed Pension Fund Administrator Limited", kind: "CPFA", status: "Licensed", address: "Lagos", city: "Lagos" },
  { name: "Pension Transitional Arrangement Directorate (PTAD)", kind: "Related", status: "Licensed", address: "Wuse, Abuja", city: "Abuja", about: "Manages pensions of retirees under the old Defined Benefits Scheme (before 2004)." },
  { name: "Pension Operators Association of Nigeria (PenOp)", kind: "Related", status: "Licensed", address: "Lagos", city: "Lagos", about: "The association of licensed pension operators in Nigeria." },
];

const kinds: { key: Kind; label: string; long: string; icon: typeof Landmark; help: string }[] = [
  { key: "PFA", label: "PFAs", long: "Pension Fund Administrators", icon: Landmark, help: "Manage and invest your Retirement Savings Account (RSA). You choose one PFA." },
  { key: "PFC", label: "PFCs", long: "Pension Fund Custodians", icon: Building2, help: "Keep pension money and assets safe. They hold the funds, not the PFAs." },
  { key: "CPFA", label: "CPFAs", long: "Closed Pension Fund Administrators", icon: Users, help: "Run pension schemes for the staff of one company only. Not open to the public." },
  { key: "Related", label: "Related bodies", long: "Related bodies", icon: Shield, help: "Other organisations in the pension industry." },
];

const statusStyle: Record<Status, { cls: string; icon: typeof ShieldCheck; help: string }> = {
  Licensed: { cls: "bg-[#EEF3E8] text-[#326206]", icon: ShieldCheck, help: "Licensed and operating normally" },
  Restricted: { cls: "bg-[#FBF4E8] text-[#8A5E1C]", icon: ShieldAlert, help: "Operating under PenCom restrictions" },
  Closed: { cls: "bg-[#FBEAE8] text-[#9D2B1F]", icon: ShieldX, help: "No longer operating; accounts moved to another PFA" },
};

const sections = [
  { id: "directory", label: "Directory" },
  { id: "performance", label: "Returns and fees" },
];

const mapUrl = (o: Operator) => `https://maps.google.com/maps?q=${encodeURIComponent(`${o.name}, ${o.address}, Nigeria`)}&z=14&output=embed`;
const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export default function Operators() {
  const [kind, setKind] = useState<Kind>("PFA");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [city, setCity] = useState("All");
  const [mapFor, setMapFor] = useState<Operator | null>(null);

  const ofKind = directory.filter((o) => o.kind === kind);
  const cities = ["All", ...Array.from(new Set(ofKind.map((o) => o.city)))];
  const list = useMemo(() => ofKind.filter((o) =>
    (status === "All" || o.status === status) &&
    (city === "All" || o.city === city) &&
    (!query || `${o.name} ${o.address}`.toLowerCase().includes(query.toLowerCase()))
  ), [ofKind, status, city, query]);
  const current = kinds.find((k) => k.key === kind)!;
  const shownOnMap = mapFor && mapFor.kind === kind ? mapFor : list[0];

  // On phones the map is below the list, so scroll down to it
  const showOnMap = (o: Operator) => {
    setMapFor(o);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById("operator-map");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 126) - 60, behavior: "smooth" });
      }, 50);
    }
  };

  const changeKind = (k: Kind) => { setKind(k); setQuery(""); setCity("All"); setStatus("All"); setMapFor(null); };

  return (
    <div>
      <PageBanner
        label="Operators"
        title="Licensed pension operators"
        description="Find a Pension Fund Administrator (PFA), Pension Fund Custodian (PFC) or other licensed operator. Call them, visit their website or see them on the map."
        bgImage="./banner-elders.jpg"
      />

      <nav aria-label="On this page" className="sticky top-[var(--header-h,126px)] z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <Link key={s.id} to={`/operators#${s.id}`} className="shrink-0 px-3 py-3 text-sm font-medium border-b-2 border-transparent hover:border-[#326206] hover:text-[#326206]">{s.label}</Link>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <section id="directory">
          <span id="pfas" />
          {/* Operator type */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="tablist" aria-label="Operator type">
            {kinds.map((k) => {
              const count = directory.filter((o) => o.kind === k.key).length;
              const on = kind === k.key;
              return (
                <button key={k.key} role="tab" aria-selected={on} onClick={() => changeKind(k.key)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${on ? "bg-[#326206] border-[#326206] text-white shadow-md" : "bg-white border-gray-200 hover:border-[#326206]/40"}`}>
                  <k.icon className={`w-6 h-6 shrink-0 ${on ? "text-white" : "text-[#326206]"}`} />
                  <span>
                    <span className={`block font-heading font-bold ${on ? "text-white" : "text-black"}`}>{k.label} <span className="font-normal text-sm opacity-75">({count})</span></span>
                    <span className={`block text-xs ${on ? "text-white/80" : ""}`}>{k.long}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm flex items-start gap-2"><Info className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" /> <span><strong className="text-black">{current.long}:</strong> {current.help}</span></p>

          {/* Filters */}
          <div className="mt-6 grid md:grid-cols-4 gap-3">
            <label className="relative md:col-span-2">
              <span className="sr-only">Search by name or area</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADAEAF]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${current.label} by name or area`}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none" />
            </label>
            <label className="text-sm">
              <span className="sr-only">Licence status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as "All" | Status)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-[#326206] outline-none">
                <option value="All">All licence statuses</option>
                <option>Licensed</option><option>Restricted</option><option>Closed</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="sr-only">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-[#326206] outline-none">
                {cities.map((c) => <option key={c} value={c}>{c === "All" ? "All cities" : c}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-6 grid lg:grid-cols-5 gap-6 items-start">
            {/* List */}
            <div className="lg:col-span-3">
              <p className="text-sm mb-3"><strong className="text-black">{list.length}</strong> {list.length === 1 ? "operator" : "operators"} found</p>
              <ul className="space-y-3">
                {list.map((o) => {
                  const st = statusStyle[o.status];
                  const onMap = shownOnMap?.name === o.name;
                  return (
                    <li key={o.name} className={`bg-white rounded-xl border p-4 transition-colors ${onMap ? "border-[#326206]" : "border-gray-200"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-black leading-snug">{o.name}</h3>
                        <span title={st.help} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}><st.icon className="w-3 h-3" /> {o.status}</span>
                      </div>
                      <p className="text-sm mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#ADAEAF]" /> {o.address}</p>
                      {o.about && <p className="text-sm mt-1">{o.about}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {o.phone && (
                          <a href={telHref(o.phone)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#326206] text-white text-sm font-semibold hover:bg-[#234504]">
                            <Phone className="w-4 h-4" /> Call {o.phone}
                          </a>
                        )}
                        {o.website ? (
                          <a href={o.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#326206] text-[#326206] text-sm font-semibold hover:bg-[#EEF3E8]">
                            <Globe className="w-4 h-4" /> Visit website <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-xs"><Globe className="w-3.5 h-3.5" /> Website to be confirmed</span>
                        )}
                        {o.email && (
                          <a href={`mailto:${o.email}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-[#326206]"><Mail className="w-4 h-4" /> Email</a>
                        )}
                        <button onClick={() => showOnMap(o)} aria-pressed={onMap} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold ${onMap ? "bg-[#EEF3E8] border-[#326206] text-[#326206]" : "border-gray-300 hover:border-[#326206]"}`}>
                          <MapIcon className="w-4 h-4" /> {onMap ? "On the map" : "Show on map"}
                        </button>
                      </div>
                    </li>
                  );
                })}
                {list.length === 0 && (
                  <li className="rounded-xl bg-[#F7F8F5] p-6 text-center text-sm">No operators match your search. Try another name or clear the filters.</li>
                )}
              </ul>
            </div>

            {/* Map */}
            <aside id="operator-map" className="lg:col-span-2 lg:sticky lg:top-[calc(var(--header-h,126px)+64px)]">
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                {shownOnMap ? (
                  <>
                    <iframe key={shownOnMap.name} title={`Map showing ${shownOnMap.name}`} src={mapUrl(shownOnMap)} className="w-full h-72 lg:h-96 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    <div className="p-4">
                      <p className="font-semibold text-black text-sm">{shownOnMap.name}</p>
                      <p className="text-xs mt-0.5">{shownOnMap.address}</p>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(`${shownOnMap.name}, ${shownOnMap.address}, Nigeria`)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#326206] hover:underline">Get directions <ArrowRight className="w-4 h-4" /></a>
                    </div>
                  </>
                ) : (
                  <div className="h-72 flex items-center justify-center text-sm">Choose an operator to see it on the map.</div>
                )}
              </div>
              <div className="mt-4 rounded-xl bg-[#F7F8F5] p-4 text-xs space-y-1.5">
                <p className="font-bold text-black text-sm">Licence status</p>
                {(Object.keys(statusStyle) as Status[]).map((s) => {
                  const st = statusStyle[s];
                  return <p key={s} className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${st.cls}`}><st.icon className="w-3 h-3" />{s}</span>{st.help}</p>;
                })}
                <p className="pt-2">Contact details are sample data until confirmed by the licensing department.</p>
              </div>
            </aside>
          </div>
        </section>

        {/* Returns and fees (DES-29): simple tables with dates, no "Compare PFAs" tool */}
        <section id="performance">
          <span className="text-xs font-bold text-[#326206] uppercase tracking-wider">Returns and fees</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">How pension funds are performing</h2>
          <p className="mt-2 max-w-3xl">Every RSA is in a fund that matches your age: younger contributors can be in Fund I or II, older ones in Fund III, and retirees in Fund IV. Returns are shown for the period stated; past returns do not guarantee future returns.</p>

          <div className="mt-6 grid lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold">Average return by fund type</h3>
              <p className="text-xs mt-0.5">Year to date, as at 31 May 2026 · Source: PenCom monthly report</p>
              <ul className="mt-4 space-y-3">
                {fundReturns.map((f) => (
                  <li key={f.name}>
                    <div className="flex justify-between text-sm"><span className="text-black font-medium">{f.name} <span className="font-normal">· {f.subtitle}</span></span><span className="font-bold text-[#326206]">{f.return}%</span></div>
                    <div className="mt-1 h-2.5 rounded-full bg-[#EEF3E8] overflow-hidden" aria-hidden="true">
                      <div className="h-full rounded-full bg-[#326206]" style={{ width: `${(f.return / 15) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="font-bold">PFA figures (RSA Fund II)</h3>
                <p className="text-xs mt-0.5">As at 31 May 2026 · Source: PFA returns to PenCom · Listed in alphabetical order</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                  <caption className="sr-only">Assets, returns and contributors for each PFA, as at 31 May 2026</caption>
                  <thead className="bg-[#F7F8F5] text-black">
                    <tr>
                      <th scope="col" className="text-left px-5 py-2.5 font-semibold">PFA</th>
                      <th scope="col" className="text-right px-3 py-2.5 font-semibold">Assets</th>
                      <th scope="col" className="text-right px-3 py-2.5 font-semibold">Return (year to date)</th>
                      <th scope="col" className="text-right px-3 py-2.5 font-semibold">Return (1 year)</th>
                      <th scope="col" className="text-right px-5 py-2.5 font-semibold">RSA holders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...pfaRankings].sort((a, b) => a.name.localeCompare(b.name)).map((p) => (
                      <tr key={p.name}>
                        <th scope="row" className="text-left px-5 py-2.5 font-medium text-black">{p.name}</th>
                        <td className="text-right px-3 py-2.5">{p.aum}</td>
                        <td className="text-right px-3 py-2.5 font-semibold text-[#326206]">{p.returnYTD}</td>
                        <td className="text-right px-3 py-2.5">{p.oneYear}%</td>
                        <td className="text-right px-5 py-2.5">{p.contributors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 pt-3 border-t border-gray-100 text-xs space-y-1">
                <p><strong className="text-black">Fees:</strong> each PFA's published fees will be added here once approved.</p>
                <p>All figures are sample data until checked by the Research and Surveillance departments.</p>
              </div>
            </div>
          </div>

          <Link to="/performance" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#326206] text-white font-semibold rounded-lg hover:bg-[#234504]">
            <BarChart3 className="w-4 h-4" /> See the full industry dashboard
          </Link>
        </section>
      </div>
    </div>
  );
}
