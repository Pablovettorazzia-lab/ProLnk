import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface CtaBannerProps {
  onSuccessSubmit: (email: string) => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onSuccessSubmit }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid student or personal email address.');
      return;
    }

    setError('');
    setSubmitted(true);
    onSuccessSubmit(email);
  };

  return (
    <div id="start" className="py-16 bg-gradient-to-b from-[#0a1329] to-[#060b17] border-b border-slate-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#F6C62B]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2249] border border-[#F6C62B]/30 text-xs font-semibold text-[#F6C62B] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>No Credit Card Required</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
          Start your free 3-day trial.
        </h2>
        <p className="mt-3 text-base text-slate-300 max-w-xl mx-auto">
          Enter your email and we'll instantly set up your 3-day trial with unlimited AI homework messages and citations.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@school.edu or gmail"
                className="w-full bg-[#122144] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B] transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-sm rounded-lg whitespace-nowrap shadow-lg shadow-[#F6C62B]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Start free trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-left pl-1">{error}</p>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              Free AI & community forum access continue even after your trial. By signing up you agree to our{' '}
              <a href="#privacy" className="text-slate-300 underline hover:text-[#F6C62B]">
                Terms & Privacy Policy
              </a>.
            </p>
          </form>
        ) : (
          <div className="mt-8 p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl max-w-md mx-auto text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Your 3-Day Trial Is Active!</h4>
            <p className="text-xs text-emerald-200">
              We sent a verification link to <strong>{email}</strong>. You can now use the ProLnk AI tutor without limits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
