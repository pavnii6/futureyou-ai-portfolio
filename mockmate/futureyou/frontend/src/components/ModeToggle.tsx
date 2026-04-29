import { motion } from "framer-motion";
import { Target, Flame, Rocket } from "lucide-react";
import type { ChatMode } from "../api/client";
import type { ReactNode } from "react";

const modes: Array<{
  id: ChatMode;
  label: string;
  icon: ReactNode;
  hint: string;
}> = [
  { id: "interview", label: "🎯 Interview Mode", icon: <Target size={16} />, hint: "Recruiter Q&A & clarity" },
  { id: "roast", label: "🔥 Roast Mode", icon: <Flame size={16} />, hint: "Honest feedback & growth" },
  { id: "vision", label: "🚀 Vision Mode", icon: <Rocket size={16} />, hint: "Bold predictions to 2030" },
];

export default function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-300/80">Persona modes</div>
      <div className="grid grid-cols-1 gap-2">
        {modes.map((m) => {
          const active = m.id === mode;
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={[
                "group w-full rounded-xl border px-3 py-3 text-left transition",
                active
                  ? "border-sky-500/50 bg-white/5 shadow-neon"
                  : "border-white/10 bg-white/3 hover:bg-white/5",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className={active ? "text-cyan-200" : "text-slate-200/80"}>{m.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-100">{m.label}</div>
                  <div className="text-xs text-slate-300/80">{m.hint}</div>
                </div>
                <div
                  className={[
                    "h-2.5 w-2.5 rounded-full transition",
                    active ? "bg-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.55)]" : "bg-white/20",
                  ].join(" ")}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

