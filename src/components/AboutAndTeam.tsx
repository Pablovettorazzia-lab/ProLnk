import React from 'react';
import { TEAM_MEMBERS } from '../data/mockData';

export const AboutAndTeam: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-22 bg-[#FAFAF5] border-b border-slate-200/75">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
              ABOUT PROLNK
            </div>
            <h1
              className="font-editorial text-[#0F2249]"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 2.95rem)', lineHeight: 1.12 }}
            >
              Verified academic help, made{' '}
              <span className="font-serif-accent italic font-normal">effortless</span>.
            </h1>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="bg-[#EBF0F7] p-6 rounded-2xl border border-slate-200/70">
              <div className="font-editorial text-lg text-[#0F2249] mb-2">Our Mission</div>
              <p>
                Empower every learner right at the moment they get stuck, uniting document-grounded AI with vetted human tutors.
              </p>
            </div>
            <div className="bg-[#EBF0F7] p-6 rounded-2xl border border-slate-200/70">
              <div className="font-editorial text-lg text-[#0F2249] mb-2">Academic Integrity</div>
              <p>
                Built around genuine conceptual understanding, step-by-step reasoning, and transparent sources — never unverified shortcuts.
              </p>
            </div>
          </div>
        </div>

        {/* Clean 4-column Team strip */}
        <div id="team" className="pt-8 border-t border-slate-200/80">
          <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400 mb-6">
            FOUNDING TEAM
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.name}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0F2249] text-[#F5C52C] flex items-center justify-center font-bold text-sm shrink-0">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#0F2249] truncate">
                    {member.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
