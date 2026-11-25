/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpeedLadder } from './components/SpeedLadder';
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
import { ChatbotWidget } from './components/ChatbotWidget';
import { Expert, ForumPost, DashboardSession, PublicPage } from './types';
import { EXPERTS_DATA, USER_PAST_SESSIONS, FORUM_POSTS } from './data/mockData';
import { CheckCircle2, X } from 'lucide-react';
import { onAuthStatusChange, logoutUser } from './firebase/authService';
import { auth } from './firebase/config';
import {
  saveUserProfile,
  getUserProfile,
  getUserSessions,
  saveUserSession,
  getForumPosts,
  createForumPost,
  updatePostVotes
} from './firebase/firestoreService';

export interface AuthUser {
  uid?: string;
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
  isDemo?: boolean;
}

export default function App() {
  // Global Theme state (Light Ivory Studio default, toggleable to Dark Mode)
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
    if (hash === 'experts') return 'experts';
    if (hash === 'community') return 'community';
    if (hash === 'pricing') return 'pricing';
    if (hash === 'about' || hash === 'team') return 'about';
    return 'home';
  };

  const [activePage, setActivePage] = useState<PublicPage>(() => parsePageFromHash());

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

  // Firestore persistent state
  const [userSessions, setUserSessions] = useState<DashboardSession[]>(USER_PAST_SESSIONS);
  const [communityPosts, setCommunityPosts] = useState<ForumPost[]>(FORUM_POSTS);

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

  // Sync with Firebase Auth and Firestore on mount
  useEffect(() => {
    // 1. Fetch community posts from Firestore
    getForumPosts()
      .then(posts => {
        if (posts && posts.length > 0) {
          setCommunityPosts(posts);
        }
      })
      .catch(err => handleServiceError(err));

    // 2. Listen to Firebase Auth state (no unauthenticated localStorage bypass)
    const unsubscribe = onAuthStatusChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          const user: AuthUser = {
            uid: firebaseUser.uid,
            name: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
            email: firebaseUser.email || '',
            photoURL: profile?.photoURL || firebaseUser.photoURL || undefined,
            plan: profile?.plan || '3-Day Free Trial',
            daysLeft: 3,
            bio: profile?.bio || 'University student focused on mastering calculus and physics with ProLnk.',
            university: profile?.university || 'Universidad del Valle de Guatemala',
            major: profile?.major || 'Computer Science & Engineering',
            semester: profile?.semester || '4th Semester',
            targetSubjects: profile?.targetSubjects || ['Differential Calculus', 'Physics II', 'Linear Algebra'],
            learningGoal: profile?.learningGoal || 'Maintain a GPA above 90 and master multivariable calculus.',
            streakDays: profile?.streakDays ?? 5,
            xpPoints: profile?.xpPoints ?? 840
          };
          setCurrentUser(user);

          // Fetch sessions from Firestore
          const sessions = await getUserSessions(firebaseUser.uid);
          if (sessions && sessions.length > 0) {
            setUserSessions(sessions);
          }
        } catch (e) {
          handleServiceError(e);
        }
      } else {
        setCurrentUser(prev => (prev?.isDemo ? prev : null));
        setUserSessions(USER_PAST_SESSIONS);
        try {
          localStorage.removeItem('prolnk_user');
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRegisterUser = async (name: string, email: string, uid?: string, photoURL?: string) => {
    const activeUid = uid || auth.currentUser?.uid;
    if (!activeUid) {
      showToast('Please complete Firebase sign-up to activate your account.');
      return;
    }

    const newUser: AuthUser = {
      uid: activeUid,
      name: name || 'Student',
      email: email,
      photoURL,
      plan: '3-Day Free Trial',
      daysLeft: 3
    };
    setCurrentUser(newUser);

    // Persist to Firestore
    try {
      await saveUserProfile({
        id: activeUid,
        name: newUser.name,
        email: newUser.email,
        photoURL,
        plan: newUser.plan,
        role: 'student',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleServiceError(err);
    }

    setCurrentView('dashboard');
    showToast(`Account created! Welcome to your ProLnk Dashboard, ${newUser.name}.`);
  };

  const handleLoginUser = async (name: string, email: string, uid?: string, photoURL?: string) => {
    const activeUid = uid || auth.currentUser?.uid;
    if (!activeUid) {
      showToast('Please sign in with your Firebase account credentials.');
      return;
    }

    const user: AuthUser = {
      uid: activeUid,
      name: name || 'Pablo Vettorazzi',
      email: email,
      photoURL,
      plan: '3-Day Free Trial',
      daysLeft: 3
    };
    setCurrentUser(user);

    // Persist / update to Firestore
    try {
      await saveUserProfile({
        id: activeUid,
        name: user.name,
        email: user.email,
        photoURL,
        plan: user.plan,
        role: 'student',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleServiceError(err);
    }

    // Load sessions from Firestore
    try {
      const sessions = await getUserSessions(activeUid);
      if (sessions && sessions.length > 0) {
        setUserSessions(sessions);
      }
    } catch (err) {
      handleServiceError(err);
    }

    setCurrentView('dashboard');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleEnterDemoPortal = () => {
    const demoUser: AuthUser = {
      uid: 'demo-student-pablo',
      name: 'Pablo Vettorazzi',
      email: 'Pablovettorazzia@hotmail.com',
      plan: 'Study Pass (Demo)',
      daysLeft: 14,
      bio: 'University student focused on mastering multivariable calculus, physics, and computer science on ProLnk.',
      university: 'Universidad del Valle de Guatemala',
      major: 'Computer Science & Engineering',
      semester: '4th Semester',
      targetSubjects: ['Multivariable Calculus', 'Physics II', 'Linear Algebra'],
      learningGoal: 'Master integration techniques and maintain a GPA above 90.',
      streakDays: 12,
      xpPoints: 1420,
      isDemo: true
    };
    setCurrentUser(demoUser);
    setUserSessions(USER_PAST_SESSIONS);
    setLoginModalOpen(false);
    setTrialModalOpen(false);
    setCurrentView('dashboard');
    showToast('Entered Demo Portal as Pablo Vettorazzi. All features unlocked!');
  };

  const handleLogOut = async () => {
    try {
      await logoutUser();
    } catch {}
    setCurrentUser(null);
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
      tutorNotes: `Confirmed 1-on-1 session with ${details.expertName}. Meet link sent to your registered email (${currentUser?.email || 'email'}).`,
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

    showToast(`Session booked with ${details.expertName} for Q${details.total}! Check your email for room link.`);
  };

  const handleSelectPlan = (_planName: string, _price: string) => {
    if (!currentUser) {
      setTrialModalOpen(true);
    } else {
      setSelectedExpert(EXPERTS_DATA[0]);
      setBookingModalOpen(true);
    }
  };

  const handlePostQuestion = async (title: string, category: string) => {
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title,
      author: currentUser ? `${currentUser.name} (Student)` : 'Guest Student',
      category,
      repliesCount: 0,
      votes: 1,
      userVoted: true,
      hasExpertAnswer: false,
      previewText: 'Awaiting first community or expert breakdown...',
      timeAgo: 'Just now'
    };

    setCommunityPosts(prev => [newPost, ...prev]);

    if (currentUser?.uid && auth.currentUser?.uid === currentUser.uid) {
      try {
        await createForumPost(newPost, currentUser.uid);
        showToast(`Your question "${title.substring(0, 30)}..." in ${category} was posted to the community!`);
      } catch (err) {
        handleServiceError(err);
      }
    } else {
      showToast('Preview posted locally! Sign up or log in to publish your question permanently.');
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

  const scrollToExperts = () => {
    navigateToPage('experts');
  };

  const handleUpdateProfile = async (updatedData: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated: AuthUser = { ...currentUser, ...updatedData };
    setCurrentUser(updated);

    if (currentUser.uid && auth.currentUser?.uid === currentUser.uid) {
      try {
        await saveUserProfile({
          id: currentUser.uid,
          name: updated.name,
          email: updated.email,
          photoURL: updated.photoURL,
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
          xpPoints: updated.xpPoints
        });
      } catch (err) {
        handleServiceError(err);
        return;
      }
    }
    showToast('Your profile has been updated successfully!');
  };

  // Dedicated Full-Page Student Profile View (Separate Page with Natural Smooth Scrolling)
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

  // If a student is authenticated / has dashboard open, they CANNOT navigate to the landing page
  // unless they go to their profile section and click "Cerrar Sesión"!
  if (currentUser) {
    return (
      <>
        <Dashboard
          user={currentUser}
          sessions={userSessions}
          posts={communityPosts}
          onVotePost={handleVoteQuestion}
          onLogOut={handleLogOut}
          onViewLandingPage={() => {}}
          onBookExpert={handleBookExpert}
          onUpdateProfile={handleUpdateProfile}
          onOpenProfile={() => setCurrentView('profile')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Modals in dashboard */}
        <BookingModal
          expert={selectedExpert}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingConfirmed={handleBookingConfirmed}
        />

        {/* 24/7 AI Tutor Chatbot - Active & Open in Dashboard with Unlimited Questions */}
        <ChatbotWidget
          isSubscribed={true}
          onOpenTrialModal={() => {}}
          onBookExpert={handleBookExpert}
          onOpenQuestionModal={() => setQuestionModalOpen(true)}
          studentName={currentUser.name}
          initiallyOpen={true}
        />

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border border-slate-700/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#F5C542] shrink-0 mt-0.5" />
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

  // Otherwise, render Public Landing Page
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-slate-900 flex flex-col font-sans selection:bg-[#F5C542]/40 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onEnterDemo={handleEnterDemoPortal}
        currentUser={currentUser}
        onGoToDashboard={() => setCurrentView('dashboard')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        activePage={activePage}
        onNavigate={(page) => navigateToPage(page)}
      />

      {/* Main Content Pages (Cleanly Separated) */}
      <main className="flex-1">
        {activePage === 'home' && (
          <>
            <Hero
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onBookExpert={handleBookExpert}
              onEnterDemo={handleEnterDemoPortal}
              isSubscribed={!!currentUser}
            />

            <SpeedLadder
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onExploreExperts={scrollToExperts}
              onBrowseCommunity={() => navigateToPage('community')}
            />

            <MarketResearch />

            <CtaBanner
              onSuccessSubmit={(email) => {
                setTrialInitialEmail(email);
                setTrialModalOpen(true);
              }}
              onViewPrivacy={() => navigateToPage('how', 'privacy')}
            />
          </>
        )}

        {activePage === 'how' && (
          <>
            <HowItWorks />
            <FAQ />
            <CtaBanner
              onSuccessSubmit={(email) => {
                setTrialInitialEmail(email);
                setTrialModalOpen(true);
              }}
              onViewPrivacy={() => navigateToPage('how', 'privacy')}
            />
          </>
        )}

        {activePage === 'experts' && (
          <>
            <ExpertDirectory
              onBookExpert={handleBookExpert}
              defaultShowAll={true}
            />
            <CtaBanner
              onSuccessSubmit={(email) => {
                setTrialInitialEmail(email);
                setTrialModalOpen(true);
              }}
              onViewPrivacy={() => navigateToPage('how', 'privacy')}
            />
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
            <CtaBanner
              onSuccessSubmit={(email) => {
                setTrialInitialEmail(email);
                setTrialModalOpen(true);
              }}
              onViewPrivacy={() => navigateToPage('how', 'privacy')}
            />
          </>
        )}

        {activePage === 'pricing' && (
          <>
            <PricingSection
              onOpenTrialModal={() => setTrialModalOpen(true)}
              onSelectPlan={handleSelectPlan}
            />
            <FAQ />
          </>
        )}

        {activePage === 'about' && (
          <>
            <AboutAndTeam />
            <MarketResearch />
            <CtaBanner
              onSuccessSubmit={(email) => {
                setTrialInitialEmail(email);
                setTrialModalOpen(true);
              }}
              onViewPrivacy={() => navigateToPage('how', 'privacy')}
            />
          </>
        )}
      </main>

      {/* Footer */}
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
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginUser}
        onEnterDemo={handleEnterDemoPortal}
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

      {/* Floating 24/7 AI Tutor Chatbot - 3 Free Questions Limit on Public Pages */}
      <ChatbotWidget
        isSubscribed={false}
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onBookExpert={handleBookExpert}
        onOpenQuestionModal={() => setQuestionModalOpen(true)}
        onNavigatePage={(page) => navigateToPage(page)}
        initiallyOpen={false}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border border-slate-700/60 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542] shrink-0 mt-0.5" />
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
