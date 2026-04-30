import { motion } from "framer-motion";
import type { ChatMode } from "../api/client";

const modeGlow: Record<ChatMode, string> = {
  interview: "from-cyan-400/35 via-sky-400/25 to-indigo-400/20",
  vision: "from-violet-400/35 via-cyan-300/25 to-emerald-300/20",
};

export default function Avatar({
  mode,
  isThinking,
  isListening,
  isSpeaking,
}: {
  mode: ChatMode;
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}) {
  const active = isThinking || isListening || isSpeaking;

  return (
    <div className="relative h-44 w-44 sm:h-48 sm:w-48">
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${modeGlow[mode]} blur-2xl`}
        animate={
          active
            ? { opacity: [0.65, 1, 0.78], scale: [1, 1.08, 1.02] }
            : { opacity: [0.58, 0.75, 0.58], scale: [1, 1.03, 1] }
        }
        transition={{ duration: active ? 1.2 : 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-4 rounded-[36%] border border-white/15 bg-black/45 backdrop-blur-xl"
        animate={
          isSpeaking
            ? { rotate: [-1.8, 1.8, -1.8], y: [-1, 2, -1] }
            : isListening
              ? { rotate: [-1, 1, -1] }
              : { y: [0, -2, 0] }
        }
        transition={{ duration: isSpeaking ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative h-full w-full p-6">
          <div className="absolute inset-0 rounded-[36%] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_45%)]" />
          <div className="relative flex h-full flex-col items-center justify-center gap-5">
            <div className="flex w-full items-center justify-center gap-8">
              {[0, 1].map((eye) => (
                <motion.div
                  key={eye}
                  className="h-3.5 w-3.5 rounded-full bg-cyan-200"
                  animate={
                    isSpeaking
                      ? { scaleY: [1, 0.5, 1], opacity: [0.85, 1, 0.85] }
                      : isListening
                        ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }
                        : { scale: [1, 1.05, 1], opacity: [0.75, 0.9, 0.75] }
                  }
                  transition={{ duration: isSpeaking ? 0.35 : 2.4, repeat: Infinity, delay: eye * 0.06 }}
                  style={{ boxShadow: "0 0 20px rgba(56,189,248,.7)" }}
                />
              ))}
            </div>

            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-200/85 via-sky-300/95 to-fuchsia-300/80"
              animate={
                isSpeaking
                  ? { width: ["22%", "42%", "28%", "38%", "22%"], opacity: [0.8, 1, 0.9, 1, 0.8] }
                  : { width: ["30%", "34%", "30%"], opacity: [0.7, 0.9, 0.7] }
              }
              transition={{ duration: isSpeaking ? 0.45 : 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

