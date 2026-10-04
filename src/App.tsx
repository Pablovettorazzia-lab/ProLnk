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
import { onAuthStatusChange, logoutUser } from './firebase/authService';
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
}

export default function App() {
  // Authentication & View state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'profile'>('landing');

  // Firestore persistent state
  const [userSessions, setUserSessions] = useState<DashboardSession[]>(USER_PAST_SESSIONS);
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

  // Sync with Firebase Auth and Firestore on mount
  useEffect(() => {
    // 1. Fetch community posts from Firestore
    getForumPosts().then(posts => {
      if (posts && posts.length > 0) {
        setCommunityPosts(posts);
      }
    }).catch(err => console.warn('Could not fetch Firestore forum posts:', err));

    // 2. Listen to Firebase Auth state
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
            bio: profile?.bio || 'Estudiante universitario enfocado en dominar cálculo y física con apoyo de ProLnk.',
            university: profile?.university || 'Universidad del Valle de Guatemala',
            major: profile?.major || 'Ingeniería en Ciencias de la Computación',
            semester: profile?.semester || '4to Semestre',
            targetSubjects: profile?.targetSubjects || ['Cálculo Diferencial', 'Física II', 'Álgebra Lineal'],
            learningGoal: profile?.learningGoal || 'Obtener nota superior a 90 en los exámenes parciales y dominar cálculo multivariable.',
            streakDays: profile?.streakDays || 5,
            xpPoints: profile?.xpPoints || 840
          };
          setCurrentUser(user);

          // Fetch sessions from Firestore
          const sessions = await getUserSessions(firebaseUser.uid);
          if (sessions && sessions.length > 0) {
            setUserSessions(sessions);
          }
        } catch (e) {
          console.error('Error loading Firestore user data:', e);
        }
      } else {
        // Fallback to localStorage if any
        try {
          const stored = localStorage.getItem('prolnk_user');
          if (stored) {
            setCurrentUser(JSON.parse(stored));
          }
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRegisterUser = async (name: string, email: string, uid?: string, photoURL?: string) => {
    const userUid = uid || `user_${Date.now()}`;
    const newUser: AuthUser = {
      uid: userUid,
      name: name || 'Student',
      email: email,
      photoURL,
      plan: '3-Day Free Trial',
      daysLeft: 3
    };
    setCurrentUser(newUser);

    try {
      localStorage.setItem('prolnk_user', JSON.stringify(newUser));
    } catch {}

    // Persist to Firestore
    await saveUserProfile({
      id: userUid,
      name: newUser.name,
      email: newUser.email,
      photoURL,
      plan: newUser.plan,
      role: 'student',
      createdAt: new Date().toISOString()
    });
    
    setCurrentView('dashboard');
    showToast(`Account created! Welcome to your ProLnk Dashboard, ${newUser.name}.`);
  };

  const handleLoginUser = async (name: string, email: string, uid?: string, photoURL?: string) => {
    const userUid = uid || `user_${Date.now()}`;
    const user: AuthUser = {
      uid: userUid,
      name: name || 'Pablo Vettorazzi',
      email: email,
      photoURL,
      plan: '3-Day Free Trial',
      daysLeft: 3
    };
    setCurrentUser(user);

    try {
      localStorage.setItem('prolnk_user', JSON.stringify(user));
    } catch {}

    // Persist / update to Firestore
    await saveUserProfile({
      id: userUid,
      name: user.name,
      email: user.email,
      photoURL,
      plan: user.plan,
      role: 'student',
      createdAt: new Date().toISOString()
    });

    // Load sessions from Firestore
    try {
      const sessions = await getUserSessions(userUid);
      if (sessions && sessions.length > 0) {
        setUserSessions(sessions);
      }
    } catch {}

    setCurrentView('dashboard');
    showToast(`Welcome back, ${user.name}!`);
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

    if (currentUser?.uid) {
      await saveUserSession(currentUser.uid, newSession);
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

    const uid = currentUser?.uid || 'guest';
    await createForumPost(newPost, uid);

    showToast(`Your question "${title.substring(0, 30)}..." in ${category} was posted to the community!`);
  };

  const handleVoteQuestion = async (postId: string) => {
    let targetVotes = 0;
    setCommunityPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const hasVoted = p.userVoted;
          const nextVotes = hasVoted ? p.votes - 1 : p.votes + 1;
          targetVotes = nextVotes;
          return {
            ...p,
            votes: nextVotes,
            userVoted: !hasVoted
          };
        }
        return p;
      })
    );

    if (targetVotes > 0) {
      await updatePostVotes(postId, targetVotes);
    }
  };

  const scrollToExperts = () => {
    const el = document.getElementById('experts');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateProfile = async (updatedData: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated: AuthUser = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    try {
      localStorage.setItem('prolnk_user', JSON.stringify(updated));
    } catch {}

    if (currentUser.uid) {
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
    }
    showToast('Your profile has been updated successfully!');
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
