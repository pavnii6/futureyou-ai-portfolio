import { Mic, MicOff, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSpeechToText } from "../../hooks/useSpeechToText";

export default function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  voiceInputEnabled,
  setVoiceInputEnabled,
  onListeningChange,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  voiceInputEnabled: boolean;
  setVoiceInputEnabled: (v: boolean) => void;
  onListeningChange?: (listening: boolean) => void;
}) {
  const { isListening: listening, isSupported } = useSpeechToText({
    enabled: voiceInputEnabled,
    onTranscript: onChange,
  });

  useEffect(() => {
    onListeningChange?.(listening);
    if (!isSupported && voiceInputEnabled) setVoiceInputEnabled(false);
  }, [isSupported, listening, onListeningChange, setVoiceInputEnabled, voiceInputEnabled]);

  const placeholder = "Ask Future Me anything...";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md px-3 py-2 shadow-[0_0_35px_rgba(56,189,248,.06)]">
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={
            listening
              ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 0 rgba(34,211,238,0.0)",
                    "0 0 24px rgba(34,211,238,0.35)",
                    "0 0 0 rgba(34,211,238,0.0)",
                  ],
                }
              : undefined
          }
          transition={listening ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : undefined}
          onClick={() => setVoiceInputEnabled(!voiceInputEnabled)}
          disabled={disabled || !isSupported}
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-xl border text-slate-100/90 transition disabled:opacity-50",
            listening ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/10 bg-white/5",
          ].join(" ")}
          title={isSupported ? "Voice input" : "Voice input not supported in this browser"}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </motion.button>

        <div className="flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!disabled) onSend();
              }
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {listening && <div className="mt-1 text-[11px] text-cyan-300/90">Listening...</div>}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          onClick={onSend}
          disabled={disabled || value.trim().length === 0}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/25 to-sky-500/20 px-3 text-sm font-semibold text-slate-50 shadow-neon transition disabled:opacity-50 disabled:shadow-none"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </motion.button>

      </div>
    </div>
  );
}

