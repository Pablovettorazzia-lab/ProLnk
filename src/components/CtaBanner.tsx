import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface CtaBannerProps {
  onSuccessSubmit: (email: string) => void;
  onViewPrivacy?: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onSuccessSubmit, onViewPrivacy }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    onSuccessSubmit(cleanEmail);
  };

  return (
    <div id="start" className="py-20 bg-[#0F2249] text-white relative overflow-hidden">
      <div className="absolute -top-24 right-0 w-[420px] h-[420px] bg-[#F5C542]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5C542] mb-3">
          3-Day Free Trial · No Card Required
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to finish tonight’s <span className="font-serif-accent text-[#F5C542] font-normal">assignment</span> faster?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
          Enter your email to activate your free 3-day trial with unlimited textbook-cited AI help.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@university.edu or email"
              className="w-full bg-white text-slate-950 rounded-full px-5 py-3 text-sm placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#F5C542] hover:bg-[#ffd65c] text-slate-950 font-bold text-sm rounded-full whitespace-nowrap transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Start trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-300 text-left pl-2">{error}</p>}

          <p className="text-[11px] text-slate-300">
            Free AI &amp; community access continue after trial.{' '}
            {onViewPrivacy ? (
              <button
                type="button"
                onClick={onViewPrivacy}
                className="text-white underline hover:text-[#F5C542] cursor-pointer"
              >
                Privacy &amp; Terms
              </button>
            ) : (
              <a href="#privacy" className="text-white underline hover:text-[#F5C542]">
                Privacy &amp; Terms
              </a>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};
