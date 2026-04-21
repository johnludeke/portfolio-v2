import { cn } from "@/lib/utils";

type Shape = "circle" | "triangle" | "square";

interface GeometricAccentProps {
  shape?: Shape;
  color?: "cPink" | "cGreen" | "cBlue" | "cOrange";
  size?: number; // px
  className?: string;
  style?: React.CSSProperties;
}

const colorMap = {
  cPink: "#c953c6",
  cGreen: "#8dc561",
  cBlue: "#65c9c7",
  cOrange: "#e8845a",
};

export default function GeometricAccent({
  shape = "circle",
  color = "cBlue",
  size = 80,
  className,
  style,
}: GeometricAccentProps) {
  const fill = colorMap[color];

  const shapeStyles: React.CSSProperties =
    shape === "circle"
      ? { borderRadius: "50%" }
      : shape === "triangle"
      ? {
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          borderRadius: "0",
        }
      : {};

  return (
    <div
      aria-hidden="true"
      className={cn("absolute pointer-events-none select-none", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: fill,
        opacity: 0.25,
        ...shapeStyles,
        ...style,
      }}
    />
  );
}
