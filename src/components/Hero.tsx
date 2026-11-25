import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface HeroProps {
  onOpenTrialModal: () => void;
  onExploreExperts: () => void;
  onSelectSubject?: (subject: string) => void;
  onScrollToAssistant?: () => void;
}

const SUBJECT_BAR_ITEMS = [
  { label: 'Calculus', prompt: 'Explain step by step how to differentiate f(x) = x² sin(x) using the product rule.' },
  { label: 'Physics', prompt: 'How do I know when to use conservation of energy vs. conservation of momentum in collisions?' },
  { label: 'Programming', prompt: 'What is the practical difference between a list and a tuple in Python?' },
  { label: 'Chemistry', prompt: 'How do I balance a redox equation in acidic solution step by step without guessing?' },
  { label: 'Economics', prompt: 'What is the difference between a shift in demand and movement along the demand curve?' }
];

export const Hero: React.FC<HeroProps> = ({
  onOpenTrialModal,
  onExploreExperts,
  onSelectSubject,
  onScrollToAssistant
}) => {
  const handleSubjectClick = (_subject: string, prompt: string) => {
    if (onSelectSubject) {
      onSelectSubject(prompt);
    } else if (onScrollToAssistant) {
      onScrollToAssistant();
    }
  };

  return (
    <section id="top" className="bg-[#FAFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-[11px] font-mono-nums font-medium uppercase tracking-[0.18em] text-slate-500">
              FEWER ROADBLOCKS, MORE «I GET IT NOW» MOMENTS.
            </div>

            <h1
              className="font-hero-headline text-[#0F2249]"
              style={{ fontSize: 'clamp(2.6rem, 4.9vw, 4.35rem)', textWrap: 'balance' }}
            >
              Your next great idea starts with{' '}
              <span className="relative inline-block">
                <span className="font-serif-accent font-normal italic">one question.</span>
                <span
                  aria-hidden="true"
                  className="block w-full h-[5px] bg-[#F5C52C] rounded-full mt-1"
                />
              </span>
            </h1>

            <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed max-w-md">
              Unstick that assignment with AI, learn with a tutor, and find your community. At your own pace, even late at night.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                type="button"
                onClick={onOpenTrialModal}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#0F2249] hover:bg-[#19346b] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Start your 3-day free trial</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreExperts}
                className="text-sm font-semibold text-[#0F2249] hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Explore tutoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 text-[11px] font-mono-nums tracking-wider text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>24/7 AI</span>
              <span className="text-slate-300">/</span>
              <span>Verified experts</span>
              <span className="text-slate-300">/</span>
              <span>At your pace</span>
            </div>
          </div>

          {/* Right Editorial Study Assistant Preview Card */}
          <div className="lg:col-span-6">
            <div
              onClick={onScrollToAssistant}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onScrollToAssistant?.();
                }
              }}
              className="relative bg-[#E6ECF5] rounded-2xl p-6 sm:p-9 pb-14 sm:pb-16 border border-slate-200/70 cursor-pointer group transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/* Floating Gold Tag */}
              <div className="inline-block bg-[#F5C52C] text-[#0F2249] px-3.5 py-2 rounded-md text-[10px] font-mono-nums font-bold uppercase tracking-[0.14em] mb-4 shadow-xs">
                FROM STUCK TO «GOT IT».
              </div>

              {/* Inner White Assistant Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-[#0F2249]">ProLnk AI</span>
                  <span className="text-[10px] font-mono-nums uppercase tracking-[0.14em] text-slate-400">
                    STUDY ASSISTANT
                  </span>
                </div>

                {/* User Prompt Box */}
                <div className="bg-[#FAF9F2] rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-800 font-medium border border-slate-200/50">
                  How do I differentiate f(x) = x² sin(x)?
                </div>

                <div className="space-y-2.5 pt-1">
                  <p className="font-editorial text-lg sm:text-xl text-[#0F2249]">
                    Let’s take it step by step.
                  </p>
                  <p className="text-xs text-slate-600">
                    We use the product rule: <span className="font-mono-nums">(uv)′ = u′v + uv′</span>
                  </p>

                  <div className="bg-[#EBF0F7] rounded-lg px-4 py-3.5 text-center sm:text-left">
                    <span className="font-editorial text-base sm:text-lg text-[#0F2249]">
                      f′(x) = 2x sin(x) + x² cos(x)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    Now you try: what would change if we used cos(x)?
                  </p>
                </div>
              </div>

              {/* Overlapping Bottom-Right Navy Corner Card */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:bottom-5 bg-[#0F2249] text-white rounded-xl px-5 py-4 shadow-xl max-w-[270px] border border-white/10">
                <div className="text-[9px] font-mono-nums uppercase tracking-[0.16em] text-slate-300">
                  NOT JUST AN ANSWER.
                </div>
                <div className="font-editorial text-base sm:text-lg text-white mt-1 leading-snug">
                  A way to understand it.
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-[11px] text-slate-400">
              A glimpse of how you can learn with ProLnk
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Dark Navy Subject Bar */}
      <div className="bg-[#0F2249] text-white border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="text-[11px] font-mono-nums uppercase tracking-[0.15em] text-slate-300 leading-relaxed shrink-0">
            THAT TOUGH SUBJECT,<br className="hidden lg:block" /> YOUR NEXT WIN.
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-x-8 sm:gap-x-12 gap-y-3 flex-1">
            {SUBJECT_BAR_ITEMS.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSubjectClick(item.label, item.prompt)}
                className="font-editorial text-lg sm:text-xl text-white hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
