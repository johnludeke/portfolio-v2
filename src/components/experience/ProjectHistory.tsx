import ExperienceCard from "./ExperienceCard";

export default function ProjectHistory() {
  return (
    <div className="space-y-4">
      <ExperienceCard
        company="Portfolio V2"
        title="Personal Portfolio"
        dates="2024"
        link="https://github.com"
        stack={[
          { name: "Next.js" },
          { name: "TypeScript" },
          { name: "Tailwind CSS" },
          { name: "Supabase" },
        ]}
      >
        <p>
          This site! A personal portfolio and blog built with Next.js App
          Router, Tailwind CSS, and Supabase. Features an admin interface with
          Google OAuth and a GitHub-style markdown editor for writing blog
          posts.
        </p>
      </ExperienceCard>
    </div>
  );
}
