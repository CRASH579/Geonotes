import { ExternalLink, Github } from "lucide-react";

type Project = {
  name: string;
  description: string;
  tech: string[];
  github?: string;
  live?: string;
  featured?: boolean;
};

const PROJECTS: Project[] = [
  {
    name: "Geonotes",
    description:
      "A full-stack geo-tagged notes app. Drop notes at real-world GPS coordinates, discover notes left by others nearby, and control visibility per note. Built with React, NestJS, PostgreSQL + PostGIS, and Firebase Auth.",
    tech: ["React", "TypeScript", "NestJS", "PostgreSQL", "PostGIS", "Firebase", "Docker"],
    github: "https://github.com/CRASH579/Geonotes",
    live: "/web",
    featured: true,
  },
  {
    name: "More projects coming soon!",
    description:
      "I have a few other projects in my mind like some tools, maybe something with AI, A chat app and a habit tracker. Stay tuned!",
    tech: ["React", "Tools", "AI"],
    github: "https://github.com/CRASH579",
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border/10 hover:border-brand/30 transition-colors flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-2">
        <h3>{project.name}</h3>
        <div className="flex gap-2 shrink-0">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-full hover:bg-surface-2 transition-colors"
            >
              <Github size={18} className="text-muted" />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live demo"
              className="p-2 rounded-full hover:bg-surface-2 transition-colors"
            >
              <ExternalLink size={18} className="text-muted" />
            </a>
          )}
        </div>
      </div>
      <p className="text-sm flex-1">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="bg-surface-2 text-muted text-xs px-3 py-1 rounded-full">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export const Projects = () => {
  const featured = PROJECTS.find((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <main className="w-full max-w-5xl mx-auto px-6 pb-24 pt-32">
      <h1 className="mb-3">Projects</h1>
      <p className="mb-12">Things I've built — from side projects to real-world apps.</p>

      {/* Featured */}
      {featured && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-brand mb-4">Featured</p>
          <div className="bg-surface rounded-2xl p-8 border border-brand/20 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h2>{featured.name}</h2>
              <div className="flex gap-2">
                {featured.github && (
                  <a
                    href={featured.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-full text-sm text-text hover:opacity-90 transition-opacity"
                  >
                    <Github size={15} />
                    Source
                  </a>
                )}
                {featured.live && (
                  <a
                    href={featured.live}
                    className="flex items-center gap-2 bg-brand text-light px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={15} />
                    Live App
                  </a>
                )}
              </div>
            </div>
            <p className="max-w-2xl">{featured.description}</p>
            <div className="flex flex-wrap gap-2">
              {featured.tech.map((t) => (
                <span key={t} className="bg-surface-2 text-muted text-sm px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest text-brand mb-4">More projects</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {rest.map((p) => (
              <ProjectCard key={p.name} project={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
};
