import { Download, Github, Linkedin, Mail, Phone } from "lucide-react";

const SKILLS: Record<string, string[]> = {
  Languages: ["JavaScript", "TypeScript", "Python", "C++", "Java", "SQL", "Bash"],
  Frontend: ["React", "Angular", "Next.js", "Vue.js", "Tailwind CSS", "HTML / CSS"],
  Backend: ["Node.js", "Express", "NestJS", "RESTful APIs", "Microservices", "GraphQL"],
  Databases: ["PostgreSQL", "Firebase", "MySQL", "MongoDB"],
  Cloud: ["Microsoft Azure", "GCP", "AWS"],
  DevOps: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions", "Azure DevOps", "CI/CD"],
  "CRM / ERP": ["Microsoft Dynamics 365", "Experlogix CPQ"],
  Tools: ["Arch Linux", "CentOS", "Adobe Suite", "Blender", "Jira"],
};

const EXPERIENCE = [
  {
    role: "Full Stack Developer",
    company: "Fastcurve Services",
    location: "Noida, UP",
    period: "Aug 2025 – Jan 2026",
    points: [
      "Engineered and scaled a multi-tenant freight management system using Vue.js and NestJS, enabling secure, isolated client environments in a single application.",
      "Delivered production-ready features and modules end-to-end, accelerating time-to-market while ensuring performance and maintainability.",
      "Collaborated in full-stack development cycles to ship critical features daily, driving continuous product evolution and client adoption.",
    ],
  },
  {
    role: "Software Engineer I",
    company: "NielsenIQ",
    location: "Pune, MH",
    period: "Oct 2022 – Mar 2025",
    points: [
      "Administered identity management using Azure Active Directory and OAuth 2.0.",
      "Built and maintained Python-based data delivery pipelines on CentOS VMs, reliably streaming data to AWS, GCP, and Azure for downstream analytics and integrations.",
      "Enhanced CPQ efficiency by building solutions in Microsoft Dynamics 365 and Experlogix.",
      "Automated deployment workflows using CI/CD pipelines with GitHub Actions and Jenkins.",
    ],
  },
  {
    role: "Video Editing Intern",
    company: "Cognitiq",
    location: "Meerut, UP",
    period: "Sep 2020 – Feb 2021",
    points: [
      "Produced engaging digital content using Adobe Premiere Pro and After Effects.",
      "Boosted interaction by 40% through data-driven video marketing campaigns.",
    ],
  },
];

const EDUCATION = [
  {
    degree: "B.Tech in Computer Science (Cloud Computing Specialization)",
    institution: "SRM Institute of Science and Technology",
    location: "Chennai, India",
    period: "Graduated 2023",
    tags: ["CGPA: 9.0"],
  },
  {
    degree: "Intermediate (CBSE)",
    institution: "K.L. International School",
    location: "Meerut, India",
    period: "2019",
    tags: ["90.3%"],
  },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/CRASH579", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/utkarshjain579", icon: Linkedin },
  { label: "Email", href: "mailto:Utkarsh57917@gmail.com", icon: Mail },
  { label: "+91 7456893677", href: "tel:+917456893677", icon: Phone },
];

export const About = () => {
  return (
    <main className="w-full max-w-3xl mx-auto px-6 pb-24 pt-32">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-1">Utkarsh Jain</h1>
        <p className="text-brand font-medium mb-1">Full-Stack Developer</p>
        <p className="text-muted text-sm mb-6">Meerut, UP · Open to opportunities</p>
        <p className="max-w-xl mx-auto mb-8 text-sm leading-relaxed">
          Multifaceted Software Engineer skilled in full-stack development, cloud platforms, DevOps,
          and scalable system design. Expert in JavaScript, Python, SQL, Node.js, React, Angular,
          and CI/CD practices. Known for cross-functional collaboration, agile methodologies and
          high-performance applications through efficient system architecture and modern development practices.
        </p>

        <div className="flex gap-3 justify-center flex-wrap mb-6">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={label}
              className="p-3 rounded-full bg-surface hover:bg-surface-2 border border-border/10 transition-colors"
            >
              <Icon size={20} className="text-text" />
            </a>
          ))}
        </div>

        <a
          href="/resume.pdf"
          download="Utkarsh_Jain_Resume.pdf"
          className="inline-flex items-center gap-2 bg-brand text-light font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          <Download size={16} />
          Download Resume
        </a>
      </section>

      {/* Skills */}
      <section className="mb-16">
        <h2 className="mb-6">Skills</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(SKILLS).map(([category, items]) => (
            <div key={category} className="bg-surface rounded-2xl p-5 border border-border/10">
              <p className="text-xs uppercase tracking-widest text-brand mb-3">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span key={skill} className="bg-surface-2 text-text text-sm px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-16">
        <h2 className="mb-6">Experience</h2>
        <div className="relative border-l-2 border-brand/30 pl-6 space-y-8">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.9rem] top-1 w-3 h-3 rounded-full bg-brand" />
              <div className="bg-surface rounded-2xl p-5 border border-border/10">
                <div className="flex justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-text">{exp.role}</p>
                    <p className="text-sm text-brand">{exp.company}</p>
                    <p className="text-xs text-muted">{exp.location}</p>
                  </div>
                  <span className="text-xs text-muted self-start mt-1 whitespace-nowrap">{exp.period}</span>
                </div>
                <ul className="space-y-2 list-none">
                  {exp.points.map((pt, j) => (
                    <li
                      key={j}
                      className="text-sm text-muted before:content-['–'] before:mr-2 before:text-brand"
                    >
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-16">
        <h2 className="mb-6">Education</h2>
        <div className="space-y-4">
          {EDUCATION.map((edu, i) => (
            <div key={i} className="bg-surface rounded-2xl p-5 border border-border/10">
              <div className="flex justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-semibold text-text">{edu.degree}</p>
                  <p className="text-sm text-brand">{edu.institution}</p>
                  <p className="text-xs text-muted">{edu.location}</p>
                </div>
                <span className="text-xs text-muted self-start mt-1">{edu.period}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {edu.tags.map((tag) => (
                  <span key={tag} className="bg-brand/10 text-brand text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="mb-4">Get in touch</h2>
        <p className="mb-6">
          Open to full-time roles, freelance work, and interesting conversations. Reach out below.
        </p>
        <div className="flex gap-3 flex-wrap">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-surface px-5 py-3 rounded-full border border-border/10 hover:border-brand/40 transition-colors text-sm text-text"
            >
              <Icon size={16} className="text-brand" />
              {label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
};
