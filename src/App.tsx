/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LearningPillarsSection } from './components/LearningPillarsSection';
import { UnderstandSpaceSection } from './components/UnderstandSpaceSection';
import { HowItWorks } from './components/HowItWorks';
import { MarketResearch } from './components/MarketResearch';
import { ExpertDirectory } from './components/ExpertDirectory';
import { CommunityAndDashboard } from './components/CommunityAndDashboard';
import { PricingSection } from './components/PricingSection';
import { AboutAndTeam } from './components/AboutAndTeam';
import { FAQ } from './components/FAQ';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { BookingModal, TrialModal, LoginModal, QuestionModal, ContactModal } from './components/Modals';
import { AuthUser, Expert, ForumPost, DashboardSession, PublicPage, UserTask, SavedSketch } from './types';
import { EXPERTS_DATA, FORUM_POSTS } from './data/mockData';
import { CheckCircle2, X } from 'lucide-react';
import { onAuthStatusChange, logoutUser } from './firebase/authService';
import { auth } from './firebase/config';
import {
  UserProfileData,
  saveUserProfile,
  getUserProfile,
  syncDailyStudyStreak,
  updateUserStats,
  getLocalDateKey,
  getUserSessions,
  saveUserSession,
  updateUserSessionMeet,
  updateUserSessionStatus,
  getUserTasks,
  saveUserTask,
  toggleUserTask,
  deleteUserTask,
  getUserSketches,
  saveUserSketch,
  deleteUserSketch,
  getForumPosts,
  createForumPost,
  updatePostVotes
} from './firebase/firestoreService';

export type { AuthUser } from './types';

function toAuthUser(
  uid: string,
  fallbackName: string,
  fallbackEmail: string,
  fallbackPhoto: string | undefined,
  profile: UserProfileData | null,
  extra?: { semester?: string }
): AuthUser {
  return {
    uid,
    name: profile?.name || fallbackName || 'Student',
    email: profile?.email || fallbackEmail || '',
    photoURL: profile?.photoURL?.trim() || fallbackPhoto?.trim() || undefined,
    plan: profile?.plan || '3-Day Free Trial',
    daysLeft: 3,
    bio: profile?.bio || '',
    university: profile?.university || '',
    major: profile?.major || '',
    semester: profile?.semester || extra?.semester || '',
    targetSubjects: Array.isArray(profile?.targetSubjects) ? profile.targetSubjects : [],
    learningGoal: profile?.learningGoal || '',
    streakDays: typeof profile?.streakDays === 'number' ? profile.streakDays : 1,
    xpPoints: typeof profile?.xpPoints === 'number' ? profile.xpPoints : 0,
    questionsResolved: typeof profile?.questionsResolved === 'number' ? profile.questionsResolved : 0,
    tutoringMinutes: typeof profile?.tutoringMinutes === 'number' ? profile.tutoringMinutes : 0,
    notesSavedCount: typeof profile?.notesSavedCount === 'number' ? profile.notesSavedCount : 0,
    forumPostsCount: typeof profile?.forumPostsCount === 'number' ? profile.forumPostsCount : 0,
    lastActiveDate: profile?.lastActiveDate || getLocalDateKey(),
    aiExplanationStyle: profile?.aiExplanationStyle === 'quick' ? 'quick' : 'detailed',
    emailNotifications: typeof profile?.emailNotifications === 'boolean' ? profile.emailNotifications : true,
    sessionReminders: typeof profile?.sessionReminders === 'boolean' ? profile.sessionReminders : true
  };
}

export default function App() {
  // Global Theme state (Light Alabaster default, toggleable to Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('prolnk_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDarkMode);
    try {
      localStorage.setItem('prolnk_theme', isDarkMode ? 'dark' : 'light');
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Authentication & View state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'profile'>('landing');

  // Multi-page public routing synced with URL hash
  const parsePageFromHash = (): PublicPage => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash === 'how' || hash === 'how-it-works' || hash === 'faq' || hash === 'privacy') return 'how';
    if (hash === 'experts' || hash === 'tutoring') return 'experts';
    if (hash === 'community') return 'community';
    if (hash === 'pricing') return 'pricing';
    if (hash === 'about' || hash === 'team') return 'about';
    return 'home';
  };

  const [activePage, setActivePage] = useState<PublicPage>(() => parsePageFromHash());
  const [assistantTopicPrefill, setAssistantTopicPrefill] = useState<{
    subject: string;
    prompt: string;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(parsePageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateToPage = (page: PublicPage, sectionId?: string) => {
    setActivePage(page);
    const hashMap: Record<PublicPage, string> = {
      home: '#/',
      how: '#/how-it-works',
      experts: '#/experts',
      community: '#/community',
      pricing: '#/pricing',
      about: '#/about'
    };
    if (window.location.hash !== hashMap[page]) {
      window.history.pushState(null, '', hashMap[page]);
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Firestore persistent per-user state
  const [userSessions, setUserSessions] = useState<DashboardSession[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [userSketches, setUserSketches] = useState<SavedSketch[]>([]);
  const [communityPosts, setCommunityPosts] = useState<ForumPost[]>(FORUM_POSTS);
  const currentUserRef = React.useRef<AuthUser | null>(null);
  currentUserRef.current = currentUser;

  // Modals state
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialInitialEmail, setTrialInitialEmail] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Global toast notification & fatal Firestore permission error state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  const handleServiceError = (err: unknown) => {
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && typeof parsed.operationType === 'string' && typeof parsed.error === 'string') {
          if (parsed.error.toLowerCase().includes('permission') || parsed.error.toLowerCase().includes('insufficient')) {
            setFatalError(err);
            return;
          }
        }
      } catch {
        // non-JSON error
      }
    }
    console.warn('Firestore operation notice:', err);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadUserPortalData = async (uid: string) => {
    const [sessions, tasks, sketches] = await Promise.all([
      getUserSessions(uid),
      getUserTasks(uid),
      getUserSketches(uid)
    ]);
    setUserSessions(sessions);
    setUserTasks(tasks);
    setUserSketches(sketches);
  };

  // Sync with Firebase Auth and Firestore on mount
  useEffect(() => {
    getForumPosts()
      .then(posts => {
        if (posts && posts.length > 0) {
          setCommunityPosts(posts);
        }
      })
      .catch(err => handleServiceError(err));

    const unsubscribe = onAuthStatusChange(async firebaseUser => {
      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid);

          if (!profile) {
            const initialProfile: UserProfileData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL?.trim() || '',
              plan: '3-Day Free Trial',
              role: 'student',
              createdAt: new Date().toISOString(),
              streakDays: 1,
              xpPoints: 0,
              questionsResolved: 0,
              tutoringMinutes: 0,
              notesSavedCount: 0,
              forumPostsCount: 0,
              lastActiveDate: getLocalDateKey(),
              aiExplanationStyle: 'detailed',
              emailNotifications: true,
              sessionReminders: true
            };
            await saveUserProfile(initialProfile);
            profile = initialProfile;
          } else {
            const streakUpdate = await syncDailyStudyStreak(firebaseUser.uid, profile);
            profile = {
              ...profile,
              streakDays: streakUpdate.streakDays,
              lastActiveDate: streakUpdate.lastActiveDate
            };
          }

          const user = toAuthUser(
            firebaseUser.uid,
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
            firebaseUser.email || '',
            firebaseUser.photoURL || undefined,
            profile
          );
          setCurrentUser(user);

          await loadUserPortalData(firebaseUser.uid);
        } catch (e) {
          handleServiceError(e);
        }
      } else {
        setCurrentUser(null);
        setUserSessions([]);
        setUserTasks([]);
        setUserSketches([]);
        try {
          localStorage.removeItem('prolnk_user');
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRegisterUser = async (
    name: string,
    email: string,
    uid?: string,
    photoURL?: string,
    extra?: { semester?: string }
  ) => {
    const activeUid = uid || auth.currentUser?.uid;
    if (!activeUid) {
      showToast('Please complete Firebase sign-up to activate your account.');
      return;
    }

    const cleanPhoto = photoURL?.trim() || undefined;
    let profile: UserProfileData | null = null;
    try {
      profile = await getUserProfile(activeUid);
      if (!profile) {
        const newProfile: UserProfileData = {
          id: activeUid,
          name: name || 'Student',
          email,
          photoURL: cleanPhoto ?? '',
          plan: '3-Day Free Trial',
          role: 'student',
          createdAt: new Date().toISOString(),
          semester: extra?.semester || '',
          streakDays: 1,
          xpPoints: 0,
          questionsResolved: 0,
          tutoringMinutes: 0,
          notesSavedCount: 0,
          forumPostsCount: 0,
          lastActiveDate: getLocalDateKey(),
          aiExplanationStyle: 'detailed',
          emailNotifications: true,
          sessionReminders: true
        };
        await saveUserProfile(newProfile);
        profile = newProfile;
      } else if (extra?.semester && !profile.semester) {
        await saveUserProfile({ ...profile, semester: extra.semester });
        profile = { ...profile, semester: extra.semester };
      }
    } catch (err) {
      handleServiceError(err);
    }

    const newUser = toAuthUser(activeUid, name, email, cleanPhoto, profile, extra);
    setCurrentUser(newUser);
    setTrialModalOpen(false);
    setLoginModalOpen(false);

    try {
      await loadUserPortalData(activeUid);
    } catch (err) {
      handleServiceError(err);
    }

    setCurrentView('dashboard');
    showToast(`Account created! Welcome to your ProLnk Portal, ${newUser.name}.`);
  };

  const handleLoginUser = async (name: string, email: string, uid?: string, photoURL?: string) => {
    const activeUid = uid || auth.currentUser?.uid;
    if (!activeUid) {
      showToast('Please sign in with your Firebase account credentials.');
      return;
    }

    let existingProfile: UserProfileData | null = null;
    try {
      existingProfile = await getUserProfile(activeUid);
      if (!existingProfile) {
        const initialProfile: UserProfileData = {
          id: activeUid,
          name: name || 'Student',
          email,
          photoURL: photoURL?.trim() || '',
          plan: '3-Day Free Trial',
          role: 'student',
          createdAt: new Date().toISOString(),
          streakDays: 1,
          xpPoints: 0,
          questionsResolved: 0,
          tutoringMinutes: 0,
          notesSavedCount: 0,
          forumPostsCount: 0,
          lastActiveDate: getLocalDateKey(),
          aiExplanationStyle: 'detailed',
          emailNotifications: true,
          sessionReminders: true
        };
        await saveUserProfile(initialProfile);
        existingProfile = initialProfile;
      } else {
        const streakUpdate = await syncDailyStudyStreak(activeUid, existingProfile);
        existingProfile = {
          ...existingProfile,
          streakDays: streakUpdate.streakDays,
          lastActiveDate: streakUpdate.lastActiveDate
        };
      }
    } catch (err) {
      handleServiceError(err);
    }

    const user = toAuthUser(activeUid, name, email, photoURL, existingProfile);
    setCurrentUser(user);
    setTrialModalOpen(false);
    setLoginModalOpen(false);

    try {
      await loadUserPortalData(activeUid);
    } catch (err) {
      handleServiceError(err);
    }

    setCurrentView('dashboard');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogOut = async () => {
    try {
      await logoutUser();
    } catch {}
    setCurrentUser(null);
    setUserSessions([]);
    setUserTasks([]);
    setUserSketches([]);
    setCurrentView('landing');
    try {
      localStorage.removeItem('prolnk_user');
    } catch {}
    showToast('You have logged out.');
  };

  const handleBookExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setBookingModalOpen(true);
  };

  const handleBookingConfirmed = async (details: { expertName: string; topic: string; total: number; date: string }) => {
    const now = new Date();
    const newSession: DashboardSession = {
      id: `session-${Date.now()}`,
      date: details.date,
      day: details.date.split(' ')[0] || `${now.getDate()}`,
      month: now.toLocaleDateString('en-US', { month: 'short' }),
      topic: details.topic || 'Tutoring Session',
      expertName: details.expertName,
      subject: details.topic || 'General Tutoring',
      tutorNotes: `Confirmed 1-on-1 session with ${details.expertName}. Meet link sent to your email (${currentUser?.email || 'email'}).`,
      status: 'upcoming',
      time: details.date.includes('·') ? details.date.split('·')[1].trim() : 'Scheduled'
    };

    setUserSessions(prev => [newSession, ...prev]);

    if (currentUser?.uid && auth.currentUser?.uid === currentUser.uid) {
      try {
        await saveUserSession(currentUser.uid, newSession);
      } catch (err) {
        handleServiceError(err);
      }
    }

    showToast(`Session booked with ${details.expertName} for Q${details.total}! Check your portal for the room link.`);
  };

  const handleAwardActivity = async (deltas: {
    xpDelta?: number;
    questionsDelta?: number;
    tutoringMinutesDelta?: number;
  }) => {
    const active = currentUserRef.current;
    if (!active?.uid) return;

    const today = getLocalDateKey();
    const nextXp = active.xpPoints + (deltas.xpDelta || 0);
    const nextQuestions = active.questionsResolved + (deltas.questionsDelta || 0);
    const nextMinutes = active.tutoringMinutes + (deltas.tutoringMinutesDelta || 0);

    const updatedUser: AuthUser = {
      ...active,
      xpPoints: nextXp,
      questionsResolved: nextQuestions,
      tutoringMinutes: nextMinutes,
      lastActiveDate: today
    };
    currentUserRef.current = updatedUser;
    setCurrentUser(updatedUser);

    if (auth.currentUser?.uid === active.uid) {
      try {
        await updateUserStats(active.uid, {
          xpPoints: nextXp,
          questionsResolved: nextQuestions,
          tutoringMinutes: nextMinutes,
          lastActiveDate: today
        });
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleAttachMeetToSession = async (
    sessionId: string,
    space: { meetingUri: string; meetingCode?: string }
  ) => {
    setUserSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              meetUri: space.meetingUri,
              meetCode: space.meetingCode
            }
          : s
      )
    );

    const activeUid = currentUserRef.current?.uid;
    if (activeUid && auth.currentUser?.uid === activeUid) {
      try {
        await updateUserSessionMeet(activeUid, sessionId, space.meetingUri, space.meetingCode);
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    const existing = userSessions.find(s => s.id === sessionId);
    if (!existing || existing.status === 'completed') return;

    setUserSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'completed' } : s))
    );

    const activeUid = currentUserRef.current?.uid;
    if (activeUid && auth.currentUser?.uid === activeUid) {
      try {
        await updateUserSessionStatus(activeUid, sessionId, 'completed');
      } catch (err) {
        handleServiceError(err);
      }
    }

    await handleAwardActivity({ xpDelta: 80, tutoringMinutesDelta: 60 });
    showToast('Session marked as completed! +60 min & +80 XP added to your account.');
  };

  const handleAddTask = async (task: UserTask) => {
    setUserTasks(prev => [task, ...prev]);
    const activeUid = currentUserRef.current?.uid;
    if (activeUid && auth.currentUser?.uid === activeUid) {
      try {
        await saveUserTask(activeUid, task);
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setUserTasks(prev => prev.map(t => (t.id === taskId ? { ...t, completed } : t)));
    const activeUid = currentUserRef.current?.uid;
    if (activeUid && auth.currentUser?.uid === activeUid) {
      try {
        await toggleUserTask(activeUid, taskId, completed);
        if (completed) {
          await handleAwardActivity({ xpDelta: 15 });
        }
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setUserTasks(prev => prev.filter(t => t.id !== taskId));
    const activeUid = currentUserRef.current?.uid;
    if (activeUid && auth.currentUser?.uid === activeUid) {
      try {
        await deleteUserTask(activeUid, taskId);
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleSaveSketch = async (sketch: SavedSketch) => {
    let nextCount = userSketches.length + 1;
    setUserSketches(prev => {
      const exists = prev.some(s => s.id === sketch.id);
      const next = exists ? prev.map(s => (s.id === sketch.id ? sketch : s)) : [sketch, ...prev];
      nextCount = next.length;
      return next;
    });

    const active = currentUserRef.current;
    if (active?.uid && auth.currentUser?.uid === active.uid) {
      const nextXp = active.xpPoints + 10;
      const updatedUser: AuthUser = {
        ...active,
        notesSavedCount: nextCount,
        xpPoints: nextXp,
        lastActiveDate: getLocalDateKey()
      };
      currentUserRef.current = updatedUser;
      setCurrentUser(updatedUser);

      try {
        await saveUserSketch(active.uid, sketch);
        await updateUserStats(active.uid, {
          notesSavedCount: nextCount,
          xpPoints: nextXp,
          lastActiveDate: getLocalDateKey()
        });
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleDeleteSketch = async (sketchId: string) => {
    let nextCount = Math.max(0, userSketches.length - 1);
    setUserSketches(prev => {
      const next = prev.filter(s => s.id !== sketchId);
      nextCount = next.length;
      return next;
    });

    const active = currentUserRef.current;
    if (active?.uid && auth.currentUser?.uid === active.uid) {
      const updatedUser: AuthUser = { ...active, notesSavedCount: nextCount };
      currentUserRef.current = updatedUser;
      setCurrentUser(updatedUser);

      try {
        await deleteUserSketch(active.uid, sketchId);
        await updateUserStats(active.uid, { notesSavedCount: nextCount });
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleSelectPlan = (_planName: string, _price: string) => {
    if (!currentUser) {
      setTrialModalOpen(true);
    } else {
      setSelectedExpert(EXPERTS_DATA[0]);
      setBookingModalOpen(true);
    }
  };

  const handlePostQuestion = async (title: string, category: string, previewText?: string) => {
    const active = currentUserRef.current;
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title,
      author: active ? `${active.name} (Student)` : 'Guest Student',
      category,
      repliesCount: 0,
      votes: 1,
      userVoted: true,
      hasExpertAnswer: false,
      previewText: previewText?.trim() || 'Awaiting first community or expert breakdown...',
      timeAgo: 'Just now'
    };

    setCommunityPosts(prev => [newPost, ...prev]);

    if (active?.uid && auth.currentUser?.uid === active.uid) {
      try {
        await createForumPost(newPost, active.uid);
        const nextPostsCount = active.forumPostsCount + 1;
        const nextXp = active.xpPoints + 20;
        const updatedUser: AuthUser = {
          ...active,
          forumPostsCount: nextPostsCount,
          xpPoints: nextXp,
          lastActiveDate: getLocalDateKey()
        };
        currentUserRef.current = updatedUser;
        setCurrentUser(updatedUser);
        await updateUserStats(active.uid, {
          forumPostsCount: nextPostsCount,
          xpPoints: nextXp,
          lastActiveDate: getLocalDateKey()
        });
        showToast(`Your question in ${category} was posted to the community!`);
      } catch (err) {
        handleServiceError(err);
      }
    } else {
      showToast('Preview posted locally! Sign in to publish your question permanently.');
    }
  };

  const handleVoteQuestion = async (postId: string) => {
    let voteDelta: 1 | -1 | null = null;
    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const hasVoted = p.userVoted;
          voteDelta = hasVoted ? -1 : 1;
          const nextVotes = Math.max(0, p.votes + voteDelta);
          return {
            ...p,
            votes: nextVotes,
            userVoted: !hasVoted
          };
        }
        return p;
      })
    );

    if (voteDelta !== null && currentUser?.uid && auth.currentUser) {
      try {
        await updatePostVotes(postId, voteDelta);
      } catch (err) {
        handleServiceError(err);
      }
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<AuthUser>) => {
    const active = currentUserRef.current;
    if (!active) return;
    const normalizedPhoto =
      'photoURL' in updatedData
        ? updatedData.photoURL?.trim() || undefined
        : active.photoURL;
    const updated: AuthUser = { ...active, ...updatedData, photoURL: normalizedPhoto };
    currentUserRef.current = updated;
    setCurrentUser(updated);

    if (active.uid && auth.currentUser?.uid === active.uid) {
      try {
        await saveUserProfile({
          id: active.uid,
          name: updated.name,
          email: updated.email,
          photoURL: 'photoURL' in updatedData ? updatedData.photoURL?.trim() || '' : updated.photoURL,
          plan: updated.plan,
          role: 'student',
          createdAt: new Date().toISOString(),
          bio: updated.bio,
          university: updated.university,
          major: updated.major,
          semester: updated.semester,
          targetSubjects: updated.targetSubjects,
          learningGoal: updated.learningGoal,
          streakDays: updated.streakDays,
          xpPoints: updated.xpPoints,
          questionsResolved: updated.questionsResolved,
          tutoringMinutes: updated.tutoringMinutes,
          notesSavedCount: updated.notesSavedCount,
          forumPostsCount: updated.forumPostsCount,
          lastActiveDate: updated.lastActiveDate,
          aiExplanationStyle: updated.aiExplanationStyle,
          emailNotifications: updated.emailNotifications,
          sessionReminders: updated.sessionReminders
        });
      } catch (err) {
        handleServiceError(err);
        return;
      }
    }
    showToast('Your profile has been updated successfully!');
  };

  const handleSelectSubjectFromHero = (prompt: string) => {
    setAssistantTopicPrefill({
      subject: 'Subject',
      prompt,
      nonce: Date.now()
    });
    const el = document.getElementById('asistente');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dedicated Full-Page Student Profile View
  if (currentView === 'profile' && currentUser) {
    return (
      <ProfilePage
        user={currentUser}
        sessionsCount={userSessions.length}
        onBackToDashboard={() => setCurrentView('dashboard')}
        onViewLandingPage={() => {}}
        onLogOut={handleLogOut}
        onUpdateProfile={handleUpdateProfile}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Authenticated Student Portal Dashboard
  if (currentUser) {
    return (
      <>
        <Dashboard
          user={currentUser}
          sessions={userSessions}
          tasks={userTasks}
          sketches={userSketches}
          posts={communityPosts}
          onVotePost={handleVoteQuestion}
          onPostQuestion={handlePostQuestion}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onSaveSketch={handleSaveSketch}
          onDeleteSketch={handleDeleteSketch}
          onCompleteSession={handleCompleteSession}
          onAwardActivity={handleAwardActivity}
          onLogOut={handleLogOut}
          onViewLandingPage={() => {}}
          onBookExpert={handleBookExpert}
          onAttachMeetToSession={handleAttachMeetToSession}
          onUpdateProfile={handleUpdateProfile}
          onOpenProfile={() => setCurrentView('profile')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <BookingModal
          expert={selectedExpert}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingConfirmed={handleBookingConfirmed}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border border-slate-700/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#F5C52C] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </>
    );
  }

  // Public Multi-Page Editorial Site
  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#0F2249] flex flex-col font-sans selection:bg-[#F5C52C]/40 selection:text-[#0F2249]">
      {/* Top Header */}
      <Header
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        currentUser={currentUser}
        onGoToDashboard={() => setCurrentView('dashboard')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        activePage={activePage}
        onNavigate={page => navigateToPage(page)}
      />

      {/* Separated Public Pages */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <Hero
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onExploreExperts={() => navigateToPage('experts')}
              onSelectSubject={handleSelectSubjectFromHero}
              onScrollToAssistant={() => {
                document.getElementById('asistente')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <LearningPillarsSection onNavigate={navigateToPage} />

            <UnderstandSpaceSection
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onExploreHow={() => navigateToPage('how')}
              onBookExpert={handleBookExpert}
              prefilledTopic={assistantTopicPrefill}
              isSubscribed={!!currentUser}
            />

            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}

        {activePage === 'how' && (
          <>
            <HowItWorks />
            <UnderstandSpaceSection
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onBookExpert={handleBookExpert}
              prefilledTopic={assistantTopicPrefill}
              isSubscribed={!!currentUser}
            />
            <FAQ />
            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}

        {activePage === 'experts' && (
          <>
            <ExpertDirectory
              onBookExpert={handleBookExpert}
              defaultShowAll={true}
            />
            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}

        {activePage === 'community' && (
          <>
            <CommunityAndDashboard
              onBookExpert={handleBookExpert}
              onOpenQuestionModal={() => setQuestionModalOpen(true)}
              posts={communityPosts}
              onVotePost={handleVoteQuestion}
              defaultShowAll={true}
            />
            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}

        {activePage === 'pricing' && (
          <>
            <PricingSection
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onSelectPlan={handleSelectPlan}
            />
            <FAQ />
            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}

        {activePage === 'about' && (
          <>
            <AboutAndTeam />
            <MarketResearch />
            <CtaBanner onOpenTrialModal={() => setTrialModalOpen(true)} />
          </>
        )}
      </main>

      {/* Dark Navy Footer */}
      <Footer
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenContactModal={() => setContactModalOpen(true)}
        isDarkMode={isDarkMode}
        onNavigate={navigateToPage}
      />

      {/* Interactive Modals */}
      <BookingModal
        expert={selectedExpert}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <TrialModal
        isOpen={trialModalOpen}
        initialEmail={trialInitialEmail}
        onClose={() => {
          setTrialModalOpen(false);
          setTrialInitialEmail('');
        }}
        onRegister={handleRegisterUser}
        onLogin={handleLoginUser}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginUser}
        onRegister={handleRegisterUser}
      />

      <QuestionModal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSubmitQuestion={handlePostQuestion}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border border-slate-700/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#F5C52C] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
