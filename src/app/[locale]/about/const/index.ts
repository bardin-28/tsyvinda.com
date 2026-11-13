import type { Locale } from "@/i18n/locales";

export type Role = {
  title: string;
  org: string;
  type?: string;
  period: string;
  location?: string;
  bullets: string[];
};

/** Key of a stack group's translated name in the `about.stack.groups` messages. */
export type StackGroupKey =
  | "markup"
  | "languages"
  | "frameworks"
  | "data"
  | "testing"
  | "tooling"
  | "design"
  | "infra";

export type StackGroup = {
  groupKey: StackGroupKey;
  items: string[];
};

export type Recommendation = {
  name: string;
  role: string;
  relation: string;
  quote: string[];
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
  {
    groupKey: "markup",
    items: ["HTML5", "Pug", "CSS3", "CSS Modules", "SCSS"],
  },
  { groupKey: "languages", items: ["JavaScript", "TypeScript", "PHP"] },
  {
    groupKey: "frameworks",
    items: [
      "React",
      "Next.js",
      "Redux-Saga",
      "Redux-Toolkit",
      "Node.js",
      "Express",
      "NestJS",
    ],
  },
  {
    groupKey: "data",
    items: ["GraphQL", "Apollo Client", "Apollo Server", "MongoDB"],
  },
  { groupKey: "testing", items: ["Jest", "Playwright", "Storybook"] },
  {
    groupKey: "tooling",
    items: [
      "Git",
      "GitHub",
      "GitLab",
      "Webpack",
      "Gulp",
      "Docker",
      "Claude Code",
    ],
  },
  { groupKey: "design", items: ["Figma", "Photoshop"] },
  { groupKey: "infra", items: ["Digital Ocean", "GoDaddy"] },
];

/** Work history per language; every language lists the same roles in the same order. */
export const EXPERIENCE: Record<Locale, Role[]> = {
  en: [
    {
      title: "Full-Stack Lead Developer",
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
  ],
  uk: [
    {
      title: "Full-Stack Lead Developer",
      org: "Tallium Inc.",
      type: "Повна зайнятість",
      period: "вер. 2025 — дотепер · 10 міс.",
      location: "Віддалено · Київ, Україна",
      bullets: [
        "Створив і підтримую внутрішні інженерні стандарти, правила безпеки та документацію з технічних практик, що зробило розробку узгодженішою та знизило ризики безпеки.",
        "Керував упровадженням Claude Code у фронтенд-команді: сформулював правила використання, ділився найкращими практиками й допомагав інженерам інтегрувати розробку з AI у щоденну роботу.",
        "Розробив інвестиційну платформу для масштабних інвестицій у бізнес-проєкти з вбудованою аналітикою та автоматичним формуванням інвестиційних документів.",
      ],
    },
    {
      title: "Front-end Developer",
      org: "Tallium Inc.",
      type: "Повна зайнятість",
      period: "бер. 2022 — дотепер · 4 р. 4 міс.",
      location: "Гібридно · Київ, Україна",
      bullets: [
        "Розробив сервіс-деск платформу, яка суттєво підвищила ефективність команди та швидкість реагування й отримала галузеве визнання як одне з найкращих рішень у своїй сфері.",
        "Розробив централізовану внутрішню систему для бізнес-центру, що обʼєднує сервіси для орендарів: прибирання, контроль доступу, керування паркінгом, аналітику та бронювання залів для заходів.",
        "Працював над офтальмологічною MedTech-платформою: візуалізація сканів сітківки, медичні картки пацієнтів, аналіз ризику захворювань на основі AI та кольорові маски шарів.",
        "Реалізував оптимізоване InsurTech-рішення з генерацією страхових PDF на фронтенді, що зменшило навантаження на бек-офіс і завдяки автоматизації пришвидшило оформлення автостраховок.",
        "Розробив платформу бронювання круїзів Балтійським морем із повними туристичними пакетами: маршрути круїзів, послуги на борту та бронювання готелів.",
      ],
    },
    {
      title: "WordPress Developer",
      org: "Tallium Inc.",
      period: "бер. 2021 — бер. 2022 · 1 р. 1 міс.",
      location: "В офісі · Київ, Україна",
      bullets: [
        "Створення інформаційних сайтів і лендингів.",
        "Інтеграція сайтів із CMS WordPress.",
        "Розгортання сайтів на хостингу.",
        "Підтримка проєктів.",
      ],
    },
    {
      title: "WordPress Developer",
      org: "Laconic Design",
      type: "Повна зайнятість",
      period: "січ. 2020 — бер. 2021 · 1 р. 3 міс.",
      location: "Україна",
      bullets: [
        "Створення лендингів.",
        "Створення інформаційних сайтів.",
        "Інтеграція сайтів із CMS WordPress.",
        "Розгортання сайтів на хостингу.",
        "Підтримка проєктів.",
      ],
    },
  ],
};

/** Recommendations per language; every language lists the same people in the same order. */
export const RECOMMENDATIONS: Record<Locale, Recommendation[]> = {
  en: [
    {
      name: "Kateryna Shcherbak",
      role: "Senior Project Manager · Tallium Inc.",
      relation: "Managed Vladyslav directly · Jun 2026",
      quote: [
        "Working with Vladyslav over a 5-month project was a genuinely great experience. He's a highly skilled front-end developer who also led our team with confidence — proactively improving the product, committing to team success, and setting a strong example throughout.",
        "What sets him apart is the balance he brings: he's ambitious and eager to learn, yet always grounded and analytical when it matters. He embraces new challenges without losing sight of what the project actually needs.",
        "Strong technically, excellent soft skills, and a real team player. I'd recommend Vladyslav without hesitation.",
      ],
    },
    {
      name: "Artem Kazka",
      role: "Senior Project Manager / Scrum Master · Tallium Inc.",
      relation: "Managed Vladyslav directly · Feb 2026",
      quote: [
        "I had the pleasure of working with Vladyslav on a complex FinTech project, where he demonstrated strong professionalism and technical expertise as a Front-End Developer.",
        "Vladyslav consistently proved himself to be a reliable and forward-thinking engineer. He approaches challenges thoughtfully and is always able to propose multiple solutions to a problem, carefully considering trade-offs and best outcomes. His ability to think ahead and anticipate potential issues significantly contributed to the stability of our product.",
        "He is also highly adaptable and open to innovation. Whenever there was a need to adopt new technologies, Vladyslav proactively took the initiative and implemented them following industry best practices.",
        "I would confidently recommend Vladyslav as a skilled, versatile, and growth-oriented Front-End Developer.",
      ],
    },
    {
      name: "Viktoriia Nekrasova",
      role: "React Developer · Tallium Inc.",
      relation: "Worked on the same team · Oct 2023",
      quote: [
        "I worked with Vladyslav on the project for six months and was impressed with his level of knowledge and skills. He quickly navigates through other people's code and helps you find things you didn't notice. He explains his decisions well and helps to solve problems. Best partner!",
      ],
    },
  ],
  uk: [
    {
      name: "Катерина Щербак",
      role: "Senior Project Manager · Tallium Inc.",
      relation: "Безпосередня керівниця Владислава · черв. 2026",
      quote: [
        "Пʼять місяців роботи з Владиславом над проєктом були справді чудовим досвідом. Він висококваліфікований фронтенд-розробник, який до того ж упевнено керував нашою командою — проактивно покращував продукт, був відданий спільному успіху й увесь час подавав гідний приклад.",
        "Його вирізняє баланс: він амбітний і прагне вчитися, але водночас завжди виважений і аналітичний, коли це справді важливо. Він охоче береться за нові виклики, не втрачаючи з поля зору того, що насправді потрібно проєкту.",
        "Сильний технічно, з чудовими soft skills і справжній командний гравець. Без вагань рекомендую Владислава.",
      ],
    },
    {
      name: "Артем Казка",
      role: "Senior Project Manager / Scrum Master · Tallium Inc.",
      relation: "Безпосередній керівник Владислава · лют. 2026",
      quote: [
        "Мав задоволення працювати з Владиславом над складним FinTech-проєктом, де він як фронтенд-розробник продемонстрував високий професіоналізм і технічну експертизу.",
        "Владислав незмінно показував себе надійним і далекоглядним інженером. Він вдумливо підходить до викликів і завжди може запропонувати кілька варіантів розвʼязання проблеми, ретельно зважуючи компроміси та найкращі результати. Його вміння думати наперед і передбачати можливі проблеми суттєво вплинуло на стабільність нашого продукту.",
        "Крім того, він легко адаптується та відкритий до інновацій. Щоразу, коли потрібно було впровадити нові технології, Владислав проактивно брав ініціативу на себе й реалізовував їх відповідно до найкращих галузевих практик.",
        "Упевнено рекомендую Владислава як кваліфікованого, різнобічного й орієнтованого на розвиток фронтенд-розробника.",
      ],
    },
    {
      name: "Вікторія Некрасова",
      role: "React Developer · Tallium Inc.",
      relation: "Працювали в одній команді · жовт. 2023",
      quote: [
        "Я працювала з Владиславом над проєктом пів року, і мене вразив рівень його знань і навичок. Він швидко орієнтується в чужому коді та допомагає знайти те, чого ти не помітив. Він добре пояснює свої рішення й допомагає розвʼязувати проблеми. Найкращий напарник!",
      ],
    },
  ],
};

/** Education per language; every language lists the same schools in the same order. */
export const EDUCATION: Record<Locale, Education[]> = {
  en: [
    {
      school: "State University of Information and Communication Technologies",
      degree: "Master's degree · Computer Software Engineering",
      period: "Sep 2024 — Jan 2026",
      skills: [
        "Amazon Web Services (AWS)",
        "Google Cloud Platform (GCP)",
        "Risk Management",
      ],
    },
    {
      school: "State University of Trade and Economics",
      degree: "Bachelor's degree · Hotel, Motel, and Restaurant Management",
      period: "2016 — 2021",
      skills: [],
    },
  ],
  uk: [
    {
      school: "Державний університет інформаційно-комунікаційних технологій",
      degree: "Магістр · Інженерія програмного забезпечення",
      period: "вер. 2024 — січ. 2026",
      skills: [
        "Amazon Web Services (AWS)",
        "Google Cloud Platform (GCP)",
        "Управління ризиками",
      ],
    },
    {
      school: "Державний торговельно-економічний університет",
      degree: "Бакалавр · Готельно-ресторанна справа",
      period: "2016 — 2021",
      skills: [],
    },
  ],
};
