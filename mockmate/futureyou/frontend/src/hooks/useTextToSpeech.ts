import { useEffect, useState } from "react";

export function useTextToSpeech({
  enabled,
  text,
  onSpeakingChange,
}: {
  enabled: boolean;
  text: string | null;
  onSpeakingChange?: (speaking: boolean) => void;
}) {
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const primeVoices = () => setVoiceReady(synth.getVoices().length > 0);
    primeVoices();
    synth.addEventListener("voiceschanged", primeVoices);
    return () => synth.removeEventListener("voiceschanged", primeVoices);
  }, []);

  useEffect(() => {
    if (!enabled || !text || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 0.92;
    utterance.volume = 1;

    const preferred = synth
      .getVoices()
      .find((v) => /google|zira|aria|david|neural|samantha/i.test(v.name) && /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => onSpeakingChange?.(true);
    utterance.onend = () => onSpeakingChange?.(false);
    utterance.onerror = () => onSpeakingChange?.(false);

    synth.speak(utterance);
    return () => synth.cancel();
  }, [enabled, text, onSpeakingChange]);

  return { voiceReady };
}

