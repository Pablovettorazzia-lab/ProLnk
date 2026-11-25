import React from 'react';
import { CheckCircle2, Video } from 'lucide-react';
import liveTutoringImg from '../assets/images/live_tutoring.jpg';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Ask your question',
      description: 'Type a calculus problem, physics dilemma, or essay prompt alongside what you have tried.'
    },
    {
      num: '02',
      title: 'Get a cited AI answer',
      description: 'Receive a step-by-step breakdown anchored to OpenStax, Stewart, or Giancoli in seconds.'
    },
    {
      num: '03',
      title: 'Match with a live tutor',
      description: 'Tap once to launch an HD shared whiteboard session with a verified specialist.'
    },
    {
      num: '04',
      title: 'Keep everything saved',
      description: 'Every solved formula sheet and tutor note lives cleanly inside your student portal.'
    }
  ];

  return (
    <section id="how" className="py-16 md:py-24 bg-[#FAFAF7] border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Clean Minimal Steps */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80">
                How ProLnk Works
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                From stuck to{' '}
                <span className="font-serif-accent text-[#0F2249] font-normal">sorted</span>{' '}
                in minutes.
              </h2>
            </div>

            <div className="divide-y divide-slate-300/70 border-y border-slate-300/70">
              {steps.map(s => (
                <div key={s.num} className="py-4 flex items-start gap-4">
                  <span className="text-xs font-bold font-mono-nums text-[#0F2249] bg-[#F5C542]/45 border border-amber-400/50 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{s.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Browser-based HD whiteboard</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant PDF &amp; SVG note export</span>
              </span>
            </div>
          </div>

          {/* Right: Clean Framed Visual Classroom */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200 bg-white group">
              <img
                src={liveTutoringImg}
                alt="Interactive Online Tutoring Whiteboard Session"
                className="w-full h-[360px] sm:h-[440px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0F2249] text-[#F5C542] flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Calculus: Tabular Integration</div>
                    <div className="text-[11px] text-slate-500">Live 1-on-1 with Daniela Ríos, M.Sc.</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
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
