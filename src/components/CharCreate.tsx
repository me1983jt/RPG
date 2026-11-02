// v15.13.4: character creation in the old isometric-RPG layout (pick a premade or make your own on one character sheet).
// Our own art (existing sheets, cropped by CSS), names and text.
import { useMemo, useState } from "react";
import { M7_MAX, M7_MIN, M7_POOL, M7_START, M7_STATS, TRAITS2, TRAIT2_MAX, fx1513, freshM7, m7Bonus, m7Left, type M7, type M7Id } from "@/game/v1513";
import { SKILLS, skillScore, type SkillId } from "@/game/progress";
import { defaultLook, roleKit, roleStats, type RoleId } from "@/game/gear";

export interface CreateResult {
  name: string; role: RoleId; hero: "justin" | "sarah";
  m7: M7; traits2: string[]; tags: string[];
  age: number; sex: "male" | "female";
  bag: { id: string; qty: number }[]; weapon?: string; look: ReturnType<typeof defaultLook>;
  premade: "justin" | "sarah" | ""; perk: string; firstJob: string; startTown: "harmony" | "pittsfield";
  background: string; body: "" | "generic_male" | "generic_female"; tint: string;
}

/** Maine backgrounds for a custom character: one small bonus each (applied in engine start15134). */
export const BACKGROUNDS: { id: string; name: string; bonus: string }[] = [
  { id: "logger", name: "Logger", bonus: "+1 Strength and a hatchet. You've limbed more spruce than most folks have seen." },
  { id: "lobsterman", name: "Lobsterman", bonus: "+1 Endurance and smoked fish. Cold water and early mornings don't bother you." },
  { id: "mechanic", name: "Mechanic", bonus: "+1 Intellect and a toolkit. Grease under the nails for good." },
  { id: "farmer", name: "Farmer", bonus: "+1 Vigor and a few apples. Up before the cows, every day." },
  { id: "hunter", name: "Hunter", bonus: "+1 Perception and six extra shells. You know where the deer bed down." },
  { id: "townie", name: "Townie", bonus: "+1 Luck and hot cider. Everyone at the store knows your name." },
];
export const START_TOWNS = [
  { id: "harmony", name: "Harmony", blurb: "The village on Route 150. Most folks start here." },
  { id: "pittsfield", name: "Pittsfield", blurb: "The railroad town to the southeast: rails, a water tower, the co-op." },
] as const;
/** Coat tints are the coat dyes the game already paints (wool, spruce, linen, soot). */
export const TINTS = [
  { id: "wool", name: "Brown wool", color: "#8c6242" },
  { id: "spruce", name: "Spruce green", color: "#46684a" },
  { id: "linen", name: "Pale linen", color: "#cec0a0" },
  { id: "soot", name: "Soot black", color: "#42444a" },
] as const;

/** Skills shown under the names the sheet uses (Foraging = Trail, Repair = Mechanics). */
export const SKILL_LABEL: Record<string, string> = { rifle: "Rifles", mechanics: "Repair", trail: "Foraging", lock: "Lockpick" };
const SKILL_INFO: Record<string, string> = {
  rifle: "Rifles, carbines and shotguns. Better aim and more crits at range.",
  mechanics: "Repair: fix gear, engines and the bike; build at the bench.",
  trail: "Foraging: herbs, berries, tracks and trail sense. Know what the woods will feed you and what will kill you.",
  barter: "Trading: better prices at every store and swap table.",
  speech: "Talking folks round: persuade, calm, bluff and learn more in talk.",
  sneak: "Moving unseen: get the first shot and slip past trouble.",
};
const label = (id: string) => SKILL_LABEL[id] ?? SKILLS.find((s) => s.id === id)?.name ?? id;

interface Premade { id: "justin" | "sarah"; perk: [string, string]; trait: string; name: string; age: number; sex: "male" | "female"; role: RoleId; bio: string; m7: M7; tags: SkillId[]; traits2: string[]; bag: { id: string; qty: number }[]; weapon?: string; gear: string }
export const PREMADES: Premade[] = [
  {
    id: "justin", name: "Justin", age: 34, sex: "male", role: "hunter", trait: "Army Vet", perk: ["Field Fix", "Repairs worn gear from the pack, away from the bench."],
    bio: "Came home to Harmony after two tours and never quite stopped tinkering. His barn is half machine shop; folks bring him whatever won't start. Starts at Pittsfield with the dead handcar line.",
    m7: { back: 7, eye: 5, wind: 7, neighborly: 4, knowhow: 4, quick: 7, fortune: 6 },
    tags: ["rifle", "mechanics", "sneak"], traits2: ["armyvet"],
    bag: [{ id: "shells", qty: 14 }, { id: "toolkit", qty: 1 }, { id: "wire", qty: 1 }], gear: "Hunting rifle, 20 shells, mechanic's toolkit",
  },
  {
    id: "sarah", name: "Sarah", age: 31, sex: "female", role: "medic", trait: "Green Thumb", perk: ["Farm Friend", "Farmers and traders give her better prices."],
    bio: "Keeps the biggest garden in Harmony and knows every root on the Cambridge Road. Can talk a Pittsfield trader out of his boots and thank her for it. Starts in Harmony, chasing medicine.",
    m7: { back: 4, eye: 7, wind: 5, neighborly: 8, knowhow: 7, quick: 4, fortune: 5 },
    tags: ["trail", "speech", "barter"], traits2: ["greenthumb"],
    bag: [{ id: "dandelion", qty: 3 }, { id: "tonic", qty: 2 }, { id: "berries", qty: 2 }, { id: "medicine", qty: 1 }, { id: "syrup", qty: 2 }, { id: "maple", qty: 2 }, { id: "pelt", qty: 1 }], gear: "Herbs, tea, bandages, medicine, syrup, maple tins and a pelt to trade",
  },
];

function derived(role: RoleId, m: M7, traits: string[]) {
  const fx = fx1513(m, traits, []), kit = roleKit(role), b = m7Bonus(m), st = roleStats(role);
  const str = st.strength + b.strength;
  return {
    fx,
    rows: [
      ["Hit Points", `${kit.hp + fx.hp}`, "How much punishment you take before you go down."],
      ["Armor", `${fx.armor}`, "Damage shaved off every hit, before any coat or plate you wear."],
      ["Action Points", `${8 + fx.ap}`, "What you can do in one turn of a fight: steps, shots, swings."],
      ["Carry Weight", `${40 + str * 4 + fx.carry} lb`, "How much you can haul before you slow down."],
      ["Melee Damage", `+${kit.atk + fx.melee}`, "Extra damage on every swing and punch."],
      ["Sequence", `${Math.max(1, 5 + fx.seq)}`, "Who moves first when a fight breaks out."],
      ["Healing Rate", `${Math.max(1, Math.floor(m.wind / 3))}`, "Health you get back each rest."],
      ["Critical Chance", `${Math.max(0, Math.round(5 + fx.crit))}%`, "Odds a hit lands somewhere that really hurts."],
    ] as [string, string, string][],
  };
}
function skillPcts(role: RoleId, m: M7, traits: string[], tags: string[]) {
  const fx = fx1513(m, traits, []), b = m7Bonus(m), st = roleStats(role);
  const stats = { strength: st.strength + b.strength, vigor: st.vigor + b.vigor, endurance: st.endurance + b.endurance, intellect: st.intellect + b.intellect, perception: st.perception + b.perception, luck: st.luck + b.luck, agility: 1 + b.agility, trait: "", extra: fx.skill };
  return SKILLS.map((s) => ({ id: s.id, pct: skillScore(s.id, stats, {}, tags as SkillId[], []) }));
}

const PAPER = "cc-paper";

/** Portrait slot: a placeholder frame (painted portraits come later). Inside, the hero's existing standing sheet, cropped by CSS. */
function Portrait({ who, className = "" }: { who: "justin" | "sarah" | "own"; className?: string }) {
  if (who === "own") return <div data-portrait-slot="custom" className={`cc-portrait flex items-center justify-center font-display text-4xl text-[#5b4a33] ${className}`} aria-hidden>?</div>;
  const src = who === "justin" ? "/game/npc-justin.png" : "/game/npc-sarah.png";
  return <div data-portrait-slot={who} className={`cc-portrait ${className}`} aria-hidden style={{ backgroundImage: `url(${src})`, backgroundSize: "400% 800%", backgroundPosition: "0 0", backgroundRepeat: "no-repeat", imageRendering: "auto" }} />;
}

export function CharCreate(props: {
  hasSave: boolean; ready: boolean;
  onBegin: (r: CreateResult) => void;
  onContinue: () => void;
  slots: { slot: number; label: string }[]; slot: number; onSlot: (n: number) => void;
  auto?: { slot: number; label: string; where?: string } | null; onAuto: () => void;
}) {
  const [screen, setScreen] = useState<"pick" | "sheet">("pick");
  const [confirm, setConfirm] = useState<CreateResult | null>(null);
  const [name, setName] = useState("Wanderer");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [hero, setHero] = useState<"justin" | "sarah">("justin");
  const [role, setRole] = useState<RoleId>("fighter");
  const [m7, setM7] = useState<M7>(freshM7);
  const [traits, setTraits] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [bag, setBag] = useState<{ id: string; qty: number }[]>([]);
  const [premade, setPremade] = useState<"justin" | "sarah" | "">("");
  const [bgId, setBgId] = useState("farmer");
  const [town, setTown] = useState<"harmony" | "pittsfield">("harmony");
  const [tint, setTint] = useState<string>("wool");
  const [info, setInfo] = useState<[string, string]>(["Character sheet", "Tap any stat, skill or trait to read what it does. Spend every point, tag exactly 3 skills, then press Done."]);
  const left = m7Left(m7);
  const d = useMemo(() => derived(role, m7, traits), [role, m7, traits]);
  const pcts = useMemo(() => skillPcts(role, m7, traits, tags), [role, m7, traits, tags]);

  const go = (r: CreateResult) => (props.hasSave ? setConfirm(r) : props.onBegin(r));
  const fromPremade = (p: Premade): CreateResult => ({ name: p.name, role: p.role, hero: p.id, m7: { ...p.m7 }, traits2: [...p.traits2], tags: [...p.tags], age: p.age, sex: p.sex, bag: p.bag, weapon: p.weapon, look: defaultLook(p.role), premade: p.id, perk: p.id === "justin" ? "fieldfix" : "farmfriend", firstJob: p.id, startTown: p.id === "justin" ? "pittsfield" : "harmony", background: "", body: "", tint: "" });
  const openSheet = (p?: Premade) => {
    if (p) { setName(p.name); setAge(p.age); setSex(p.sex); setHero(p.id); setRole(p.role); setM7({ ...p.m7 }); setTraits([...p.traits2]); setTags([...p.tags]); setBag(p.bag); setPremade(p.id); setTown(p.id === "justin" ? "pittsfield" : "harmony"); setTint(defaultLook(p.role)); }
    else { setPremade(""); setBgId("farmer"); setTown("harmony"); setTint("wool"); setName("Wanderer"); setAge(28); setSex("male"); setHero("justin"); setRole("fighter"); setM7(freshM7()); setTraits([]); setTags([]); setBag([]); }
    setScreen("sheet");
  };
  const bump = (k: M7Id, n: number) => setM7((m) => { const v = m[k] + n; if (v < M7_MIN || v > M7_MAX || (n > 0 && m7Left(m) < 1)) return m; return { ...m, [k]: v }; });
  const flipTag = (id: string) => setTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= 3 ? t : [...t, id]));
  const flipTrait = (id: string) => setTraits((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= TRAIT2_MAX ? t : [...t, id]));
  const randomize = () => {
    const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
    const m = freshM7(); let pool = M7_POOL;
    for (let i = 0; i < 40; i++) { const a = pick(M7_STATS).id, b = pick(M7_STATS).id; if (a !== b && m[b] > 3 && m[a] < 9) { m[a]++; m[b]--; } }
    while (pool > 0) { const a = pick(M7_STATS).id; if (m[a] < M7_MAX) { m[a]++; pool--; } }
    const sk = [...SKILLS].sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.id);
    const tr = [...TRAITS2].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3)).map((x) => x.id);
    const sx = Math.random() < 0.5 ? "male" : "female";
    setM7(m); setTags(sk); setTraits(tr); setSex(sx); setHero(sx === "female" ? "sarah" : "justin");
    setName(pick(sx === "male" ? ["Eben", "Lyle", "Royce", "Dana", "Wendell", "Cyrus"] : ["Mavis", "Nell", "Dottie", "Hazel", "Ione", "Bea"]));
    setAge(18 + Math.floor(Math.random() * 45)); setBgId(pick(BACKGROUNDS).id); setTown(pick(START_TOWNS).id); setTint(pick(TINTS).id);
    setInfo(["Random", "A stranger off the back roads. Change anything you like before you press Done."]);
  };
  const doneOk = left === 0 && tags.length === 3 && name.trim().length > 0;

  if (confirm) {
    return (
      <div className="cc-root flex items-center justify-center">
        <div className={`${PAPER} max-w-md p-4 text-center`}>
          <p className="font-display text-xl">Start over?</p>
          <p className="mt-2 text-sm">A saved character is already in this slot. Starting a new one replaces it.</p>
          <div className="mt-3 flex justify-center gap-2">
            <button type="button" className="cc-btn cc-btn-go" onClick={() => props.onBegin(confirm)}>Replace save</button>
            <button type="button" className="cc-btn" onClick={() => setConfirm(null)}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "pick") {
    return (
      <div className="cc-root flex flex-col" data-testid="cc-pick">
        <div className="flex shrink-0 items-end justify-between gap-2 px-1 pb-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b878]">Northwestern Maine</p>
            <h1 className="font-display text-2xl leading-none text-[#f1e3c0] short:text-xl">Choose who walks out of the woods</h1>
            <p data-version="0.1" className="text-[10px] text-[#d8b878] opacity-80">v0.1 - coming next: custom hero farm opening, Gus warning, first Pelletier raid</p>
          </div>
          {props.hasSave ? <button type="button" data-testid="continue-btn" className="cc-btn cc-btn-go" onClick={props.onContinue}>Continue</button> : null}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2">
          {PREMADES.map((p) => (
            <div key={p.id} className={`${PAPER} flex min-h-0 flex-col p-2`} data-testid={`card-${p.id}`}>
              <div className="flex min-h-0 gap-2">
                <Portrait who={p.id} className="h-24 w-[4.3rem] shrink-0" />
                <div className="min-w-0">
                  <p className="font-display text-xl leading-none">{p.name}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">{p.sex === "male" ? "Male" : "Female"}, {p.age}</p>
                  <p className="mt-1 text-[11px] leading-snug">{p.bio}</p>
                </div>
              </div>
              <div className="mt-1 grid grid-cols-7 gap-px text-center text-[10px] leading-tight">
                {M7_STATS.map((s) => <div key={s.id} className="cc-cell"><b className="block">{s.short}</b>{p.m7[s.id]}</div>)}
              </div>
              <p className="mt-1 text-[10px] leading-snug"><b>Tagged:</b> {p.tags.map(label).join(", ")}</p>
              <p className="text-[10px] leading-snug"><b>Trait:</b> {p.trait} · <b>Perk:</b> {p.perk[0]}</p>
              <p className="text-[10px] leading-snug"><b>Gear:</b> {p.gear}</p>
              <div className="mt-auto flex gap-1 pt-1">
                <button type="button" className="cc-btn cc-btn-go flex-1" data-testid={`take-${p.id}`} onClick={() => go(fromPremade(p))}>Take</button>
                <button type="button" className="cc-btn flex-1" data-testid={`modify-${p.id}`} onClick={() => openSheet(p)}>Modify</button>
              </div>
            </div>
          ))}
          <div className={`${PAPER} flex min-h-0 flex-col p-2`} data-testid="card-own">
            <div className="flex gap-2">
              <Portrait who="own" className="h-24 w-[4.3rem] shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-xl leading-none">Make your own</p>
                <p className="mt-1 text-[11px] leading-snug">A blank sheet. Name yourself, spend {M7_POOL} points over the Maine Seven, tag three skills and take up to two traits.</p>
              </div>
            </div>
            <div className="mt-1 grid grid-cols-7 gap-px text-center text-[10px] leading-tight">
              {M7_STATS.map((s) => <div key={s.id} className="cc-cell"><b className="block">{s.short}</b>{M7_START}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {props.slots.map((sl) => (
                <button key={sl.slot} type="button" role="radio" aria-checked={props.slot === sl.slot} data-testid={`slot-${sl.slot}`} className={`cc-cell px-1 py-0.5 text-left text-[10px] leading-tight ${props.slot === sl.slot ? "cc-on" : ""}`} onClick={() => props.onSlot(sl.slot)}>
                  <b className="block">Slot {sl.slot}</b><span className="block truncate">{sl.label}</span>
                </button>
              ))}
            </div>
            {props.auto ? (
              <button type="button" data-testid="slot-auto" className="cc-cell mt-1 px-1 py-0.5 text-left text-[10px]" onClick={props.onAuto}>Autosave · Slot {props.auto.slot} · {props.auto.label} · tap to load</button>
            ) : null}
            <div className="mt-auto flex pt-1">
              <button type="button" className="cc-btn cc-btn-go flex-1" data-testid="create-own" onClick={() => openSheet()}>Create</button>
            </div>
          </div>
        </div>
        {!props.ready ? <p className="text-center text-[10px] text-[#d8b878]">Painting the spruce…</p> : null}
      </div>
    );
  }

  return (
    <div className="cc-root" data-testid="cc-sheet">
      <div className={`${PAPER} grid h-full min-h-0 grid-cols-[1fr_1.05fr_1fr] gap-2 p-2`}>
        {/* left: identity, the Maine Seven, derived */}
        <div className="flex min-h-0 flex-col gap-[3px] overflow-y-auto">
          <div className="flex gap-1">
            <label className="min-w-0 flex-1 text-[9px] uppercase tracking-wider">Name
              <input id="wanderer-name" value={name} maxLength={18} onChange={(e) => setName(e.target.value)} onFocus={() => setInfo(["Name", "What folks call you. Shown in talk and on your save."])} className="cc-input block w-full" />
            </label>
            <label className="w-12 text-[9px] uppercase tracking-wider">Age
              <input data-testid="cc-age" type="number" min={16} max={80} value={age} onChange={(e) => setAge(Math.max(16, Math.min(80, Number(e.target.value) || 16)))} onFocus={() => setInfo(["Age", "Between 16 and 80. Just who you are; no rules hang on it."])} className="cc-input block w-full" />
            </label>
            <div className="text-[9px] uppercase tracking-wider">Sex
              <div className="flex">
                {(["male", "female"] as const).map((s) => <button key={s} type="button" data-testid={`cc-sex-${s}`} aria-pressed={sex === s} className={`cc-cell h-[1.55rem] px-1.5 text-[11px] ${sex === s ? "cc-on" : ""}`} onClick={() => { setSex(s); setHero(s === "female" ? "sarah" : "justin"); setInfo(["Sex", s === "female" ? "Female. You walk the world in Sarah's clothes and body." : "Male. You walk the world in Justin's clothes and body."]); }}>{s === "male" ? "M" : "F"}</button>)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="cc-h">The Maine Seven</p>
            <p className="text-[11px]" data-testid="m7-left">Points Left <b className={`cc-led ${left ? "" : "opacity-60"}`}>{left}</b></p>
          </div>
          {M7_STATS.map((s) => (
            <div key={s.id} className="flex items-center gap-1" data-m7={s.id}>
              <button type="button" className="cc-cell min-w-0 flex-1 px-1 text-left text-[11px] leading-[1.1rem]" onClick={() => setInfo([s.name, s.does])}>{s.name}</button>
              <button type="button" aria-label={`Lower ${s.name}`} className="cc-pm" disabled={m7[s.id] <= M7_MIN} onClick={() => { bump(s.id, -1); setInfo([s.name, s.does]); }}>−</button>
              <span className="cc-led w-7 text-center">{m7[s.id]}</span>
              <button type="button" aria-label={`Raise ${s.name}`} className="cc-pm" disabled={left < 1 || m7[s.id] >= M7_MAX} onClick={() => { bump(s.id, 1); setInfo([s.name, s.does]); }}>+</button>
            </div>
          ))}
          <div className="cc-box grid grid-cols-2 gap-x-2 text-[11px] leading-tight" data-testid="cc-derived">
            {d.rows.map(([k, v, t]) => (
              <button key={k} type="button" className="flex justify-between text-left" onClick={() => setInfo([k, t])}><span>{k}</span><b>{v}</b></button>
            ))}
          </div>
          {premade ? (
            <button type="button" className="cc-box text-left text-[11px] leading-snug" onClick={() => { const p = PREMADES.find((x) => x.id === premade)!; setInfo([p.perk[0], `Signature perk. ${p.perk[1]}`]); }}>
              <b>Signature perk:</b> {PREMADES.find((x) => x.id === premade)!.perk[0]} · <b>Starts:</b> {town === "pittsfield" ? "Pittsfield" : "Harmony"}
            </button>
          ) : (
            <div className="cc-box flex flex-col gap-1 text-[11px]" data-testid="cc-extras">
              <div className="flex flex-wrap items-center gap-px">
                <span className="w-9 text-[9px] uppercase tracking-wider">Past</span>
                {BACKGROUNDS.map((b) => <button key={b.id} type="button" data-bg={b.id} aria-pressed={bgId === b.id} className={`cc-cell px-[3px] text-[10px] ${bgId === b.id ? "cc-on" : ""}`} onClick={() => { setBgId(b.id); setInfo([b.name, b.bonus]); }}>{b.name}</button>)}
              </div>
              <div className="flex flex-wrap items-center gap-px">
                <span className="w-9 text-[9px] uppercase tracking-wider">Start</span>
                {START_TOWNS.map((t) => <button key={t.id} type="button" data-town={t.id} aria-pressed={town === t.id} className={`cc-cell px-1 text-[10px] ${town === t.id ? "cc-on" : ""}`} onClick={() => { setTown(t.id); setInfo([t.name, t.blurb]); }}>{t.name}</button>)}
                <span className="ml-auto pr-0.5 text-[9px] uppercase tracking-wider">Coat</span>
                {TINTS.map((t) => <button key={t.id} type="button" data-tint={t.id} aria-label={t.name} aria-pressed={tint === t.id} className={`h-4 w-4 border ${tint === t.id ? "border-2 border-[#2b2116]" : "border-[#6b5737]"}`} style={{ background: t.color }} onClick={() => { setTint(t.id); setInfo(["Coat color", t.name]); }} />)}
              </div>
            </div>
          )}
        </div>
        {/* middle: skills */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between"><p className="cc-h">Skills</p><p className="text-[11px]">Tagged <b className="cc-led">{3 - tags.length}</b> left</p></div>
          <div className="min-h-0 flex-1 overflow-y-auto" data-testid="tag-grid">
            {pcts.map((s) => {
              const on = tags.includes(s.id);
              return (
                <button key={s.id} type="button" data-tag={s.id} aria-pressed={on} className={`flex w-full items-center gap-1 border-b border-[#6b5737]/30 px-1 py-[3px] text-left text-[12px] ${on ? "cc-tagged" : ""}`}
                  onClick={() => { flipTag(s.id); setInfo([label(s.id), `${SKILL_INFO[s.id] ?? SKILLS.find((x) => x.id === s.id)?.blurb ?? ""} Tagging a skill adds +15% now and doubles every point you put in it later.`]); }}>
                  <span className={`cc-dot ${on ? "cc-dot-on" : ""}`} aria-hidden />
                  <span className="flex-1">{label(s.id)}</span>
                  <b className="tabular-nums">{s.pct}%</b>
                </button>
              );
            })}
          </div>
        </div>
        {/* right: traits, description, done/cancel */}
        <div className="flex min-h-0 flex-col gap-1">
          <p className="cc-h">Optional traits <span className="text-[10px] font-normal">({traits.length}/{TRAIT2_MAX})</span></p>
          <div className="grid shrink-0 grid-cols-2 gap-px" data-testid="trait-grid">
            {TRAITS2.map((t) => (
              <button key={t.id} type="button" data-trait2={t.id} aria-pressed={traits.includes(t.id)} className={`cc-cell truncate px-1 py-[3px] text-left text-[11px] ${traits.includes(t.id) ? "cc-on" : ""}`}
                onClick={() => { flipTrait(t.id); setInfo([t.name, `+ ${t.up}\n− ${t.down}`]); }}>{t.name}</button>
            ))}
          </div>
          <div className="cc-box min-h-0 flex-1 overflow-y-auto" data-testid="cc-info">
            <p className="font-display text-base leading-tight">{info[0]}</p>
            <p className="mt-1 whitespace-pre-line text-[11px] leading-snug">{info[1]}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button type="button" className="cc-btn cc-btn-go flex-1 disabled:opacity-40" data-testid="cc-done" disabled={!doneOk}
              onClick={() => go({ name: name.trim(), role, hero, m7, traits2: traits, tags, age, sex, bag, look: tint as CreateResult["look"],
                premade, perk: premade === "justin" ? "fieldfix" : premade === "sarah" ? "farmfriend" : "", firstJob: premade, startTown: town,
                background: premade ? "" : bgId, body: premade ? "" : sex === "female" ? "generic_female" : "generic_male", tint })}>Done</button>
            {!premade ? <button type="button" className="cc-btn" data-testid="cc-random" onClick={randomize}>Random</button> : null}
            <button type="button" className="cc-btn flex-1" data-testid="cc-cancel" onClick={() => setScreen("pick")}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
