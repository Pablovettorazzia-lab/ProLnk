/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpeedLadder } from './components/SpeedLadder';
import { HowItWorks } from './components/HowItWorks';
import { MarketResearch } from './components/MarketResearch';
import { ExpertDirectory } from './components/ExpertDirectory';
import { CommunityAndDashboard } from './components/CommunityAndDashboard';
import { ComparisonTable } from './components/ComparisonTable';
import { PricingSection } from './components/PricingSection';
import { AboutAndTeam } from './components/AboutAndTeam';
import { FAQ } from './components/FAQ';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { BookingModal, TrialModal, LoginModal, QuestionModal, ContactModal } from './components/Modals';
import { Expert, ForumPost, DashboardSession } from './types';
import { EXPERTS_DATA, USER_PAST_SESSIONS, FORUM_POSTS } from './data/mockData';
import { CheckCircle2, X, LayoutDashboard } from 'lucide-react';
import { onAuthStatusChange, logoutUser, restoreSession } from './services/auth';
import {
  saveUserProfile,
  getUserProfile,
  getUserSessions,
  saveUserSession,
  getForumPosts,
  createForumPost,
  updatePostVotes
} from './services/data';

export interface AuthUser {
  uid?: string;
  isDemo?: boolean;
  emailNotifications?: boolean;
  sessionReminders?: boolean;
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
}

export default function App() {
  // Authentication & View state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'profile'>('landing');
  const accountLoadRef = useRef(0);

  const [userSessions, setUserSessions] = useState<DashboardSession[]>([]);
  const [communityPosts, setCommunityPosts] = useState<ForumPost[]>(FORUM_POSTS);

  // Modals state
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Global toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadAccount = async () => {
    const version = ++accountLoadRef.current;
    const profile = await getUserProfile();
    if (version !== accountLoadRef.current) throw new Error('La sesión ha cambiado. Inténtalo de nuevo.');
    setCurrentUser(profile);
    setCurrentView('dashboard');
    setUserSessions([]);
    try {
      const sessions = await getUserSessions();
      if (version === accountLoadRef.current) setUserSessions(sessions);
    } catch {
      showToast('No se pudo cargar el historial de sesiones.');
    }
    return profile;
  };

  useEffect(() => {
    let active = true;
    try { localStorage.removeItem('prolnk_user'); } catch {}
    getForumPosts().then(posts => {
      if (active && posts.length > 0) setCommunityPosts(posts);
    }).catch(() => {});
    restoreSession().then(async user => {
      if (active && user?.confirmedAt) await loadAccount();
    }).catch(() => {
      if (active) showToast('No se pudo restaurar tu cuenta. Inicia sesión de nuevo.');
    });
    const unsubscribe = onAuthStatusChange(() => {
      if (!active) return;
      accountLoadRef.current++;
      setCurrentUser(null);
      setUserSessions([]);
      setCurrentView('landing');
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const handleRegisterUser = async (_name: string, _email: string, uid?: string) => {
    if (!uid) return;
    const user = await loadAccount();
    showToast(`Cuenta creada. ¡Bienvenido, ${user.name}!`);
  };

  const handleLoginUser = async (name: string, email: string, uid?: string) => {
    if (uid === 'demo') {
      if (await restoreSession()) await logoutUser();
      accountLoadRef.current++;
      setCurrentUser({ uid: 'demo', name, email, isDemo: true, plan: 'Demo', daysLeft: 3 });
      setUserSessions(USER_PAST_SESSIONS);
      setCurrentView('dashboard');
      showToast('Modo demo: los cambios no se guardan en una cuenta real.');
      return;
    }
    if (!uid) throw new Error('Inicia sesión con tu cuenta.');
    const user = await loadAccount();
    showToast(`¡Bienvenido de nuevo, ${user.name}!`);
  };

  const handleLogOut = async () => {
    accountLoadRef.current++;
    try {
      if (!currentUser?.isDemo) await logoutUser();
      setCurrentUser(null);
      setUserSessions([]);
      setCurrentView('landing');
      showToast('Sesión cerrada.');
    } catch {
      showToast('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
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

    if (!currentUser) { setLoginModalOpen(true); return; }
    try {
      if (!currentUser.isDemo && currentUser.uid) await saveUserSession(currentUser.uid, newSession);
      setUserSessions(prev => [newSession, ...prev]);
    } catch {
      showToast('No se pudo guardar la reserva. Inténtalo de nuevo.');
      return;
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
      votes: 0,
      userVoted: false,
      hasExpertAnswer: false,
      previewText: 'Awaiting first community or expert breakdown...',
      timeAgo: 'Just now'
    };

    if (!currentUser) { setLoginModalOpen(true); return; }
    try {
      if (!currentUser.isDemo) await createForumPost(newPost, currentUser.uid!);
      setCommunityPosts(prev => [newPost, ...prev]);
    } catch {
      showToast('No se pudo publicar la pregunta. Inténtalo de nuevo.');
      return;
    }

    showToast(`Your question "${title.substring(0, 30)}..." in ${category} was posted to the community!`);
  };

  const handleVoteQuestion = async (postId: string) => {
    if (!currentUser) { setLoginModalOpen(true); return; }
    if (currentUser.isDemo) {
      setCommunityPosts(posts => posts.map(post => post.id === postId ? { ...post, votes: post.votes + (post.userVoted ? -1 : 1), userVoted: !post.userVoted } : post));
      return;
    }
    try {
      const result = await updatePostVotes(postId);
      setCommunityPosts(posts => posts.map(post => post.id === postId ? { ...post, ...result } : post));
    } catch {
      showToast('No se pudo guardar el voto.');
    }
  };

  const scrollToExperts = () => {
    const el = document.getElementById('experts');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateProfile = async (updatedData: Partial<AuthUser>) => {
    if (!currentUser) return;
    if (currentUser.isDemo) {
      setCurrentUser({ ...currentUser, ...updatedData });
      showToast('Perfil demo actualizado solo durante esta visita.');
      return;
    }
    const profile = await saveUserProfile(updatedData);
    setCurrentUser(profile);
    showToast('Tu perfil se guardó correctamente.');
  };

  // Dedicated Full-Page Student Profile View (Separate Page with Natural Smooth Scrolling)
  if (currentView === 'profile' && currentUser) {
    return (
      <ProfilePage
        user={currentUser}
        onBackToDashboard={() => setCurrentView('dashboard')}
        onViewLandingPage={() => {}}
        onLogOut={handleLogOut}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  // If a student is authenticated / has dashboard open, they CANNOT navigate to the landing page
  // unless they go to their profile section and click "Cerrar Sesión"!
  if (currentUser) {
    return (
      <>
        <Dashboard
          key={currentUser.uid}
          user={currentUser}
          sessions={userSessions}
          posts={communityPosts}
          onVotePost={handleVoteQuestion}
          onLogOut={handleLogOut}
          onViewLandingPage={() => {}}
          onBookExpert={handleBookExpert}
          onUpdateProfile={handleUpdateProfile}
          onOpenProfile={() => setCurrentView('profile')}
        />

        {/* Modals in dashboard */}
        <BookingModal
          expert={selectedExpert}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingConfirmed={handleBookingConfirmed}
        />

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border-2 border-[#F6C62B] p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#F6C62B] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
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
    <div className="min-h-screen bg-[#080f21] text-slate-100 flex flex-col font-sans selection:bg-[#F6C62B]/30 selection:text-white">
      
      {/* Top Header */}
      <Header
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        currentUser={currentUser}
        onGoToDashboard={() => setCurrentView('dashboard')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Live Fast AI Chat */}
        <Hero
          onOpenTrialModal={() => setTrialModalOpen(true)}
          onBookExpert={handleBookExpert}
          isSubscribed={!!currentUser}
        />

        {/* Speed Ladder */}
        <SpeedLadder
          onOpenTrialModal={() => setTrialModalOpen(true)}
          onExploreExperts={scrollToExperts}
        />

        {/* How It Works (4 Steps) */}
        <HowItWorks />

        {/* Market Research (40 students surveyed, 4 stats, 3 charts) */}
        <MarketResearch />

        {/* Verified Experts Directory with Flippable Cards */}
        <ExpertDirectory onBookExpert={handleBookExpert} />

        {/* Community Forum & Student Dashboard Preview */}
        <CommunityAndDashboard
          onBookExpert={handleBookExpert}
          onOpenQuestionModal={() => setQuestionModalOpen(true)}
          posts={communityPosts}
          onVotePost={handleVoteQuestion}
        />

        {/* Competitor Comparison Matrix (ProLnk vs Chegg, Course Hero, Brainly) */}
        <ComparisonTable />

        {/* Pricing, Real-time Calculator & 3-Step Recommendation Quiz */}
        <PricingSection
          onOpenTrialModal={() => setTrialModalOpen(true)}
          onSelectPlan={handleSelectPlan}
        />

        {/* About ProLnk, Mission, Vision, Values, History & Team */}
        <AboutAndTeam />

        {/* 3-Day Free Trial Banner (Start your free 3 day trial) */}
        <CtaBanner onSuccessSubmit={(email) => handleRegisterUser(email.split('@')[0], email)} />

        {/* FAQ (Questions students ask us) & Privacy/Terms */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onOpenContactModal={() => setContactModalOpen(true)}
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
        onClose={() => setTrialModalOpen(false)}
        onRegister={handleRegisterUser}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLoginUser}
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
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0F2249] text-white border-2 border-[#F6C62B] p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#F6C62B] shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
