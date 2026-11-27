import React, { useState, useEffect, useRef } from 'react';
import { ProLnkLogo } from './Logo';
import { AuthUser, Expert, ForumPost, ForumComment, DashboardSession, StudyDocumentPayload, VerifiedSource, UserTask, SavedSketch } from '../types';
import { EXPERTS_DATA, FORUM_POSTS, AI_PRESET_QUESTIONS } from '../data/mockData';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import { VerifiedSourcesBar } from './VerifiedSourcesBar';
import { GoogleChatPanel } from './GoogleChatPanel';
import { GoogleClassroomPanel } from './GoogleClassroomPanel';
import { GoogleMeetPanel } from './GoogleMeetPanel';
import { GoogleMeetModal } from './GoogleMeetModal';
import { UserAvatar } from './UserAvatar';
import { pickNextVariantIndex } from './Modals';
import { readStudyFile, formatFileSize, MAX_STUDY_FILES } from '../utils/studyFiles';

const DASHBOARD_PLANS_PHRASES = [
  {
    badge: 'Planes ProLnk',
    line1: 'Un plan para',
    line2: 'cada ritmo.',
    accent: 'Sin ataduras.',
    desc: 'Combina tutorías humanas 1-a-1, pizarra compartida e IA 24/7 según tus exámenes del mes.'
  },
  {
    badge: 'Tu ritmo importa',
    line1: 'Crece según',
    line2: 'tu semestre.',
    accent: 'Cambia cuando quieras.',
    desc: 'Sube o ajusta tu plan en segundos cuando lleguen parciales, laboratorios o proyectos finales.'
  },
  {
    badge: 'Más claridad',
    line1: 'Invierte en',
    line2: 'entender mejor.',
    accent: 'Cero complicaciones.',
    desc: 'Horas flexibles con tutores verificados, historial de pizarra y dudas ilimitadas en Plus.'
  },
  {
    badge: 'Acompañamiento real',
    line1: 'Elige cuánto',
    line2: 'apoyo necesitas.',
    accent: 'Todo transparente.',
    desc: 'Precios claros desde el primer día y herramientas listas para impulsar tu promedio.'
  }
];

const DASHBOARD_HELP_PHRASES = [
  {
    badge: 'Ayuda y soporte',
    line1: 'Siempre tienes',
    line2: 'respaldo aquí.',
    accent: 'Nunca estudies solo.'
  },
  {
    badge: 'Guía rápida',
    line1: '¿Te trabaste',
    line2: 'en algo hoy?',
    accent: 'Lo resolvemos juntos.'
  },
  {
    badge: 'Soporte 24/7',
    line1: 'De la duda',
    line2: 'a la solución.',
    accent: 'En un par de clics.'
  },
  {
    badge: 'Contigo siempre',
    line1: 'IA o tutoría,',
    line2: 'tú decides.',
    accent: 'Estamos disponibles.'
  }
];
import {
  Home,
  Bot,
  Users,
  Calendar,
  FileText,
  Search,
  Bell,
  LogOut,
  Send,
  BookOpen,
  Sparkles,
  Zap,
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
  ArrowUp,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Mic,
  MicOff,
  VideoOff,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  User,
  GraduationCap,
  Check,
  Sun,
  Moon,
  Paperclip,
  Globe,
  Upload,
  BarChart2,
  FlaskConical,
  Code2,
  ArrowRight,
  Link2,
  Copy
} from 'lucide-react';

interface DashboardProps {
  user: AuthUser;
  sessions?: DashboardSession[];
  tasks?: UserTask[];
  sketches?: SavedSketch[];
  posts?: ForumPost[];
  onVotePost?: (postId: string) => void;
  onPostQuestion?: (title: string, category: string, previewText?: string) => Promise<void> | void;
  onAddTask?: (task: UserTask) => Promise<void> | void;
  onToggleTask?: (taskId: string, completed: boolean) => Promise<void> | void;
  onDeleteTask?: (taskId: string) => Promise<void> | void;
  onSaveSketch?: (sketch: SavedSketch) => Promise<void> | void;
  onDeleteSketch?: (sketchId: string) => Promise<void> | void;
  onCompleteSession?: (sessionId: string) => Promise<void> | void;
  onAwardActivity?: (deltas: { xpDelta?: number; questionsDelta?: number; tutoringMinutesDelta?: number }) => Promise<void> | void;
  onLogOut: () => void;
  onViewLandingPage: () => void;
  onBookExpert: (expert: Expert) => void;
  onAttachMeetToSession?: (sessionId: string, space: { meetingUri: string; meetingCode?: string }) => void;
  onUpdateProfile?: (updated: Partial<AuthUser>) => void;
  onOpenProfile?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  sessions: propSessions,
  tasks: propTasks,
  sketches: propSketches,
  posts: propPosts,
  onVotePost,
  onPostQuestion,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSaveSketch,
  onDeleteSketch,
  onCompleteSession,
  onAwardActivity,
  onLogOut,
  onBookExpert,
  onAttachMeetToSession,
  onUpdateProfile,
  onOpenProfile,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'ai-chat' | 'tutors' | 'sessions' | 'community' | 'google-chat' | 'google-classroom' | 'google-meet' | 'notes' | 'profile'>('home');
  const [notesSubTab, setNotesSubTab] = useState<'canvas' | 'downloads'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [dashboardToast, setDashboardToast] = useState<string | null>(null);
  const [homeAiPrompt, setHomeAiPrompt] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [plansPhraseIdx, setPlansPhraseIdx] = useState(0);
  const [helpPhraseIdx, setHelpPhraseIdx] = useState(0);
  const [meetModalOpen, setMeetModalOpen] = useState(false);
  const [meetModalSession, setMeetModalSession] = useState<DashboardSession | null>(null);
  const [meetModalMode, setMeetModalMode] = useState<'launch' | 'join'>('launch');
  const [sessionMeetOverrides, setSessionMeetOverrides] = useState<
    Record<string, { meetingUri: string; meetingCode?: string }>
  >({});
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plansModalOpen) {
      setPlansPhraseIdx(pickNextVariantIndex('dash_plans', DASHBOARD_PLANS_PHRASES.length));
    }
  }, [plansModalOpen]);

  useEffect(() => {
    if (helpModalOpen) {
      setHelpPhraseIdx(pickNextVariantIndex('dash_help', DASHBOARD_HELP_PHRASES.length));
    }
  }, [helpModalOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setSearchDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchDropdownOpen(false);
        setNotificationsOpen(false);
        setAccountMenuOpen(false);
        setPlansModalOpen(false);
        setHelpModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Profile state synced from authenticated user
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileBio, setProfileBio] = useState(user.bio || '');
  const [profileUniversity, setProfileUniversity] = useState(user.university || '');
  const [profileMajor, setProfileMajor] = useState(user.major || '');
  const [profileSemester, setProfileSemester] = useState(user.semester || '');
  const [profileLearningGoal, setProfileLearningGoal] = useState(user.learningGoal || '');
  const [profilePhotoURL, setProfilePhotoURL] = useState(user.photoURL || '');
  const [profileSubjects, setProfileSubjects] = useState<string[]>(user.targetSubjects || []);

  // Sync profile state when user prop updates
  useEffect(() => {
    setProfileName(user.name || '');
    setProfileBio(user.bio || '');
    setProfileUniversity(user.university || '');
    setProfileMajor(user.major || '');
    setProfileSemester(user.semester || '');
    setProfileLearningGoal(user.learningGoal || '');
    setProfilePhotoURL(user.photoURL || '');
    setProfileSubjects(user.targetSubjects || []);
  }, [user]);

  const _unusedProfileRefs = {
    profileBio,
    profileUniversity,
    profileMajor,
    profileSemester,
    profileLearningGoal,
    profileSubjects
  };
  void _unusedProfileRefs;

  // Collapsible sidebar & portal theme state synced with global theme
  const [localLightTheme, setLocalLightTheme] = useState<boolean>(() => {
    try {
      return localStorage.getItem('prolnk_theme') !== 'dark';
    } catch {
      return true;
    }
  });
  const isLightTheme = isDarkMode !== undefined ? !isDarkMode : localLightTheme;
  const togglePortalTheme = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
      return;
    }
    setLocalLightTheme(prev => {
      const next = !prev;
      try {
        localStorage.setItem('prolnk_theme', next ? 'light' : 'dark');
      } catch {}
      return next;
    });
  };
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
  
  // Homework Tasks Planner state (persisted per user via Firestore)
  const [localTasks, setLocalTasks] = useState<UserTask[]>([]);
  const tasks = propTasks ?? localTasks;
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Calculus');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Tomorrow');

  // Daily Academic Challenge state
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);
  const [challengeRevealed, setChallengeRevealed] = useState(false);
  const [challengeAwarded, setChallengeAwarded] = useState(false);

  // Virtual Live Classroom Modal state
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [classroomMicOn, setClassroomMicOn] = useState(true);
  const [classroomVideoOn, setClassroomVideoOn] = useState(true);
  const [classroomChatInput, setClassroomChatInput] = useState('');
  const [classroomMessages, setClassroomMessages] = useState<
    { id: string; sender: 'tutor' | 'student'; author: string; time: string; text: string }[]
  >([
    {
      id: 'cr-1',
      sender: 'tutor',
      author: 'Daniela Ríos (Tutor)',
      time: '6:02 PM',
      text: `Welcome ${user.name}! I checked your question on the community board. Let's start with equation #14 from Stewart Section 7.2.`
    },
    {
      id: 'cr-2',
      sender: 'student',
      author: user.name,
      time: '6:03 PM',
      text: 'Great! I got stuck on how the factor of 1/2 distributes into the second integral.'
    },
    {
      id: 'cr-3',
      sender: 'tutor',
      author: 'Daniela Ríos (Tutor)',
      time: '6:04 PM',
      text: 'Take a look at the blackboard. Because dv = e^(2x) dx, v is (1/2)e^(2x). So the outer 1/2 times the integrated 1/2 gives 1/4!'
    }
  ]);

  const handleSendClassroomMessage = () => {
    const text = classroomChatInput.trim();
    if (!text) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setClassroomMessages(prev => [
      ...prev,
      {
        id: `cr-${Date.now()}`,
        sender: 'student',
        author: user.name,
        time: nowTime,
        text
      }
    ]);
    setClassroomChatInput('');
    showDashboardToast('Message sent to Daniela in live room!');
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const next = !target.completed;
    if (onToggleTask) {
      await onToggleTask(id, next);
    } else {
      setLocalTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: next } : t)));
    }
    if (next) {
      showDashboardToast(`Marked "${target.title.substring(0, 25)}..." as done! +15 XP`);
    }
  };

  const deleteTask = async (id: string) => {
    if (onDeleteTask) {
      await onDeleteTask(id);
    } else {
      setLocalTasks(prev => prev.filter(t => t.id !== id));
    }
    showDashboardToast('Assignment removed from your tracker.');
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: UserTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      dueDate: newTaskDueDate.trim() || 'This week',
      completed: false,
      urgency: 'medium'
    };
    if (onAddTask) {
      await onAddTask(newTask);
    } else {
      setLocalTasks(prev => [newTask, ...prev]);
    }
    setNewTaskTitle('');
    setShowAddTask(false);
    showDashboardToast(`Added "${newTask.title.substring(0, 25)}..." to your personal planner.`);
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

  const handleSelectChallenge = async (option: string) => {
    setSelectedChallengeOption(option);
    if (option === 'A') {
      if (!challengeAwarded) {
        setChallengeAwarded(true);
        await onAwardActivity?.({ xpDelta: 50, questionsDelta: 1 });
        showDashboardToast('Correct answer! +50 XP saved to your account.');
      } else {
        showDashboardToast('Correct answer! Keep going.');
      }
    } else {
      showDashboardToast('Not quite! Check the LIATE integration rule below.');
    }
  };

  // Dashboard AI Solver state (with persistent session study library & live grounding)
  const [aiInput, setAiInput] = useState('');
  const [aiStudyDocs, setAiStudyDocs] = useState<StudyDocumentPayload[]>([]);
  const [aiGroundingMode, setAiGroundingMode] = useState<'hybrid' | 'document' | 'web'>('hybrid');
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [aiChatMessages, setAiChatMessages] = useState<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    source?: string;
    sources?: VerifiedSource[];
    searchQueries?: string[];
    webGroundingSkipped?: boolean;
    attachedFileNames?: string[];
    isError?: boolean;
  }[]>([
    {
      id: 'd-1',
      sender: 'ai',
      text: `Hello ${user.name}! I am your ProLnk 24/7 AI tutor. Every answer can verify facts via live Google Search links or directly read PDFs, notes, and homework photos you upload to your Study Library below.`,
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleUploadStudyFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    if (aiStudyDocs.length + files.length > MAX_STUDY_FILES) {
      showDashboardToast(`Study Library supports up to ${MAX_STUDY_FILES} active files at once.`);
      return;
    }

    try {
      const encoded = await Promise.all(files.map(readStudyFile));
      setAiStudyDocs(prev => [...prev, ...encoded].slice(0, MAX_STUDY_FILES));
      showDashboardToast(`Added ${encoded.length} study file${encoded.length > 1 ? 's' : ''} to AI context.`);
    } catch (err: any) {
      showDashboardToast(err?.message || 'Could not attach study file.');
    }
  };

  // Community state inside dashboard (merged cleanly with propPosts from App/Firestore)
  const [communityPosts, setCommunityPosts] = useState<ForumPost[]>(() =>
    propPosts && propPosts.length > 0 ? propPosts : FORUM_POSTS
  );
  useEffect(() => {
    if (!propPosts || propPosts.length === 0) return;
    setCommunityPosts(prev => {
      const prevById = new Map(prev.map(p => [p.id, p]));
      const propIds = new Set(propPosts.map(p => p.id));
      const mergedFromProps = propPosts.map(pp => {
        const existing = prevById.get(pp.id);
        if (!existing) return pp;
        return {
          ...pp,
          comments: existing.comments ?? pp.comments,
          repliesCount: Math.max(pp.repliesCount, existing.repliesCount)
        };
      });
      const localOnlyPosts = prev.filter(p => !propIds.has(p.id));
      return [...localOnlyPosts, ...mergedFromProps];
    });
  }, [propPosts]);
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

  const handleCreateNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim()) return;
    const title = newQuestionTitle.trim();
    const details = newQuestionDetails.trim() || 'Question submitted for student peer review and verified tutor answer.';
    if (onPostQuestion) {
      await onPostQuestion(title, newQuestionCategory, details);
    } else {
      const newPost: ForumPost = {
        id: `post-${Date.now()}`,
        title,
        author: `${user.name} (Student)`,
        category: newQuestionCategory,
        repliesCount: 0,
        votes: 1,
        userVoted: true,
        hasExpertAnswer: false,
        previewText: details,
        timeAgo: 'Just now',
        comments: []
      };
      setCommunityPosts(prev => [newPost, ...prev]);
    }
    setNewQuestionTitle('');
    setNewQuestionDetails('');
    setShowNewQuestionForm(false);
    showDashboardToast('Your question was published to the Community Board! +20 XP');
  };

  const sendPromptToAi = async (rawPrompt: string) => {
    if ((!rawPrompt.trim() && aiStudyDocs.length === 0) || isAiThinking) return;

    const userText =
      rawPrompt.trim() || 'Please summarize and explain the key concepts in my uploaded study materials.';
    const activeDocs = aiGroundingMode === 'web' ? [] : aiStudyDocs;
    const effectiveMode = activeDocs.length > 0 ? aiGroundingMode : 'web';

    setAiChatMessages(prev => [
      ...prev,
      {
        id: Date.now() + '-u',
        sender: 'user',
        text: userText,
        attachedFileNames: activeDocs.map(d => d.name)
      }
    ]);

    setIsAiThinking(true);

    try {
      const historyPayload = aiChatMessages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          documents: activeDocs.map(d => ({
            name: d.name,
            mimeType: d.mimeType,
            base64Data: d.base64Data
          })),
          groundingMode: effectiveMode,
          userContext: {
            isSubscribed: true,
            studentName: profileName,
            explanationStyle: user.aiExplanationStyle
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || 'Could not verify an answer with ProLnk AI.');
      }

      const cleanReply = data.reply
        .split('\n')
        .filter((line: string) => !line.toLowerCase().startsWith('source:'))
        .join('\n')
        .trim();

      setAiChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-a',
          sender: 'ai',
          text: cleanReply || data.reply,
          sources: Array.isArray(data.sources) ? data.sources : [],
          searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
          webGroundingSkipped: Boolean(data.webGroundingSkipped)
        }
      ]);
      onAwardActivity?.({ xpDelta: 15, questionsDelta: 1 });
    } catch (err: any) {
      setAiChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-err',
          sender: 'ai',
          text:
            err?.message ||
            'Unable to reach ProLnk AI right now. Please try again or book a 1-on-1 tutor.',
          isError: true
        }
      ]);
    } finally {
      setIsAiThinking(false);
      setTimeout(() => chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = aiInput;
    if ((!prompt.trim() && aiStudyDocs.length === 0) || isAiThinking) return;
    setAiInput('');
    await sendPromptToAi(prompt);
  };

  const handleHomeAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = homeAiPrompt;
    if (!prompt.trim() && aiStudyDocs.length === 0) {
      setActiveTab('ai-chat');
      return;
    }
    setHomeAiPrompt('');
    setActiveTab('ai-chat');
    await sendPromptToAi(prompt);
  };

  const handleVote = (id: string) => {
    if (onVotePost) {
      onVotePost(id);
    }
    setCommunityPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, votes: p.userVoted ? p.votes - 1 : p.votes + 1, userVoted: !p.userVoted } : p))
    );
  };

  const navItems: {
    id: 'home' | 'ai-chat' | 'tutors' | 'sessions' | 'community' | 'google-chat' | 'google-classroom' | 'google-meet' | 'notes' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeTone?: 'live' | 'workspace' | 'neutral';
  }[] = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'ai-chat', label: 'AI Tutor 24/7', icon: Bot, badge: 'Live', badgeTone: 'live' },
    { id: 'tutors', label: 'Verified Tutors', icon: Users },
    { id: 'sessions', label: 'My Sessions', icon: Calendar },
    { id: 'community', label: 'Community Q&A', icon: MessageSquare },
    { id: 'google-chat', label: 'Google Chat', icon: MessageSquare, badge: 'Workspace', badgeTone: 'workspace' },
    { id: 'google-classroom', label: 'Google Classroom', icon: GraduationCap, badge: 'Workspace', badgeTone: 'workspace' },
    { id: 'google-meet', label: 'Google Meet', icon: Video, badge: 'Workspace', badgeTone: 'workspace' },
    { id: 'notes', label: 'Whiteboard Notes', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User, badge: 'You', badgeTone: 'neutral' }
  ];

  const activeTabLabel = navItems.find(item => item.id === activeTab)?.label || 'Overview';
  const baseSessionsList = propSessions ?? [];
  const activeSessionsList = baseSessionsList.map(s => {
    const override = sessionMeetOverrides[s.id];
    return override ? { ...s, meetUri: override.meetingUri, meetCode: override.meetingCode } : s;
  });
  const upcomingSessions = activeSessionsList.filter(s => s.status === 'upcoming');
  const pastSessions = activeSessionsList.filter(s => s.status !== 'upcoming');
  const activePostsList = communityPosts;
  const nextSession = upcomingSessions[0] || null;
  const userSketches = propSketches ?? [];
  const totalTutoringMinutes = Math.max(user.tutoringMinutes || 0, pastSessions.length * 60);
  const formattedTutoringHours =
    totalTutoringMinutes % 60 === 0
      ? `${totalTutoringMinutes / 60} h`
      : `${(totalTutoringMinutes / 60).toFixed(1)} h`;
  const savedNotesCount = userSketches.length + aiStudyDocs.length;

  const openMeetModal = (session: DashboardSession | null, mode?: 'launch' | 'join') => {
    setMeetModalSession(session);
    setMeetModalMode(mode ?? (session?.meetUri ? 'join' : 'launch'));
    setMeetModalOpen(true);
  };

  const handleSessionMeetLinked = (
    sessionId: string,
    space: { meetingUri: string; meetingCode?: string }
  ) => {
    setSessionMeetOverrides(prev => ({ ...prev, [sessionId]: space }));
    onAttachMeetToSession?.(sessionId, space);
    setMeetModalSession(prev =>
      prev && prev.id === sessionId
        ? { ...prev, meetUri: space.meetingUri, meetCode: space.meetingCode }
        : prev
    );
  };

  const handleCopySessionMeetUri = async (sessionId: string, uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedSessionId(sessionId);
      showDashboardToast('Enlace de Google Meet copiado.');
      setTimeout(() => setCopiedSessionId(null), 2000);
    } catch {
      showDashboardToast(`Enlace listo: ${uri}`);
    }
  };

  const todayFormatted = (() => {
    const raw = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  const trimmedSearch = searchQuery.trim().toLowerCase();
  const searchMatches = trimmedSearch
    ? {
        tutors: EXPERTS_DATA.filter(
          e =>
            e.name.toLowerCase().includes(trimmedSearch) ||
            e.subjects.some(s => s.toLowerCase().includes(trimmedSearch))
        ).slice(0, 3),
        posts: activePostsList
          .filter(
            p =>
              p.title.toLowerCase().includes(trimmedSearch) ||
              p.category.toLowerCase().includes(trimmedSearch)
          )
          .slice(0, 3),
        tasks: tasks
          .filter(
            t =>
              t.title.toLowerCase().includes(trimmedSearch) ||
              t.subject.toLowerCase().includes(trimmedSearch)
          )
          .slice(0, 3)
      }
    : null;

  const recentNotesPreview = [
    ...userSketches.slice(0, 3).map((sk, idx) => ({
      id: sk.id,
      title: sk.title,
      meta: `Pizarra personal · ${sk.timestamp}`,
      highlight: idx === 0,
      targetSubTab: 'canvas' as const
    })),
    ...aiStudyDocs.slice(0, Math.max(0, 3 - userSketches.length)).map(doc => ({
      id: doc.id,
      title: doc.name,
      meta: `Archivo de estudio · ${formatFileSize(doc.sizeBytes)}`,
      highlight: false,
      targetSubTab: 'downloads' as const
    }))
  ];

  const renderBadgeStyle = (tone?: 'live' | 'workspace' | 'neutral', isActive?: boolean) => {
    if (isActive) {
      return 'bg-white/15 text-white border border-white/20';
    }
    if (tone === 'live') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    }
    if (tone === 'workspace') {
      return 'bg-[#EEF2F7] text-[#0F2249] border border-slate-200';
    }
    return 'bg-slate-100 text-slate-600 border border-slate-200/80';
  };

  return (
    <>
      <div className={`${isLightTheme ? 'portal-light bg-[#FAFAF5] text-[#0F2249]' : 'bg-[#070d1c] text-slate-100'} h-screen max-h-screen overflow-hidden flex flex-col md:flex-row antialiased relative`}>
      
      {/* Shared Hidden File Input for Overview & AI Tutor Study Library */}
      <input
        ref={aiFileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.png,.jpg,.jpeg,.webp"
        multiple
        onChange={handleUploadStudyFiles}
        className="hidden"
      />

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 md:hidden animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-72 bg-white border-r border-slate-200 h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
          >
            <div>
              <div className="pb-4 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <ProLnkLogo size="md" light={!isLightTheme} showWordmark={true} />
                  <div className="text-[9px] tracking-[0.16em] uppercase font-semibold text-slate-400 mt-1 pl-0.5">
                    Aprender es conectar
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F2249] hover:bg-slate-100 cursor-pointer"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-400 px-2 pt-5 pb-2">
                Tu espacio
              </div>

              <nav className="space-y-1 text-[13px] font-medium">
                {navItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'profile' && onOpenProfile) {
                          onOpenProfile();
                          setMobileSidebarOpen(false);
                          return;
                        }
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0F2249] text-white font-semibold shadow-sm'
                          : 'text-slate-600 hover:text-[#0F2249] hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${renderBadgeStyle(item.badgeTone, isActive)}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 space-y-3 border-t border-slate-200/80 mt-4">
              <div className="rounded-2xl bg-[#EEF2F8] border border-slate-200/80 p-4 space-y-2">
                <div className="text-[9px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                  Un poco más lejos
                </div>
                <div className="font-editorial text-base text-[#0F2249] leading-snug">
                  Tu próximo gran paso.
                </div>
                <p className="text-[11px] text-slate-500">
                  Más preguntas. Más posibilidades.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlansModalOpen(true);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full mt-1 py-2 px-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Descubrir planes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setMobileSidebarOpen(false);
                  }}
                  className="flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <UserAvatar photoURL={profilePhotoURL} name={profileName} size="sm" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#0F2249] truncate">{profileName}</div>
                    <div className="text-[10px] text-slate-500">Mi perfil →</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onLogOut}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Fixed Editorial Navigation */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200/80 shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 overflow-y-auto overflow-x-hidden ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className={`px-5 pt-6 pb-4 flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
            {!sidebarCollapsed ? (
              <div>
                <ProLnkLogo size="md" light={!isLightTheme} showWordmark={true} />
                <div className="text-[9px] tracking-[0.16em] uppercase font-semibold text-slate-400 mt-1.5 pl-0.5">
                  Aprender es conectar
                </div>
              </div>
            ) : (
              <div className="p-1.5 rounded-xl bg-[#EEF2F7] border border-slate-200 flex items-center justify-center">
                <ProLnkLogo size="sm" light={!isLightTheme} showWordmark={false} />
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-400 px-6 pt-3 pb-2">
              Tu espacio
            </div>
          )}

          {/* Navigation Links */}
          <nav className={`space-y-1 text-[13px] font-medium ${sidebarCollapsed ? 'p-2 mt-2' : 'px-3 pb-4'}`}>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'profile' && onOpenProfile) {
                      onOpenProfile();
                      return;
                    }
                    setActiveTab(item.id);
                  }}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-full flex items-center transition-all cursor-pointer rounded-xl ${
                    sidebarCollapsed
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-[#0F2249] text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-[#0F2249] hover:bg-slate-100'
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${renderBadgeStyle(item.badgeTone, isActive)}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Promo Card + Support Footer */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-3`}>
          {!sidebarCollapsed ? (
            <>
              <div className="rounded-2xl bg-[#EEF2F8] border border-slate-200/80 p-4 space-y-2">
                <div className="text-[9px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                  Un poco más lejos
                </div>
                <div className="font-editorial text-[17px] text-[#0F2249] leading-snug">
                  Tu próximo gran paso.
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Más preguntas. Más posibilidades.
                </p>
                <button
                  type="button"
                  onClick={() => setPlansModalOpen(true)}
                  className="w-full mt-1.5 py-2.5 px-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <span>Descubrir planes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(true)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-[#0F2249] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Ayuda y soporte</span>
                </button>

                <div className="flex items-center justify-between px-2.5 pt-1">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="text-[11px] text-slate-400 hover:text-[#0F2249] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Colapsar barra lateral"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                    <span>Colapsar</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogOut}
                    className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>

                <div className="px-2.5 pt-1 text-[10px] text-slate-400">
                  © 2026 ProLnk
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 border-t border-slate-200/80 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                }}
                className="p-0.5 rounded-full hover:ring-2 hover:ring-[#F5C52C] transition-all cursor-pointer"
                title={`Mi Perfil (${profileName})`}
              >
                <UserAvatar photoURL={profilePhotoURL} name={profileName} size="md" />
              </button>
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-slate-400 hover:text-[#0F2249] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md shrink-0">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-[#0F2249] hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Abrir menú"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="font-bold text-[#0F2249] hover:underline cursor-pointer"
              >
                Mi espacio
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-medium truncate">{activeTabLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Search Input with Live Results Popover */}
            <div ref={searchBoxRef} className="relative hidden sm:block w-60 lg:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder="Buscar apuntes, tutores, preguntas..."
                className="w-full bg-[#F4F6FA] border border-slate-200/90 rounded-xl pl-9 pr-8 py-2 text-xs text-[#0F2249] placeholder-slate-400 focus:outline-none focus:border-[#0F2249]/40 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchDropdownOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {searchMatches && searchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 text-xs">
                  {searchMatches.tutors.length === 0 && searchMatches.posts.length === 0 && searchMatches.tasks.length === 0 ? (
                    <div className="py-3 text-center text-slate-400">
                      No encontramos resultados para «{searchQuery}».
                    </div>
                  ) : (
                    <>
                      {searchMatches.tutors.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">Tutores</div>
                          {searchMatches.tutors.map(t => (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => {
                                setSearchQuery('');
                                onBookExpert(t);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                            >
                              <span className="font-semibold text-[#0F2249]">{t.name}</span>
                              <span className="text-[11px] text-slate-500">Q{t.hourlyRate}/h</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchMatches.posts.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">Comunidad</div>
                          {searchMatches.posts.map(p => (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => {
                                setSearchQuery('');
                                setExpandedDashboardPostId(p.id);
                                setActiveTab('community');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 truncate font-medium text-[#0F2249] cursor-pointer"
                            >
                              {p.title}
                            </button>
                          ))}
                        </div>
                      )}
                      {searchMatches.tasks.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">Tareas</div>
                          {searchMatches.tasks.map(tk => (
                            <button
                              type="button"
                              key={tk.id}
                              onClick={() => {
                                setSearchQuery('');
                                handleSolveTaskWithAI(tk.title, tk.subject);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 truncate font-medium text-[#0F2249] cursor-pointer"
                            >
                              {tk.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Switch */}
            <button
              type="button"
              onClick={togglePortalTheme}
              className="p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-[#0F2249] transition-colors cursor-pointer shrink-0"
              title={isLightTheme ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              aria-label={isLightTheme ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {isLightTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#F5C52C]" />}
            </button>

            {/* Notifications Bell */}
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(prev => !prev);
                  setAccountMenuOpen(false);
                }}
                className="relative p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-[#0F2249] transition-colors cursor-pointer shrink-0"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5C52C] ring-2 ring-white"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-[#0F2249]">Notificaciones</span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {nextSession ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          setActiveTab('sessions');
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#F2F6FB] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="font-semibold text-[#0F2249]">Próxima sesión con {nextSession.expertName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{nextSession.topic} · {nextSession.time || nextSession.date}</div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          setActiveTab('tutors');
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#F2F6FB] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="font-semibold text-[#0F2249]">Sin sesiones próximas</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Explora tutores verificados para agendar tu primera sesión</div>
                      </button>
                    )}
                    <div className="p-2.5 rounded-xl bg-[#FAFAF5] border border-slate-200/70">
                      <div className="font-semibold text-[#0F2249]">{tasks.filter(t => !t.completed).length} tareas pendientes</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Plan actual: {user.plan} ({user.xpPoints} XP)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Button with Generic User Avatar */}
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen(prev => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Mi cuenta"
              >
                <UserAvatar photoURL={profilePhotoURL} name={profileName} size="sm" />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-[#0F2249]">
                    {profileName ? profileName.split(' ')[0] : 'Mi cuenta'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <span>Estudiante</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-bold text-[#0F2249] truncate">{profileName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-[#0F2249] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mi perfil y foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setPlansModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-[#0F2249] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Descubrir planes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onLogOut();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab 1: Overview (New Warm Alabaster Editorial Portal + Integrated Study Workstation) */}
        {activeTab === 'home' && (
          <div className="p-5 sm:p-8 space-y-7 max-w-[1280px] mx-auto w-full">
            
            {/* Greeting Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                  Tu próxima gran idea empieza aquí
                </div>
                <h1 className="font-editorial text-3xl sm:text-[2.25rem] text-[#0F2249] tracking-tight mt-1 leading-tight">
                  Un buen día para entender.
                </h1>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs font-medium text-slate-500">{todayFormatted}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Un paso a la vez. A tu ritmo.</div>
              </div>
            </div>

            {/* Top Split Grid: PROLNK AI (8 cols) + TU PRÓXIMA SESIÓN (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left 8 cols: PROLNK AI Card */}
              <div className="lg:col-span-8 bg-[#F2F6FB] border border-slate-200/90 rounded-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between">
                {/* Subtle Engineering Grid Accent on Right */}
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(15,34,73,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,34,73,0.045) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    maskImage: 'linear-gradient(to left, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to left, black, transparent)'
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                      ProLnk AI
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/90 text-[11px] font-medium text-emerald-700 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Disponible 24/7</span>
                    </span>
                  </div>

                  <h2 className="font-editorial text-2xl sm:text-[1.85rem] text-[#0F2249] mt-4 leading-snug">
                    ¿En qué te ayudo hoy?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                    De «no puedo» a «ya entendí». Pregunta, sube tus apuntes y vamos paso a paso.
                  </p>
                </div>

                {/* Quick Ask Bar */}
                <form
                  onSubmit={handleHomeAiSubmit}
                  className="relative z-10 mt-6 bg-white border border-slate-200 rounded-xl p-1.5 pl-4 flex items-center gap-2 shadow-xs focus-within:border-[#0F2249]/40 transition-colors"
                >
                  <input
                    type="text"
                    value={homeAiPrompt}
                    onChange={e => setHomeAiPrompt(e.target.value)}
                    placeholder="Escribe tu pregunta o adjunta tus apuntes..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-2"
                  />

                  {aiStudyDocs.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                      <FileText className="w-3 h-3" />
                      <span>{aiStudyDocs.length}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => aiFileInputRef.current?.click()}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#0F2249] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="Adjuntar apuntes o PDF"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    className="w-9 h-9 rounded-lg bg-[#F5C52C] hover:bg-[#eab921] text-[#0F2249] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Enviar a ProLnk AI"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              </div>

              {/* Right 4 cols: TU PRÓXIMA SESIÓN Card */}
              <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
                {nextSession ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                          Tu próxima sesión
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('sessions')}
                          className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver todas</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-start gap-3.5 mt-5">
                        <div className="w-14 h-14 rounded-xl bg-[#F3F5F8] border border-slate-200/70 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">
                            {nextSession.month?.toUpperCase() || 'SES'}
                          </span>
                          <span className="font-editorial text-xl text-[#0F2249] leading-none mt-0.5">
                            {nextSession.day || '01'}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-editorial text-lg text-[#0F2249] leading-snug truncate">
                            {nextSession.topic}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Con {nextSession.expertName} · Tutor verificado
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-5 pt-3 border-t border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{nextSession.time || nextSession.date}</span>
                      </div>

                      {nextSession.meetUri && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-[#F4F7FB] border border-slate-200/80 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0 text-[#0F2249]">
                            <Link2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-mono">{nextSession.meetUri}</span>
                          </div>
                          <a
                            href={nextSession.meetUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#0F2249] hover:underline shrink-0 inline-flex items-center gap-0.5"
                          >
                            <span>Entrar</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openMeetModal(nextSession, nextSession.meetUri ? 'join' : 'launch')}
                        className="py-2.5 px-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-[#F5C52C]" />
                        <span>{nextSession.meetUri ? 'Unirse en Meet' : 'Google Meet'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassroomOpen(true)}
                        className="py-2.5 px-3 rounded-xl bg-[#F3F5F8] hover:bg-slate-200/80 text-[#0F2249] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Preparar aula</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">
                          Tu próxima sesión
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('sessions')}
                          className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Agenda</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="w-11 h-11 rounded-xl bg-[#F3F5F8] border border-slate-200/70 flex items-center justify-center text-[#0F2249]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-editorial text-lg text-[#0F2249] leading-snug pt-1">
                          Aún no tienes citas reservadas
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Aparta tu primera tutoría 1-a-1 con un especialista o abre una sala de Google Meet en segundos.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('tutors')}
                        className="py-2.5 px-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 text-[#F5C52C]" />
                        <span>Explorar tutores</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openMeetModal(null, 'launch')}
                        className="py-2.5 px-3 rounded-xl bg-[#F3F5F8] hover:bg-slate-200/80 text-[#0F2249] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Google Meet</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 4-Column KPI Strip (Live Personal Account Stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('ai-chat')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/30 rounded-2xl p-5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <MessageSquare className="w-4 h-4 text-slate-400 self-center shrink-0" />
                    <span className="font-editorial text-2xl sm:text-3xl text-[#0F2249] font-mono-nums">
                      {user.questionsResolved}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Tu historial</span>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-medium">Preguntas resueltas</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sessions')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/30 rounded-2xl p-5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 self-center shrink-0" />
                    <span className="font-editorial text-2xl sm:text-3xl text-[#0F2249] font-mono-nums">
                      {formattedTutoringHours}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{activeSessionsList.length} sesiones</span>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-medium">Aprendiendo con tutores</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/30 rounded-2xl p-5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <FileText className="w-4 h-4 text-slate-400 self-center shrink-0" />
                    <span className="font-editorial text-2xl sm:text-3xl text-[#0F2249] font-mono-nums">
                      {String(savedNotesCount).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Tu biblioteca</span>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-medium">Apuntes guardados</div>
              </button>

              <button
                type="button"
                onClick={() => onOpenProfile?.()}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/30 rounded-2xl p-5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <BarChart2 className="w-4 h-4 text-slate-400 self-center shrink-0" />
                    <span className="font-editorial text-2xl sm:text-3xl text-[#0F2249] font-mono-nums">
                      {user.streakDays} {user.streakDays === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{user.xpPoints} XP</span>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-medium">Tu racha de aprendizaje</div>
              </button>
            </div>

            {/* Middle 2-Column Row: Retoma donde lo dejaste + Avanza en compañía */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Card: Notes & Study Files */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-editorial text-xl text-[#0F2249]">Retoma donde lo dejaste.</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tus apuntes personales, siempre a mano.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Ver todos</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentNotesPreview.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-[#FAFAF5] p-5 text-center space-y-3">
                    <p className="text-xs text-slate-500">
                      Todavía no has guardado notas de pizarra ni archivos de estudio en tu cuenta.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setNotesSubTab('canvas');
                        setActiveTab('notes');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0F2249] text-white text-xs font-semibold cursor-pointer hover:bg-[#19346b] transition-colors"
                    >
                      Abrir pizarra personal
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentNotesPreview.map(note => (
                      <button
                        type="button"
                        key={note.id}
                        onClick={() => {
                          setNotesSubTab(note.targetSubTab);
                          setActiveTab('notes');
                        }}
                        className="w-full py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              note.highlight
                                ? 'bg-amber-50 border-amber-200/80 text-amber-700'
                                : 'bg-[#F3F5F8] border-slate-200/70 text-[#0F2249]'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-[#0F2249] truncate">
                              {note.title}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">{note.meta}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F2249] shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Card: Community Preview */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-editorial text-xl text-[#0F2249]">Avanza en compañía.</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Una buena pregunta también conecta.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('community')}
                    className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Ir a comunidad</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {activePostsList.slice(0, 2).map((post, idx) => (
                    <button
                      type="button"
                      key={post.id}
                      onClick={() => {
                        setExpandedDashboardPostId(post.id);
                        setActiveTab('community');
                      }}
                      className="w-full py-3.5 first:pt-1 last:pb-1 text-left hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors cursor-pointer block space-y-1.5"
                    >
                      {idx === 0 && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#EEF2F7] text-[#0F2249] text-[10px] font-bold uppercase tracking-wider">
                          {post.category}
                        </span>
                      )}
                      <div className="text-xs sm:text-sm font-semibold text-[#0F2249] leading-snug">
                        {post.title}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-[11px] text-slate-400 truncate">
                          {idx === 0
                            ? `${post.author} · ${post.timeAgo}`
                            : `${post.category} · ${post.repliesCount} respuestas · ${post.timeAgo}`}
                        </span>
                        {idx === 0 && post.hasExpertAnswer && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-medium shrink-0">
                            <Check className="w-3 h-3" />
                            <span>{Math.max(post.repliesCount, 3)} respuestas de expertos</span>
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section: Featured Tutors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-editorial text-xl sm:text-2xl text-[#0F2249]">
                  A veces, necesitas a alguien al otro lado.
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('tutors')}
                  className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Encontrar mi tutor</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {EXPERTS_DATA.slice(0, 3).map((exp, idx) => (
                  <button
                    type="button"
                    key={exp.id}
                    onClick={() => onBookExpert(exp)}
                    className="bg-white border border-slate-200/90 hover:border-[#0F2249]/35 rounded-2xl p-5 text-left transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            idx === 1
                              ? 'bg-amber-50 border-amber-200 text-[#0F2249]'
                              : 'bg-[#F3F5F8] border-slate-200/80 text-[#0F2249]'
                          }`}
                        >
                          {idx === 0 ? (
                            <span className="font-editorial text-base">±</span>
                          ) : idx === 1 ? (
                            <Code2 className="w-4 h-4" />
                          ) : (
                            <FlaskConical className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-editorial text-base text-[#0F2249] truncate">
                            {exp.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {exp.subjects.slice(0, 2).join(' · ')}
                          </div>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Disponible esta semana</span>
                      </span>
                      <span className="font-bold text-[#0F2249] font-mono-nums">
                        Q{exp.hourlyRate} / hora
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Google Workspace & Interactive Tools Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('google-chat')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/35 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2249]">Google Chat Workspace</div>
                    <div className="text-[11px] text-slate-500">Grupos de estudio y mensajes</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('google-classroom')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/35 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2F7] border border-slate-200 text-[#0F2249] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2249]">Google Classroom</div>
                    <div className="text-[11px] text-slate-500">Cursos, entregas y anuncios</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('google-meet')}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/35 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2249]">Google Meet</div>
                    <div className="text-[11px] text-slate-500">Salas en vivo e historial</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setNotesSubTab('canvas');
                  setActiveTab('notes');
                }}
                className="bg-white border border-slate-200/90 hover:border-[#0F2249]/35 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2249]">Pizarra y Hojas de Fórmulas</div>
                    <div className="text-[11px] text-slate-500">Dibuja diagramas y descarga guías</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Existing Workstation Grid: Assignments Planner + Daily STEM Challenge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (7 cols): Assignments & Exam Planner */}
              <div className="lg:col-span-7 bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#F6C62B]/20 text-[#F6C62B]">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base font-display">
                          Assignments &amp; Exam Planner
                        </h3>
                        <p className="text-xs text-slate-400">
                          Track deadlines, get instant AI explanations, or request human review.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
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
                        type="button"
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
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#F6C62B] text-slate-950 text-xs font-bold hover:bg-[#ffd744] cursor-pointer"
                        >
                          Save Task
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Task Rows */}
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {tasks.length === 0 ? (
                      <div className="p-6 rounded-xl bg-[#080f21] border border-dashed border-slate-800 text-center space-y-2">
                        <p className="text-xs font-semibold text-white">No assignments tracked yet</p>
                        <p className="text-[11px] text-slate-400">
                          Click "Add Task" above to save homework deadlines directly to your account.
                        </p>
                      </div>
                    ) : (
                      tasks
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
                                type="button"
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
                                type="button"
                                onClick={() => handleSolveTaskWithAI(task.title, task.subject)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Solve problem step-by-step with 24/7 AI"
                              >
                                <Bot className="w-3 h-3" />
                                <span>Solve with AI</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBookTutorForSubject(task.subject)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[#F6C62B] border border-amber-500/30 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                title="Book a verified human tutor for this subject"
                              >
                                <Users className="w-3 h-3" />
                                <span>Book Tutor</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{tasks.filter(t => t.completed).length} of {tasks.length} assignments completed</span>
                  <span className="text-emerald-400 font-semibold font-mono-nums">
                    {tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}% Complete
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Daily STEM Challenge + Latest Tutor Notes */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Widget 1: Daily STEM Challenge */}
                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
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
                    <div className="text-center font-mono font-bold text-[#F6C62B] text-base my-2.5 tracking-wide">
                      ∫ x · cos(x) dx
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'A', text: 'x · sin(x) + cos(x) + C', correct: true },
                      { id: 'B', text: 'x · cos(x) - sin(x) + C', correct: false },
                      { id: 'C', text: '-x · sin(x) + cos(x) + C', correct: false }
                    ].map(option => (
                      <button
                        type="button"
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

                  <div>
                    <button
                      type="button"
                      onClick={() => setChallengeRevealed(prev => !prev)}
                      className="text-xs text-[#F6C62B] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>{challengeRevealed ? 'Hide Step-by-Step Logic' : 'View Step-by-Step AI Logic Breakdown'}</span>
                      {challengeRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {challengeRevealed && (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#080f21] border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
                        <div className="font-bold text-[11px] uppercase tracking-wide text-emerald-400">
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

                {/* Widget 2: Latest Tutor Feedback */}
                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#F6C62B]" />
                      <h4 className="font-bold text-white text-sm font-display">Latest Tutor Feedback</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {pastSessions[0]?.expertName || activeSessionsList[0]?.expertName || 'Your Tutors'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed bg-[#080f21] p-3.5 rounded-xl border border-slate-800">
                    {pastSessions[0]?.tutorNotes ||
                      activeSessionsList[0]?.tutorNotes ||
                      'Tutor notes and personalized study recommendations will appear here after you book or complete a session.'}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Full-screen AI Homework Solver with Real Web & Document Grounding */}
        {activeTab === 'ai-chat' && (
          <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-4xl mx-auto w-full h-[calc(100vh-4rem)]">
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
              
              {/* Header + Grounding Mode Selector */}
              <div className="px-5 py-3.5 bg-[#080f21] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2249] text-[#F6C62B] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">ProLnk AI Tutor</h3>
                    <div className="text-[11px] text-slate-400">
                      Live web search links + uploaded PDF/notes verification
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center rounded-lg bg-[#122144] border border-slate-700/80 p-0.5 text-[11px]">
                    {(
                      [
                        { id: 'hybrid', label: 'Web + Docs' },
                        { id: 'document', label: 'Docs Only' },
                        { id: 'web', label: 'Live Web' }
                      ] as const
                    ).map(mode => {
                      const disabled = mode.id === 'document' && aiStudyDocs.length === 0;
                      const active = aiGroundingMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => setAiGroundingMode(mode.id)}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            active
                              ? 'bg-[#F6C62B] text-slate-950 font-bold'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title={
                            disabled
                              ? 'Upload a PDF or study notes first to use Docs Only mode'
                              : `Use ${mode.label} grounding`
                          }
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grounded</span>
                  </span>
                </div>
              </div>

              {/* Study Library Drawer (Uploaded PDFs / Notes / Homework Photos) */}
              <div className="px-5 py-2.5 bg-[#080f21]/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => aiFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F6C62B]" />
                    <span>Upload PDF / Notes</span>
                  </button>

                  {aiStudyDocs.length === 0 ? (
                    <span className="text-[11px] text-slate-400">
                      Attach textbook chapters, PDFs, or homework photos (up to 3 files, 8 MB each)
                    </span>
                  ) : (
                    aiStudyDocs.map(doc => (
                      <span
                        key={doc.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium"
                      >
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{doc.name}</span>
                        <span className="text-[10px] opacity-75">({formatFileSize(doc.sizeBytes)})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAiStudyDocs(prev => {
                              const next = prev.filter(d => d.id !== doc.id);
                              if (next.length === 0 && aiGroundingMode === 'document') {
                                setAiGroundingMode('hybrid');
                              }
                              return next;
                            });
                          }}
                          className="hover:text-rose-300 cursor-pointer"
                          title={`Remove ${doc.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
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
                          : msg.isError
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/40'
                          : 'bg-[#122144] text-slate-200 border border-slate-700/70 shadow-sm'
                      }`}
                    >
                      {msg.attachedFileNames && msg.attachedFileNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {msg.attachedFileNames.map(name => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{name}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                      {!msg.isError && (
                        <VerifiedSourcesBar
                          sources={msg.sources}
                          fallbackText={msg.source}
                          searchQueries={msg.searchQueries}
                          webGroundingSkipped={msg.webGroundingSkipped}
                          variant={isLightTheme ? 'light' : 'dark'}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-[#122144] w-fit px-3.5 py-2 rounded-xl border border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] ml-1">Verifying web &amp; document sources...</span>
                  </div>
                )}
                <div ref={chatLogEndRef} />
              </div>

              {/* Quick Preset Prompts */}
              <div className="px-4 py-2 bg-[#080f21] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 shrink-0 text-[11px]">Verified examples:</span>
                {AI_PRESET_QUESTIONS.map(p => (
                  <button
                    key={p.topic}
                    onClick={() => {
                      setAiChatMessages(prev => [
                        ...prev,
                        { id: Date.now() + '-u', sender: 'user', text: p.question },
                        {
                          id: Date.now() + '-a',
                          sender: 'ai',
                          text: p.answer,
                          source: p.source,
                          sources: p.sources
                        }
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {p.topic}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAiMessage} className="p-3.5 bg-[#080f21] border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => aiFileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Upload study PDF, notes, or image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={
                    aiStudyDocs.length > 0
                      ? `Ask about ${aiStudyDocs[0].name} or any homework topic...`
                      : 'Type any homework problem, equation, or concept...'
                  }
                  className="flex-1 bg-[#122144] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                />
                <button
                  type="submit"
                  disabled={(!aiInput.trim() && aiStudyDocs.length === 0) || isAiThinking}
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
          <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl text-[#0F2249]">
                  My Tutoring Sessions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Únete directo con Google Meet desde tus sesiones reservadas o consulta tus notas anteriores.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openMeetModal(null, 'join')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0F2249]/40 text-[#0F2249] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Unirse con enlace</span>
                </button>
                <button
                  type="button"
                  onClick={() => openMeetModal(null, 'launch')}
                  className="px-4 py-2.5 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-[#F5C52C]" />
                  <span>Lanzar sala Google Meet</span>
                </button>
              </div>
            </div>

            {/* Upcoming Booked Sessions */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-slate-500">
                    Próximas sesiones reservadas ({upcomingSessions.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('tutors')}
                  className="text-xs font-semibold text-[#0F2249] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Reservar nueva tutoría</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-3">
                  <Calendar className="w-7 h-7 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="font-editorial text-lg text-[#0F2249]">
                      No tienes sesiones próximas reservadas
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Reserva una tutoría 1-a-1 con un especialista o abre una sala instantánea de Google Meet.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('tutors')}
                      className="px-4 py-2 rounded-xl bg-[#F5C52C] hover:bg-[#e5b51f] text-[#0F2249] text-xs font-bold cursor-pointer"
                    >
                      Explorar tutores
                    </button>
                    <button
                      type="button"
                      onClick={() => openMeetModal(null, 'launch')}
                      className="px-4 py-2 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-semibold cursor-pointer"
                    >
                      Crear sala Meet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {upcomingSessions.map(s => (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[#0F2249] text-white flex flex-col items-center justify-center font-mono-nums shrink-0">
                            <span className="text-sm font-bold leading-none">{s.day}</span>
                            <span className="text-[9px] uppercase text-[#F5C52C] mt-0.5">{s.month}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold uppercase tracking-wider">
                                Próxima
                              </span>
                              {s.urgentUsed && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                  Prioridad urgente
                                </span>
                              )}
                              {s.time && (
                                <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {s.time}
                                </span>
                              )}
                            </div>
                            <h4 className="font-editorial text-lg text-[#0F2249] mt-1 truncate">
                              {s.topic}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Con {s.expertName} · {s.subject}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openMeetModal(s, s.meetUri ? 'join' : 'launch')}
                            className="px-4 py-2.5 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-[#F5C52C]" />
                            <span>{s.meetUri ? 'Unirse por Meet' : 'Lanzar Google Meet'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openMeetModal(s, 'join')}
                            className="px-3.5 py-2.5 rounded-xl bg-[#F3F5F8] hover:bg-slate-200/80 text-[#0F2249] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>{s.meetUri ? 'Cambiar enlace' : 'Unirse con enlace'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setClassroomOpen(true)}
                            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Pizarra
                          </button>

                          {onCompleteSession && (
                            <button
                              type="button"
                              onClick={async () => {
                                await onCompleteSession(s.id);
                                showDashboardToast('Sesión marcada como completada (+60 min, +80 XP).');
                              }}
                              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completada</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Embedded Google Meet Link Strip (when linked to this booked session) */}
                      {s.meetUri && (
                        <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                                Enlace integrado de Google Meet{s.meetCode ? ` · ${s.meetCode}` : ''}
                              </span>
                              <a
                                href={s.meetUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[#0F2249] hover:underline truncate block"
                              >
                                {s.meetUri}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopySessionMeetUri(s.id, s.meetUri!)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[#0F2249] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedSessionId === s.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                            <a
                              href={s.meetUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 rounded-lg bg-[#F5C52C] hover:bg-[#e5b51f] text-[#0F2249] font-bold inline-flex items-center gap-1"
                            >
                              <span>Entrar directo</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#FAFAF5] p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                        <span className="font-bold text-[#0F2249]">Notas de preparación: </span>
                        <span>{s.tutorNotes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Past Sessions */}
            <div className="space-y-3.5">
              <div className="text-[11px] uppercase tracking-[0.14em] font-bold text-slate-500">
                Sesiones completadas ({pastSessions.length})
              </div>
              {pastSessions.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  Aún no tienes sesiones completadas en tu historial. Cuando finalices una tutoría aparecerán aquí junto con tus notas.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {pastSessions.map(s => (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F3F5F8] border border-slate-200/80 text-[#0F2249] flex flex-col items-center justify-center font-mono-nums">
                            <span className="text-xs font-bold">{s.day}</span>
                            <span className="text-[9px] uppercase text-slate-500">{s.month}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#0F2249]">{s.topic}</h4>
                            <p className="text-xs text-slate-500">with {s.expertName} · {s.subject}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBookExpert(EXPERTS_DATA.find(e => e.name === s.expertName) || EXPERTS_DATA[0])}
                          className="px-3.5 py-1.5 text-xs font-bold text-[#0F2249] bg-[#F5C52C] hover:bg-[#e5b51f] rounded-lg transition-colors cursor-pointer"
                        >
                          Rebook
                        </button>
                      </div>

                      <div className="bg-[#FAFAF5] p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                        <div className="font-semibold text-[#0F2249] mb-1">
                          Tutor Feedback &amp; Homework Checklist:
                        </div>
                        <p className="italic">{s.tutorNotes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {communityPosts
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
                              <UserAvatar photoURL={profilePhotoURL} name={user.name} size="sm" className="mt-0.5" />
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
              <WhiteboardCanvas
                sketches={userSketches}
                onSaveSketch={onSaveSketch}
                onDeleteSketch={onDeleteSketch}
              />
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

        {/* Tab 7: Google Chat Workspace Integration */}
        {activeTab === 'google-chat' && (
          <GoogleChatPanel onNotify={showDashboardToast} />
        )}

        {/* Tab 8: Google Classroom Workspace Integration */}
        {activeTab === 'google-classroom' && (
          <GoogleClassroomPanel onNotify={showDashboardToast} />
        )}

        {/* Tab 9: Google Meet Workspace Integration */}
        {activeTab === 'google-meet' && (
          <GoogleMeetPanel onNotify={showDashboardToast} />
        )}

      </main>
      </div>

      {/* Interactive Virtual Live Classroom Modal (Always dark studio outside .portal-light) */}
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
                        <UserAvatar photoURL={user.photoURL} name={user.name} size="lg" shape="rounded" className="mx-auto border border-[#F6C62B]/50" />
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
                  {classroomMessages.map(msg =>
                    msg.sender === 'tutor' ? (
                      <div key={msg.id} className="bg-[#0c162e] border border-slate-800 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-400">{msg.author}</span>
                          <span className="text-slate-500">{msg.time}</span>
                        </div>
                        <p className="text-slate-200">{msg.text}</p>
                      </div>
                    ) : (
                      <div key={msg.id} className="bg-[#0F2249] border border-blue-500/30 p-2.5 rounded-xl space-y-1 text-right">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">{msg.time}</span>
                          <span className="font-bold text-blue-300">{msg.author}</span>
                        </div>
                        <p className="text-white text-left">{msg.text}</p>
                      </div>
                    )
                  )}
                </div>

                <div className="p-3 bg-[#080f21] border-t border-slate-800">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendClassroomMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={classroomChatInput}
                      onChange={e => setClassroomChatInput(e.target.value)}
                      placeholder="Type a message to Daniela..."
                      className="flex-1 bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
                    />
                    <button
                      type="submit"
                      disabled={!classroomChatInput.trim()}
                      className="p-2 rounded-lg bg-[#F6C62B] disabled:opacity-50 text-slate-950 font-bold hover:bg-[#ffd744] transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Plans Discovery Modal (Editorial Split Design) */}
      {plansModalOpen && (() => {
        const planCopy = DASHBOARD_PLANS_PHRASES[plansPhraseIdx];
        return (
          <div
            onClick={e => {
              if (e.target === e.currentTarget) setPlansModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[34%_66%]">
              <div className="editorial-grid-panel p-6 sm:p-7 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
                <div className="space-y-4">
                  <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
                    {planCopy.badge}
                  </div>
                  <div>
                    <h3 className="font-editorial text-2xl leading-[1.08] text-[#0F2249]">
                      {planCopy.line1}
                      <br />
                      {planCopy.line2}
                    </h3>
                    <div className="mt-1 inline-block">
                      <span className="font-serif-accent text-2xl text-[#0F2249] block">
                        {planCopy.accent}
                      </span>
                      <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">{planCopy.desc}</p>
                </div>
                <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
                  IA 24/7  /  TUTORÍAS  /  CAMBIA CUANDO QUIERAS
                </div>
              </div>

              <div className="bg-white p-6 sm:p-7 relative space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                      Tu membresía
                    </div>
                    <h4 className="font-editorial text-xl text-[#0F2249]">Elige el plan ideal</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlansModalOpen(false)}
                    aria-label="Cerrar planes"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  {[
                    { name: 'Starter', price: 'Q120', desc: '1 hora de tutoría + 50 preguntas de IA al mes', accent: false },
                    { name: 'Plus', price: 'Q240', desc: '3 horas de tutoría + IA ilimitada + notas de pizarra', accent: true },
                    { name: 'Unlimited STEM', price: 'Q450', desc: '6 horas de tutoría + IA ilimitada + matching prioritario', accent: false }
                  ].map(p => (
                    <div
                      key={p.name}
                      className={`rounded-2xl p-4 border flex flex-col justify-between space-y-4 ${
                        p.accent ? 'bg-[#0F2249] text-white border-[#0F2249]' : 'bg-[#FAFAF5] text-[#0F2249] border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-editorial text-lg">{p.name}</div>
                        <div className="font-editorial text-2xl mt-2">
                          {p.price}
                          <span className="text-[11px] font-sans opacity-75"> /mes</span>
                        </div>
                        <p className={`text-[11px] mt-2 leading-relaxed ${p.accent ? 'text-slate-300' : 'text-slate-600'}`}>
                          {p.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPlansModalOpen(false);
                          if (onUpdateProfile) {
                            onUpdateProfile({ plan: `${p.name} (${p.price}/mes)` });
                          }
                          showDashboardToast(`Plan ${p.name} seleccionado en tu portal.`);
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                          p.accent ? 'bg-[#F5C52C] hover:bg-[#eab921] text-[#0F2249]' : 'bg-[#0F2249] hover:bg-[#19346b] text-white'
                        }`}
                      >
                        Elegir {p.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Help & Support Modal (Editorial Split Design) */}
      {helpModalOpen && (() => {
        const helpCopy = DASHBOARD_HELP_PHRASES[helpPhraseIdx];
        return (
          <div
            onClick={e => {
              if (e.target === e.currentTarget) setHelpModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-[780px] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[44%_56%]">
              <div className="editorial-grid-panel p-6 sm:p-7 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200/80">
                <div className="space-y-4">
                  <div className="inline-block bg-[#F5C52C] text-[#0F2249] text-[10px] font-extrabold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md">
                    {helpCopy.badge}
                  </div>
                  <div>
                    <h3 className="font-editorial text-2xl leading-[1.08] text-[#0F2249]">
                      {helpCopy.line1}
                      <br />
                      {helpCopy.line2}
                    </h3>
                    <div className="mt-1 inline-block">
                      <span className="font-serif-accent text-2xl text-[#0F2249] block">
                        {helpCopy.accent}
                      </span>
                      <div className="h-[4px] w-full bg-[#F5C52C] rounded-full mt-1" />
                    </div>
                  </div>
                </div>
                <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-slate-500">
                  IA 24/7  /  CLASSROOM  /  TUTORÍAS
                </div>
              </div>

              <div className="bg-white p-6 sm:p-7 relative flex flex-col justify-center space-y-5">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  aria-label="Cerrar ayuda"
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500">
                    Centro de ayuda
                  </div>
                  <h3 className="font-editorial text-2xl text-[#0F2249] mt-0.5 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#0F2249]" />
                    <span>¿En qué te apoyamos?</span>
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  ¿Necesitas ayuda con tus sesiones, Google Classroom o apuntes? Puedes consultar a ProLnk AI las 24 horas o apartar una tutoría con un especialista verificado.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHelpModalOpen(false);
                      setActiveTab('ai-chat');
                    }}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-[#F5C52C] hover:bg-[#eab921] text-[#0F2249] font-bold text-xs cursor-pointer transition-colors"
                  >
                    Ir a AI Tutor 24/7
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHelpModalOpen(false);
                      setActiveTab('tutors');
                    }}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs cursor-pointer transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <span>Buscar tutor</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Google Meet Launch / Join Modal */}
      <GoogleMeetModal
        isOpen={meetModalOpen}
        onClose={() => setMeetModalOpen(false)}
        session={meetModalSession}
        initialMode={meetModalMode}
        onSpaceLinked={handleSessionMeetLinked}
        onNotify={showDashboardToast}
      />

      {/* Dashboard Toast */}
      {dashboardToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2249] text-white border-2 border-[#F6C62B] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#F6C62B] shrink-0" />
          <span>{dashboardToast}</span>
        </div>
      )}
    </>
  );
};
