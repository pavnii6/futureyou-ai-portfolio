import type { ChatMode } from "../../api/client";
import { motion } from "framer-motion";
import { coreSuggestionChips, modeSuggestionChips } from "../../data/showcase";

export default function SuggestionsChips({
  mode,
  onPick,
}: {
  mode: ChatMode;
  onPick: (text: string) => void;
}) {
  const suggestions = [...coreSuggestionChips, ...(modeSuggestionChips[mode] ?? [])];
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <motion.button
          key={s}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPick(s)}
          className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-slate-100/90 shadow-[0_0_0_1px_rgba(255,255,255,.02)] transition hover:-translate-y-0.5 hover:bg-white/5 hover:shadow-neon"
        >
          {s}
        </motion.button>
      ))}
    </div>
  );
}

