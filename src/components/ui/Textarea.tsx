import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-cBlack">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full border border-zinc-300 px-3 py-2 text-sm text-cBlack placeholder:text-zinc-400 focus:outline-none focus:border-cBlack transition-colors resize-y min-h-[100px]",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
