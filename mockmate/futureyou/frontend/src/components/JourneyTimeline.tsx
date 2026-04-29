import { AnimatePresence, motion } from "framer-motion";
import type { TimelinePhase } from "../data/showcase";

export default function JourneyTimeline({
  phases,
  activeId,
  onSelect,
}: {
  phases: TimelinePhase[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activePhase = phases.find((phase) => phase.id === activeId) ?? phases[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">My Journey Timeline</div>
          <div className="text-xs text-slate-400">Past -> present -> future, told like a product story</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300/80">
          Storyline
        </div>
      </div>

      <div className="mt-5">
        <div className="relative flex items-center gap-3 overflow-x-auto pb-2">
          <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-cyan-400/15 via-fuchsia-400/40 to-emerald-400/15" />
          {phases.map((phase, index) => {
            const active = phase.id === activeId;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onSelect(phase.id)}
                className="relative z-10 min-w-[150px] flex-1 text-left"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold backdrop-blur-md transition",
                      active
                        ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-neon"
                        : "border-white/10 bg-white/5 text-slate-300",
                    ].join(" ")}
                  >
                    0{index + 1}
                  </motion.div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{phase.era}</div>
                    <div className="text-sm font-medium text-slate-100">{phase.title}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${activePhase.accent}`} />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-300/80">{activePhase.era}</div>
            <div className="mt-1 text-xl font-semibold text-white">{activePhase.title}</div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300/90">{activePhase.blurb}</p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {activePhase.highlights.map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-200"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

