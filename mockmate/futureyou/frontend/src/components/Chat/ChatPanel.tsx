import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { ChatRole } from "./MessageBubble";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  isTyping?: boolean;
};

export default function ChatPanel({
  messages,
  thinking,
  onTypingDone,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  onTypingDone?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const typingMessageCount = useMemo(
    () => messages.filter((m) => m.role === "assistant" && m.isTyping).length,
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking, typingMessageCount]);

  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2">
      <div className="mx-auto max-w-3xl pt-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              timestamp={m.timestamp}
              isTyping={m.isTyping}
              onTypingDone={m.isTyping ? onTypingDone : undefined}
            />
          ))}

          {thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="flex w-full"
            >
              <div className="ml-auto mr-auto flex max-w-[700px] rounded-2xl border border-white/10 bg-white/3 px-4 py-3 backdrop-blur-md shadow-[0_0_25px_rgba(56,189,248,.08)]">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.55)]" />
                  <div className="text-sm text-slate-200/90">Future Me is thinking</div>
                  <div className="flex items-center gap-1">
                    <span className="animate-pulse text-cyan-200">.</span>
                    <span className="animate-pulse text-cyan-200" style={{ animationDelay: "100ms" }}>
                      .
                    </span>
                    <span className="animate-pulse text-cyan-200" style={{ animationDelay: "200ms" }}>
                      .
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

