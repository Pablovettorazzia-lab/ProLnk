import React from 'react';
import { Check, Video } from 'lucide-react';
import liveTutoringImg from '../assets/images/live_tutoring.jpg';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Ask your question or upload notes',
      description:
        'Type the problem where you got stuck or attach your PDFs and class notes so the assistant answers with your actual context.'
    },
    {
      num: '02',
      title: 'Follow a step-by-step breakdown',
      description:
        'Our AI unpacks formulas and core concepts with verified sources, walking through every step without skipping the reasoning.'
    },
    {
      num: '03',
      title: 'Connect with a live tutor',
      description:
        'When a topic calls for deeper guidance, book a 1-on-1 HD shared whiteboard session in a single click.'
    },
    {
      num: '04',
      title: 'Keep your notes organized',
      description:
        'Every explanation and exported whiteboard sheet stays neatly saved inside your student portal before exam day.'
    }
  ];

  return (
    <section id="how" className="py-16 md:py-22 bg-[#FAFAF5] border-b border-slate-200/75">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Steps */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
                THE PROLNK METHOD
              </div>
              <h1
                className="font-editorial text-[#0F2249]"
                style={{ fontSize: 'clamp(2rem, 3.6vw, 2.95rem)', lineHeight: 1.12 }}
              >
                From stuck to{' '}
                <span className="font-serif-accent italic font-normal">«got it»</span> in minutes.
              </h1>
            </div>

            <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
              {steps.map(s => (
                <div key={s.num} className="py-4 flex items-start gap-4">
                  <span className="text-xs font-mono-nums font-bold text-[#0F2249] bg-[#F5C52C] px-2.5 py-0.5 rounded mt-0.5 shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <h2 className="font-editorial text-base sm:text-lg text-[#0F2249] font-medium">
                      {s.title}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#0F2249] font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Browser-based HD whiteboard</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Instant PDF &amp; note exports</span>
              </span>
            </div>
          </div>

          {/* Right: Live Whiteboard Preview */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#0F2249]/10 border border-slate-200/80 bg-white group">
              <img
                src={liveTutoringImg}
                alt="Live 1-on-1 tutoring whiteboard session"
                className="w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2249]/70 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200/70 shadow-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0F2249] text-[#F5C52C] flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-editorial text-sm text-[#0F2249] font-medium">
                      Calculus: Integration by Parts
                    </div>
                    <div className="text-[11px] text-slate-500">
                      1-on-1 live session with Daniela Ríos, M.Sc.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Shared Whiteboard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
