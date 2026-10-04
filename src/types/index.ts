export type SubjectCategory = 'all' | 'math-science' | 'writing-languages' | 'tech' | 'business-career';

export interface Expert {
  id: string;
  name: string;
  initials: string;
  role: string;
  credentials: string;
  category: SubjectCategory;
  subjects: string[];
  rating: number;
  sessionsCompleted: number;
  hourlyRate: number; // in Quetzales (Q)
  isOnline: boolean;
  responseTime: string;
  avatarColor: string;
  avatarImage?: string;
  bio: string;
  teachingApproach: string;
}

export interface ForumComment {
  id: string;
  author: string;
  authorRole?: 'student' | 'expert';
  avatarInitials: string;
  text: string;
  timestamp: string;
  upvotes?: number;
  userVoted?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  category: string;
  repliesCount: number;
  votes: number;
  hasExpertAnswer: boolean;
  expertName?: string;
  previewText: string;
  expertAnswer?: string;
  timeAgo: string;
  userVoted?: boolean;
  comments?: ForumComment[];
}

export interface DashboardSession {
  id: string;
  date: string;
  day: string;
  month: string;
  topic: string;
  expertName: string;
  subject: string;
  tutorNotes: string;
  status: 'completed' | 'upcoming';
  time?: string;
  urgentUsed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sourceCitation?: string;
  confidence?: string;
  recommendedExpertId?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
  initials: string;
  accentColor: string;
  bio: string;
}

export interface SurveyStat {
  label: string;
  percentage: number;
  count: number;
  total: number;
  color?: string;
}

export interface FinancialYear {
  year: string;
  income: number;
  expenses: number;
  profit: number;
}
