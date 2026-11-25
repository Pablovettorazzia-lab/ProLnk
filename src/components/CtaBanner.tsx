import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CtaBannerProps {
  onOpenTrialModal?: () => void;
  onSuccessSubmit?: (email: string) => void;
  onViewPrivacy?: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  onOpenTrialModal,
  onSuccessSubmit
}) => {
  const handleStart = () => {
    if (onOpenTrialModal) {
      onOpenTrialModal();
    } else if (onSuccessSubmit) {
      onSuccessSubmit('');
    }
  };

  return (
    <section id="start" className="bg-[#F5C52C] text-[#0F2249] border-t border-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2.5 max-w-2xl">
            <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-[#0F2249]/75 font-medium">
              YOUR NEXT STEP STARTS HERE
            </div>
            <h2
              className="font-editorial text-[#0F2249]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.1rem)', lineHeight: 1.08 }}
            >
              From «I can’t» to «I got it».
            </h2>
            <p className="text-sm sm:text-base text-[#0F2249]/85">
              One question can change the way you learn.
            </p>
            <div className="pt-2 text-[10px] font-mono-nums uppercase tracking-[0.16em] text-[#0F2249]/75 font-semibold">
              3 DAYS TO FIND YOUR RHYTHM
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-3.5 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <span>Try ProLnk free</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
