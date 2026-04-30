import type { ChatMode } from "../api/client";
import type { ChatMessage } from "./Chat/ChatPanel";
import ChatPanel from "./Chat/ChatPanel";
import InputBar from "./Chat/InputBar";
import SuggestionsChips from "./Chat/SuggestionsChips";
import TurnstileGate from "./TurnstileGate";

export default function ChatUI({
  mode,
  messages,
  thinking,
  input,
  onInputChange,
  onSend,
  onTypingDone,
  voiceInputEnabled,
  setVoiceInputEnabled,
  onListeningChange,
  onSuggestionPick,
  turnstileDisabled,
  onTurnstileToken,
}: {
  mode: ChatMode;
  messages: ChatMessage[];
  thinking: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onTypingDone: () => void;
  voiceInputEnabled: boolean;
  setVoiceInputEnabled: (v: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onSuggestionPick: (text: string) => void;
  turnstileDisabled: boolean;
  onTurnstileToken: (token: string | null) => void;
}) {
  return (
    <>
      <div className="mt-4">
        <ChatPanel messages={messages} thinking={thinking} onTypingDone={onTypingDone} />
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <SuggestionsChips mode={mode} onPick={onSuggestionPick} />
      </div>

      <div className="mt-4">
        <InputBar
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          disabled={thinking}
          voiceInputEnabled={voiceInputEnabled}
          setVoiceInputEnabled={setVoiceInputEnabled}
          onListeningChange={onListeningChange}
        />
      </div>

      <div className="mt-3">
        <TurnstileGate onToken={onTurnstileToken} disabled={turnstileDisabled} />
      </div>
    </>
  );
}

