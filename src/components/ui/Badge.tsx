import { cn } from "@/lib/utils";

interface BadgeProps {
  published: boolean;
  className?: string;
}

export default function Badge({ published, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
        published
          ? "bg-green-100 text-green-800"
          : "bg-zinc-100 text-zinc-600",
        className
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
