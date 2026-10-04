import React from 'react';
import { HelpCircle, Sparkles, UserCheck, BookmarkCheck, CheckCircle2, Video, Zap } from 'lucide-react';
import liveTutoringImg from '../assets/images/live_tutoring.jpg';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: HelpCircle,
      title: 'Ask your question',
      description: 'Type your math problem, physics dilemma, or upload your essay prompt. Mention what methods you’ve already tried.'
    },
    {
      num: '02',
      icon: Sparkles,
      title: 'Get an instant AI answer',
      description: 'The ProLnk AI replies in seconds with a worked step-by-step breakdown and the exact textbook or curriculum citation.'
    },
    {
      num: '03',
      icon: UserCheck,
      title: 'Bring in a verified tutor',
      description: 'Need deeper 1-on-1 guidance? Tap once to match with an expert tutor, or use urgent help if your deadline is tonight.'
    },
    {
      num: '04',
      icon: BookmarkCheck,
      title: 'Follow up in your dashboard',
      description: 'Your personal notebook saves every whiteboard export, practice problem, and tutor note so you never lose progress.'
    }
  ];

  return (
    <section id="how" className="py-16 md:py-24 bg-[#080f21] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">Clear & Simple Process</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            From stuck to sorted in four steps.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            A frictionless learning path designed specifically for high school and university students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative group">
                <div className="bg-[#0c162e] border border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-between transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-slate-700">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0F2249] text-[#F6C62B] border border-[#F6C62B]/30 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-700 font-display">
                        {s.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-display">{s.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>

                {/* Arrow connector between steps on desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-700 pointer-events-none z-10">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Visual Interactive Showcase Banner */}
        <div className="bg-gradient-to-br from-[#0c162e] to-[#070d1c] border border-slate-700/80 rounded-3xl p-6 lg:p-10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive Virtual Classroom</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight">
              Real-time collaboration that feels like sitting side-by-side.
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step beyond static video calls. ProLnk pairs you with an expert on an HD shared whiteboard where formulas, molecular models, and code can be edited synchronously.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero software install — runs directly in your browser</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant SVG and PDF exports of all solved problem sheets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Voice, HD camera, and stylus pen pressure support</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 relative group">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-black">
              <img
                src={liveTutoringImg}
                alt="Interactive Online Tutoring Whiteboard Session"
                className="w-full h-[320px] sm:h-[400px] object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1329] via-transparent to-black/20 pointer-events-none"></div>

              {/* Floating Live Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Live 1-on-1 Session</span>
              </div>

              {/* Floating Bottom Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#0a1329]/90 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Calculus: Tabular Integration</div>
                    <div className="text-[10px] text-slate-400">Tutor: Daniela Ríos (M.Sc.)</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#F6C62B] bg-[#F6C62B]/10 px-2.5 py-1 rounded-md border border-[#F6C62B]/20">
                  Shared Canvas
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
