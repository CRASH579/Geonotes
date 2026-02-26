import Logo from "@/assets/logo.svg";
import { Link } from "react-router-dom";
import { MapPin, Lock, Globe } from "lucide-react";

const TECH_STACK = [
  "React", "TypeScript", "NestJS", "PostgreSQL",
  "PostGIS", "Firebase", "Tailwind CSS", "Docker",
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Leave Notes",
    description:
      "Drop text notes at any GPS location. Share observations, tips, or memories tied to a real place.",
  },
  {
    icon: Globe,
    title: "Discover Nearby",
    description:
      "Browse notes others have left around you. Explore your city through the eyes of people who've been there.",
  },
  {
    icon: Lock,
    title: "Control Visibility",
    description:
      "Keep notes private, share with friends, or make them public. Your content, your rules.",
  },
];

export const Home = () => {
  return (
    <main className="w-full max-w-5xl mx-auto px-6 pb-24">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 pt-36 pb-20">
        <div className="flex items-center gap-4">
          <img src={Logo} className="h-20" alt="Geonotes logo" />
          <h1>Geonotes</h1>
        </div>
        <p className="max-w-xl text-lg">
          Leave notes. Discover places. Connect with the world — one pin at a
          time.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/web"
            className="bg-brand text-light font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Try the App
          </Link>
          <a
            href="https://github.com/CRASH579/Geonotes"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface-2 text-text font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            View Source
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20">
        <h2 className="text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-surface rounded-2xl p-6 flex flex-col gap-3 border border-border/10 hover:border-brand/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <Icon size={20} className="text-brand" />
              </div>
              <h3>{title}</h3>
              <p className="text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="pb-20 text-center">
        <h2 className="mb-6">Built with</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="bg-surface px-4 py-2 rounded-full text-sm text-muted border border-border/10"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Explore more */}
      <section className="text-center">
        <h2 className="mb-3">Explore more</h2>
        <p className="mb-8">See my other projects or learn more about me.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/projects"
            className="bg-brand text-light font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Projects
          </Link>
          <Link
            to="/about"
            className="bg-surface-2 text-text font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            About Me
          </Link>
        </div>
      </section>
    </main>
  );
};
