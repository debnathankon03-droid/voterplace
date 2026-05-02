import { Sparkles, ExternalLink, VolumeX, Volume2 } from "lucide-react";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  msg: ChatMessage;
  isSpeaking: boolean;
  speakText: (text: string) => void;
}

/**
 * MessageBubble renders an individual chat message, differentiating between
 * the user and the AI assistant, and handling text-to-speech functionality.
 */
export default function MessageBubble({ msg, isSpeaking, speakText }: MessageBubbleProps) {
  return (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} slide-in-up`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
          msg.role === "user"
            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900"
            : "glass"
        }`}
      >
        {msg.role === "assistant" && (
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-medium text-orange-400">Matdaan Mitra</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

        {/* Citations */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
              <span>Sources:</span>
              {msg.citations.map((c, i) => (
                <a
                  key={i}
                  href={c}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {new URL(c).hostname}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* TTS button for assistant messages */}
        {msg.role === "assistant" && msg.id !== "welcome" && (
          <button
            onClick={() => speakText(msg.content)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            {isSpeaking ? "Stop" : "Listen"}
          </button>
        )}
      </div>
    </div>
  );
}
