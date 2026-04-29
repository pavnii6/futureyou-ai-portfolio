import { useEffect, useMemo, useState } from "react";

export function useTypewriter(targetText: string, enabled: boolean) {
  const normalized = useMemo(() => targetText ?? "", [targetText]);
  const [displayText, setDisplayText] = useState(enabled ? "" : normalized);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(normalized);
      return;
    }

    setDisplayText("");
    let i = 0;
    const start = () => {
      i = 0;
      setDisplayText("");
      const tick = () => {
        i += 1;
        setDisplayText(normalized.slice(0, i));
        if (i >= normalized.length) return;
        // Slightly variable speed feels more human.
        const jitter = Math.floor(Math.random() * 30);
        window.setTimeout(tick, 10 + jitter);
      };
      const jitter = Math.floor(Math.random() * 30);
      window.setTimeout(tick, 10 + jitter);
    };
    start();

    return () => {
      // No-op: timeouts are harmless for this use case.
    };
  }, [enabled, normalized]);

  return displayText;
}

