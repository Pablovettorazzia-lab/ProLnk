export type SubjectCategory = 'all' | 'math-science' | 'writing-languages' | 'tech' | 'business-career';
export type PublicPage = 'home' | 'how' | 'experts' | 'community' | 'pricing' | 'about';

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  plan: string;
  daysLeft: number;
  bio?: string;
  university?: string;
  major?: string;
  semester?: string;
  targetSubjects?: string[];
  learningGoal?: string;
  streakDays: number;
  xpPoints: number;
  questionsResolved: number;
  tutoringMinutes: number;
  notesSavedCount: number;
  forumPostsCount: number;
  lastActiveDate?: string;
  aiExplanationStyle: 'detailed' | 'quick';
  emailNotifications: boolean;
  sessionReminders: boolean;
}

export interface UserTask {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  urgency: 'high' | 'medium' | 'low';
  createdAt?: string;
}

export interface SavedSketch {
  id: string;
  userId?: string;
  title: string;
  dataUrl: string;
  timestamp: string;
  createdAt?: string;
}

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
  postId?: string;
  authorId?: string;
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
  authorId?: string;
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
  status: 'completed' | 'upcoming' | 'cancelled';
  time?: string;
  urgentUsed?: boolean;
  meetUri?: string;
  meetCode?: string;
}

export interface VerifiedSource {
  title: string;
  uri?: string;
  type: 'web' | 'document' | 'textbook';
}

export interface StudyDocumentPayload {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  base64Data: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sourceCitation?: string;
  sources?: VerifiedSource[];
  searchQueries?: string[];
  groundingMode?: 'web' | 'document' | 'hybrid';
  confidence?: string;
  recommendedExpertId?: string;
}

export interface AiChatThread {
  id: string;
  userId?: string;
  title: string;
  previewText?: string;
  messageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiChatMessage {
  id: string;
  chatId?: string;
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
  sources?: VerifiedSource[];
  searchQueries?: string[];
  webGroundingSkipped?: boolean;
  attachedFileNames?: string[];
  createdAt?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
  initials: string;
  accentColor: string;
  bio: string;
}
