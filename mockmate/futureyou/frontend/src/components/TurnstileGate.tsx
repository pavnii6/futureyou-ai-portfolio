import { useEffect, useId, useMemo, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

function getTurnstileSiteKey() {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  return typeof key === "string" && key.length > 0 ? key : "";
}

export default function TurnstileGate({
  onToken,
  disabled,
}: {
  onToken: (token: string | null) => void;
  disabled?: boolean;
}) {
  const siteKey = getTurnstileSiteKey();
  const domId = useId().replaceAll(":", "-");
  const [ready, setReady] = useState(false);

  const enabled = useMemo(() => Boolean(siteKey) && !disabled, [siteKey, disabled]);

  useEffect(() => {
    if (!enabled) {
      onToken(null);
      return;
    }

    const scriptId = "turnstile-script";
    const existing = document.getElementById(scriptId);
    if (!existing) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => setReady(true);
      document.head.appendChild(s);
    } else {
      setReady(true);
    }
  }, [enabled, onToken]);

  useEffect(() => {
    if (!enabled) return;
    if (!ready) return;
    if (!window.turnstile) return;

    const el = document.getElementById(domId);
    if (!el) return;

    onToken(null);

    const widgetId = window.turnstile.render(el, {
      sitekey: siteKey,
      theme: "dark",
      appearance: "interaction-only",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });

    return () => {
      try {
        window.turnstile?.reset(widgetId);
      } catch {
        // ignore
      }
    };
  }, [domId, enabled, onToken, ready, siteKey]);

  if (!siteKey) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Human check</div>
      <div className="mt-2" id={domId} />
    </div>
  );
}

