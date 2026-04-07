import {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface MessageInputHandle {
  insertText: (text: string) => void;
  deleteBackward: () => void;
  focus: () => void;
}

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStartVoiceInput?: () => void;
  onStopVoiceInput?: () => void;
  isRecording?: boolean;
  placeholder?: string;
  onTyping?: () => void;
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  function MessageInput(
    {
      onSendMessage,
      onStartVoiceInput,
      onStopVoiceInput,
      isRecording = false,
      placeholder = "Type a message...",
      onTyping,
    },
    ref
  ) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const applyEdit = (
      updater: (prev: string, start: number, end: number) => { next: string; caret: number }
    ) => {
      const el = textareaRef.current;
      const prev = el?.value ?? message;
      const start = el ? el.selectionStart : prev.length;
      const end = el ? el.selectionEnd : prev.length;
      const { next, caret } = updater(prev, start, end);
      setMessage(next);
      onTyping?.();
      requestAnimationFrame(() => {
        const t = textareaRef.current;
        if (!t) return;
        t.focus();
        const c = Math.min(caret, next.length);
        t.setSelectionRange(c, c);
      });
    };

    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        applyEdit((prev, start, end) => {
          const next = prev.slice(0, start) + text + prev.slice(end);
          return { next, caret: start + text.length };
        });
      },
      deleteBackward: () => {
        applyEdit((prev, start, end) => {
          if (start !== end) {
            const next = prev.slice(0, start) + prev.slice(end);
            return { next, caret: start };
          }
          if (start <= 0) return { next: prev, caret: 0 };
          const next = prev.slice(0, start - 1) + prev.slice(end);
          return { next, caret: start - 1 };
        });
      },
      focus: () => textareaRef.current?.focus(),
    }));

    const handleSend = () => {
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping?.();
            }}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="resize-none min-h-[48px] max-h-32 rounded-xl text-base bg-surface-container dark:bg-surface-container-high border-outline-variant"
            rows={1}
            data-testid="input-message"
          />
        </div>

        {onStartVoiceInput && onStopVoiceInput && (
          <Button
            variant={isRecording ? "default" : "outline"}
            size="icon"
            onClick={isRecording ? onStopVoiceInput : onStartVoiceInput}
            data-testid="button-voice-input"
            className={cn(
              "h-12 w-12 rounded-xl shrink-0",
              isRecording && "animate-pulse"
            )}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="h-12 w-12 rounded-xl shrink-0"
          data-testid="button-send-message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";
