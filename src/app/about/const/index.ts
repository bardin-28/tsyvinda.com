export type Role = {
  title: string;
  org: string;
  type?: string;
  period: string;
  location?: string;
  bullets: string[];
};

export type StackGroup = {
  group: string;
  items: string[];
};

export type Education = {
  school: string;
  degree: string;
  period: string;
  skills: string[];
};

export const INDUSTRIES = [
  "MedTech",
  "FinTech",
  "PropTech",
  "TravelTech",
  "EdTech",
  "InsurTech",
];

export const STACK: StackGroup[] = [
  { group: "Markup", items: ["HTML5", "Pug", "CSS3", "SCSS"] },
  { group: "Languages", items: ["JavaScript", "TypeScript", "PHP"] },
  {
    group: "Frameworks",
    items: ["React", "Next.js", "Redux-Saga", "Redux-Toolkit", "Node.js", "Express"],
  },
  { group: "Data", items: ["GraphQL", "Apollo Client", "Apollo Server", "MongoDB"] },
  { group: "Testing", items: ["Jest", "React Testing Library", "Storybook"] },
  { group: "Tooling", items: ["Git", "GitHub", "GitLab", "Webpack", "Gulp", "Docker", "Claude Code"] },
  { group: "Design", items: ["Figma", "Photoshop"] },
  { group: "Infra", items: ["Digital Ocean", "GoDaddy"] },
];

export const EXPERIENCE: Role[] = [
  {
    title: "Front-end Lead Engineer",
    org: "Tallium Inc.",
    type: "Full-time",
    period: "Sep 2025 — Present · 10 mos",
    location: "Remote · Kyiv, Ukraine",
    bullets: [
      "Created and maintained internal engineering standards, security guidelines, and technical best-practice documentation, improving development consistency and reducing security risks.",
      "Led the frontend team's adoption of Claude Code, establishing usage guidelines, sharing best practices, and supporting engineers in integrating AI-assisted development into their daily workflows.",
      "Developed an investment platform enabling large-scale investments into business projects, with built-in analytics and automated generation of investment documents.",
    ],
  },
  {
    title: "Front-end Developer",
    org: "Tallium Inc.",
    type: "Full-time",
    period: "Mar 2022 — Present · 4 yrs 4 mos",
    location: "Hybrid · Kyiv, Ukraine",
    bullets: [
      "Developed a service desk platform that significantly improved team efficiency and response times, earning industry recognition as one of the top solutions in its field.",
      "Developed a centralized internal system for a business center, integrating tenant services like cleaning, access control, parking management, analytics, and event space reservations.",
      "Worked on a MedTech ophthalmology platform, building retinal scan visualization, patient records, AI-driven disease risk analysis, and color-coded layer masks.",
      "Delivered an optimized InsurTech solution with frontend-generated insurance PDFs, minimizing back-office effort and accelerating vehicle policy issuance through automation.",
      "Developed a cruise booking platform in the Baltic Sea, enabling end-to-end travel packages including cruise itineraries, onboard services, and hotel reservations.",
    ],
  },
  {
    title: "WordPress Developer",
    org: "Tallium Inc.",
    period: "Mar 2021 — Mar 2022 · 1 yr 1 mo",
    location: "On-site · Kyiv, Ukraine",
    bullets: [
      "Creation of informational sites and landing pages.",
      "Website integration to CMS WordPress.",
      "Website deployment to hosting.",
      "Supporting projects.",
    ],
  },
  {
    title: "WordPress Developer",
    org: "Laconic Design",
    type: "Full-time",
    period: "Jan 2020 — Mar 2021 · 1 yr 3 mos",
    location: "Ukraine",
    bullets: [
      "Creation of landing pages.",
      "Creation of informational sites.",
      "Website integration to CMS WordPress.",
      "Website deployment to hosting.",
      "Supporting projects.",
    ],
  },
];

export const EDUCATION: Education[] = [
  {
    school: "State University of Information and Communication Technologies",
    degree: "Master's degree · Computer Software Engineering",
    period: "Sep 2024 — Jan 2026",
    skills: ["Amazon Web Services (AWS)", "Google Cloud Platform (GCP)", "Risk Management"],
  },
  {
    school: "State University of Trade and Economics",
    degree: "Bachelor's degree · Hotel, Motel, and Restaurant Management",
    period: "2016 — 2021",
    skills: [],
  },
];

export const STATS = [
  { number: "6+", label: "Years building products" },
  { number: "5", label: "Industries shipped to" },
  { number: "10+", label: "Production platforms" },
];

export const HEADLINE_WORDS = ["Software", "Engineer"];
