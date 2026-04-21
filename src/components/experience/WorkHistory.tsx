import ExperienceCard from "./ExperienceCard";

export default function WorkHistory() {
  return (
    <div className="space-y-4">
      <ExperienceCard
        company="IMC Trading"
        title="Software Engineer"
        dates="Aug 2026 — Present"
        location="Chicago, IL"
        link="https://www.imc.com/"
        stack={[
          { name: "TypeScript" },
          { name: "React" },
          { name: "Node.js" },
          { name: "PostgreSQL" },
          { name: "AWS" },
        ]}
      >
        <p>Incoming strategy.</p>
      </ExperienceCard>

      <ExperienceCard
        company="IMC Trading"
        title="Software Engineer Intern"
        dates="Jun 2025 - Aug 2025"
        location="Chicago, IL"
        stack={[
          { name: "Java" },
          { name: "TypeScript" },
          { name: "Kafka" },
          { name: "Kubernetes" },
          { name: "React" },
        ]}
      >
        <p>
          Worked in a team of 4 to build software that aids equity options
          traders in the contrary process.
        </p>
        <p>Owned the real-time data acquisition, streaming, and display.</p>
      </ExperienceCard>

      <ExperienceCard
        company="AbbVie"
        title="Software Engineer Intern"
        dates="May 2024 — Dec 2024"
        location="North Chicago, IL"
        stack={[{ name: "Java" }, { name: "Jira" }, { name: "Confluence" }]}
      >
        <p>
          Developed internal tooling for large Jira and Confluence instances,
          serving 1000+ active everyday users.
        </p>
      </ExperienceCard>
    </div>
  );
}
