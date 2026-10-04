import { askAi, getChatHistory, parseAiReply } from '../services/chat';
import React, { useState, useEffect, useRef } from 'react';
import { ProLnkLogo } from './Logo';
import { Expert, ForumPost, ForumComment, DashboardSession } from '../types';
import { EXPERTS_DATA, FORUM_POSTS, USER_PAST_SESSIONS, AI_PRESET_QUESTIONS } from '../data/mockData';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import {
  Home,
  Bot,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  Search,
  Bell,
  LogOut,
  Send,
  BookOpen,
  Sparkles,
  Zap,
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Download,
  Flame,
  Target,
  Video,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ArrowUpRight,
  Award,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  X,
  Mic,
  MicOff,
  VideoOff,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  Menu,
  ChevronLeft,
  User,
  Camera,
  Edit3,
  Save,
  GraduationCap,
  School,
  Trophy,
  Check
} from 'lucide-react';

interface DashboardProps {
  user: {
    uid?: string;
    isDemo?: boolean;
    emailNotifications?: boolean;
    aiExplanationStyle?: 'detailed' | 'quick';
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
    streakDays?: number;
    xpPoints?: number;
  };
  sessions?: DashboardSession[];
  posts?: ForumPost[];
  onVotePost?: (postId: string) => void;
  onLogOut: () => void;
  onViewLandingPage: () => void;
  onBookExpert: (expert: Expert) => void;
  onUpdateProfile?: (updated: Partial<DashboardProps['user']>) => void | Promise<void>;
  onOpenProfile?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  sessions: propSessions,
  posts: propPosts,
  onVotePost,
  onLogOut,
  onViewLandingPage,
  onBookExpert,
  onUpdateProfile,
  onOpenProfile
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'ai-chat' | 'tutors' | 'sessions' | 'community' | 'notes' | 'profile' | 'settings'>('home');
  const [notesSubTab, setNotesSubTab] = useState<'canvas' | 'downloads'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardToast, setDashboardToast] = useState<string | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileBio, setProfileBio] = useState(user.bio ?? '');
  const [profileUniversity, setProfileUniversity] = useState(user.university ?? '');
  const [profileMajor, setProfileMajor] = useState(user.major ?? '');
  const [profileSemester, setProfileSemester] = useState(user.semester ?? '');
  const [profileLearningGoal, setProfileLearningGoal] = useState(user.learningGoal ?? '');
  const [profilePhotoURL, setProfilePhotoURL] = useState(user.photoURL || '');
  const [profileSubjects, setProfileSubjects] = useState<string[]>(
    user.targetSubjects && user.targetSubjects.length > 0
      ? user.targetSubjects
      : []
  );
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const PRESET_AVATARS = [
    { id: 'av1', label: 'Estudiante Tech', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
    { id: 'av2', label: 'Ingeniero', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
    { id: 'av3', label: 'Científica', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
    { id: 'av4', label: 'Académico', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
    { id: 'av5', label: 'Matemática', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
  ];
  const [profileSubTab, setProfileSubTab] = useState<'info' | 'achievements' | 'preferences'>('info');
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
  const [aiExplanationStyle, setAiExplanationStyle] = useState<'detailed' | 'quick'>(user.aiExplanationStyle ?? 'detailed');

  // Sync profile state when user prop updates
  useEffect(() => {
    setProfileName(user.name ?? '');
    setProfileBio(user.bio ?? '');
    setProfileUniversity(user.university ?? '');
    setProfileMajor(user.major ?? '');
    setProfileSemester(user.semester ?? '');
    setProfileLearningGoal(user.learningGoal ?? '');
    setProfilePhotoURL(user.photoURL ?? '');
    setProfileSubjects(user.targetSubjects ?? []);
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) return;

    try {
      await onUpdateProfile?.({
        name: profileName.trim(),
        bio: profileBio.trim(),
        university: profileUniversity.trim(),
        major: profileMajor.trim(),
        semester: profileSemester.trim(),
        learningGoal: profileLearningGoal.trim(),
        photoURL: profilePhotoURL || '',
        targetSubjects: profileSubjects,
        emailNotifications,
        aiExplanationStyle,
      });
      showDashboardToast(user.isDemo ? 'Perfil demo actualizado durante esta visita.' : 'Perfil guardado correctamente.');
    } catch (error) {
      showDashboardToast(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    const clean = newSubjectInput.trim();
    if (!profileSubjects.includes(clean)) {
      setProfileSubjects(prev => [...prev, clean]);
    }
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (subj: string) => {
    setProfileSubjects(prev => prev.filter(s => s !== subj));
  };

  // Collapsible sidebar state with local storage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('prolnk_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const chatLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'ai-chat') {
      chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('prolnk_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      showDashboardToast(next ? 'Menú lateral guardado (vista compacta)' : 'Menú lateral desplegado');
      return next;
    });
  };

  const showDashboardToast = (msg: string) => {
    setDashboardToast(msg);
    setTimeout(() => setDashboardToast(null), 3500);
  };

  const handleDownloadFormula = (filename: string, title: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showDashboardToast(`Downloaded "${title}" to your computer.`);
    } catch {
      showDashboardToast(`Generated "${title}".`);
    }
  };
  
  // Homework Tasks Planner state
  const [tasks, setTasks] = useState<{
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    completed: boolean;
    urgency: 'high' | 'medium' | 'low';
  }[]>([
    {
      id: 'hw-1',
      title: 'Calculus: Section 7.2 Exercises 14 to 28 (Integration by Parts)',
      subject: 'Calculus',
      dueDate: 'Tomorrow, 11:59 PM',
      completed: false,
      urgency: 'high'
    },
    {
      id: 'hw-2',
      title: 'Physics: 2D Collisions & Momentum Lab Data Table',
      subject: 'Physics',
      dueDate: 'Friday, Oct 6',
      completed: false,
      urgency: 'medium'
    },
    {
      id: 'hw-3',
      title: 'Chemistry: Redox Half-Reactions in Acidic Media Worksheet',
      subject: 'Chemistry',
      dueDate: 'Sunday, Oct 8',
      completed: true,
      urgency: 'low'
    },
    {
      id: 'hw-4',
      title: 'Academic Writing: Thesis Statement & 3 Direct Quotes Outline',
      subject: 'Literature',
      dueDate: 'Next Monday',
      completed: false,
      urgency: 'low'
    }
  ]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Calculus');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Tomorrow');

  // Daily Academic Challenge state
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);
  const [challengeRevealed, setChallengeRevealed] = useState(false);

  // Virtual Live Classroom Modal state
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [classroomMicOn, setClassroomMicOn] = useState(true);
  const [classroomVideoOn, setClassroomVideoOn] = useState(true);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) {
            showDashboardToast(`Marked "${t.title.substring(0, 25)}..." as done! ✨`);
          }
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showDashboardToast('Assignment removed from tracker.');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      dueDate: newTaskDueDate || 'This week',
      completed: false,
      urgency: 'medium' as const
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowAddTask(false);
    showDashboardToast(`Added "${newTask.title.substring(0, 25)}..." to your assignments.`);
  };

  const handleSolveTaskWithAI = (taskTitle: string, subject: string) => {
    setActiveTab('ai-chat');
    setAiInput(`Please help me solve this ${subject} assignment step-by-step: "${taskTitle}". Explain the foundational theorems, formulas, and show every calculation.`);
    showDashboardToast(`Loaded "${taskTitle.substring(0, 25)}..." into 24/7 AI Solver.`);
  };

  const handleBookTutorForSubject = (subject: string) => {
    const tutor = EXPERTS_DATA.find(e => e.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))) || EXPERTS_DATA[0];
    onBookExpert(tutor);
  };

  const handleSelectChallenge = (option: string) => {
    setSelectedChallengeOption(option);
    if (option === 'A') {
      showDashboardToast('🎉 Correct answer! +50 XP added to your weekly streak.');
    } else {
      showDashboardToast('Not quite! Check the LIATE integration rule below.');
    }
  };

  // Dashboard AI Solver state
  const [aiInput, setAiInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    source?: string;
  }[]>([
    {
      id: 'd-1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your ProLnk AI tutor. What homework problem or exam topic are you working on right now?`
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Community state inside dashboard
  const [communityPosts, setCommunityPosts] = useState<ForumPost[]>(FORUM_POSTS);
  const [dashboardCommentInputs, setDashboardCommentInputs] = useState<Record<string, string>>({});
  const [expandedDashboardPostId, setExpandedDashboardPostId] = useState<string | null>('post-1');
  const [forumCategoryFilter, setForumCategoryFilter] = useState('All');
  const [forumSearchQuery, setForumSearchQuery] = useState('');
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('Mathematics');
  const [newQuestionDetails, setNewQuestionDetails] = useState('');

  const handleAddDashboardComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = dashboardCommentInputs[postId]?.trim();
    if (!text) return;
    const newComment: ForumComment = {
      id: `c-dash-${Date.now()}`,
      author: `${user.name} (Student)`,
      authorRole: 'student',
      avatarInitials: user.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'ST',
      text,
      timestamp: 'Just now',
      upvotes: 1,
      userVoted: true
    };
    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            comments: [...currentComments, newComment]
          };
        }
        return p;
      })
    );
    setDashboardCommentInputs(prev => ({ ...prev, [postId]: '' }));
    showDashboardToast('Comment added to discussion thread! 💬');
  };

  const handleVoteDashboardComment = (postId: string, commentId: string) => {
    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.comments) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                const voted = c.userVoted;
                return {
                  ...c,
                  upvotes: (c.upvotes || 0) + (voted ? -1 : 1),
                  userVoted: !voted
                };
              }
              return c;
            })
          };
        }
        return p;
      })
    );
  };

  const handleCreateNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newQuestionTitle.trim(),
      author: `${user.name} (Student)`,
      category: newQuestionCategory,
      repliesCount: 0,
      votes: 1,
      userVoted: true,
      hasExpertAnswer: false,
      previewText: newQuestionDetails.trim() || 'Question submitted for student peer review and verified tutor answer.',
      timeAgo: 'Just now',
      comments: []
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    setNewQuestionTitle('');
    setNewQuestionDetails('');
    setShowNewQuestionForm(false);
    showDashboardToast('Your question was posted to the Community Board! 🚀');
  };

  const [aiError, setAiError] = useState<string | null>(null);
  const aiSendingRef = useRef(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (user.isDemo) return;
    let active = true;
    setIsHistoryLoading(true);
    getChatHistory('dashboard').then(messages => {
      if (active && messages.length) setAiChatMessages(messages);
    }).catch(() => {
      if (active) setAiError('No se pudo cargar tu historial. Inténtalo más tarde.');
    }).finally(() => { if (active) setIsHistoryLoading(false); });
    return () => { active = false; };
  }, [user.uid]);

  const sendAiQuestion = async (question: string) => {
    const userText = question.trim();
    if (!userText || aiSendingRef.current || isHistoryLoading) return;
    aiSendingRef.current = true;
    setAiInput('');
    setAiError(null);
    const userMessage = { id: crypto.randomUUID(), sender: 'user' as const, text: userText };
    setAiChatMessages(previous => [...previous, userMessage]);
    setIsAiThinking(true);
    try {
      const { reply } = await askAi(userText, aiChatMessages, 'dashboard');
      setAiChatMessages(previous => [...previous, { id: crypto.randomUUID(), sender: 'ai', ...parseAiReply(reply) }]);
    } catch (error) {
      setAiChatMessages(previous => previous.filter(message => message.id !== userMessage.id));
      setAiInput(userText);
      setAiError(error instanceof Error ? error.message : 'El asistente no pudo responder. Inténtalo de nuevo.');
    } finally {
      setIsAiThinking(false);
      aiSendingRef.current = false;
      setTimeout(() => chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleSendAiMessage = (event: React.FormEvent) => {
    event.preventDefault();
    void sendAiQuestion(aiInput);
  };

  const handleVote = (id: string) => {
    if (onVotePost) {
      onVotePost(id);
    }
    setCommunityPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, votes: p.userVoted ? p.votes - 1 : p.votes + 1, userVoted: !p.userVoted } : p))
    );
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#070d1c] text-slate-100 flex flex-col md:flex-row antialiased relative">
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-72 bg-[#0a1329] border-r border-slate-800 h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div>
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <ProLnkLogo size="sm" light={true} />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-3 space-y-1.5 text-xs font-medium mt-3">
                {[
                  { id: 'home', label: 'Overview', icon: Home, color: 'text-[#F6C62B]' },
                  { id: 'ai-chat', label: 'AI Tutor 24/7', icon: Bot, color: 'text-[#F6C62B]', badge: 'Live' },
                  { id: 'tutors', label: 'Verified Tutors', icon: Users, color: 'text-cyan-400' },
                  { id: 'sessions', label: 'My Sessions', icon: Calendar, color: 'text-purple-400' },
                  { id: 'community', label: 'Community Q&A', icon: MessageSquare, color: 'text-amber-400' },
                  { id: 'notes', label: 'Whiteboard Notes', icon: FileText, color: 'text-teal-400' },
                  { id: 'profile', label: 'My Profile', icon: User, color: 'text-emerald-400', badge: 'You' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'profile' && onOpenProfile) {
                        onOpenProfile();
                        setMobileSidebarOpen(false);
                        return;
                      }
                      setActiveTab(item.id as any);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-[#0F2249] text-white font-bold border border-[#F6C62B]/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-3 border-t border-slate-800 space-y-3">
              <div
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  setMobileSidebarOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-[#080f21] border border-slate-800 hover:border-[#F6C62B]/50 cursor-pointer transition-colors"
                title="View my profile"
              >
                {profilePhotoURL ? (
                  <img src={profilePhotoURL} alt={profileName} className="w-8 h-8 rounded-full object-cover border border-[#F6C62B]/40" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0F2249] border border-[#F6C62B] text-white font-bold text-xs flex items-center justify-center">
                    {profileName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-bold text-white truncate">{profileName}</div>
                  <div className="text-[10px] text-emerald-400">View & edit profile →</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  setMobileSidebarOpen(false);
                }}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#F6C62B]" />
                <span>My Student Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Completely Fixed and Stationary When Scrolling */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-[#0a1329] border-r border-slate-800 shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 overflow-y-auto overflow-x-hidden ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo brand (clean top header without collapse button) */}
          <div className={`p-4 border-b border-slate-800 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2">
                <ProLnkLogo size="sm" light={true} showWordmark={true} />
                <span className="text-[10px] font-bold bg-[#F6C62B]/20 text-[#F6C62B] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Portal
                </span>
              </div>
            ) : (
              <div className="p-1.5 rounded-xl bg-[#080f21] border border-slate-800 flex items-center justify-center shadow-sm">
                <ProLnkLogo size="sm" light={true} showWordmark={false} />
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`space-y-1.5 text-xs font-medium ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            {[
              { id: 'home', label: 'Overview', icon: Home, color: 'text-[#F6C62B]' },
              { id: 'ai-chat', label: 'AI Tutor 24/7', icon: Bot, color: 'text-[#F6C62B]', badge: 'Live' },
              { id: 'tutors', label: 'Verified Tutors', icon: Users, color: 'text-cyan-400' },
              { id: 'sessions', label: 'My Sessions', icon: Calendar, color: 'text-purple-400' },
              { id: 'community', label: 'Community Q&A', icon: MessageSquare, color: 'text-amber-400' },
              { id: 'notes', label: 'Whiteboard Notes', icon: FileText, color: 'text-teal-400' },
              { id: 'profile', label: 'My Profile', icon: User, color: 'text-emerald-400', badge: 'You' },
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'profile' && onOpenProfile) {
                      onOpenProfile();
                      return;
                    }
                    setActiveTab(item.id as any);
                  }}
                  title={item.label}
                  className={`w-full flex items-center transition-all cursor-pointer rounded-xl ${
                    sidebarCollapsed
                      ? 'justify-center p-3 relative group'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#0F2249] text-white font-bold border border-[#F6C62B]/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#0a1329] text-white text-[11px] font-semibold rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Student profile */}
        <div className={`border-t border-slate-800 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-3`}>
          {!sidebarCollapsed ? (
            <>
              <div
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                }}
                className="p-3 rounded-xl bg-[#080f21] border border-slate-800 hover:border-[#F6C62B]/50 flex items-center gap-3 cursor-pointer transition-all group"
                title="Open My Profile"
              >
                {profilePhotoURL ? (
                  <img src={profilePhotoURL} alt={profileName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#F6C62B]/50 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F2249] to-[#F6C62B] text-white font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {profileName.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <div className="text-xs font-bold text-white truncate group-hover:text-[#F6C62B] transition-colors">{profileName}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">My Student Profile →</div>
                </div>
              </div>

              {/* Bottom toggle / collapse button */}
              <button
                onClick={toggleSidebar}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PanelLeftClose className="w-3.5 h-3.5 text-[#F6C62B]" />
                <span>Collapse Sidebar</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                }}
                className="p-0.5 rounded-full hover:ring-2 hover:ring-[#F6C62B] transition-all cursor-pointer"
                title={`My Profile (${profileName})`}
              >
                {profilePhotoURL ? (
                  <img src={profilePhotoURL} alt={profileName} className="w-9 h-9 rounded-full object-cover border border-[#F6C62B]/50" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F2249] to-[#F6C62B] text-white font-bold flex items-center justify-center text-xs">
                    {profileName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                  </div>
                )}
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-slate-400 hover:text-[#F6C62B] hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - Scrollable Independently */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Top bar matching mockup */}
        <header className="h-16 bg-[#0a1329]/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md shrink-0">
          
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Open Menu"
            >
              <Menu className="w-4 h-4 text-[#F6C62B]" />
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search formulas, tutors, questions..."
                className="w-full bg-[#122144] border border-slate-700/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('ai-chat')}
              className="px-3.5 py-1.5 rounded-full bg-[#F6C62B] text-slate-950 font-bold text-xs hover:bg-[#ffd744] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>
            {/* Direct Profile Access */}
            <button
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
              }}
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-700/80 bg-[#122144] hover:bg-[#192f5e] text-slate-200 transition-all cursor-pointer shadow-sm hover:scale-102"
              title="My Student Profile"
            >
              {profilePhotoURL ? (
                <img src={profilePhotoURL} alt={profileName} className="w-6 h-6 rounded-full object-cover border border-[#F6C62B]" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0F2249] to-[#F6C62B] text-white font-bold text-[10px] flex items-center justify-center">
                  {profileName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
              )}
              <span className="text-xs font-semibold hidden sm:inline">{profileName.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Home Dashboard Overview (Based on prueba de captura.jpeg) */}
        {activeTab === 'home' && (
          <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {/* Hero Welcome banner */}
            <div className="bg-gradient-to-r from-[#0F2249] via-[#142958] to-[#0d1c3d] border border-[#F6C62B]/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F6C62B] text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                  ProLnk Active
                </span>
                <span className="text-xs text-slate-300">
                  3-Day Free Trial ({user.daysLeft} days remaining)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Your personal academic command center is ready. Review your active study streak, pending homework deadlines, and upcoming 1-on-1 tutoring sessions.
              </p>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={() => setActiveTab('ai-chat')}
                  className="px-4 py-2 rounded-lg bg-[#F6C62B] text-slate-950 font-bold text-xs hover:bg-[#ffd744] transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open 24/7 AI Solver</span>
                </button>
                <button
                  onClick={() => setActiveTab('tutors')}
                  className="px-4 py-2 rounded-lg bg-[#080f21] text-white border border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#F6C62B]" />
                  <span>Book Human Expert</span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="px-4 py-2 rounded-lg bg-[#080f21] text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Whiteboard & Notes</span>
                </button>
              </div>
            </div>

            {/* NEW: 4-Column Academic Momentum & Study Streak Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Daily Streak */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C62B]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Study Streak</span>
                  <div className="p-2 rounded-xl bg-amber-500/20 text-[#F6C62B]">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white flex items-baseline gap-2 font-mono-nums">
                    <span>5 Days</span>
                    <span className="text-xs text-amber-400 font-semibold">Active 🔥</span>
                  </div>
                  {/* Weekday indicators */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx < 5
                            ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stat 2: AI Solver Queries */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C62B]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">AI Problems Solved</span>
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white font-mono-nums">
                    34 <span className="text-xs text-slate-400 font-normal">/ 50 goal</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-[#F6C62B] h-full rounded-full w-[68%]"></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">68% of weekly practice target reached</p>
                </div>
              </div>

              {/* Stat 3: Study & Tutoring Hours */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C62B]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Study & Tutoring Time</span>
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white font-mono-nums">
                    6.8 <span className="text-xs text-slate-400 font-normal">Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-3">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+1.5h vs last week</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">3 live tutor sessions completed</p>
                </div>
              </div>

              {/* Stat 4: Academic Mastery Score */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#F6C62B]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Concept Mastery</span>
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white font-mono-nums">
                    94% <span className="text-xs text-emerald-400 font-semibold">Mastery</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Calculus
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      Physics
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Ranked in top 5% of student cohort</p>
                </div>
              </div>

            </div>

            {/* NEW: Upcoming Live Tutoring Spotlight Card */}
            <div className="bg-gradient-to-r from-[#0F2249] to-[#0c1a38] border-2 border-[#F6C62B]/60 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-[#F6C62B] text-[#F6C62B] font-bold flex items-center justify-center text-lg shadow-md">
                      DR
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0F2249] animate-pulse"></span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Next Live Call Today
                      </span>
                      <span className="text-xs text-[#F6C62B] font-semibold font-mono-nums">
                        6:00 PM - 7:00 PM (In 1h 45m)
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-display">
                      Calculus: Integration by Parts & Trigonometric Substitution
                    </h3>
                    <p className="text-xs text-slate-300">
                      with <strong>Daniela Ríos</strong> (M.Sc. Mathematics · Rating: 4.98 ★)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setClassroomOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Virtual Classroom</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>View Session Notes</span>
                  </button>
                </div>

              </div>
            </div>

            {/* NEW: 2-Column Student Workstation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (7 cols): Homework & Exam Due Date Tracker */}
              <div className="lg:col-span-7 bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#F6C62B]/20 text-[#F6C62B]">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base font-display">
                          Assignments & Exam Planner
                        </h3>
                        <p className="text-xs text-slate-400">
                          Track deadlines, get instant AI explanations, or request human review.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddTask(prev => !prev)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F6C62B]" />
                      <span>{showAddTask ? 'Close' : 'Add Task'}</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 mb-4">
                    {(['all', 'pending', 'completed'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                          taskFilter === filter
                            ? 'bg-[#F6C62B] text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter === 'all'
                          ? `All (${tasks.length})`
                          : filter === 'pending'
                          ? `Pending (${tasks.filter(t => !t.completed).length})`
                          : `Completed (${tasks.filter(t => t.completed).length})`}
                      </button>
                    ))}
                  </div>

                  {/* Add Task Inline Form */}
                  {showAddTask && (
                    <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-[#080f21] border border-slate-800 mb-4 space-y-3 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs text-slate-300 font-semibold mb-1">Assignment / Topic Title:</label>
                        <input
                          type="text"
                          required
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Calculus: Stewart Chapter 7 Exercises 20-25"
                          className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">Subject:</label>
                          <select
                            value={newTaskSubject}
                            onChange={e => setNewTaskSubject(e.target.value)}
                            className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F6C62B]"
                          >
                            <option value="Calculus">Calculus / Math</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Literature">Academic Writing</option>
                            <option value="Coding">Computer Science</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1">Due Date:</label>
                          <input
                            type="text"
                            value={newTaskDueDate}
                            onChange={e => setNewTaskDueDate(e.target.value)}
                            placeholder="e.g. Tomorrow 11:59 PM"
                            className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddTask(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#F6C62B] text-slate-950 text-xs font-bold hover:bg-[#ffd744]"
                        >
                          Save Task
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Task Rows */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {tasks
                      .filter(t => {
                        if (taskFilter === 'pending') return !t.completed;
                        if (taskFilter === 'completed') return t.completed;
                        return true;
                      })
                      .map(task => (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            task.completed
                              ? 'bg-[#080f21]/60 border-slate-800/80 opacity-70'
                              : 'bg-[#080f21] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5 text-slate-400 hover:text-[#F6C62B] transition-colors cursor-pointer shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-500 hover:text-white" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <p
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  task.completed ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F2249] text-amber-300 border border-amber-500/20">
                                  {task.subject}
                                </span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{task.dueDate}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleSolveTaskWithAI(task.title, task.subject)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Solve problem step-by-step with 24/7 AI"
                            >
                              <Bot className="w-3 h-3" />
                              <span>Solve with AI</span>
                            </button>
                            <button
                              onClick={() => handleBookTutorForSubject(task.subject)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#F6C62B] border border-amber-500/30 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Book a verified human tutor for this subject"
                            >
                              <Users className="w-3 h-3" />
                              <span>Book Tutor</span>
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{tasks.filter(t => t.completed).length} of {tasks.length} assignments completed</span>
                  <span className="text-emerald-400 font-semibold font-mono-nums">
                    {Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}% Complete
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Daily STEM Challenge + Pinned Guides */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Widget 1: Daily Academic Challenge */}
                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-[#F6C62B]">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-display">Daily STEM Challenge</h4>
                        <p className="text-[11px] text-slate-400">Calculus II Practice · Earn +50 XP</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] text-[10px] font-extrabold">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800">
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Evaluate the indefinite integral using the <strong>LIATE</strong> integration by parts rule:
                    </p>
                    <div className="text-center font-mono font-bold text-white text-base my-2.5 tracking-wide text-[#F6C62B]">
                      ∫ x · cos(x) dx
                    </div>
                  </div>

                  {/* 3 Interactive Multiple Choice Options */}
                  <div className="space-y-2">
                    {[
                      { id: 'A', text: 'x · sin(x) + cos(x) + C', correct: true },
                      { id: 'B', text: 'x · cos(x) - sin(x) + C', correct: false },
                      { id: 'C', text: '-x · sin(x) + cos(x) + C', correct: false }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectChallenge(option.id)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                          selectedChallengeOption === option.id
                            ? option.correct
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-rose-500/20 border-rose-500 text-rose-200'
                            : 'bg-[#080f21] border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {option.id}
                          </span>
                          <span>{option.text}</span>
                        </div>
                        {selectedChallengeOption === option.id && (
                          <span className="text-[10px] font-bold">
                            {option.correct ? '✓ Correct (+50 XP)' : '✕ Try again'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Collapsible Step-by-Step AI Breakdown */}
                  <div>
                    <button
                      onClick={() => setChallengeRevealed(prev => !prev)}
                      className="text-xs text-[#F6C62B] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>{challengeRevealed ? 'Hide Step-by-Step Logic' : 'View Step-by-Step AI Logic Breakdown'}</span>
                      {challengeRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {challengeRevealed && (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#080f21] border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
                        <div className="font-bold text-white text-[11px] uppercase tracking-wide text-emerald-400">
                          Step-by-Step Derivation:
                        </div>
                        <p>1. <strong>Choose u and dv:</strong> By LIATE, set algebraic <span className="text-amber-300">u = x</span> and trigonometric <span className="text-amber-300">dv = cos(x) dx</span>.</p>
                        <p>2. <strong>Compute differentials:</strong> <span className="text-amber-300">du = dx</span> and <span className="text-amber-300">v = sin(x)</span>.</p>
                        <p>3. <strong>Apply formula:</strong> ∫ u dv = u·v - ∫ v du = x·sin(x) - ∫ sin(x) dx.</p>
                        <p>4. <strong>Evaluate remaining integral:</strong> Since ∫ sin(x) dx = -cos(x), we get x·sin(x) - (-cos(x)) = <span className="font-bold text-emerald-300">x·sin(x) + cos(x) + C</span>.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Widget 2: Pinned Formula Guides & Canvas Shortcut */}
                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#F6C62B]" />
                      <h4 className="font-bold text-white text-sm font-display">Pinned Formula Sheets</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="text-xs text-[#F6C62B] hover:underline font-semibold"
                    >
                      Open Canvas
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Calculus: Integration by Parts</div>
                        <div className="text-[10px] text-slate-400">LIATE Hierarchy & Tabular Method</div>
                      </div>
                      <button
                        onClick={() => handleDownloadFormula(
                          'ProLnk_Calculus_Integration_by_Parts.md',
                          'Calculus Cheat Sheet',
                          '# ProLnk Integration by Parts Cheat Sheet\n$$\\int u \\, dv = uv - \\int v \\, du$$\nLIATE: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.'
                        )}
                        className="p-1.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">Physics: 2D Collision Vectors</div>
                        <div className="text-[10px] text-slate-400">Conservation of Linear Momentum</div>
                      </div>
                      <button
                        onClick={() => handleDownloadFormula(
                          'ProLnk_Physics_2D_Collisions.md',
                          'Physics 2D Collisions',
                          '# ProLnk Physics 2D Collisions\n$$m_1 v_{1x} + m_2 v_{2x} = m_1 v\'_{1x} + m_2 v\'_{2x}$$\n$$m_1 v_{1y} + m_2 v_{2y} = m_1 v\'_{1y} + m_2 v\'_{2y}$$'
                        )}
                        className="p-1.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Grid of Key Features (AI Solver, Tutoring, Community) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: 24/7 AI Solver */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-[#F6C62B]/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F6C62B] flex items-center justify-center mb-4">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base font-display">Instant AI Tutor</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Ask questions in Calculus, Physics, Chemistry or Essay Writing. AI provides step-by-step logic and citations.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ai-chat')}
                  className="mt-6 text-xs font-bold text-[#F6C62B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Solve homework problem</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Upcoming / Recent Sessions */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-[#F6C62B]/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base font-display">Tutoring Sessions</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    3 past sessions with tutor notes on Integration by parts and Thesis rewrite. Rebook with 1 click.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="mt-6 text-xs font-bold text-[#F6C62B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View session notes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: Community Forum */}
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-[#F6C62B]/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base font-display">Community Study Feed</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Browse questions from other students with verified expert answers. Vote on the clearest explanations.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('community')}
                  className="mt-6 text-xs font-bold text-[#F6C62B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore community</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Notes Callout from Tutors */}
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F6C62B]" />
                  <h3 className="font-bold text-white text-sm">Latest Tutor Feedback & Practice Notes</h3>
                </div>
                <span className="text-[11px] text-slate-400">Daniela Ríos · Calculus</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed bg-[#080f21] p-4 rounded-xl border border-slate-800">
                "Redo problems 4 to 9 without the formula sheet, then send me the two that felt slow. Remember LIATE rule for picking u!"
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Full-screen AI Homework Solver */}
        {activeTab === 'ai-chat' && (
          <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full h-[calc(100vh-4rem)]">
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="px-5 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2249] text-[#F6C62B] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">ProLnk AI Tutor</h3>
                    <div className="text-[11px] text-slate-400">Unlimited questions enabled (Trial active)</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online 24/7</span>
                </span>
              </div>

              {/* Chat Log */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {aiChatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#1b2f60] text-white border border-[#2b4486]'
                          : 'bg-[#122144] text-slate-200 border border-slate-700/70 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      {msg.source && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-[#F6C62B]">
                          <span className="font-semibold text-slate-400">Source: </span>
                          <span className="text-slate-200 italic">{msg.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-[#122144] w-fit px-3.5 py-2 rounded-xl border border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] ml-1">Solving with academic sources...</span>
                  </div>
                )}
                <div ref={chatLogEndRef} />
              </div>

              {/* Quick Preset Prompts */}
              <div className="px-4 py-2 bg-[#080f21] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 shrink-0 text-[11px]">Quick question:</span>
                {AI_PRESET_QUESTIONS.map(p => (
                  <button
                    key={p.topic}
                    onClick={() => void sendAiQuestion(p.question)}
                    disabled={isAiThinking || isHistoryLoading}
                    className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {p.topic}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              {aiError && <p role="alert" className="px-4 py-2 text-xs text-red-300">{aiError}</p>}
              <form onSubmit={handleSendAiMessage} className="p-3.5 bg-[#080f21] border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Type any homework problem, equation, or concept..."
                  className="flex-1 bg-[#122144] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isAiThinking || isHistoryLoading}
                  className="px-5 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <span>Solve</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Verified Tutors */}
        {activeTab === 'tutors' && (
          <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-bold text-white font-display">Verified Expert Tutors</h2>
              <p className="text-xs text-slate-300 mt-1">
                Book a 1-on-1 private tutoring session with verified degree specialists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXPERTS_DATA.map(exp => (
                <div key={exp.id} className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border ${exp.avatarColor}`}>
                        {exp.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm font-display">{exp.name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#F6C62B]" />
                        </div>
                        <p className="text-xs text-slate-300">{exp.role}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {exp.subjects.map(s => (
                        <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {exp.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-white font-mono-nums">Q{exp.hourlyRate}</span>
                      <span className="text-[10px] text-slate-400">/hr</span>
                    </div>
                    <button
                      onClick={() => onBookExpert(exp)}
                      className="px-4 py-1.5 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: My Sessions */}
        {activeTab === 'sessions' && (
          <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-bold text-white font-display">My Tutoring Sessions</h2>
              <p className="text-xs text-slate-300 mt-1">All past and scheduled 1-on-1 calls with tutor notes.</p>
            </div>

            <div className="space-y-4">
              {(propSessions ?? (user.isDemo ? USER_PAST_SESSIONS : [])).map(s => (
                <div key={s.id} className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F2249] text-white flex flex-col items-center justify-center font-mono-nums">
                        <span className="text-xs font-bold">{s.day}</span>
                        <span className="text-[9px] uppercase text-[#F6C62B]">{s.month}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.topic}</h4>
                        <p className="text-xs text-slate-400">with {s.expertName} · {s.subject}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onBookExpert(EXPERTS_DATA[0])}
                      className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#F6C62B] hover:bg-[#ffd744] rounded-lg transition-colors cursor-pointer"
                    >
                      Rebook
                    </button>
                  </div>

                  <div className="bg-[#080f21] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <div className="font-semibold text-[#F6C62B] mb-1">Tutor Feedback & Homework Checklist:</div>
                    <p className="italic">{s.tutorNotes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Community Student & Expert Forum */}
        {activeTab === 'community' && (
          <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] text-[10px] font-extrabold uppercase tracking-wide">
                    Live Peer & Tutor Community
                  </span>
                  <span className="text-xs text-slate-400">· 24/7 Verified Academic Answers</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Student Homework Forum</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Post difficult problem sets, compare solution techniques, and read certified tutor derivations.
                </p>
              </div>

              <button
                onClick={() => setShowNewQuestionForm(prev => !prev)}
                className="px-5 py-2.5 rounded-xl bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showNewQuestionForm ? 'Close Form' : 'Ask a Question'}</span>
              </button>
            </div>

            {/* Inline New Question Form */}
            {showNewQuestionForm && (
              <form onSubmit={handleCreateNewQuestion} className="bg-[#0c162e] border-2 border-[#F6C62B]/60 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F6C62B]" />
                    <h3 className="font-bold text-white text-sm">Post a New Question to the Community</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewQuestionForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">Question Summary / Problem:</label>
                    <input
                      type="text"
                      required
                      value={newQuestionTitle}
                      onChange={e => setNewQuestionTitle(e.target.value)}
                      placeholder="e.g. How do I compute the moment of inertia for an irregular solid using triple integrals?"
                      className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">Academic Category:</label>
                      <select
                        value={newQuestionCategory}
                        onChange={e => setNewQuestionCategory(e.target.value)}
                        className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F6C62B]"
                      >
                        <option value="Mathematics">Mathematics / Calculus</option>
                        <option value="Physics">Physics / Mechanics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Tech">Computer Science / Coding</option>
                        <option value="Writing">Academic Writing / Literature</option>
                        <option value="Career">Career / Internships</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">Details & Problem Context (Optional):</label>
                      <input
                        type="text"
                        value={newQuestionDetails}
                        onChange={e => setNewQuestionDetails(e.target.value)}
                        placeholder="e.g. From Stewart 8th Edition, page 422 problem 18..."
                        className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewQuestionForm(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#F6C62B] text-slate-950 text-xs font-bold hover:bg-[#ffd744] shadow"
                  >
                    Post Question Now
                  </button>
                </div>
              </form>
            )}

            {/* Filter Pills and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c162e] p-4 rounded-2xl border border-slate-700/80 shadow">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', 'Mathematics', 'Physics', 'Chemistry', 'Tech', 'Career', 'Writing'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setForumCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      forumCategoryFilter === cat
                        ? 'bg-[#F6C62B] text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={forumSearchQuery}
                  onChange={e => setForumSearchQuery(e.target.value)}
                  placeholder="Filter discussions..."
                  className="w-full bg-[#122144] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                />
              </div>
            </div>

            {/* Forum Thread Cards List */}
            <div className="space-y-4">
              {(propPosts && propPosts.length > 0 ? propPosts : communityPosts)
                .filter(p => {
                  const matchesCat = forumCategoryFilter === 'All' || p.category.toLowerCase().includes(forumCategoryFilter.toLowerCase());
                  const matchesSearch = !forumSearchQuery.trim() ||
                    p.title.toLowerCase().includes(forumSearchQuery.toLowerCase()) ||
                    p.previewText.toLowerCase().includes(forumSearchQuery.toLowerCase()) ||
                    (p.expertAnswer && p.expertAnswer.toLowerCase().includes(forumSearchQuery.toLowerCase()));
                  return matchesCat && matchesSearch;
                })
                .map(p => {
                  const isExpanded = expandedDashboardPostId === p.id;
                  const comments = p.comments || [];

                  return (
                    <div
                      key={p.id}
                      className={`bg-[#0c162e] border rounded-2xl overflow-hidden transition-all shadow-md ${
                        isExpanded ? 'border-[#F6C62B]/60 ring-1 ring-[#F6C62B]/20' : 'border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      {/* Main Question Card Header Row */}
                      <div
                        onClick={() => setExpandedDashboardPostId(prev => (prev === p.id ? null : p.id))}
                        className="p-5 sm:p-6 cursor-pointer flex items-start gap-4"
                      >
                        {/* Upvote Pill */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(p.id);
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[54px] transition-all cursor-pointer font-mono-nums shrink-0 ${
                            p.userVoted
                              ? 'bg-[#F6C62B] text-slate-950 border-[#F6C62B] shadow-md'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-[#F6C62B]/50 hover:bg-slate-700'
                          }`}
                          title="Upvote question"
                        >
                          <ThumbsUp className={`w-4 h-4 ${p.userVoted ? 'fill-slate-950' : ''}`} />
                          <span className="text-xs font-black mt-1">{p.votes}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold">votes</span>
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0F2249] text-amber-300 border border-amber-500/30">
                              {p.category}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Posted by <strong>{p.author}</strong> · {p.timeAgo}
                            </span>
                            {p.hasExpertAnswer && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full ml-auto">
                                <Award className="w-3 h-3" />
                                <span>Expert Answered</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-white hover:text-[#F6C62B] transition-colors leading-snug">
                            {p.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
                            {p.previewText}
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                <MessageSquare className="w-3.5 h-3.5 text-[#F6C62B]" />
                                <span>{p.repliesCount} comments</span>
                              </span>
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-400 hidden sm:inline-block">Click to view certified breakdown & replies</span>
                            </div>

                            <div className="flex items-center gap-1 text-[#F6C62B] font-bold text-xs">
                              <span>{isExpanded ? 'Collapse' : 'Expand Thread & Comments'}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Drawer */}
                      {isExpanded && (
                        <div className="bg-[#080f21] border-t border-slate-800 p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
                          
                          {/* Verified Tutor Answer */}
                          {p.expertAnswer && (
                            <div className="bg-[#0c162e] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 space-y-3 relative shadow-md">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>Verified Solution by</span>
                                      <span className="text-emerald-400 font-extrabold">{p.expertName}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">Certified Academic Instructor</div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    const tutor = EXPERTS_DATA.find(e => e.name.toLowerCase().includes((p.expertName || '').toLowerCase())) || EXPERTS_DATA[0];
                                    onBookExpert(tutor);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer self-start sm:self-center shadow"
                                >
                                  Book 1-on-1 with {p.expertName?.split(' ')[0]}
                                </button>
                              </div>

                              <div className="text-xs sm:text-sm text-slate-100 leading-relaxed bg-[#080f21] p-4 rounded-xl border border-slate-800/80">
                                {p.expertAnswer}
                              </div>
                            </div>
                          )}

                          {/* Comments Stream */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Thread Discussion ({comments.length} replies)
                              </h4>
                              <span className="text-[11px] text-slate-500">Live replies</span>
                            </div>

                            {comments.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-[#0c162e] p-4 rounded-xl border border-slate-800">
                                No comments posted yet. Add your thoughts or formula approach below!
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {comments.map(comm => (
                                  <div
                                    key={comm.id}
                                    className="bg-[#0c162e] border border-slate-800 p-4 rounded-xl space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold text-[10px] flex items-center justify-center border border-slate-700">
                                          {comm.avatarInitials}
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <span>{comm.author}</span>
                                            {comm.authorRole === 'expert' && (
                                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F6C62B] text-[9px] font-bold">
                                                Tutor
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-400">{comm.timestamp}</div>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleVoteDashboardComment(p.id, comm.id)}
                                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                                          comm.userVoted
                                            ? 'bg-[#F6C62B]/20 text-[#F6C62B] border-[#F6C62B]/40'
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>{comm.upvotes || 0}</span>
                                      </button>
                                    </div>

                                    <p className="text-xs text-slate-200 leading-relaxed pl-9">
                                      {comm.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add Comment Input Form */}
                          <form onSubmit={(e) => handleAddDashboardComment(p.id, e)} className="pt-2">
                            <div className="flex items-start gap-3 bg-[#0c162e] p-3 rounded-xl border border-slate-700 focus-within:border-[#F6C62B] transition-colors">
                              <div className="w-8 h-8 rounded-full bg-[#0F2249] border border-[#F6C62B]/40 text-[#F6C62B] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                              </div>
                              <input
                                type="text"
                                required
                                value={dashboardCommentInputs[p.id] || ''}
                                onChange={(e) => setDashboardCommentInputs({ ...dashboardCommentInputs, [p.id]: e.target.value })}
                                placeholder="Reply to this thread with your solution, formula check, or question..."
                                className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none py-1.5"
                              />
                              <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Comment</span>
                              </button>
                            </div>
                          </form>

                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tab 6: Whiteboard Notes & Drawing Canvas */}
        {activeTab === 'notes' && (
          <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-display">Personal Whiteboard & Study Notes</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Draw scratch math formulas, sketch physics vectors, or review tutor study guides.
                </p>
              </div>

              {/* Subtab buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#080f21] rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNotesSubTab('canvas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    notesSubTab === 'canvas'
                      ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Draw / Scratchpad
                </button>
                <button
                  type="button"
                  onClick={() => setNotesSubTab('downloads')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    notesSubTab === 'downloads'
                      ? 'bg-[#F6C62B] text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formula Sheets
                </button>
              </div>
            </div>

            {notesSubTab === 'canvas' ? (
              <WhiteboardCanvas />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Calculus: Integration by Parts Cheat Sheet</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Daniela Ríos · PDF & Markdown Guide</p>
                    </div>
                    <button
                      onClick={() => handleDownloadFormula(
                        'ProLnk_Calculus_Integration_by_Parts.md',
                        'Calculus: Integration by Parts',
                        `# ProLnk Academic Guide: Integration by Parts\nAuthor: Daniela Ríos (M.Sc. Mathematics)\n\n## Master Formula\n$$\\int u \\, dv = uv - \\int v \\, du$$\n\n## The LIATE Priority Rule for Choosing u:\n1. **L** - Logarithmic functions (ln x, log_a x)\n2. **I** - Inverse trigonometric (arctan x, arcsin x)\n3. **A** - Algebraic / Polynomials (x^2, 3x, etc.)\n4. **T** - Trigonometric (sin x, cos x)\n5. **E** - Exponential (e^x, 2^x)\n\n## Tabular Method (Repeated Integration)\nFor polynomials times exponentials or sines/cosines:\n- Column 1: Signs (+, -, +, -)\n- Column 2: Differentiate u repeatedly to 0\n- Column 3: Integrate dv repeatedly`
                      )}
                      className="p-2.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors cursor-pointer"
                      title="Download Sheet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Physics: 2D Collision Vector Formulas</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Andrés Molina · Whiteboard Vector Guide</p>
                    </div>
                    <button
                      onClick={() => handleDownloadFormula(
                        'ProLnk_Physics_2D_Collision_Formulas.md',
                        'Physics: 2D Collisions',
                        `# ProLnk Academic Guide: 2D Collision Vectors\nAuthor: Andrés Molina (Physics B.Sc.)\n\n## Conservation of Linear Momentum\nIn 2 dimensions (x and y orthogonal axes):\n$$m_1 v_{1x} + m_2 v_{2x} = m_1 v'_{1x} + m_2 v'_{2x}$$\n$$m_1 v_{1y} + m_2 v_{2y} = m_1 v'_{1y} + m_2 v'_{2y}$$\n\n## Kinetic Energy Classification\n- **Elastic**: KE_initial = KE_final\n- **Inelastic**: KE_final < KE_initial (energy converted to deformation/heat)\n- **Completely Inelastic**: Objects stick together: v' = (m1*v1 + m2*v2)/(m1 + m2)`
                      )}
                      className="p-2.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors cursor-pointer"
                      title="Download Sheet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Chemistry: Acid-Base & Redox Balancing Map</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Lucía Coronado · 5-Step Redox Framework</p>
                    </div>
                    <button
                      onClick={() => handleDownloadFormula(
                        'ProLnk_Chemistry_Redox_Balancing_Map.md',
                        'Chemistry: Redox Balancing',
                        `# ProLnk Academic Guide: 5-Step Redox Balancing Method\nAuthor: Lucía Coronado (Chemical Engineer)\n\n## The Ion-Electron Method (Acidic Solution)\n1. Split the skeletal reaction into oxidation and reduction half-reactions.\n2. Balance all atoms EXCEPT hydrogen and oxygen.\n3. Balance oxygen atoms by adding H2O molecules.\n4. Balance hydrogen atoms by adding H+ ions.\n5. Balance net electrical charge by adding electrons (e-).\n6. Multiply half-reactions by integers so electrons cancel out, then add together!`
                      )}
                      className="p-2.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors cursor-pointer"
                      title="Download Sheet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#0c162e] border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Literature: Essay Thesis & Citation Guide</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Priya Nair · Quote Sandwich Framework</p>
                    </div>
                    <button
                      onClick={() => handleDownloadFormula(
                        'ProLnk_Literature_Essay_Thesis_Guide.md',
                        'Literature: Essay Thesis Guide',
                        `# ProLnk Academic Guide: Essay Thesis & Quote Sandwich\nAuthor: Priya Nair (Academic Writing Coach)\n\n## The Strong Thesis Checklist\n- [ ] Is it arguable (not a simple statement of fact)?\n- [ ] Does it answer "Why?" or "How?"\n- [ ] Does it establish a roadmap for your essay body paragraphs?\n\n## The Quote Sandwich Technique\n1. **Top Bread (Signal Phrase)**: Introduce speaker & context.\n2. **The Filling (Quotation)**: Concise, relevant textual evidence.\n3. **Bottom Bread (Analysis)**: 2+ sentences explaining how this evidence proves your argument.`
                      )}
                      className="p-2.5 rounded-lg bg-slate-800 text-[#F6C62B] hover:bg-[#F6C62B] hover:text-slate-950 transition-colors cursor-pointer"
                      title="Download Sheet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Interactive Virtual Live Classroom Modal */}
      {classroomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a1329] border-2 border-[#F6C62B]/80 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[780px] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Classroom Header */}
            <div className="px-5 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  ● LIVE 1-ON-1 ROOM
                </span>
                <span className="text-white font-bold text-xs sm:text-sm font-display truncate">
                  Calculus: Integration by Parts with Daniela Ríos
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                  ID: meet.prolnk.edu/room-7f61c618
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleDownloadFormula(
                      'ProLnk_Live_Session_Notes_Daniela_Rios.md',
                      'Classroom Notes',
                      '# ProLnk Live 1-on-1 Session Notes\nTutor: Daniela Ríos\nStudent: ' + user.name + '\nDate: ' + new Date().toLocaleDateString() + '\n\n## Covered Topics:\n1. Integration by Parts LIATE priority\n2. Tabular method for repeated integrals\n3. Homework review problems 14 to 28.'
                    );
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F6C62B]" />
                  <span>Save Notes</span>
                </button>
                <button
                  onClick={() => setClassroomOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Call</span>
                </button>
              </div>
            </div>

            {/* Classroom Body (2 Columns) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              
              {/* Left Column (8 cols): HD Whiteboard & Video Feeds */}
              <div className="lg:col-span-8 p-4 flex flex-col gap-3 overflow-y-auto bg-[#070d1c]">
                
                {/* Video Tiles Grid */}
                <div className="grid grid-cols-2 gap-3 shrink-0 h-40 sm:h-48">
                  {/* Tutor Video Frame */}
                  <div className="bg-[#0c162e] border border-slate-700/80 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-white z-10">
                      <span className="font-bold flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Daniela Ríos (Tutor)
                      </span>
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md">
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-sm animate-pulse"></span>
                        <span className="w-1 h-3.5 bg-emerald-400 rounded-sm animate-pulse delay-75"></span>
                        <span className="w-1 h-2 bg-emerald-400 rounded-sm animate-pulse delay-150"></span>
                      </div>
                    </div>
                    {/* Simulated Camera Feed */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/40 to-slate-950">
                      <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-[#F6C62B] text-[#F6C62B] font-bold text-lg flex items-center justify-center mx-auto shadow-lg">
                          DR
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">1080p HD Video Connected</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Video Frame */}
                  <div className="bg-[#0c162e] border border-slate-700/80 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-white z-10">
                      <span className="font-bold flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {user.name} (You)
                      </span>
                      <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-slate-300">Student</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#070d1c]">
                      <div className="text-center space-y-2">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-14 h-14 rounded-2xl mx-auto object-cover border border-[#F6C62B]/50" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#0F2249] border border-[#F6C62B] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {classroomVideoOn ? 'Camera Active' : 'Camera Muted'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Synchronized Live Blackboard */}
                <div className="flex-1 min-h-[220px] bg-[#0c162e] border border-slate-700 rounded-xl p-4 flex flex-col justify-between relative shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Sparkles className="w-3.5 h-3.5 text-[#F6C62B]" />
                      <span>Shared Interactive Blackboard</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Daniela writing...
                    </span>
                  </div>

                  <div className="my-auto text-center space-y-3 font-mono py-4">
                    <div className="text-xs text-slate-400">Integration by Parts Formula Application:</div>
                    <div className="text-lg sm:text-xl font-bold text-[#F6C62B] tracking-wider">
                      ∫ x · e^(2x) dx = (1/2) x · e^(2x) - ∫ (1/2) e^(2x) dx
                    </div>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 tracking-wider">
                      = (1/2) x · e^(2x) - (1/4) e^(2x) + C
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      Tip: Always verify the coefficient by differentiating the final answer!
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Synchronized in 12ms via ProLnk RTC</span>
                    <button
                      onClick={() => showDashboardToast('Whiteboard snapshot saved to your study notes! 📝')}
                      className="text-[#F6C62B] hover:underline font-semibold cursor-pointer"
                    >
                      Copy to Notes
                    </button>
                  </div>
                </div>

                {/* Bottom Call Controls */}
                <div className="bg-[#0a1329] border border-slate-800 p-3 rounded-xl flex items-center justify-center gap-4 shrink-0">
                  <button
                    onClick={() => {
                      setClassroomMicOn(prev => !prev);
                      showDashboardToast(classroomMicOn ? 'Microphone muted' : 'Microphone enabled');
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      classroomMicOn
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                    title="Toggle Microphone"
                  >
                    {classroomMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setClassroomVideoOn(prev => !prev);
                      showDashboardToast(classroomVideoOn ? 'Video camera disabled' : 'Video camera enabled');
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      classroomVideoOn
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                    title="Toggle Camera"
                  >
                    {classroomVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => showDashboardToast('Screen sharing permissions requested')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-colors"
                    title="Share Screen"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setClassroomOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow transition-colors"
                  >
                    End Session
                  </button>
                </div>

              </div>

              {/* Right Column (4 cols): Live Classroom Chat & Transcript */}
              <div className="lg:col-span-4 bg-[#0a1329] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
                
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#F6C62B]" />
                    <span className="font-bold text-white text-xs">Live Classroom Chat</span>
                  </div>
                  <span className="text-[10px] text-slate-400">2 Participants</span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
                  <div className="bg-[#0c162e] border border-slate-800 p-2.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-400">Daniela Ríos (Tutor)</span>
                      <span className="text-slate-500">6:02 PM</span>
                    </div>
                    <p className="text-slate-200">
                      Welcome {user.name}! I checked your question on the community board. Let's start with equation #14 from Stewart Section 7.2.
                    </p>
                  </div>

                  <div className="bg-[#0F2249] border border-blue-500/30 p-2.5 rounded-xl space-y-1 text-right">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">6:03 PM</span>
                      <span className="font-bold text-blue-300">{user.name}</span>
                    </div>
                    <p className="text-white text-left">
                      Great! I got stuck on how the factor of 1/2 distributes into the second integral.
                    </p>
                  </div>

                  <div className="bg-[#0c162e] border border-slate-800 p-2.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-400">Daniela Ríos (Tutor)</span>
                      <span className="text-slate-500">6:04 PM</span>
                    </div>
                    <p className="text-slate-200">
                      Take a look at the blackboard. Because dv = e^(2x) dx, v is (1/2)e^(2x). So the outer 1/2 times the integrated 1/2 gives 1/4!
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#080f21] border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message to Daniela..."
                      className="flex-1 bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).value = '';
                          showDashboardToast('Message sent to Daniela in live room!');
                        }
                      }}
                    />
                    <button
                      onClick={() => showDashboardToast('Message sent to Daniela in live room!')}
                      className="p-2 rounded-lg bg-[#F6C62B] text-slate-950 font-bold hover:bg-[#ffd744] transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Dashboard Toast */}
      {dashboardToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2249] text-white border-2 border-[#F6C62B] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#F6C62B] shrink-0" />
          <span>{dashboardToast}</span>
        </div>
      )}

    </div>
  );
};
