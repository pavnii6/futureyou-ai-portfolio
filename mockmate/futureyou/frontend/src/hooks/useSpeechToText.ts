import { useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function useSpeechToText({
  enabled,
  onTranscript,
}: {
  enabled: boolean;
  onTranscript: (text: string) => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const recognitionCtor = useMemo<SpeechRecognitionCtor | null>(() => {
    const w = window as any;
    return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as SpeechRecognitionCtor | null;
  }, []);

  useEffect(() => {
    if (!recognitionCtor) return;
    const recognition = new recognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) onTranscript(transcript.trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [recognitionCtor, onTranscript]);

  useEffect(() => {
    if (!recognitionCtor || !recognitionRef.current) return;
    if (!enabled) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore browser-level stop errors
      }
      setIsListening(false);
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // ignore duplicate start calls
    }
  }, [enabled, recognitionCtor]);

  return {
    isListening,
    isSupported: Boolean(recognitionCtor),
  };
}

