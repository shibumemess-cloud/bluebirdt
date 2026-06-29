import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolLayout } from "../components/ToolLayout";
import { HowItWorks } from "../components/ToolControls";

export const Route = createFileRoute("/periodic-table")({
  head: () => ({
    meta: [
      { title: "Interactive Periodic Table — Free, Offline" },
      { name: "description", content: "Browse all 118 elements with symbol, atomic number, mass and group. Click any element for details. Works offline." },
      { property: "og:title", content: "Periodic Table — Bluebird" },
      { property: "og:description", content: "A clean periodic table that works in your browser." },
    ],
    links: [{ rel: "canonical", href: "/periodic-table" }],
  }),
  component: Page,
});

type El = { n: number; s: string; name: string; m: number; x: number; y: number; c: string };

const C = {
  am: "Alkali metal", ae: "Alkaline earth", tm: "Transition metal", pm: "Post-transition metal",
  me: "Metalloid", nm: "Nonmetal", hg: "Halogen", ng: "Noble gas", la: "Lanthanide", ac: "Actinide", un: "Unknown",
};
const CLR: Record<string, string> = {
  am: "bg-rose-100 text-rose-900", ae: "bg-orange-100 text-orange-900", tm: "bg-amber-100 text-amber-900",
  pm: "bg-lime-100 text-lime-900", me: "bg-teal-100 text-teal-900", nm: "bg-sky-100 text-sky-900",
  hg: "bg-indigo-100 text-indigo-900", ng: "bg-violet-100 text-violet-900",
  la: "bg-pink-100 text-pink-900", ac: "bg-fuchsia-100 text-fuchsia-900", un: "bg-slate-100 text-slate-700",
};

// Layout: x = column (1-18), y = period (1-7 main, 8 = lanthanides, 9 = actinides)
const E: El[] = [
  {n:1,s:"H",name:"Hydrogen",m:1.008,x:1,y:1,c:"nm"},{n:2,s:"He",name:"Helium",m:4.0026,x:18,y:1,c:"ng"},
  {n:3,s:"Li",name:"Lithium",m:6.94,x:1,y:2,c:"am"},{n:4,s:"Be",name:"Beryllium",m:9.0122,x:2,y:2,c:"ae"},
  {n:5,s:"B",name:"Boron",m:10.81,x:13,y:2,c:"me"},{n:6,s:"C",name:"Carbon",m:12.011,x:14,y:2,c:"nm"},
  {n:7,s:"N",name:"Nitrogen",m:14.007,x:15,y:2,c:"nm"},{n:8,s:"O",name:"Oxygen",m:15.999,x:16,y:2,c:"nm"},
  {n:9,s:"F",name:"Fluorine",m:18.998,x:17,y:2,c:"hg"},{n:10,s:"Ne",name:"Neon",m:20.180,x:18,y:2,c:"ng"},
  {n:11,s:"Na",name:"Sodium",m:22.990,x:1,y:3,c:"am"},{n:12,s:"Mg",name:"Magnesium",m:24.305,x:2,y:3,c:"ae"},
  {n:13,s:"Al",name:"Aluminium",m:26.982,x:13,y:3,c:"pm"},{n:14,s:"Si",name:"Silicon",m:28.085,x:14,y:3,c:"me"},
  {n:15,s:"P",name:"Phosphorus",m:30.974,x:15,y:3,c:"nm"},{n:16,s:"S",name:"Sulfur",m:32.06,x:16,y:3,c:"nm"},
  {n:17,s:"Cl",name:"Chlorine",m:35.45,x:17,y:3,c:"hg"},{n:18,s:"Ar",name:"Argon",m:39.948,x:18,y:3,c:"ng"},
  {n:19,s:"K",name:"Potassium",m:39.098,x:1,y:4,c:"am"},{n:20,s:"Ca",name:"Calcium",m:40.078,x:2,y:4,c:"ae"},
  {n:21,s:"Sc",name:"Scandium",m:44.956,x:3,y:4,c:"tm"},{n:22,s:"Ti",name:"Titanium",m:47.867,x:4,y:4,c:"tm"},
  {n:23,s:"V",name:"Vanadium",m:50.942,x:5,y:4,c:"tm"},{n:24,s:"Cr",name:"Chromium",m:51.996,x:6,y:4,c:"tm"},
  {n:25,s:"Mn",name:"Manganese",m:54.938,x:7,y:4,c:"tm"},{n:26,s:"Fe",name:"Iron",m:55.845,x:8,y:4,c:"tm"},
  {n:27,s:"Co",name:"Cobalt",m:58.933,x:9,y:4,c:"tm"},{n:28,s:"Ni",name:"Nickel",m:58.693,x:10,y:4,c:"tm"},
  {n:29,s:"Cu",name:"Copper",m:63.546,x:11,y:4,c:"tm"},{n:30,s:"Zn",name:"Zinc",m:65.38,x:12,y:4,c:"tm"},
  {n:31,s:"Ga",name:"Gallium",m:69.723,x:13,y:4,c:"pm"},{n:32,s:"Ge",name:"Germanium",m:72.630,x:14,y:4,c:"me"},
  {n:33,s:"As",name:"Arsenic",m:74.922,x:15,y:4,c:"me"},{n:34,s:"Se",name:"Selenium",m:78.971,x:16,y:4,c:"nm"},
  {n:35,s:"Br",name:"Bromine",m:79.904,x:17,y:4,c:"hg"},{n:36,s:"Kr",name:"Krypton",m:83.798,x:18,y:4,c:"ng"},
  {n:37,s:"Rb",name:"Rubidium",m:85.468,x:1,y:5,c:"am"},{n:38,s:"Sr",name:"Strontium",m:87.62,x:2,y:5,c:"ae"},
  {n:39,s:"Y",name:"Yttrium",m:88.906,x:3,y:5,c:"tm"},{n:40,s:"Zr",name:"Zirconium",m:91.224,x:4,y:5,c:"tm"},
  {n:41,s:"Nb",name:"Niobium",m:92.906,x:5,y:5,c:"tm"},{n:42,s:"Mo",name:"Molybdenum",m:95.95,x:6,y:5,c:"tm"},
  {n:43,s:"Tc",name:"Technetium",m:98,x:7,y:5,c:"tm"},{n:44,s:"Ru",name:"Ruthenium",m:101.07,x:8,y:5,c:"tm"},
  {n:45,s:"Rh",name:"Rhodium",m:102.91,x:9,y:5,c:"tm"},{n:46,s:"Pd",name:"Palladium",m:106.42,x:10,y:5,c:"tm"},
  {n:47,s:"Ag",name:"Silver",m:107.87,x:11,y:5,c:"tm"},{n:48,s:"Cd",name:"Cadmium",m:112.41,x:12,y:5,c:"tm"},
  {n:49,s:"In",name:"Indium",m:114.82,x:13,y:5,c:"pm"},{n:50,s:"Sn",name:"Tin",m:118.71,x:14,y:5,c:"pm"},
  {n:51,s:"Sb",name:"Antimony",m:121.76,x:15,y:5,c:"me"},{n:52,s:"Te",name:"Tellurium",m:127.60,x:16,y:5,c:"me"},
  {n:53,s:"I",name:"Iodine",m:126.90,x:17,y:5,c:"hg"},{n:54,s:"Xe",name:"Xenon",m:131.29,x:18,y:5,c:"ng"},
  {n:55,s:"Cs",name:"Caesium",m:132.91,x:1,y:6,c:"am"},{n:56,s:"Ba",name:"Barium",m:137.33,x:2,y:6,c:"ae"},
  {n:57,s:"La",name:"Lanthanum",m:138.91,x:3,y:6,c:"la"},
  {n:72,s:"Hf",name:"Hafnium",m:178.49,x:4,y:6,c:"tm"},{n:73,s:"Ta",name:"Tantalum",m:180.95,x:5,y:6,c:"tm"},
  {n:74,s:"W",name:"Tungsten",m:183.84,x:6,y:6,c:"tm"},{n:75,s:"Re",name:"Rhenium",m:186.21,x:7,y:6,c:"tm"},
  {n:76,s:"Os",name:"Osmium",m:190.23,x:8,y:6,c:"tm"},{n:77,s:"Ir",name:"Iridium",m:192.22,x:9,y:6,c:"tm"},
  {n:78,s:"Pt",name:"Platinum",m:195.08,x:10,y:6,c:"tm"},{n:79,s:"Au",name:"Gold",m:196.97,x:11,y:6,c:"tm"},
  {n:80,s:"Hg",name:"Mercury",m:200.59,x:12,y:6,c:"tm"},{n:81,s:"Tl",name:"Thallium",m:204.38,x:13,y:6,c:"pm"},
  {n:82,s:"Pb",name:"Lead",m:207.2,x:14,y:6,c:"pm"},{n:83,s:"Bi",name:"Bismuth",m:208.98,x:15,y:6,c:"pm"},
  {n:84,s:"Po",name:"Polonium",m:209,x:16,y:6,c:"pm"},{n:85,s:"At",name:"Astatine",m:210,x:17,y:6,c:"hg"},
  {n:86,s:"Rn",name:"Radon",m:222,x:18,y:6,c:"ng"},
  {n:87,s:"Fr",name:"Francium",m:223,x:1,y:7,c:"am"},{n:88,s:"Ra",name:"Radium",m:226,x:2,y:7,c:"ae"},
  {n:89,s:"Ac",name:"Actinium",m:227,x:3,y:7,c:"ac"},
  {n:104,s:"Rf",name:"Rutherfordium",m:267,x:4,y:7,c:"tm"},{n:105,s:"Db",name:"Dubnium",m:268,x:5,y:7,c:"tm"},
  {n:106,s:"Sg",name:"Seaborgium",m:269,x:6,y:7,c:"tm"},{n:107,s:"Bh",name:"Bohrium",m:270,x:7,y:7,c:"tm"},
  {n:108,s:"Hs",name:"Hassium",m:277,x:8,y:7,c:"tm"},{n:109,s:"Mt",name:"Meitnerium",m:278,x:9,y:7,c:"un"},
  {n:110,s:"Ds",name:"Darmstadtium",m:281,x:10,y:7,c:"un"},{n:111,s:"Rg",name:"Roentgenium",m:282,x:11,y:7,c:"un"},
  {n:112,s:"Cn",name:"Copernicium",m:285,x:12,y:7,c:"tm"},{n:113,s:"Nh",name:"Nihonium",m:286,x:13,y:7,c:"un"},
  {n:114,s:"Fl",name:"Flerovium",m:289,x:14,y:7,c:"un"},{n:115,s:"Mc",name:"Moscovium",m:290,x:15,y:7,c:"un"},
  {n:116,s:"Lv",name:"Livermorium",m:293,x:16,y:7,c:"un"},{n:117,s:"Ts",name:"Tennessine",m:294,x:17,y:7,c:"un"},
  {n:118,s:"Og",name:"Oganesson",m:294,x:18,y:7,c:"ng"},
  // Lanthanides row (period 8 display, columns 3-17 use 58-71)
  ...[
    [58,"Ce","Cerium",140.12],[59,"Pr","Praseodymium",140.91],[60,"Nd","Neodymium",144.24],
    [61,"Pm","Promethium",145],[62,"Sm","Samarium",150.36],[63,"Eu","Europium",151.96],
    [64,"Gd","Gadolinium",157.25],[65,"Tb","Terbium",158.93],[66,"Dy","Dysprosium",162.50],
    [67,"Ho","Holmium",164.93],[68,"Er","Erbium",167.26],[69,"Tm","Thulium",168.93],
    [70,"Yb","Ytterbium",173.05],[71,"Lu","Lutetium",174.97],
  ].map((r, i) => ({ n: r[0] as number, s: r[1] as string, name: r[2] as string, m: r[3] as number, x: 4 + i, y: 9, c: "la" })),
  ...[
    [90,"Th","Thorium",232.04],[91,"Pa","Protactinium",231.04],[92,"U","Uranium",238.03],
    [93,"Np","Neptunium",237],[94,"Pu","Plutonium",244],[95,"Am","Americium",243],
    [96,"Cm","Curium",247],[97,"Bk","Berkelium",247],[98,"Cf","Californium",251],
    [99,"Es","Einsteinium",252],[100,"Fm","Fermium",257],[101,"Md","Mendelevium",258],
    [102,"No","Nobelium",259],[103,"Lr","Lawrencium",262],
  ].map((r, i) => ({ n: r[0] as number, s: r[1] as string, name: r[2] as string, m: r[3] as number, x: 4 + i, y: 10, c: "ac" })),
];

function Page() {
  const [sel, setSel] = useState<El | null>(null);
  const [q, setQ] = useState("");
  const match = (el: El) => !q || el.name.toLowerCase().includes(q.toLowerCase()) || el.s.toLowerCase() === q.toLowerCase() || String(el.n) === q;

  return (
    <ToolLayout slug="periodic-table">
      <div className="soft-card p-4 sm:p-5 space-y-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, symbol or number…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 min-h-11" />
        <div className="overflow-x-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(18, minmax(56px, 1fr))" }}>
            {E.map((el) => (
              <button key={el.n} onClick={() => setSel(el)}
                aria-label={`${el.name} (${el.s})`}
                className={`${CLR[el.c]} ${match(el) ? "opacity-100" : "opacity-25"} rounded-md aspect-square p-1 flex flex-col items-start justify-between text-left transition hover:scale-105 motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-ring`}
                style={{ gridColumn: el.x, gridRow: el.y }}>
                <span className="text-[10px] tabular-nums opacity-70">{el.n}</span>
                <span className="font-bold text-base sm:text-lg leading-none w-full text-center">{el.s}</span>
                <span className="text-[9px] truncate w-full">{el.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(C).map(([k, v]) => <span key={k} className={`${CLR[k]} rounded-full px-2 py-1`}>{v}</span>)}
        </div>
      </div>

      {sel && (
        <div role="dialog" aria-label={sel.name} className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setSel(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-baseline gap-3">
              <div className={`${CLR[sel.c]} rounded-xl px-4 py-3 text-3xl font-bold`}>{sel.s}</div>
              <div>
                <div className="text-2xl font-display">{sel.name}</div>
                <div className="text-sm text-muted-foreground">Atomic number {sel.n}</div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Atomic mass</dt><dd className="tabular-nums">{sel.m}</dd>
              <dt className="text-muted-foreground">Category</dt><dd>{C[sel.c as keyof typeof C]}</dd>
              <dt className="text-muted-foreground">Symbol</dt><dd>{sel.s}</dd>
            </dl>
            <button onClick={() => setSel(null)} className="mt-5 w-full min-h-11 rounded-xl bg-primary text-primary-foreground font-medium">Close</button>
          </div>
        </div>
      )}

      <HowItWorks>
        <p>Click any element to see its details. Use the search box to find elements by name, symbol or number. The table is colour-coded by category and works fully offline.</p>
      </HowItWorks>
    </ToolLayout>
  );
}
