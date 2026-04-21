type AccentColor = "cBlue" | "cPink" | "cGreen" | "cOrange";

interface SectionHeaderProps {
  label: string;
  accent?: AccentColor;
  className?: string;
}

const accentColors: Record<AccentColor, string> = {
  cBlue: "bg-cBlue",
  cPink: "bg-cPink",
  cGreen: "bg-cGreen",
  cOrange: "bg-cOrange",
};

export default function SectionHeader({ label, accent = "cBlue", className }: SectionHeaderProps) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-bold tracking-tight text-cBlack">{label}</h2>
      <div className={`mt-2 h-1 w-12 ${accentColors[accent]}`} />
    </div>
  );
}
