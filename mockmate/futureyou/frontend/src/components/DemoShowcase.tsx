import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { demoConversations } from "../data/showcase";

export default function DemoShowcase({
  activeDemoId,
  autoplaying,
  onPlayDemo,
}: {
  activeDemoId: string | null;
  autoplaying: boolean;
  onPlayDemo: (demoId: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">Demo Mode</div>
          <div className="text-xs text-slate-400">Auto-play showcase prompts for interviews and live demos</div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200/85">
          <Sparkles size={12} />
          Showcase ready
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {demoConversations.map((demo) => {
          const active = autoplaying && activeDemoId === demo.id;
          return (
            <motion.button
              key={demo.id}
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onPlayDemo(demo.id)}
              className={[
                "rounded-2xl border p-4 text-left transition",
                active
                  ? "border-cyan-300/50 bg-cyan-400/10 shadow-neon"
                  : "border-white/10 bg-black/20 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{demo.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{demo.subtitle}</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  <Play size={12} />
                  {active ? "Playing" : "Play"}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-300">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Preview</div>
                <div className="mt-2 line-clamp-2">{demo.turns[1]?.content}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

