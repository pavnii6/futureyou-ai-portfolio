import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function VoiceController({
  enabled,
  setEnabled,
  speakText,
  onSpeakingChange,
}: {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  speakText: string | null;
  onSpeakingChange?: (speaking: boolean) => void;
}) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const primeVoices = () => {
      const voices = synth.getVoices();
      setVoiceReady(voices.length > 0);
    };
    primeVoices();
    synth.addEventListener("voiceschanged", primeVoices);
    return () => synth.removeEventListener("voiceschanged", primeVoices);
  }, []);

  useEffect(() => {
    if (!enabled || !speakText || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 0.96;
    utterance.pitch = 0.92;
    utterance.volume = 1;
    utteranceRef.current = utterance;

    utterance.onstart = () => onSpeakingChange?.(true);
    utterance.onend = () => onSpeakingChange?.(false);
    utterance.onerror = () => onSpeakingChange?.(false);

    const preferred = synth
      .getVoices()
      .find((v) => /google|zira|aria|david|neural|samantha/i.test(v.name) && /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    synth.speak(utterance);
    return () => synth.cancel();
  }, [enabled, speakText, onSpeakingChange]);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <div>
        <div className="text-xs text-slate-400">Voice output</div>
        <div className="mt-1 text-sm font-semibold text-slate-100">{enabled ? "Voice ON" : "Voice OFF"}</div>
        <div className="text-[11px] text-slate-400">{voiceReady ? "Web Speech ready" : "Loading voices..."}</div>
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setEnabled(!enabled)}
        className={[
          "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition",
          enabled
            ? "border-cyan-300/50 bg-cyan-400/10 text-cyan-100 shadow-[0_0_26px_rgba(56,189,248,.26)]"
            : "border-white/10 bg-white/5 text-slate-100/85 hover:bg-white/10",
        ].join(" ")}
      >
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        {enabled ? "Speaking" : "Enable"}
      </motion.button>
    </div>
  );
}

