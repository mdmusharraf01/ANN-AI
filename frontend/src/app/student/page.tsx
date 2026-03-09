"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Sun, Coffee, Moon, Sparkles, Leaf, TrendingDown,
  Star, Send, ChevronRight, Zap, Bot, X,
  CheckCircle2, Clock, Flame, Droplets, Award,
  ChevronDown, Heart, Bell, User, Users, Trophy,
  Apple, AlertCircle
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

// ─── API BASE ────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface MenuItem {
  id: string;
  meal: "Breakfast" | "Lunch" | "Dinner";
  icon: ReactNode;
  color: string;
  glow: string;
  border: string;
  time: string;
  mainDish: string;
  items: string[];
  calories: number;
  protein: string;
  carbs: string;
  tag: string;
}

interface Suggestion {
  id: string;
  title: string;
  reason: string;
  icon: ReactNode;
  accent: string;
  badge: string;
}

interface CrowdSeries { t: string; v: number; }
interface CrowdData {
  current_load: number;
  best_time: string;
  peak_time: string;
  series: CrowdSeries[];
}

interface NutritionData {
  score: number;
  protein: number;
  carbs: number;
  vegetables: number;
  recommendation: string;
}

interface LeaderboardEntry {
  name: string;
  points: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MENU_ITEMS: MenuItem[] = [
  {
    id: "breakfast",
    meal: "Breakfast",
    icon: <Coffee size={20} />,
    color: "from-amber-500/20 to-yellow-600/10",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/30",
    time: "7:30 – 9:00 AM",
    mainDish: "Masala Oats + Poha",
    items: ["Masala Oats", "Poha", "Banana", "Boiled Egg", "Milk"],
    calories: 480,
    protein: "18g",
    carbs: "62g",
    tag: "High Energy",
  },
  {
    id: "lunch",
    meal: "Lunch",
    icon: <Sun size={20} />,
    color: "from-emerald-500/20 to-green-600/10",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/30",
    time: "12:30 – 2:00 PM",
    mainDish: "Dal Tadka + Rice",
    items: ["Dal Tadka", "Steamed Rice", "Jeera Aloo", "Salad", "Curd", "Chapati ×2"],
    calories: 720,
    protein: "24g",
    carbs: "95g",
    tag: "Balanced",
  },
  {
    id: "dinner",
    meal: "Dinner",
    icon: <Moon size={20} />,
    color: "from-violet-500/20 to-purple-600/10",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/30",
    time: "7:30 – 9:00 PM",
    mainDish: "Paneer Butter Masala",
    items: ["Paneer Butter Masala", "Roti ×3", "Raita", "Kheer", "Papad"],
    calories: 680,
    protein: "28g",
    carbs: "78g",
    tag: "Protein Rich",
  },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: "s1",
    title: "Skip Kheer Tonight",
    reason: "82% of students skip dessert on Wednesdays. Save 120 kcal.",
    icon: <TrendingDown size={16} />,
    accent: "text-cyan-400",
    badge: "AI Insight",
  },
  {
    id: "s2",
    title: "Add Extra Curd at Lunch",
    reason: "Your protein intake is 14% below weekly average. Curd adds 6g.",
    icon: <Flame size={16} />,
    accent: "text-emerald-400",
    badge: "Nutrition",
  },
  {
    id: "s3",
    title: "Try Oats Tomorrow",
    reason: "Students who ate oats reported 23% higher focus scores before exams.",
    icon: <Sparkles size={16} />,
    accent: "text-amber-400",
    badge: "Trending",
  },
];

const QUICK_CHIPS = ["Too Salty", "Perfect", "Need More Veg", "Loved It"];
const WASTE_PERCENT = 72;
// ─── SHIMMER SKELETON ─────────────────────────────────────────────────────────
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
      />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 p-1">
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <Shimmer className="h-8 w-full mt-2" />
      <Shimmer className="h-8 w-full" />
    </div>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v: number) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.8, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { controls.stop(); unsub(); };
  }, [target, count, rounded]);

  return <span>{display}{suffix}</span>;
}

// ─── CIRCULAR PROGRESS ───────────────────────────────────────────────────────
function CircularProgress({ value }: { value: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(0,255,135,0.08)" strokeWidth="10" />
        <motion.circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - progress }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff87" />
            <stop offset="100%" stopColor="#00c9ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="font-black text-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent leading-none">
          <AnimatedNumber target={value} suffix="%" />
        </span>
        <span className="text-[10px] text-slate-400 tracking-widest uppercase mt-1">Saved</span>
      </div>
    </div>
  );
}

// ─── COUNTDOWN TIMER ──────────────────────────────────────────────────────────
function useCountdown(targetHour: number, targetMin: number) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(targetHour, targetMin, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      setTimeLeft({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetHour, targetMin]);

  return timeLeft;
}

function TimerBlock({ value, label }: { value: number; label: string }) {
  const [flipping, setFlipping] = useState(false);
  const prev = useRef(value);
  
  useEffect(() => {
    setFlipping(prev.current !== value);
    prev.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        key={value}
        initial={flipping ? { rotateX: -90, opacity: 0 } : false}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md"
        style={{ perspective: 400 }}
      >
        <span className="text-2xl font-black tabular-nums bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
          {String(value).padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-[9px] tracking-widest uppercase text-slate-500">{label}</span>
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <motion.button
          key={s}
          type="button"
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${s} stars`}
          className="focus:outline-none"
        >
          <Star
            size={26}
            className={`transition-colors duration-150 ${
              s <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-slate-600"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

// ─── SECTION HEADING ──────────────────────────────────────────────────────────
function SectionHeading({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        {icon}
      </div>
      <div>
        <h2 className="font-black text-base tracking-tight text-white leading-none">{title}</h2>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── GLASS CARD ───────────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={`
        relative rounded-2xl border border-white/8 backdrop-blur-xl
        bg-gradient-to-br from-white/5 to-white/2
        shadow-xl shadow-black/40 overflow-hidden
        ${className}
      `}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
}

// ─── MENU CARD ────────────────────────────────────────────────────────────────
function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 + index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`
        relative rounded-2xl border ${item.border} backdrop-blur-xl
        bg-gradient-to-br ${item.color}
        shadow-xl ${item.glow} overflow-hidden cursor-pointer group
      `}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${item.color} opacity-40 blur-2xl`} />

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl bg-white/10 border ${item.border} text-white`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-slate-400">{item.time}</p>
              <h3 className="font-black text-base text-white leading-tight">{item.meal}</h3>
            </div>
          </div>
          <span className="text-[9px] tracking-wider uppercase px-2 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300">
            {item.tag}
          </span>
        </div>

        <p className="text-sm font-semibold text-white/90 mb-3">{item.mainDish}</p>

        <div className="flex gap-3 mb-4">
          {[
            { icon: <Flame size={10} />, val: `${item.calories} kcal`, col: "text-amber-400" },
            { icon: <Droplets size={10} />, val: item.protein, col: "text-blue-400" },
            { icon: <Zap size={10} />, val: item.carbs, col: "text-emerald-400" },
          ].map(({ icon, val, col }) => (
            <div key={val} className={`flex items-center gap-1 text-[10px] ${col}`}>
              {icon} <span className="text-slate-300">{val}</span>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 mb-4 pt-1">
                {item.items.map((food) => (
                  <span
                    key={food}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/12 text-slate-300"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
              saved
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : "bg-white/8 border-white/15 text-slate-300 hover:border-white/30"
            }`}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <CheckCircle2 size={11} /> Saved!
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Heart size={11} /> Save
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? "Less" : "Details"}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} />
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CROWD BAR TOOLTIP ────────────────────────────────────────────────────────
function CrowdBar({
  pt,
  index,
  barClass,
}: {
  pt: CrowdSeries;
  index: number;
  barClass: string;
}) {
  const [hovered, setHovered] = useState(false);
  const heightPct = Math.max(4, Math.round(pt.v * 100));

  return (
    <div
      className="flex-1 flex flex-col items-center gap-1 h-full relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 backdrop-blur-sm whitespace-nowrap pointer-events-none"
          >
            <span className="text-[9px] font-bold text-white">{heightPct}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex-1 flex items-end">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${heightPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * index }}
          className={`w-full rounded-t-sm bg-gradient-to-t ${barClass} ${hovered ? "opacity-100" : "opacity-80"} transition-opacity duration-150`}
        />
      </div>
      <span className="text-[8px] text-slate-600 whitespace-nowrap leading-none pb-0.5">{pt.t}</span>
    </div>
  );
}

// ─── CROWD PREDICTION CARD ────────────────────────────────────────────────────
function CrowdPredictionCard() {
  const [data, setData] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/analytics/crowd`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: CrowdData) => { setData(d); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError("Failed to load crowd data"); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const getLoad = (v: number) =>
    v < 0.4
      ? { label: "Low",    color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", barClass: "from-emerald-500 to-cyan-500" }
      : v < 0.75
      ? { label: "Medium", color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",     barClass: "from-amber-500 to-orange-500" }
      : { label: "High",   color: "text-red-400",     bg: "bg-red-500/15 border-red-500/30",          barClass: "from-red-500 to-rose-500" };

  return (
    <GlassCard delay={0.22} className="p-6">
      <SectionHeading icon={<Users size={16} />} title="Mess Crowd" sub="Real-time load prediction" />

      {loading && <CardSkeleton />}

      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-400 py-3">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (() => {
        const load = getLoad(data.current_load);
        return (
          <div className="space-y-4">
            {/* Current load */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black ${load.color}`}>
                  {Math.round(data.current_load * 100)}%
                </span>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${load.bg} ${load.color}`}>
                  {load.label}
                </span>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1.5"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  data.current_load >= 0.75 ? "bg-red-400" : data.current_load >= 0.4 ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                <span className="text-[10px] text-slate-500">Live</span>
              </motion.div>
            </div>

            {/* Mini bar chart with tooltips */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Load Forecast</p>
              <div className="flex items-end gap-1.5" style={{ height: "64px" }}>
                {data.series.map((pt, i) => (
                  <CrowdBar key={pt.t} pt={pt} index={i} barClass={load.barClass} />
                ))}
              </div>
            </div>

            {/* Best / Peak time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <p className="text-[9px] uppercase tracking-wider text-emerald-500 mb-0.5">Best Time</p>
                <p className="text-sm font-black text-emerald-300">{data.best_time}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-500/8 border border-red-500/20">
                <p className="text-[9px] uppercase tracking-wider text-red-400 mb-0.5">Peak Time</p>
                <p className="text-sm font-black text-red-300">{data.peak_time}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </GlassCard>
  );
}

// ─── NUTRITION SCORE CARD ─────────────────────────────────────────────────────
function NutritionScoreCard() {
  const [data, setData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/nutrition/student`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: NutritionData) => { setData(d); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError("Failed to load nutrition data"); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const scoreGrad = (s: number) =>
    s >= 80 ? "from-emerald-400 to-cyan-400" : s >= 60 ? "from-amber-400 to-yellow-400" : "from-red-400 to-rose-400";

  const nutriRows: { label: string; key: keyof Pick<NutritionData, "protein" | "carbs" | "vegetables">; col: string }[] = [
    { label: "Protein",    key: "protein",    col: "from-blue-500 to-cyan-500" },
    { label: "Carbs",      key: "carbs",      col: "from-amber-500 to-yellow-500" },
    { label: "Vegetables", key: "vegetables", col: "from-emerald-500 to-green-400" },
  ];

  return (
    <GlassCard delay={0.28} className="p-6">
      <SectionHeading icon={<Apple size={16} />} title="Nutrition Score" sub="Today's intake analysis" />

      {loading && <CardSkeleton />}

      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-400 py-3">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Mini circular score */}
            <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
              <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                <motion.circle
                  cx="40" cy="40" r="32"
                  fill="none"
                  stroke="url(#nutriGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - data.score / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="nutriGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={data.score >= 80 ? "#34d399" : data.score >= 60 ? "#fbbf24" : "#f87171"} />
                    <stop offset="100%" stopColor={data.score >= 80 ? "#22d3ee" : data.score >= 60 ? "#f59e0b" : "#fb7185"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="z-10 text-center">
                <span className={`text-xl font-black bg-gradient-to-r ${scoreGrad(data.score)} bg-clip-text text-transparent leading-none`}>
                  {data.score}
                </span>
                <span className="block text-[8px] text-slate-500 tracking-wider">/100</span>
              </div>
            </div>

            {/* Progress rows */}
            <div className="flex-1 space-y-2.5">
              {nutriRows.map(({ label, key, col }) => (
                <div key={key}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-semibold">{data[key]}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data[key]}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                      className={`h-full rounded-full bg-gradient-to-r ${col}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <Sparkles size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-200 leading-relaxed">
              <span className="font-semibold text-amber-300">AI tip: </span>
              {data.recommendation}
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ─── LEADERBOARD CARD ─────────────────────────────────────────────────────────
function LeaderboardCard() {
  const [data, setData] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/leaderboard`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: LeaderboardEntry[]) => { setData(d); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError("Failed to load leaderboard"); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const rankBadge = (i: number) =>
    i === 0 ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
    : i === 1 ? "text-slate-300 bg-white/8 border-white/15"
    : i === 2 ? "text-orange-400 bg-orange-500/15 border-orange-500/30"
    : "text-slate-500 bg-white/4 border-white/8";

  const rankEmoji = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  const maxPts = data ? Math.max(...data.map((e) => e.points), 1) : 1;

  return (
    <GlassCard delay={0.42} className="p-6">
      <SectionHeading icon={<Trophy size={16} />} title="Waste Leaderboard" sub="Top savers this week" />

      {loading && <CardSkeleton />}

      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-400 py-3">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-2">
          {data.map((entry, i) => {
            const isMe = entry.name === "You";
            const barPct = Math.round((entry.points / maxPts) * 100);
            return (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border overflow-hidden transition-all duration-200 ${
                  isMe
                    ? "border-emerald-500/40 bg-emerald-500/8 shadow-lg shadow-emerald-500/15"
                    : "border-white/6 bg-white/2 hover:border-white/12"
                }`}
              >
                {/* Proportional background bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 + 0.1 * i }}
                  className={`absolute inset-y-0 left-0 ${isMe ? "bg-emerald-500/8" : "bg-white/3"} rounded-xl`}
                />

                {/* Rank */}
                <span className={`relative z-10 w-6 h-6 rounded-full border text-[10px] font-black flex items-center justify-center flex-shrink-0 ${rankBadge(i)}`}>
                  {rankEmoji(i)}
                </span>

                {/* Name */}
                <span className={`relative z-10 flex-1 text-sm font-bold truncate ${isMe ? "text-emerald-300" : "text-slate-200"}`}>
                  {entry.name}
                </span>

                {/* Points + YOU badge */}
                <div className="relative z-10 flex items-center gap-1.5 flex-shrink-0">
                  {isMe && (
                    <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                      YOU
                    </span>
                  )}
                  <Leaf size={10} className={isMe ? "text-emerald-400" : "text-slate-500"} />
                  <span className={`text-[12px] font-black tabular-nums ${isMe ? "text-emerald-300" : "text-slate-300"}`}>
                    {entry.points}
                  </span>
                  <span className="text-[9px] text-slate-600">pts</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentPage() {
  const [rating, setRating] = useState(0);
  const [chips, setChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const countdown = useCountdown(19, 30);
  const [chatInput, setChatInput] = useState("");
const [chatMessages, setChatMessages] = useState<
  { role: "user" | "bot"; text: string }[]
>([]);
const [chatLoading, setChatLoading] = useState(false);
    const router = useRouter();
  const handleLogout = () => {
    // clear whatever you stored at login time
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("ann_name"); // optional, remove if you want name kept

    router.replace("/login"); // or "/" depending on your login route
  };

  // Dynamic greeting name
  const name =
    typeof window !== "undefined"
      ? (localStorage.getItem("ann_name") ?? "Student")
      : "Student";

  useEffect(() => {
    const id = setInterval(() => setActiveSuggestion((p) => (p + 1) % SUGGESTIONS.length), 3000);
    return () => clearInterval(id);
  }, []);
  

  const handleSubmit = async () => {
  if (rating === 0) return;

  try {
    setSubmitting(true);

    const res = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: rating,
        tags: chips,
        comment: comment,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to submit feedback");
    }

    setSubmitted(true);
  } catch (err) {
    console.error("Feedback error:", err);
  } finally {
    setSubmitting(false);
  }
};

const askAssistant = async () => {
  if (!chatInput.trim()) return;

  const userMessage = chatInput.trim();

  setChatMessages((prev) => [
    ...prev,
    { role: "user", text: userMessage },
  ]);
  setChatInput("");
  setChatLoading(true);

  try {
    const res = await fetch(`${API_BASE}/ai/student-assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: userMessage }),
    });

    if (!res.ok) {
      throw new Error("Failed to get assistant response");
    }

    const data = await res.json();

    setChatMessages((prev) => [
      ...prev,
      { role: "bot", text: data.answer },
    ]);
  } catch (error) {
    console.error("Student assistant error:", error);
    setChatMessages((prev) => [
      ...prev,
      { role: "bot", text: "Assistant is currently unavailable." },
    ]);
  } finally {
    setChatLoading(false);
  }
};
  const toggleChip = (c: string) =>
    setChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  return (
    <div className="min-h-screen bg-[#060a0d] text-white font-sans antialiased overflow-x-hidden">

      {/* ── Background atmosphere ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/6 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,135,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/6 backdrop-blur-2xl bg-black/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 border border-emerald-500/30 flex items-center justify-center">
                <Sparkles size={16} className="text-emerald-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 rounded-xl border border-emerald-500/40"
              />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                ANN AI
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] tracking-widest text-slate-500 uppercase">Predict Smart.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Student</span>
            </motion.div>
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Notifications">
              <Bell size={14} className="text-slate-400" />
            </button>
            <button onClick={handleLogout}
               className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
               aria-label="Logout"
               title="Logout">
               <User size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-widest text-emerald-400 uppercase">Saturday, Today</span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-500">Hostel Mess Block B</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Good Evening,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
              {name} 👋
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what the AI predicts for your mess today.</p>
        </motion.div>

        {/* ── FIXED GRID: left fluid, right fixed ~420px ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">

          {/* ── LEFT COL ── */}
          <div className="min-w-0 flex flex-col gap-6">

            {/* TODAY'S MENU */}
            <GlassCard delay={0.2} className="p-6">
              <SectionHeading
                icon={<Leaf size={16} />}
                title="Today's Menu"
                sub="AI-optimized for your nutritional profile"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MENU_ITEMS.map((item, i) => (
                  <MenuCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </GlassCard>

            {/* SMART SUGGESTIONS */}
            <GlassCard delay={0.3} className="p-6">
              <SectionHeading
                icon={<Sparkles size={16} />}
                title="Smart Suggestions"
                sub="Personalized by ANN — updated every 3h"
              />
              <div className="flex flex-col gap-3">
                {SUGGESTIONS.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`
                      relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 cursor-default
                      ${activeSuggestion === i
                        ? "border-emerald-500/40 bg-emerald-500/6"
                        : "border-white/6 bg-white/2 hover:border-white/15"
                      }
                    `}
                  >
                    {activeSuggestion === i && (
                      <motion.div
                        layoutId="suggestionHighlight"
                        className="absolute inset-0 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                        transition={{ duration: 0.4 }}
                      />
                    )}
                    <div className={`relative z-10 mt-0.5 p-2 rounded-lg bg-white/5 border border-white/10 ${s.accent}`}>
                      {s.icon}
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-white">{s.title}</p>
                        <span className={`text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-white/8 border border-white/12 ${s.accent}`}>
                          {s.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{s.reason}</p>
                    </div>
                    <ChevronRight size={14} className="relative z-10 text-slate-600 flex-shrink-0 mt-1" />
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* FEEDBACK */}
            <GlassCard delay={0.4} className="p-6">
              <SectionHeading
                icon={<Star size={16} />}
                title="Rate Today's Lunch"
                sub="Your feedback trains the AI"
              />
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="flex flex-col items-center py-8 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
                    >
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-black text-lg text-white">Thanks for the feedback!</p>
                      <p className="text-sm text-slate-400 mt-1">ANN AI will use this to improve tomorrow&apos;s menu.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/8 border border-emerald-500/20">
                      <Award size={14} className="text-emerald-400" />
                      <span className="text-[11px] text-emerald-300 font-semibold">+10 Impact Points earned</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-sm text-slate-400 min-w-max">Overall rating:</span>
                      <StarRating value={rating} onChange={setRating} />
                      {rating > 0 && (
                        <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-amber-400 font-semibold">
                          {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                        </motion.span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Quick tags</p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_CHIPS.map((c) => (
                          <motion.button
                            key={c} type="button"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                            onClick={() => toggleChip(c)}
                            className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                              chips.includes(c)
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-white/4 border-white/12 text-slate-400 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            {chips.includes(c) && "✓ "}{c}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Comments (optional)</p>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Anything specific? e.g. 'Rice was undercooked'..."
                        rows={2}
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/4 transition-all duration-200"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: rating > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: rating > 0 ? 0.97 : 1 }}
                      onClick={handleSubmit}
                      disabled={rating === 0 || submitting}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        rating > 0
                          ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                          : "bg-white/4 border border-white/8 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <><Send size={14} /> Submit Feedback</>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>

          {/* ── RIGHT COL ── */}
          <div className="w-full flex flex-col gap-6 lg:sticky lg:top-20 h-fit self-start">

            {/* 1. Crowd Prediction */}
            <CrowdPredictionCard />

            {/* 2. Nutrition Score */}
            <NutritionScoreCard />

            {/* 3. Waste Impact */}
            <GlassCard delay={0.32} className="p-6">
              <SectionHeading icon={<Leaf size={16} />} title="Waste Impact" sub="This week vs. last week" />
              <div className="flex flex-col items-center gap-4">
                <CircularProgress value={WASTE_PERCENT} />
                <div className="w-full space-y-3">
                  {[
                    { label: "Food Saved",  val: "2.4 kg", bar: 72, col: "from-emerald-500 to-cyan-500" },
                    { label: "CO₂ Reduced", val: "1.1 kg", bar: 55, col: "from-cyan-500 to-blue-500" },
                    { label: "Water Saved", val: "38 L",   bar: 40, col: "from-blue-500 to-violet-500" },
                  ].map(({ label, val, bar, col }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-white font-semibold">{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar}%` }}
                          transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
                          className={`h-full rounded-full bg-gradient-to-r ${col}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full p-3 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
                  <p className="text-[11px] text-emerald-300 text-center leading-relaxed">
                    🌱 You&apos;ve helped save <span className="font-bold">2.4 kg</span> of food this week. Keep it up!
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* 4. Leaderboard */}
            <LeaderboardCard />

            {/* 5. Next Meal Countdown */}
            <GlassCard delay={0.38} className="p-6">
              <SectionHeading icon={<Clock size={16} />} title="Next Meal" sub="Dinner starts in" />
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-2">
                  {[
                    { val: countdown.h, lbl: "HRS" },
                    { val: countdown.m, lbl: "MIN" },
                    { val: countdown.s, lbl: "SEC" },
                  ].map(({ val, lbl }, i) => (
                    <div key={lbl} className="flex items-center gap-2">
                      <TimerBlock value={val} label={lbl} />
                      {i < 2 && <span className="text-2xl font-black text-slate-600 mb-5">:</span>}
                    </div>
                  ))}
                </div>
                <div className="w-full space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 text-center">Dinner Preview</p>
                  {["Paneer Butter Masala", "Roti × 3", "Raita", "Kheer"].map((dish, i) => (
                    <motion.div
                      key={dish}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-center gap-2 text-[12px] text-slate-300"
                    >
                      <div className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      {dish}
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* 6. Your Stats */}
            <GlassCard delay={0.48} className="p-6">
              <SectionHeading icon={<Award size={16} />} title="Your Stats" sub="This semester" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "47",     lbl: "Meals Rated", accent: "text-amber-400" },
                  { val: "8.4",    lbl: "Avg Rating",  accent: "text-emerald-400" },
                  { val: "12.6 kg",lbl: "Food Saved",  accent: "text-cyan-400" },
                  { val: "340",    lbl: "Impact Pts",  accent: "text-violet-400" },
                ].map(({ val, lbl, accent }) => (
                  <div key={lbl} className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                    <p className={`font-black text-lg ${accent} leading-none`}>{val}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{lbl}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>
      </main>

      {/* ── FLOATING ACTION BUTTON ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d1a14] border border-emerald-500/25 rounded-2xl p-4 w-64 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bot size={16} className="text-emerald-400" />
                <span className="font-bold text-sm text-white">Ask ANN AI</span>
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider">BETA</span>
              </div>
              <div className="flex flex-col gap-2 mb-3">
                {[
  "What should I eat today?",
  "How is my nutrition this week?",
  "Will mess be crowded at 1pm?",
].map((q) => (
  <button
    key={q}
    onClick={async () => {
      setChatMessages((prev) => [...prev, { role: "user", text: q }]);
      setChatLoading(true);

      try {
        const res = await fetch(`${API_BASE}/ai/student-assistant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: q }),
        });

        const data = await res.json();

        setChatMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
      } catch (error) {
        console.error("Student assistant error:", error);
        setChatMessages((prev) => [
          ...prev,
          { role: "bot", text: "Assistant is currently unavailable." },
        ]);
      } finally {
        setChatLoading(false);
      }
    }}
    className="text-left text-[11px] px-3 py-2 rounded-lg bg-white/4 border border-white/8 text-slate-300 hover:border-emerald-500/30 hover:text-white transition-all duration-150"
  >
    {q}
  </button>
))}
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/4 border border-white/8 mt-3">
  <input
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        askAssistant();
      }
    }}
    placeholder="Type your question…"
    className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none"
  />
  <button
    onClick={askAssistant}
    disabled={chatLoading}
    className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
  >
    <Send size={13} />
  </button>
</div>
<div className="max-h-40 overflow-y-auto space-y-2 mb-3">
  {chatMessages.map((msg, index) => (
    <div
      key={index}
      className={`text-[11px] px-3 py-2 rounded-lg ${
        msg.role === "user"
          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-right"
          : "bg-white/4 border border-white/8 text-slate-300 text-left"
      }`}
    >
      {msg.text}
    </div>
  ))}

  {chatLoading && (
    <div className="text-[10px] text-slate-500 px-1">Thinking...</div>
  )}
</div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => setFabOpen(!fabOpen)}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/40 flex items-center justify-center"
          aria-label="Ask ANN AI"
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-2xl bg-emerald-400/40"
          />
          <AnimatePresence mode="wait">
            {fabOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Bot size={22} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}