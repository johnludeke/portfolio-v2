import ProjectCard, { Project } from "./ProjectCard";

// Add new projects here — even indices go left column, odd go right
const PROJECTS: Project[] = [
  {
    name: "Portfolio V2",
    year: "2024",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    description:
      "This site. A personal portfolio and blog built with Next.js App Router, Tailwind CSS v4, and Supabase. Features an admin interface secured with Google OAuth and a GitHub-style markdown editor for writing blog posts.",
    link: "https://github.com/johnludeke/portfolio-v2",
  },
];

export default function ProjectGrid() {
  const left = PROJECTS.filter((_, i) => i % 2 === 0);
  const right = PROJECTS.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div className="flex flex-col gap-4">
        {left.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {right.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </div>
  );
}
