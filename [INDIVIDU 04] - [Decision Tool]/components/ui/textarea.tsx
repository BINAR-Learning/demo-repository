import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  maxRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoResize = false,
      maxRows,
      onChange,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge forwarded ref + local ref
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
      if (maxRows) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
        const maxHeight = lineHeight * maxRows;
        el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
        el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
      }
    }, [maxRows]);

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      if (autoResize) resize();
      onChange?.(e);
    };

    React.useLayoutEffect(() => {
      if (autoResize) resize();
    }, [autoResize, resize]);

    return (
      <textarea
        ref={innerRef}
        onChange={handleChange}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          autoResize && "overflow-hidden resize-none",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
