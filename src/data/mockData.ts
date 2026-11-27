import { Expert, ForumPost, DashboardSession, TeamMember } from '../types';
import tutorDanielaImg from '../assets/images/tutor_daniela.jpg';
import tutorMarcusImg from '../assets/images/tutor_marcus.jpg';

export const EXPERTS_DATA: Expert[] = [
  {
    id: 'andres-molina',
    name: 'Andrés Molina',
    initials: 'AM',
    role: 'Physics Tutor, B.Sc. in Physics',
    credentials: 'B.Sc. in Applied Physics, 5+ yrs high school & college tutoring',
    category: 'math-science',
    subjects: ['Mechanics', 'Electricity & Magnetism', 'Exam Prep', 'Kinematics'],
    rating: 4.9,
    sessionsCompleted: 247,
    hourlyRate: 130,
    isOnline: true,
    responseTime: 'Replies in ~5 min',
    avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bio: 'Specialist in breaking down difficult physics word problems into visual diagrams. Focuses on conceptual understanding before tackling equations.',
    teachingApproach: 'Usually replies fast and keeps detailed notes after every session, so follow-ups start right where you left off without repeating basics.'
  },
  {
    id: 'daniela-rios',
    name: 'Daniela Ríos',
    initials: 'DR',
    role: 'Calculus & Statistics, M.Sc. in Mathematics',
    credentials: 'M.Sc. in Pure Mathematics, University Adjunct Lecturer',
    category: 'math-science',
    subjects: ['Differential Calculus', 'Integration by Parts', 'Statistics', 'Linear Algebra'],
    rating: 4.9,
    sessionsCompleted: 320,
    hourlyRate: 120,
    isOnline: true,
    responseTime: 'Online now',
    avatarColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    avatarImage: tutorDanielaImg,
    bio: 'Patient math tutor passionate about turning "math anxiety" into confidence. Known for step-by-step derivate and integral proofs with real-life intuition.',
    teachingApproach: 'Provides customized practice problems tailored to your exam syllabus and shares tablet board exports after every call.'
  },
  {
    id: 'marcus-bell',
    name: 'Marcus Bell',
    initials: 'MB',
    role: 'Chemistry & Biology, PhD Candidate',
    credentials: 'PhD Candidate in Biochemistry, former AP Chemistry TA',
    category: 'math-science',
    subjects: ['Organic Chemistry', 'Redox Reactions', 'Cell Biology', 'Lab Reports'],
    rating: 4.8,
    sessionsCompleted: 212,
    hourlyRate: 130,
    isOnline: false,
    responseTime: 'Replies in 1 hour',
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    avatarImage: tutorMarcusImg,
    bio: 'Dedicated scientist helping students conquer reaction mechanisms, stoichiometry, and chemistry lab reports with crystal clarity.',
    teachingApproach: 'Uses 3D molecular modeling tools and interactive reaction maps to make organic chemistry intuitive.'
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    initials: 'PN',
    role: 'Academic Writing Coach',
    credentials: 'M.A. in Comparative Literature, former university writing-center lead',
    category: 'writing-languages',
    subjects: ['Essays', 'Thesis Statements', 'MLA/APA Citations', 'Critical Reading'],
    rating: 5.0,
    sessionsCompleted: 405,
    hourlyRate: 120,
    isOnline: true,
    responseTime: 'Online now',
    avatarColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bio: 'Former university writing center director with over 8 years of experience coaching students through college admissions essays, argumentative theses, and literature analysis.',
    teachingApproach: 'Guides students through outline structures and argument flow rather than just copyediting, ensuring true writing growth.'
  },
  {
    id: 'elodie-martin',
    name: 'Élodie Martin',
    initials: 'EM',
    role: 'Certified French & Spanish Teacher',
    credentials: 'Certified Language Educator (DALF C2, DELE C2)',
    category: 'writing-languages',
    subjects: ['French Conversation', 'Spanish Grammar', 'DELF/DELE Prep', 'Reading Comp'],
    rating: 4.9,
    sessionsCompleted: 188,
    hourlyRate: 120,
    isOnline: false,
    responseTime: 'Replies in 2 hours',
    avatarColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bio: 'Bilingual language instructor focused on conversational fluency, verb conjugation drills, and pronunciation correction.',
    teachingApproach: 'Combines dynamic speaking sessions with structured grammar review sheets tailored to school or test benchmarks.'
  },
  {
    id: 'tomas-herrera',
    name: 'Tomás Herrera',
    initials: 'TH',
    role: 'Senior Software Engineer, Tech Mentor',
    credentials: 'B.Sc. in Computer Science, 7+ yrs industry software engineer',
    category: 'tech',
    subjects: ['Python', 'SQL & Databases', 'Data Structures', 'Debugging'],
    rating: 4.9,
    sessionsCompleted: 276,
    hourlyRate: 150,
    isOnline: true,
    responseTime: 'Online now',
    avatarColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bio: 'Practical software developer helping high school & college students debug code, understand algorithm complexity, and build capstone projects.',
    teachingApproach: 'Pair-programming style. You share your screen or repo, and Tomás guides you step-by-step so you learn how to troubleshoot independently.'
  },
  {
    id: 'sofia-lindqvist',
    name: 'Sofía Lindqvist',
    initials: 'SL',
    role: 'Career Coach & HR Specialist',
    credentials: 'M.Sc. in Organizational Psychology, Talent Acquisition lead',
    category: 'business-career',
    subjects: ['CV / Resume Review', 'Interview Prep', 'First Job Search', 'LinkedIn Optimization'],
    rating: 4.8,
    sessionsCompleted: 301,
    hourlyRate: 130,
    isOnline: false,
    responseTime: 'Replies in 1 hour',
    avatarColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bio: 'Experienced HR recruiter who has reviewed thousands of resumes. Specializes in helping students craft their very first professional CVs and ace internship interviews.',
    teachingApproach: 'Hands-on line-by-line review of resumes with concrete bullet point formulas (Action Verb + Context + Measurable Result).'
  },
  {
    id: 'mateo-valenzuela',
    name: 'Dr. Mateo Valenzuela',
    initials: 'MV',
    role: 'Mechanical Engineer, PhD in Applied Physics',
    credentials: 'PhD in Mechanical Engineering, 6+ yrs university lecturer',
    category: 'math-science',
    subjects: ['Thermodynamics', 'Fluid Mechanics', 'AP Physics C', 'Vector Calculus'],
    rating: 5.0,
    sessionsCompleted: 195,
    hourlyRate: 140,
    isOnline: true,
    responseTime: 'Online now',
    avatarColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    bio: 'Specialist in advanced physics and college engineering fundamentals. Bridges abstract calculus-based physics to tangible engineering systems.',
    teachingApproach: 'Solves complex free-body and thermodynamic cycle problems with live CAD and tablet sketches.'
  },
  {
    id: 'lucia-coronado',
    name: 'Lucía Coronado',
    initials: 'LC',
    role: 'Chemical Engineer, Organic Chemistry Mentor',
    credentials: 'B.Sc. in Chemical Engineering, Honors graduate',
    category: 'math-science',
    subjects: ['Organic Mechanisms', 'Equilibrium', 'Thermochemistry', 'Stoichiometry'],
    rating: 4.9,
    sessionsCompleted: 260,
    hourlyRate: 125,
    isOnline: false,
    responseTime: 'Replies in 40 min',
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bio: 'Loves helping students map out multi-step reaction syntheses and conquer chemistry exam anxiety through systematic patterns.',
    teachingApproach: 'Shares color-coded electron-pushing reaction maps after every single session.'
  },
  {
    id: 'alejandro-paz',
    name: 'Alejandro Paz',
    initials: 'AP',
    role: 'English Literature & SAT Coach, M.A.',
    credentials: 'M.A. in English Literature, former high-school department head',
    category: 'writing-languages',
    subjects: ['AP English Lit', 'SAT Verbal Prep', 'Rhetorical Analysis', 'Argumentative Papers'],
    rating: 4.9,
    sessionsCompleted: 340,
    hourlyRate: 120,
    isOnline: true,
    responseTime: 'Replies in ~10 min',
    avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bio: 'Passionate about helping students write sharp, college-level analytical essays and dissecting classic texts with ease.',
    teachingApproach: 'Focuses on thesis formulation, transitions between counterarguments, and textual evidence analysis.'
  },
  {
    id: 'carlos-mendoza',
    name: 'Carlos Mendoza',
    initials: 'CM',
    role: 'Full-Stack Developer & CS Tutor',
    credentials: 'Senior Frontend Architect, B.Sc. in Systems Engineering',
    category: 'tech',
    subjects: ['JavaScript / React', 'Algorithms', 'Web Development', 'Git & GitHub'],
    rating: 4.9,
    sessionsCompleted: 184,
    hourlyRate: 135,
    isOnline: true,
    responseTime: 'Online now',
    avatarColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    bio: 'Patient coding mentor who teaches students how to break programming assignments into logical pseudo-code before writing a single line.',
    teachingApproach: 'Live interactive coding reviews in VS Code and screen sharing with instant debugging tips.'
  },
  {
    id: 'esteban-morales',
    name: 'Esteban Morales',
    initials: 'EM',
    role: 'Economics & Accounting Mentor, CPA',
    credentials: 'CPA, M.Sc. in Applied Finance',
    category: 'business-career',
    subjects: ['Microeconomics', 'Financial Accounting', 'Corporate Finance', 'Excel Modeling'],
    rating: 4.8,
    sessionsCompleted: 220,
    hourlyRate: 130,
    isOnline: false,
    responseTime: 'Replies in 1 hour',
    avatarColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bio: 'Financial specialist who makes supply/demand curves, cost-benefit analysis, and balance sheets accessible to college and high school learners.',
    teachingApproach: 'Provides clean Excel spreadsheet templates and step-by-step problem workbooks.'
  }
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'How do I balance redox equations without just guessing?',
    author: 'Mateo G. (11th Grade)',
    category: 'Chemistry',
    repliesCount: 14,
    votes: 38,
    hasExpertAnswer: true,
    expertName: 'Marcus Bell (PhD Candidate)',
    previewText: 'I always get stuck splitting oxidation and reduction half-reactions in acidic solutions. Is there a strict 5-step rule?',
    expertAnswer: 'The foolproof method: 1. Split into half-reactions. 2. Balance all atoms except H and O. 3. Balance O by adding H2O. 4. Balance H by adding H+. 5. Balance charge with e-. Finally multiply to cancel electrons and add together!',
    timeAgo: '2 hours ago',
    comments: [
      {
        id: 'c-1-1',
        author: 'Elena Morales',
        authorRole: 'student',
        avatarInitials: 'EM',
        text: 'Marcus, steps 3 and 4 were exactly what my AP chemistry teacher couldn\'t explain clearly. Does step 4 also apply if the solution is basic instead of acidic?',
        timestamp: '1 hour ago',
        upvotes: 6,
        userVoted: false
      },
      {
        id: 'c-1-2',
        author: 'Marcus Bell (PhD Candidate)',
        authorRole: 'expert',
        avatarInitials: 'MB',
        text: 'Great question Elena! In basic media, you do the exact same 5 steps, but at the end you add OH⁻ to both sides for every H⁺ present, turning H⁺ + OH⁻ into H2O. Super clean once you practice it twice.',
        timestamp: '42 mins ago',
        upvotes: 11,
        userVoted: false
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Is a two-page cover letter too long for a first internship?',
    author: 'Camila R. (Freshman)',
    category: 'Career',
    repliesCount: 9,
    votes: 21,
    hasExpertAnswer: true,
    expertName: 'Sofía Lindqvist (Career Coach)',
    previewText: 'I want to include all my school projects and volunteer hours, but my teacher said it should fit on one page.',
    expertAnswer: 'Yes, definitely keep it strictly to one single page! Recruiters spend an average of 15 seconds per entry. Pick your 2 strongest school projects and connect them directly to what the company needs.',
    timeAgo: '4 hours ago',
    comments: [
      {
        id: 'c-2-1',
        author: 'Andrés K.',
        authorRole: 'student',
        avatarInitials: 'AK',
        text: 'Should high school GPA still be included if applying to college summer internships?',
        timestamp: '3 hours ago',
        upvotes: 4,
        userVoted: false
      },
      {
        id: 'c-2-2',
        author: 'Sofía Lindqvist (Career Coach)',
        authorRole: 'expert',
        avatarInitials: 'SL',
        text: 'Only if it is above 3.5 / 85+ points. Otherwise, emphasize relevant coursework and projects instead.',
        timestamp: '2 hours ago',
        upvotes: 9,
        userVoted: false
      }
    ]
  },
  {
    id: 'post-3',
    title: 'What is the difference between a list and a tuple in Python in plain words?',
    author: 'Santiago L. (Intro to CS)',
    category: 'Tech',
    repliesCount: 6,
    votes: 17,
    hasExpertAnswer: true,
    expertName: 'Tomás Herrera (Senior Dev)',
    previewText: 'Both store items inside brackets or parentheses, but why do tutorials say tuples are immutable?',
    expertAnswer: 'Think of a list as a shopping cart: you can add, remove, and swap items anytime []. A tuple is a sealed flight ticket (): once issued, the name and flight number cannot change without buying a new ticket. Tuples are also faster and safer for fixed configs.',
    timeAgo: '6 hours ago',
    comments: [
      {
        id: 'c-3-1',
        author: 'David R.',
        authorRole: 'student',
        avatarInitials: 'DR',
        text: 'The flight ticket analogy is brilliant. Does that mean dictionary keys must be tuples instead of lists?',
        timestamp: '5 hours ago',
        upvotes: 5,
        userVoted: false
      },
      {
        id: 'c-3-2',
        author: 'Tomás Herrera (Senior Dev)',
        authorRole: 'expert',
        avatarInitials: 'TH',
        text: 'Spot on! Dict keys must be hashable and immutable, which is why lists raise TypeError: unhashable type.',
        timestamp: '4 hours ago',
        upvotes: 8,
        userVoted: false
      }
    ]
  },
  {
    id: 'post-4',
    title: 'Why do we need the Chain Rule when differentiating composite functions?',
    author: 'Valeria M. (Calculus student)',
    category: 'Mathematics',
    repliesCount: 11,
    votes: 29,
    hasExpertAnswer: true,
    expertName: 'Daniela Ríos (M.Sc. Mathematics)',
    previewText: 'If y = (3x^2 + 1)^5, why can’t I just do 5*(3x^2 + 1)^4?',
    expertAnswer: 'Because the inner function (3x^2 + 1) is changing at a rate of 6x at the same time! If gear A spins 5 times faster than gear B, and gear B spins 6 times faster than gear C, gear A spins 5 * 6 = 30 times faster than gear C. That rate must be multiplied!',
    timeAgo: '1 day ago',
    comments: [
      {
        id: 'c-4-1',
        author: 'Gabriel T.',
        authorRole: 'student',
        avatarInitials: 'GT',
        text: 'The spinning gears analogy just saved my midterm tomorrow morning!',
        timestamp: '18 hours ago',
        upvotes: 7,
        userVoted: false
      }
    ]
  },
  {
    id: 'post-5',
    title: 'Why is kinetic energy lost in inelastic collisions if total momentum is conserved?',
    author: 'Diego P. (AP Physics)',
    category: 'Physics',
    repliesCount: 8,
    votes: 34,
    hasExpertAnswer: true,
    expertName: 'Andrés Molina (Physics B.Sc.)',
    previewText: 'If energy cannot be created or destroyed, why do textbooks say inelastic collisions don\'t conserve kinetic energy?',
    expertAnswer: 'Total ENERGY is always conserved, but KINETIC energy specifically transforms into other forms! When two cars or clay balls collide and deform, mechanical work is done to alter their molecular structure, turning kinetic energy into thermal heat and sound vibrations.',
    timeAgo: '1 day ago',
    comments: [
      {
        id: 'c-5-1',
        author: 'Martina V.',
        authorRole: 'student',
        avatarInitials: 'MV',
        text: 'So the "lost" energy literally heats up the colliding objects?',
        timestamp: '20 hours ago',
        upvotes: 5,
        userVoted: false
      },
      {
        id: 'c-5-2',
        author: 'Andrés Molina (Physics B.Sc.)',
        authorRole: 'expert',
        avatarInitials: 'AM',
        text: 'Exactly right Martina! If you measure two clay balls with a thermal infrared sensor right after collision, they are measurably warmer.',
        timestamp: '19 hours ago',
        upvotes: 9,
        userVoted: false
      }
    ]
  },
  {
    id: 'post-6',
    title: 'How does Le Chatelier’s Principle work when pressure is increased in a gas reaction?',
    author: 'Mariana S. (Chemistry student)',
    category: 'Chemistry',
    repliesCount: 10,
    votes: 25,
    hasExpertAnswer: true,
    expertName: 'Lucía Coronado (Chemical Engineer)',
    previewText: 'In N2(g) + 3H2(g) <=> 2NH3(g), does increasing pressure shift left or right?',
    expertAnswer: 'It shifts toward the side with FEWER moles of gas! Count the coefficients: Left side has 1 + 3 = 4 moles of gas. Right side has only 2 moles of gas. By shifting to the right (NH3), the system reduces the number of gas molecules and relieves the pressure.',
    timeAgo: '2 days ago'
  },
  {
    id: 'post-7',
    title: 'How do I smoothly integrate quotes into my literature paper without "dropped quotes"?',
    author: 'Javier B. (Literature senior)',
    category: 'Writing',
    repliesCount: 7,
    votes: 22,
    hasExpertAnswer: true,
    expertName: 'Priya Nair (Academic Writing Coach)',
    previewText: 'My professor keeps writing "dropped quote" or "floating quote" in red ink on my papers.',
    expertAnswer: 'Use the "Quote Sandwich" framework: Top slice = Signal phrase introducing the speaker and context (e.g. As Orwell underscores...). The filling = The concise cited quote. Bottom slice = Your original sentence analyzing HOW this quote proves your thesis. Never let a quote stand as its own isolated sentence!',
    timeAgo: '2 days ago'
  },
  {
    id: 'post-8',
    title: 'How does Binary Search achieve O(log n) time complexity compared to linear search?',
    author: 'Fernando K. (CS freshman)',
    category: 'Tech',
    repliesCount: 12,
    votes: 31,
    hasExpertAnswer: true,
    expertName: 'Carlos Mendoza (Full-Stack Architect)',
    previewText: 'Why is dividing by 2 so much faster for large arrays of data?',
    expertAnswer: 'Imagine looking for a word in a 1,000-page dictionary. Linear search checks page 1, 2, 3... up to 1,000 steps. Binary search opens the middle (page 500), eliminates 500 pages instantly, then 250, then 125... In just 10 cuts (2^10 = 1024), you find the exact word! That is why log2(1,000,000) takes only 20 checks.',
    timeAgo: '3 days ago'
  }
];

export const USER_PAST_SESSIONS: DashboardSession[] = [
  {
    id: 'sess-upcoming-1',
    date: '26 Nov',
    day: '26',
    month: 'Nov',
    topic: 'Cálculo diferencial · Regla de la cadena',
    expertName: 'Daniela Ríos',
    subject: 'Calculus',
    tutorNotes: 'Sesión 1-a-1 confirmada. Lanza una sala de Google Meet o pega el enlace de tu tutor para conectarte.',
    status: 'upcoming',
    time: 'Mañana, 16:00 – 17:00'
  },
  {
    id: 'sess-1',
    date: '18 Sep',
    day: '18',
    month: 'Sep',
    topic: 'Integration by parts & trigonometric substitutions',
    expertName: 'Daniela Ríos',
    subject: 'Calculus',
    tutorNotes: 'Redo problems 4 to 9 without the formula sheet, then send me the two that felt slow. Remember LIATE rule for picking u!',
    status: 'completed'
  },
  {
    id: 'sess-2',
    date: '12 Sep',
    day: '12',
    month: 'Sep',
    topic: 'Thesis statement rewrite & evidence synthesis',
    expertName: 'Priya Nair',
    subject: 'Writing',
    tutorNotes: 'Revised the central thesis to make a specific counter-argument. Draft paragraphs 2 and 3 using the quotation sandwich technique before next Monday.',
    status: 'completed'
  },
  {
    id: 'sess-3',
    date: '05 Sep',
    day: '05',
    month: 'Sep',
    topic: 'CV for first software internship application',
    expertName: 'Sofía Lindqvist',
    subject: 'Career',
    tutorNotes: 'Replaced vague verbs with action statements. Highlighted GitHub repo link at top. Ready to submit to 3 target companies!',
    status: 'completed'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Juan Andrés Estrada',
    role: 'Co-Founder · AI & Platform Engineering',
    focus: 'Core Architecture & Cited AI Engine',
    initials: 'JE',
    accentColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bio: 'Leads full-stack platform architecture, AI curriculum grounding, tutor-matching systems, and cloud reliability.'
  },
  {
    name: 'Juan Andrés Díaz',
    role: 'Co-Founder · Growth & Finance',
    focus: 'Student Acquisition & Financial Strategy',
    initials: 'JD',
    accentColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bio: 'Oversees institutional partnerships, digital acquisition channels, pricing strategy, and financial operations.'
  },
  {
    name: 'Lourdes Monterroso',
    role: 'Co-Founder · Academic Operations',
    focus: 'Tutor Vetting & Quality Assurance',
    initials: 'LM',
    accentColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bio: 'Directs instructor credential screening, pedagogical quality standards, student support, and operational workflows.'
  },
  {
    name: 'Pablo Vettorazzi',
    role: 'Co-Founder · Product & Design',
    focus: 'Brand Identity & Learning Experience',
    initials: 'PV',
    accentColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bio: 'Leads product strategy, design systems, interactive study workspaces, and end-to-end student experience.'
  }
];

export const AI_PRESET_QUESTIONS = [
  {
    topic: 'Calculus',
    question: 'Why is the derivative of ln(x) equal to 1/x? I have an exam tomorrow.',
    answer: 'Start with y = ln(x), which means e^y = x.\nDifferentiate both sides with respect to x: d/dx(e^y) = d/dx(x).\nBy the chain rule, e^y · y′ = 1.\nSince e^y = x, substitute x back in: x · y′ = 1 ⇒ y′ = 1/x.\nTry it once yourself on ln(2x) using the chain rule to lock it in!',
    source: 'OpenStax Calculus Volume 1, Section 3.9',
    sources: [
      {
        title: 'OpenStax Calculus Vol. 1 · Sec. 3.9 (Derivatives of Logs)',
        uri: 'https://openstax.org/books/calculus-volume-1/pages/3-9-derivatives-of-exponential-and-logarithmic-functions',
        type: 'textbook' as const
      }
    ],
    expertId: 'daniela-rios'
  },
  {
    topic: 'Physics',
    question: 'How do I know whether to use conservation of energy or conservation of momentum in collision problems?',
    answer: 'A clear rule of thumb:\n1. Total momentum is ALWAYS conserved in any closed system, whether elastic or inelastic, because internal forces cancel out by Newton\'s 3rd Law.\n2. Kinetic energy is ONLY conserved in purely ELASTIC collisions (where objects bounce without deforming or generating heat).\nIf objects stick together (inelastic), energy is lost to heat/deformation—use momentum to solve for velocity!',
    source: 'OpenStax University Physics Volume 1, Section 9.4',
    sources: [
      {
        title: 'OpenStax University Physics Vol. 1 · Sec. 9.4 (Types of Collisions)',
        uri: 'https://openstax.org/books/university-physics-volume-1/pages/9-4-types-of-collisions',
        type: 'textbook' as const
      }
    ],
    expertId: 'andres-molina'
  },
  {
    topic: 'Chemistry',
    question: 'How do I balance redox reactions in acidic solution without guessing?',
    answer: 'Follow the 5-step ion-electron method:\n1. Write separate oxidation and reduction half-reactions.\n2. Balance all atoms EXCEPT oxygen and hydrogen.\n3. Balance O atoms by adding H2O to the side deficient in oxygen.\n4. Balance H atoms by adding H+ to the opposite side.\n5. Balance total electric charges by adding electrons (e-).\nFinally, multiply half-reactions by integers so electrons cancel, then add them together.',
    source: 'OpenStax Chemistry 2e, Section 4.2',
    sources: [
      {
        title: 'OpenStax Chemistry 2e · Sec. 4.2 (Classifying Chemical Reactions)',
        uri: 'https://openstax.org/books/chemistry-2e/pages/4-2-classifying-chemical-reactions',
        type: 'textbook' as const
      }
    ],
    expertId: 'marcus-bell'
  },
  {
    topic: 'Essay thesis',
    question: 'What makes a strong thesis statement for an argumentative essay on artificial intelligence?',
    answer: 'A strong thesis must be debatable, specific, and provide a "roadmap".\n❌ Weak: "Artificial intelligence has pros and cons for students." (Stating the obvious)\n✅ Strong: "Although automated AI study tools provide vital immediate feedback for high school students during late-night study hours, educational institutions must pair them with verified human tutoring to safeguard critical thinking and prevent conceptual over-reliance."\nNotice the structure: Counter-argument + Core claim + "Because" rationale.',
    source: 'Purdue OWL · Tips and Examples for Writing Thesis Statements',
    sources: [
      {
        title: 'Purdue OWL · Writing Thesis Statements',
        uri: 'https://owl.purdue.edu/owl/general_writing/the_writing_process/thesis_statement_tips.html',
        type: 'textbook' as const
      }
    ],
    expertId: 'priya-nair'
  },
  {
    topic: 'Biology',
    question: 'What is the main difference between active transport and facilitated diffusion?',
    answer: '1. Direction & Energy: Facilitated diffusion moves substances DOWN their concentration gradient (high to low) with NO ATP expenditure.\n2. Active transport pumps substances AGAINST their concentration gradient (low to high), requiring direct or indirect ATP consumption.\n3. Both use transmembrane proteins, but only active transport can establish steep chemical gradients like the Na+/K+ ATPase pump.',
    source: 'OpenStax Biology 2e, Section 5.3',
    sources: [
      {
        title: 'OpenStax Biology 2e · Sec. 5.3 (Active Transport)',
        uri: 'https://openstax.org/books/biology-2e/pages/5-3-active-transport',
        type: 'textbook' as const
      }
    ],
    expertId: 'marcus-bell'
  }
];

export const HISTORY_TIMELINE = [
  {
    year: '2024 · Q1',
    title: 'Identifying the Verification Gap',
    description: 'Launched ProLnk to solve student frustration with unverified generic AI outputs and limited access to live instructors during critical exam windows.'
  },
  {
    year: '2024 · Q3',
    title: 'Vetted Instructor Network',
    description: 'Established a structured academic vetting pipeline onboarding specialists in Physics, Calculus, Chemistry, Writing, and Software Engineering.'
  },
  {
    year: '2025',
    title: 'Cited AI & Hybrid Study Workspace',
    description: 'Introduced textbook-grounded AI explanations paired with live collaborative whiteboards and persistent session notebooks.'
  },
  {
    year: '2026',
    title: 'Unified ProLnk Academic Portal',
    description: 'Scaled into a full-featured learning platform combining 24/7 AI tutoring, community Q&A, progress analytics, and on-demand 1-on-1 mentorship.'
  }
];
