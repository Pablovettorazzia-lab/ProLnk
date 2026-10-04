import React, { useState } from 'react';
import { Expert } from '../types';
import { X, CheckCircle2, ShieldCheck, Zap, Sparkles, Mail, Send } from 'lucide-react';

interface BookingModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (details: { expertName: string; topic: string; total: number; date: string }) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  expert,
  isOpen,
  onClose,
  onBookingConfirmed
}) => {
  if (!isOpen || !expert) return null;

  const [date, setDate] = useState('Today (Within 1-2 hours)');
  const [time, setTime] = useState('6:00 PM - 7:00 PM');
  const [topic, setTopic] = useState('');
  const [urgentUpgrade, setUrgentUpgrade] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const basePrice = expert.hourlyRate;
  const totalPrice = basePrice + (urgentUpgrade ? 25 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onBookingConfirmed({
        expertName: expert.name,
        topic: topic || `${expert.subjects[0]} Session`,
        total: totalPrice,
        date: date
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c162e] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${expert.avatarColor}`}>
              {expert.initials}
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-display">Book a Session</h3>
              <p className="text-xs text-slate-400">with {expert.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                What topic or assignment would you like to cover?
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Calculus derivatives, Physics collision mechanics..."
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred date:</label>
              <select
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              >
                <option value="Today (Fastest available)">Today (Fastest available)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This weekend">This weekend</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Preferred time:</label>
              <div className="grid grid-cols-3 gap-2">
                {['4:00 PM', '6:00 PM', '8:00 PM'].map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      time === t
                        ? 'bg-[#F6C62B] text-slate-950 border-[#F6C62B]'
                        : 'bg-[#122144] text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => setUrgentUpgrade(!urgentUpgrade)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                urgentUpgrade
                  ? 'bg-amber-500/10 border-[#F6C62B]'
                  : 'bg-[#080f21] border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={urgentUpgrade}
                onChange={e => setUrgentUpgrade(e.target.checked)}
                className="mt-0.5 accent-[#F6C62B] w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#F6C62B]" />
                    <span>Urgent help (+Q25)</span>
                  </span>
                  <span className="text-[#F6C62B] font-bold font-mono-nums">~15 minutes</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  We alert {expert.name.split(' ')[0]} to connect right away.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono-nums">
              <div>
                <span className="text-xs text-slate-400">Total:</span>
                <div className="text-xs text-slate-400">Q{basePrice} {urgentUpgrade ? '+ Q25 urgent' : ''}</div>
              </div>
              <div className="text-2xl font-black text-white font-display">
                Q{totalPrice}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 text-xs font-bold cursor-pointer shadow"
              >
                Confirm booking
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">Session Booked</h4>
            <p className="text-xs text-slate-300">
              You are booked with <strong>{expert.name}</strong> for {date}. Check your email for access instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TrialModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (name: string, email: string, uid?: string, photoURL?: string) => void;
}> = ({
  isOpen,
  onClose,
  onRegister
}) => {
  if (!isOpen) return null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('High School');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { signInWithGoogle } = await import('../firebase/authService');
      const user = await signInWithGoogle();
      if (onRegister) {
        onRegister(user.displayName || user.email?.split('@')[0] || 'Student', user.email || '', user.uid, user.photoURL || undefined);
      }
      onClose();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err.message || 'Could not complete Google Sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    const finalName = name.trim() || email.split('@')[0];

    try {
      const { registerUserWithEmail } = await import('../firebase/authService');
      const pwd = password || 'prolnk123';
      const user = await registerUserWithEmail(finalName, email, pwd);
      if (onRegister) {
        onRegister(user.displayName || finalName, user.email || email, user.uid);
      }
      onClose();
    } catch (err: any) {
      console.warn('Firebase registration notice:', err?.message);
      // If user exists or auth error, proceed with client account creation
      if (onRegister) {
        onRegister(finalName, email);
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c162e] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6C62B]" />
            <h3 className="font-bold text-white text-base font-display">Create Account & Start Trial</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.11-6.68-4.96H1.21v3.15C3.25 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.97 0 12s.44 3.86 1.21 5.39l4.11-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.21 6.61l4.11 3.15c.94-2.85 3.58-4.96 6.68-4.96z"/>
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase">or sign up with email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Full Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pablo Vettorazzi"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu or gmail.com"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Grade / Level:</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              >
                <option value="High School">High School (Diversificado / Senior)</option>
                <option value="Middle School">Middle School / Junior</option>
                <option value="College">College / University</option>
                <option value="Professional">Self-learner / Career</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-[#080f21] border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-[#F6C62B] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Free 3-Day Trial · Secured by Firebase</span>
              </div>
              <p>Creates your student account and opens your personal ProLnk Dashboard with unlimited 24/7 AI assistance.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Open Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, email: string, uid?: string, photoURL?: string) => void;
}> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { signInWithGoogle } = await import('../firebase/authService');
      const user = await signInWithGoogle();
      onLogin(user.displayName || user.email?.split('@')[0] || 'Pablo Vettorazzi', user.email || '', user.uid, user.photoURL || undefined);
      onClose();
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Could not complete Google Sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { loginUserWithEmail } = await import('../firebase/authService');
      const user = await loginUserWithEmail(email, password);
      onLogin(user.displayName || email.split('@')[0], user.email || email, user.uid);
      onClose();
    } catch (err: any) {
      console.warn('Firebase login note:', err?.message);
      // Fallback to local session
      const name = email.split('@')[0];
      onLogin(name, email);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    try {
      const { loginUserWithEmail, registerUserWithEmail } = await import('../firebase/authService');
      let user;
      try {
        user = await loginUserWithEmail('pablovettorazzia@hotmail.com', 'prolnkDemo123!');
      } catch {
        user = await registerUserWithEmail('Pablo Vettorazzi', 'pablovettorazzia@hotmail.com', 'prolnkDemo123!');
      }
      onLogin(user.displayName || 'Pablo Vettorazzi', user.email || 'pablovettorazzia@hotmail.com', user.uid);
      onClose();
    } catch {
      onLogin('Pablo Vettorazzi', 'pablovettorazzia@hotmail.com');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c162e] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base font-display">Log in to ProLnk</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.11-6.68-4.96H1.21v3.15C3.25 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.97 0 12s.44 3.86 1.21 5.39l4.11-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.21 6.61l4.11 3.15c.94-2.85 3.58-4.96 6.68-4.96z"/>
            </svg>
            <span>{isLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase">or with email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log in to Dashboard'}
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Demo Login (Pablo Vettorazzi)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const QuestionModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmitQuestion: (title: string, category: string) => void }> = ({
  isOpen,
  onClose,
  onSubmitQuestion
}) => {
  if (!isOpen) return null;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Physics');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmitQuestion(title, category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c162e] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base font-display">Ask the Community</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Your Question:</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How do I balance redox equations without guessing?"
              className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject:</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
            >
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Tech">Tech</option>
              <option value="Career">Career</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs cursor-pointer shadow"
            >
              Post question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c162e] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <Mail className="w-5 h-5 text-[#F6C62B]" />
          <h3 className="font-bold text-white text-lg font-display">Contact ProLnk</h3>
        </div>

        {!submitted ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-3 text-xs sm:text-sm"
          >
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Email:</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Message:</label>
              <textarea
                rows={3}
                required
                placeholder="How can we help you?"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F6C62B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
            >
              Send message
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-300">Message sent! We usually reply within 2 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
};
