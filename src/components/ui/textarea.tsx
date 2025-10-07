"use client";

import { forwardRef, useId } from "react";
import { twMerge } from "tailwind-merge";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? `textarea-${generatedId}`;

    return (
      <div className="flex flex-col gap-2">
        {label ? (
          <label htmlFor={textareaId} className="text-sm text-zinc-300">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={twMerge(
            "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            className
          )}
          {...props}
        />
        {helperText ? (
          <p className="text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
