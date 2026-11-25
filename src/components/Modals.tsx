import React, { useState, useEffect } from 'react';
import { Expert } from '../types';
import { X, CheckCircle2, ShieldCheck, Zap, Sparkles, Mail } from 'lucide-react';

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
  const [date, setDate] = useState('Today (Fastest available)');
  const [time, setTime] = useState('6:00 PM');
  const [topic, setTopic] = useState('');
  const [urgentUpgrade, setUrgentUpgrade] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !expert) return null;

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
        date: `${date} · ${time}`
      });
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#FAFAF5] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F2249] text-[#F5C52C] flex items-center justify-center font-bold text-xs shadow-sm">
              {expert.initials}
            </div>
            <div>
              <h3 className="font-editorial text-[#0F2249] text-lg">Book a Session</h3>
              <p className="text-xs text-slate-500">with {expert.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Topic or assignment to cover
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Calculus chain rule, physics mechanics, essay thesis..."
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Preferred date</label>
              <select
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#0F2249]"
              >
                <option value="Today (Fastest available)">Today (Fastest available)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This weekend">This weekend</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Preferred time</label>
              <div className="grid grid-cols-3 gap-2">
                {['4:00 PM', '6:00 PM', '8:00 PM'].map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      time === t
                        ? 'bg-[#0F2249] text-white border-[#0F2249]'
                        : 'bg-[#FAFAF5] text-slate-700 border-slate-200 hover:border-slate-300'
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
                  ? 'bg-amber-50 border-[#F5C52C]'
                  : 'bg-[#FAFAF5] border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={urgentUpgrade}
                onChange={e => setUrgentUpgrade(e.target.checked)}
                className="mt-0.5 accent-[#0F2249] w-4 h-4 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F2249] text-xs flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Urgent priority (+Q25)</span>
                  </span>
                  <span className="text-amber-700 font-bold font-mono-nums">~15 min</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  We notify {expert.name.split(' ')[0]} immediately for priority connection.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-mono-nums">
              <div>
                <span className="text-xs text-slate-500">Session Total</span>
                <div className="text-xs text-slate-400">
                  Q{basePrice} {urgentUpgrade ? '+ Q25 urgent' : ''}
                </div>
              </div>
              <div className="font-editorial text-3xl text-[#0F2249]">Q{totalPrice}</div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Confirm booking
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-xl text-[#0F2249]">Session Booked</h4>
            <p className="text-xs text-slate-600">
              You are booked with <strong>{expert.name}</strong> ({date}). Check your portal for the session link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TrialModal: React.FC<{
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onRegister?: (name: string, email: string, uid?: string, photoURL?: string) => void;
}> = ({
  isOpen,
  initialEmail = '',
  onClose,
  onRegister
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('High School');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (initialEmail) {
        setEmail(initialEmail);
      }
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { signInWithGoogle, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        const user = await signInWithGoogle();
        if (onRegister) {
          onRegister(
            user.displayName || user.email?.split('@')[0] || 'Student',
            user.email || '',
            user.uid,
            undefined
          );
        }
        onClose();
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const finalName = name.trim() || email.split('@')[0];

    try {
      const { registerUserWithEmail, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        const user = await registerUserWithEmail(finalName, email.trim(), password);
        if (onRegister) {
          onRegister(user.displayName || finalName, user.email || email.trim(), user.uid);
        }
        onClose();
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#FAFAF5] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F2249]" />
            <h3 className="font-editorial text-[#0F2249] text-lg">Start your 3-day free trial</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-xs flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.11-6.68-4.96H1.21v3.15C3.25 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.97 0 12s.44 3.86 1.21 5.39l4.11-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.21 6.61l4.11 3.15c.94-2.85 3.58-4.96 6.68-4.96z" />
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider">or with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pablo Vettorazzi"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu or gmail.com"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Level</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#0F2249]"
              >
                <option value="High School">High School</option>
                <option value="Middle School">Middle School</option>
                <option value="College">College / University</option>
                <option value="Professional">Self-learner</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#EBF0F7] border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-[#0F2249] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free 3-Day Trial · No card required</span>
              </div>
              <p>Unlocks unlimited 24/7 AI tutoring, study notes upload, and your full student portal.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Open Portal'}
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
  onEnterDemo?: () => void;
}> = ({ isOpen, onClose, onLogin, onEnterDemo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { signInWithGoogle, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        const user = await signInWithGoogle();
        onLogin(
          user.displayName || user.email?.split('@')[0] || 'Pablo Vettorazzi',
          user.email || '',
          user.uid,
          undefined
        );
        onClose();
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { loginUserWithEmail, formatFirebaseAuthError } = await import('../firebase/authService');
      try {
        const user = await loginUserWithEmail(email.trim(), password);
        onLogin(user.displayName || email.split('@')[0], user.email || email.trim(), user.uid);
        onClose();
      } catch (err) {
        setErrorMsg(formatFirebaseAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    if (onEnterDemo) {
      onEnterDemo();
      return;
    }
    onLogin('Pablo Vettorazzi', 'Pablovettorazzia@hotmail.com', 'demo-student-pablo');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 bg-[#FAFAF5] border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-editorial text-[#0F2249] text-lg">Log in to ProLnk</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-3 px-4 rounded-lg bg-[#F5C52C] hover:bg-[#eab921] text-[#0F2249] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fast Enter: Demo Student Account</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-xs flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.18 3.645-9.14z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.11-6.68-4.96H1.21v3.15C3.25 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.21C.44 8.14 0 9.97 0 12s.44 3.86 1.21 5.39l4.11-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.21 6.61l4.11 3.15c.94-2.85 3.58-4.96 6.68-4.96z" />
            </svg>
            <span>{isLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider">or with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log in to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const QuestionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuestion: (title: string, category: string) => void;
}> = ({ isOpen, onClose, onSubmitQuestion }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Physics');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmitQuestion(title, category);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#FAFAF5] border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-editorial text-[#0F2249] text-lg">Ask the Community</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Your Question</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How do I balance redox equations without guessing?"
              className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Subject</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-[#0F2249]"
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
              className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Post question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAFAF5] border border-slate-200 flex items-center justify-center">
            <Mail className="w-4 h-4 text-[#0F2249]" />
          </div>
          <h3 className="font-editorial text-[#0F2249] text-lg">Contact ProLnk</h3>
        </div>

        {!submitted ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-3.5 text-xs sm:text-sm"
          >
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Your Email</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Message</label>
              <textarea
                rows={3}
                required
                placeholder="How can we help you?"
                className="w-full bg-[#FAFAF5] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0F2249] hover:bg-[#19346b] text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Send message
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              Message sent! Our team usually replies within 2 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
