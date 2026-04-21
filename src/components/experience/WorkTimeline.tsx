interface TimelineItem {
  company: string;
  title: string;
  dates: string;
  description: string;
  link?: string;
}

const WORK: TimelineItem[] = [
  {
    company: "IMC Trading",
    title: "Software Engineer",
    dates: "Aug 2026 — Present",
    description: "Incoming strategy.",
    link: "https://imc.com",
  },
  {
    company: "IMC Trading",
    title: "Software Engineer Intern",
    dates: "Jun 2025 — Aug 2025",
    description:
      "Worked in a team of 4 to build software that aids equity options traders in the contrary process. Owned the real-time data acquisition, streaming, and display.",
  },
  {
    company: "AbbVie",
    title: "Software Engineer Intern",
    dates: "May 2024 — Dec 2024",
    description:
      "Developed internal tooling for large Jira and Confluence instances, serving 1000+ active everyday users.",
  },
];

function ItemContent({
  item,
  align,
}: {
  item: TimelineItem;
  align: "left" | "right";
}) {
  return (
    <div className={align === "left" ? "text-right" : "text-left"}>
      <p className="text-xs font-mono font-semibold text-cOrange tracking-wide uppercase">
        {item.dates}
      </p>
      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-bold text-cBlack mt-1 block hover:text-cPink transition-colors"
        >
          {item.company}
        </a>
      ) : (
        <p className="text-xl font-bold text-cBlack mt-1">{item.company}</p>
      )}
      <p className="text-sm text-zinc-400 mt-0.5">{item.title}</p>
      <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}

export default function WorkTimeline() {
  return (
    <div className="relative">
      {/* ── Mobile: single column with one continuous line ── */}
      <div className="md:hidden relative pl-7">
        {/* Single unbroken line spanning full height */}
        <div className="absolute left-0.75 top-2.25 bottom-2.25 w-px bg-cBlack/20" />

        {WORK.map((item, i) => (
          <div key={i} className={i < WORK.length - 1 ? "pb-10" : ""}>
            {/* Dot sits on the line */}
            <div className="absolute left-0 w-1.75 h-1.75 rounded-full bg-cBlack z-10 mt-1.25" />
            <ItemContent item={item} align="right" />
          </div>
        ))}
      </div>

      {/* ── Desktop: alternating left / right ── */}
      <div className="hidden md:block">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cBlack/20 -translate-x-1/2" />

        {WORK.map((item, i) => {
          const isRight = i % 2 === 0;
          return (
            <div key={i} className="relative grid grid-cols-[1fr_0_1fr] pb-14">
              <div className="pr-12">
                {!isRight && <ItemContent item={item} align="left" />}
              </div>

              <div className="relative flex justify-center">
                <div className="absolute top-2.5 w-2.5 h-2.5 rounded-full bg-cBlack z-10 -translate-x-1/2 left-1/2" />
              </div>

              <div className="pl-12">
                {isRight && <ItemContent item={item} align="right" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
