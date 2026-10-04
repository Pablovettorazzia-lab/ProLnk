import React, { useState, useEffect } from 'react';
import { ProLnkLogo } from './Logo';
import {
  ArrowLeft,
  Camera,
  Save,
  CheckCircle2,
  Flame,
  Trophy,
  Users,
  Bot,
  School,
  Edit3,
  Settings,
  Bell,
  Sparkles,
  X,
  LogOut,
  GraduationCap,
  MessageSquare,
  Check,
  BookOpen,
  User,
  ShieldCheck,
  Award,
  Plus
} from 'lucide-react';
import { AuthUser } from '../App';

interface ProfilePageProps {
  user: AuthUser;
  onBackToDashboard: () => void;
  onViewLandingPage?: () => void;
  onLogOut: () => void;
  onUpdateProfile?: (updated: Partial<AuthUser>) => void | Promise<void>;
}

const PRESET_AVATARS = [
  { id: 'av1', label: 'Tech Student', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { id: 'av2', label: 'Engineer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: 'av3', label: 'Scientist', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80' },
  { id: 'av4', label: 'Scholar', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { id: 'av5', label: 'Mathematician', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' },
];

const SUGGESTED_SUBJECTS = [
  'Differential Calculus',
  'Integral Calculus',
  'Multivariable Calculus',
  'Classical Mechanics',
  'Electromagnetism',
  'Linear Algebra',
  'Differential Equations',
  'General Chemistry',
  'Data Structures'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onBackToDashboard,
  onLogOut,
  onUpdateProfile
}) => {
  // Form state
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
  const [activeTab, setActiveTab] = useState<'info' | 'subjects' | 'achievements' | 'preferences'>('info');
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
  const [sessionReminders, setSessionReminders] = useState(user.sessionReminders ?? true);
  const [aiExplanationStyle, setAiExplanationStyle] = useState<'detailed' | 'quick'>(user.aiExplanationStyle ?? 'detailed');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) return;

    if (isSaving) return;
    setIsSaving(true);
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
        sessionReminders,
        aiExplanationStyle,
      });
      showToast(user.isDemo ? 'Perfil demo actualizado solo durante esta visita.' : 'Perfil guardado correctamente.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubjectInput.trim()) return;
    const clean = newSubjectInput.trim();
    if (!profileSubjects.includes(clean)) {
      setProfileSubjects(prev => [...prev, clean]);
    }
    setNewSubjectInput('');
  };

  const handleAddSuggestedSubject = (subj: string) => {
    if (!profileSubjects.includes(subj)) {
      setProfileSubjects(prev => [...prev, subj]);
      showToast(`Subject added: ${subj}`);
    }
  };

  const handleRemoveSubject = (subj: string) => {
    setProfileSubjects(prev => prev.filter(s => s !== subj));
  };

  return (
    <div className="min-h-screen bg-[#070d1c] text-slate-100 flex flex-col font-sans antialiased selection:bg-[#F6C62B] selection:text-slate-950">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0a1329]/95 backdrop-blur-md border-b border-slate-800 h-16 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all hover:scale-102"
            title="Return to Student Portal"
          >
            <ArrowLeft className="w-4 h-4 text-[#F6C62B]" />
            <span>Back to Portal</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <ProLnkLogo size="sm" light={true} showWordmark={true} />
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-xs font-semibold text-slate-300">Student Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            onClick={onLogOut}
            className="text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102"
            title="Safely log out and return to the home page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container: 2-Column Professional Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Identity Card, Metrics & Navigation Tabs
             ========================================================================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Student Summary Card */}
            <div className="bg-[#0c162e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Cover Banner */}
              <div className="h-28 bg-gradient-to-r from-[#0F2249] via-[#162e63] to-[#0a1530] relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F6C62B_1px,transparent_1px)] [background-size:14px_14px]"></div>
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online
                  </span>
                </div>
              </div>

              {/* Avatar + Info Body */}
              <div className="px-5 pb-5 relative -mt-12 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar with Camera Button */}
                  <div className="relative group shrink-0">
                    {profilePhotoURL ? (
                      <img
                        src={profilePhotoURL}
                        alt={profileName}
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-[#0c162e] shadow-lg bg-[#080f21]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F2249] to-[#F6C62B] text-white font-extrabold text-2xl flex items-center justify-center border-4 border-[#0c162e] shadow-lg">
                        {profileName.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                      </div>
                    )}
                    <button
                      onClick={() => setShowAvatarPicker(prev => !prev)}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#F6C62B] text-slate-950 hover:bg-[#ffd744] shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Change profile avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name and University */}
                  <div className="overflow-hidden flex-1 space-y-0.5">
                    <h2 className="text-lg font-bold text-white truncate">{profileName || 'Student'}</h2>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <p className="text-xs text-[#F6C62B] font-medium flex items-center justify-center sm:justify-start gap-1 truncate pt-0.5">
                      <School className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{profileUniversity}</span>
                    </p>
                  </div>
                </div>

                {/* Avatar Picker Dropdown */}
                {showAvatarPicker && (
                  <div className="mt-4 p-3 rounded-xl bg-[#080f21] border border-slate-700/80 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Select an avatar:</span>
                      <button
                        onClick={() => setShowAvatarPicker(false)}
                        className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {PRESET_AVATARS.map(av => (
                        <button
                          key={av.id}
                          onClick={() => {
                            setProfilePhotoURL(av.url);
                            setShowAvatarPicker(false);
                            showToast(`Avatar "${av.label}" selected.`);
                          }}
                          className={`p-1 rounded-lg border transition-all cursor-pointer ${
                            profilePhotoURL === av.url
                              ? 'bg-[#0F2249] border-[#F6C62B] ring-1 ring-[#F6C62B]'
                              : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                          }`}
                          title={av.label}
                        >
                          <img src={av.url} alt={av.label} className="w-10 h-10 rounded-md object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
                      <input
                        type="url"
                        value={profilePhotoURL}
                        onChange={e => setProfilePhotoURL(e.target.value)}
                        placeholder="Or paste custom image URL..."
                        className="flex-1 bg-[#122144] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B]"
                      />
                      <button
                        onClick={() => {
                          setShowAvatarPicker(false);
                          showToast('Custom image URL applied.');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg cursor-pointer"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

                {/* Compact Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-left">
                  <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Study Streak</span>
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">{user.streakDays ?? 0} Days</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Trophy className="w-3.5 h-3.5 text-purple-400" />
                      <span>XP Progress</span>
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">{user.xpPoints ?? 0} XP</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>1-on-1 Sessions</span>
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">3 Completed</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080f21] border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AI Solutions</span>
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">24 Solved</div>
                  </div>
                </div>

                {/* Plan Status Box */}
                <div className="mt-4 p-3 rounded-xl bg-[#080f21] border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Active Membership</div>
                    <div className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F6C62B]"></span>
                      <span>{user.plan}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#F6C62B] bg-[#F6C62B]/10 px-2 py-0.5 rounded-md border border-[#F6C62B]/20">
                    {user.daysLeft} days left
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Section Navigation */}
            <nav className="bg-[#0c162e] border border-slate-800 rounded-2xl p-2 space-y-1 shadow-lg text-xs font-medium">
              {[
                { id: 'info', label: 'Personal & Academic Info', icon: User, desc: 'Name, university, major and bio' },
                { id: 'subjects', label: 'Focus Subjects', icon: BookOpen, desc: 'Key coursework you are actively studying' },
                { id: 'achievements', label: 'Badges & Achievements', icon: Trophy, desc: 'Academic milestones and consistency' },
                { id: 'preferences', label: 'AI & Study Preferences', icon: Settings, desc: 'Explanation style and notifications' },
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#0F2249] text-white border border-[#F6C62B]/50 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-[#F6C62B]' : 'text-slate-400'}`} />
                    <div className="overflow-hidden">
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

          </div>


          {/* =========================================================================
              RIGHT COLUMN: Main Configuration Workspaces
             ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Sub-tab 1: Personal & Academic Info */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Block 1: Student Identity */}
                <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
                  <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Identity & Contact</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Primary information visible to your assigned tutors.</p>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Full Name:</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="e.g. Pablo Vettorazzi"
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Registered Email:</label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-[#080f21] border border-slate-800 text-slate-400 rounded-xl px-3.5 py-2.5 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Block 2: Academic Program */}
                <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-base font-bold text-white">Academic Enrollment</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Helps tutors prepare problems tailored to your institution curriculum.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1.5">University or School:</label>
                      <input
                        type="text"
                        value={profileUniversity}
                        onChange={e => setProfileUniversity(e.target.value)}
                        placeholder="e.g. Universidad del Valle de Guatemala (UVG)"
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Semester or Year:</label>
                      <input
                        type="text"
                        value={profileSemester}
                        onChange={e => setProfileSemester(e.target.value)}
                        placeholder="e.g. 4th Semester"
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-slate-300 font-semibold mb-1.5">Major or Academic Track:</label>
                      <input
                        type="text"
                        value={profileMajor}
                        onChange={e => setProfileMajor(e.target.value)}
                        placeholder="e.g. Computer Science and Engineering / STEM Honors"
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Block 3: Goals and Bio */}
                <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-base font-bold text-white">Study Goals & Bio</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Share what concepts you want to conquer this term.</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Primary Academic Goal:</label>
                      <input
                        type="text"
                        value={profileLearningGoal}
                        onChange={e => setProfileLearningGoal(e.target.value)}
                        placeholder="e.g. Master integration by parts and maintain GPA above 90."
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Student Biography & Summary:</label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={e => setProfileBio(e.target.value)}
                        placeholder="Tell us about the courses or topics where you need the most practice..."
                        className="w-full bg-[#122144] border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-102 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Information'}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* Sub-tab 2: Focus Subjects */}
            {activeTab === 'subjects' && (
              <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Focus Coursework</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Classes where you seek regular tutoring or AI problem walkthroughs.</p>
                  </div>
                  <span className="text-xs font-semibold text-[#F6C62B]">{profileSubjects.length} selected</span>
                </div>

                {/* Active Subjects */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300">Your current courses:</span>
                  <div className="flex flex-wrap gap-2">
                    {profileSubjects.map(subj => (
                      <span
                        key={subj}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F2249] text-amber-300 border border-amber-500/30 text-xs font-medium shadow-sm"
                      >
                        <span>{subj}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subj)}
                          className="hover:text-rose-400 cursor-pointer transition-colors p-0.5"
                          title="Remove subject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {profileSubjects.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No courses added yet. Add one below.</span>
                    )}
                  </div>
                </div>

                {/* Custom Input Form */}
                <form onSubmit={handleAddSubject} className="flex items-center gap-2 max-w-md pt-2">
                  <input
                    type="text"
                    value={newSubjectInput}
                    onChange={e => setNewSubjectInput(e.target.value)}
                    placeholder="Type another subject (e.g. Physics I, Chemistry...)"
                    className="flex-1 bg-[#122144] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F6C62B]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#F6C62B]" />
                    <span>Add</span>
                  </button>
                </form>

                {/* STEM Quick Suggestions */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  <span className="text-xs font-semibold text-slate-400">Popular suggestions (click to add):</span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SUBJECTS.map(subj => {
                      const alreadyAdded = profileSubjects.includes(subj);
                      return (
                        <button
                          key={subj}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSuggestedSubject(subj)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            alreadyAdded
                              ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800/60 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {alreadyAdded ? `✓ ${subj}` : `+ ${subj}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleSaveProfile()}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Coursework</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Badges & Achievements */}
            {activeTab === 'achievements' && (
              <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Academic Badges & Milestones</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Earned through continuous problem-solving and live sessions on ProLnk.</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">5 Unlocked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'First Step', desc: 'Registered your student account and configured your academic profile.', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', status: 'Unlocked' },
                    { title: 'Unstoppable Streak', desc: '5 consecutive days reviewing formula sheets and solving exercises.', icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', status: 'Unlocked' },
                    { title: 'Live Mentorship', desc: 'Completed your first 1-on-1 virtual whiteboard session with a verified tutor.', icon: GraduationCap, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', status: 'Unlocked' },
                    { title: 'AI Problem Solver', desc: 'Over 10 STEM problems solved with verified step-by-step textbook citations.', icon: Bot, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', status: 'Unlocked' },
                    { title: 'Community Voice', desc: 'Posted a question in the student forum and received a verified breakdown.', icon: MessageSquare, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30', status: 'Unlocked' },
                    { title: 'Study Marathon', desc: 'Accumulate 20 active learning hours inside the ProLnk platform.', icon: Trophy, color: 'text-slate-400 bg-slate-800/50 border-slate-800', status: 'In progress (75%)' },
                  ].map(ach => (
                    <div
                      key={ach.title}
                      className="p-4 rounded-xl bg-[#080f21] border border-slate-800 flex items-start gap-3.5"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border shrink-0 ${ach.color}`}>
                        <ach.icon className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{ach.title}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            ach.status.includes('Unlocked')
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ach.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: AI & Study Preferences */}
            {activeTab === 'preferences' && (
              <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="border-b border-slate-800/80 pb-3">
                  <h3 className="text-base font-bold text-white">Study Preferences & AI Assistant</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Customize how you interact with tutors and your 24/7 AI tutor.</p>
                </div>

                <div className="space-y-5 text-xs">
                  
                  {/* AI Response Style */}
                  <div className="space-y-2.5">
                    <label className="block text-slate-200 font-semibold text-sm">24/7 AI Tutor Explanation Style:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAiExplanationStyle('detailed');
                          showToast('Preference updated: Step-by-Step with Citations');
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          aiExplanationStyle === 'detailed'
                            ? 'bg-[#0F2249] border-[#F6C62B] text-white shadow-md'
                            : 'bg-[#080f21] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                          <span>Step-by-Step with Citations</span>
                          {aiExplanationStyle === 'detailed' && <Check className="w-4 h-4 text-[#F6C62B]" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Displays theorems, comprehensive algebraic proofs, and exact page references from official textbooks.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAiExplanationStyle('quick');
                          showToast('Preference updated: Direct & Concise');
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          aiExplanationStyle === 'quick'
                            ? 'bg-[#0F2249] border-[#F6C62B] text-white shadow-md'
                            : 'bg-[#080f21] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                          <span>Direct & Concise Summary</span>
                          {aiExplanationStyle === 'quick' && <Check className="w-4 h-4 text-[#F6C62B]" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Concise reduction and the final answer, ideal for double-checking homework practice problems quickly.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Notification Toggles */}
                  <div className="space-y-3 pt-4 border-t border-slate-800/80">
                    <label className="block text-slate-200 font-semibold text-sm">Notifications & Reminders:</label>
                    
                    <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080f21] border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-semibold text-white">1-on-1 Virtual Room Reminders</div>
                        <div className="text-[11px] text-slate-400">Receive Google Meet & whiteboard links 30 minutes prior to session.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={sessionReminders}
                        onChange={e => {
                          setSessionReminders(e.target.checked);
                          showToast(e.target.checked ? 'Session reminders enabled' : 'Session reminders disabled');
                        }}
                        className="w-4 h-4 accent-[#F6C62B] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080f21] border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-semibold text-white">Community Forum Replies</div>
                        <div className="text-[11px] text-slate-400">Notify me whenever a tutor or peer posts a response to my question.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={e => {
                          setEmailNotifications(e.target.checked);
                          showToast(e.target.checked ? 'Email notifications enabled' : 'Email notifications disabled');
                        }}
                        className="w-4 h-4 accent-[#F6C62B] cursor-pointer"
                      />
                    </label>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => void handleSaveProfile()}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-102"
                  >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2249] text-white border-2 border-[#F6C62B] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#F6C62B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
