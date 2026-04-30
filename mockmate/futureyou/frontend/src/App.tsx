import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import Avatar from "./components/Avatar";
import ChatUI from "./components/ChatUI";
import DemoShowcase from "./components/DemoShowcase";
import JourneyTimeline from "./components/JourneyTimeline";
import ModeToggle from "./components/ModeToggle";
import VoiceController from "./components/VoiceController";
import { type ChatMessage } from "./components/Chat/ChatPanel";
import type { ChatMode, ChatHistoryItem } from "./api/client";
import { sendChat } from "./api/client";
import { demoConversations, timelinePhases } from "./data/showcase";

function nowTimeString() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getGreeting(): ChatMessage {
  return {
    id: makeId(),
    role: "assistant",
    content:
      "Welcome. I'm Pavni Srivastava Ask me about my projects, decisions, strengths, or ambition, and I'll answer with grounded context and a sharper narrative than a static portfolio ever could.",
    timestamp: nowTimeString(),
  };
}

function trimHistory(history: ChatHistoryItem[]) {
  return history.slice(-10);
}

export default function App() {
  const [mode, setMode] = useState<ChatMode>("interview");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getGreeting()]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechQueueText, setSpeechQueueText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTimelineId, setActiveTimelineId] = useState<string>(timelinePhases[1]?.id ?? "present");
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const pendingSpeakTextRef = useRef<string | null>(null);
  const soundCtxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const demoTimerRef = useRef<number | null>(null);

  const historyPayload: ChatHistoryItem[] = useMemo(
    () => trimHistory(messages.map((m) => ({ role: m.role, content: m.content }))),
    [messages],
  );

  useEffect(() => {
    return () => {
      if (demoTimerRef.current) window.clearTimeout(demoTimerRef.current);
      abortRef.current?.abort?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  function clearDemoTimer() {
    if (demoTimerRef.current) {
      window.clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  }

  function playUiTick(freq = 460) {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!soundCtxRef.current) soundCtxRef.current = new Ctx();
      const ctx = soundCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // optional audio feedback only
    }
  }

  async function sendMessage(textOverride?: string) {
    if (thinking) return;
    clearDemoTimer();
    setIsDemoPlaying(false);
    setActiveDemoId(null);

    const text = (textOverride ?? input).trim();
    if (!text) return;

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setInput("");
    setThinking(true);

    const userMsgId = makeId();
    const assistantMsgId = makeId();
    const userMsg: ChatMessage = { id: userMsgId, role: "user", content: text, timestamp: nowTimeString() };
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: nowTimeString(),
      isTyping: true,
    };

    pendingSpeakTextRef.current = null;
    setTypingMessageId(assistantMsgId);

    const snapshotHistory = trimHistory([...historyPayload, { role: "user", content: text }]);

    setMessages((prev) => [...prev.map((m) => ({ ...m, isTyping: undefined })), userMsg, assistantMsg]);

    try {
      const response = await sendChat({
        message: text,
        mode,
        history: snapshotHistory,
        turnstileToken,
        signal: controller.signal,
      });

      pendingSpeakTextRef.current = response;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, content: response, isTyping: true } : m)),
      );
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "Something went wrong.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `I couldn't generate a response. ${msg}\n\nTip: verify your OPENAI_API_KEY and that the FAISS index can build from backend/data.`,
                isTyping: false,
              }
            : m,
        ),
      );
      setTypingMessageId(null);
    } finally {
      setThinking(false);
    }
  }

  function onAssistantTypingDone() {
    const text = pendingSpeakTextRef.current;
    pendingSpeakTextRef.current = null;
    setTypingMessageId(null);
    if (text && voiceOutputEnabled) setSpeechQueueText(text);
  }

  function runDemo(demoId: string) {
    if (thinking) return;
    clearDemoTimer();
    window.speechSynthesis?.cancel?.();

    const demo = demoConversations.find((item) => item.id === demoId);
    if (!demo) return;

    setMode(demo.mode);
    playUiTick(560);
    setActiveDemoId(demo.id);
    setIsDemoPlaying(true);
    setTypingMessageId(null);
    pendingSpeakTextRef.current = null;

    const base = [getGreeting()];
    const userTurn = demo.turns.find((turn) => turn.role === "user");
    const assistantTurn = demo.turns.find((turn) => turn.role === "assistant");
    if (!userTurn || !assistantTurn) return;

    setMessages([
      ...base,
      { id: makeId(), role: "user", content: userTurn.content, timestamp: nowTimeString() },
      { id: makeId(), role: "assistant", content: "", timestamp: nowTimeString(), isTyping: false },
    ]);
    setThinking(true);

    demoTimerRef.current = window.setTimeout(() => {
      const assistantId = makeId();
      pendingSpeakTextRef.current = assistantTurn.content;
      setMessages([
        ...base,
        { id: makeId(), role: "user", content: userTurn.content, timestamp: nowTimeString() },
        {
          id: assistantId,
          role: "assistant",
          content: assistantTurn.content,
          timestamp: nowTimeString(),
          isTyping: true,
        },
      ]);
      setTypingMessageId(assistantId);
      setThinking(false);
      setIsDemoPlaying(false);
      demoTimerRef.current = null;
    }, 1100);
  }

  const syncedMessages = useMemo(() => {
    if (!typingMessageId) return messages.map((m) => ({ ...m, isTyping: false }));
    return messages.map((m) => ({ ...m, isTyping: m.id === typingMessageId }));
  }, [messages, typingMessageId]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100 noise">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(600px_circle_at_5%_5%,rgba(56,189,248,.22),transparent_60%),radial-gradient(760px_circle_at_85%_15%,rgba(167,139,250,.20),transparent_58%),radial-gradient(700px_circle_at_50%_100%,rgba(34,197,94,.08),transparent_55%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(0,0,0,1))] bg-[length:120%_120%]"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6 xl:grid xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,.03),0_0_40px_rgba(56,189,248,.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-display text-sm font-semibold text-slate-100">Pavni Srivastava</div>
                <div className="text-xs text-slate-400">Interactive AI portfolio</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-300/85">
                RAG grounded
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <Avatar mode={mode} isThinking={thinking} isListening={isListening} isSpeaking={isSpeaking} />
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                <Sparkles size={12} />
                Presence
              </div>
              <div className="mt-3 text-lg font-semibold text-white">
                {thinking ? "Thinking through the answer" : isListening ? "Listening in real time" : "Quiet confidence, idle and ready"}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300/85">
                Lightweight voice interaction, grounded retrieval, and a more human narrative style for recruiter conversations.
              </div>
            </div>

            <div className="mt-4">
              <ModeToggle
                mode={mode}
                onModeChange={(nextMode) => {
                  playUiTick(590);
                  setMode(nextMode);
                }}
              />
            </div>

            <div className="mt-4">
              <VoiceController
                enabled={voiceOutputEnabled}
                setEnabled={setVoiceOutputEnabled}
                speakText={speechQueueText}
                onSpeakingChange={(speaking) => {
                  setIsSpeaking(speaking);
                  if (!speaking) setSpeechQueueText(null);
                }}
              />
            </div>
          </div>

          <DemoShowcase activeDemoId={activeDemoId} autoplaying={isDemoPlaying} onPlayDemo={runDemo} />
        </aside>

        <main className="space-y-4">
          <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,.03),0_0_55px_rgba(167,139,250,.08)]">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Talk to Future Me</div>
                <div className="font-display mt-1 text-2xl font-semibold tracking-tight text-white">
                  A recruiter conversation, not a static portfolio
                </div>
                <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/85">
                  Ask about projects, strengths, decisions, and ambition. The AI responds with memory, voice, and a more personal storytelling cadence grounded in your portfolio data.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[11px] text-slate-400">Mode</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">
                  {mode === "interview" ? "Interview" : mode === "roast" ? "Roast" : "Vision"}
                </div>
              </div>
            </div>

            <ChatUI
              mode={mode}
              messages={syncedMessages}
              thinking={thinking}
              input={input}
              onInputChange={setInput}
              onSend={() => {
                playUiTick(520);
                void sendMessage();
              }}
              onTypingDone={onAssistantTypingDone}
              voiceInputEnabled={voiceInputEnabled}
              setVoiceInputEnabled={setVoiceInputEnabled}
              onListeningChange={setIsListening}
              onSuggestionPick={(text) => {
                playUiTick(500);
                void sendMessage(text);
              }}
              turnstileDisabled={thinking || isDemoPlaying}
              onTurnstileToken={setTurnstileToken}
            />
          </section>

          <JourneyTimeline phases={timelinePhases} activeId={activeTimelineId} onSelect={setActiveTimelineId} />
        </main>
      </div>
    </div>
  );
}

