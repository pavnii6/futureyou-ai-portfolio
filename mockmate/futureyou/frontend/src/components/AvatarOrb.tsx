import { motion } from "framer-motion";

export default function AvatarOrb({
  isThinking,
  isListening = false,
}: {
  isThinking: boolean;
  isListening?: boolean;
}) {
  const active = isThinking || isListening;

  return (
    <div className="relative h-32 w-32 sm:h-36 sm:w-36">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-400/30 via-fuchsia-400/20 to-sky-500/10 blur-xl"
        animate={
          active
            ? { opacity: [0.7, 1, 0.8], scale: [1, 1.08, 1.03] }
            : { opacity: [0.72, 0.88, 0.72], scale: [1, 1.025, 1] }
        }
        transition={{ duration: active ? 1.1 : 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,.55),rgba(167,139,250,.22)_45%,rgba(0,0,0,0)_70%)] shadow-neon"
        animate={
          active
            ? { filter: ["brightness(1)", "brightness(1.25)", "brightness(1.08)"], scale: [1, 1.04, 1.01] }
            : { filter: ["brightness(0.98)", "brightness(1.08)", "brightness(0.98)"], scale: [1, 1.01, 1] }
        }
        transition={{ duration: active ? 1.2 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-4 rounded-full bg-black/40 border border-sky-500/25"
        animate={{
          boxShadow: active
            ? "0 0 40px rgba(56,189,248,.5), 0 0 85px rgba(167,139,250,.22)"
            : "0 0 18px rgba(56,189,248,.22)",
          opacity: active ? 1 : 0.92,
        }}
        transition={{ duration: 0.35 }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-400/60 via-fuchsia-400/30 to-sky-500/15 blur-[1px]"
        animate={
          active
            ? { y: [-3, 2, -3], opacity: [0.75, 1, 0.82], scale: [1, 1.08, 1.02] }
            : { y: [-1, 1, -1], opacity: [0.8, 0.9, 0.8], scale: [1, 1.03, 1] }
        }
        transition={{ duration: active ? 1.1 : 4.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-[22%] rounded-full border border-white/10"
        animate={active ? { scale: [0.96, 1.1], opacity: [0.45, 0] } : { scale: [1, 1.04, 1], opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: active ? 1.5 : 4.5, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}

