import { Delete, Space } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LanguageCode } from "@/lib/languages";
import { getVirtualKeyboardLayout } from "@/lib/virtualKeyboardLayouts";

export interface VirtualKeyboardProps {
  /** Matches chat language from `LanguageSelector` / `ChatHeader`. */
  language: LanguageCode;
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  className?: string;
}

function KeyRow({
  keys,
  rowIndex,
  onKey,
}: {
  keys: string[];
  rowIndex: number;
  onKey: (ch: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {keys.map((ch, colIndex) => (
        <Button
          key={`${rowIndex}-${colIndex}`}
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 min-w-[2.25rem] px-2 text-base font-normal shrink-0",
            "bg-surface-container dark:bg-surface-container-high border-outline-variant",
            "hover:bg-surface-container-high dark:hover:bg-surface"
          )}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onKey(ch)}
        >
          {ch}
        </Button>
      ))}
    </div>
  );
}

export function VirtualKeyboard({
  language,
  onInsert,
  onBackspace,
  onSpace,
  className,
}: VirtualKeyboardProps) {
  const rows = getVirtualKeyboardLayout(language);

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface dark:bg-surface-container p-3 shadow-sm",
        className
      )}
      data-testid="virtual-keyboard"
    >
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <KeyRow key={i} rowIndex={i} keys={row} onKey={onInsert} />
        ))}
      </div>

      <div className="flex gap-2 mt-3 pt-2 border-t border-outline-variant">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 h-10 gap-2"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onSpace}
          data-testid="vk-space"
        >
          <Space className="h-4 w-4" />
          Space
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10 px-4 shrink-0"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBackspace}
          data-testid="vk-backspace"
          aria-label="Backspace"
        >
          <Delete className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
