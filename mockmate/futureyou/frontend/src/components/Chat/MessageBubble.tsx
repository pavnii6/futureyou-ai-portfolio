import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useTypewriter } from "./useTypewriter";

export type ChatRole = "user" | "assistant";

export default function MessageBubble({
  role,
  content,
  timestamp,
  isTyping,
  onTypingDone,
}: {
  role: ChatRole;
  content: string;
  timestamp: string;
  isTyping?: boolean;
  onTypingDone?: () => void;
}) {
  // We wrap typewriter hook in a tiny adapter to keep component props simple.
  const displayText = useTypewriter(content, Boolean(isTyping));

  useEffect(() => {
    if (!isTyping) return;
    if (!content || content.length === 0) return;
    if (displayText.length >= content.length) {
      onTypingDone?.();
    }
  }, [content?.length, displayText.length, isTyping, onTypingDone]);

  const bubbleBase =
    "relative max-w-[95%] rounded-2xl px-4 py-3 border backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,.03)]";

  const userStyle =
    "ml-auto bg-white/6 border-white/10 text-slate-50 shadow-[0_0_25px_rgba(255,255,255,.05)]";

  const assistantStyle =
    "mr-auto bg-gradient-to-b from-white/7 to-white/3 border-sky-500/20 text-slate-50";

  const text = Boolean(isTyping) ? displayText : content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
      className="flex w-full"
    >
      <div className={`${bubbleBase} ${role === "user" ? userStyle : assistantStyle}`}>
        <div className="flex items-start gap-3">
          {role === "assistant" && (
            <div className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.55)]" />
          )}
          <div className="min-w-0">
            <div className="whitespace-pre-wrap text-sm leading-6">
              {text}
              <AnimatePresence>
                {role === "assistant" && isTyping && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="ml-0.5 inline-block animate-pulse text-cyan-200/90"
                  >
                    ▍
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-[10px] text-slate-400">{timestamp}</span>
        </div>
      </div>
    </motion.div>
  );
}

