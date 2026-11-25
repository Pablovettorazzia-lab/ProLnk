import React from 'react';
import { TEAM_MEMBERS } from '../data/mockData';

export const AboutAndTeam: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-22 bg-white border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80">
              About ProLnk
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Verified academic help, made <span className="font-serif-accent text-[#0F2249] font-normal">effortless</span>.
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="bg-[#FAFAF7] p-5 rounded-2xl border border-slate-300/80">
              <div className="font-bold text-slate-950 mb-1.5">Our Mission</div>
              <p>
                Empower every learner to find reliable academic support for any subject by uniting textbook-cited AI with vetted human tutors.
              </p>
            </div>
            <div className="bg-[#FAFAF7] p-5 rounded-2xl border border-slate-300/80">
              <div className="font-bold text-slate-950 mb-1.5">Academic Integrity</div>
              <p>
                Built around genuine conceptual understanding, step-by-step proofs, and transparent citations — never unverified shortcuts.
              </p>
            </div>
          </div>
        </div>

        {/* Clean 4-column Team strip */}
        <div id="team" className="pt-8 border-t border-slate-200/80">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80 mb-6">
            Leadership Team
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.name}
                className="bg-[#FAFAF7] border border-slate-300/80 rounded-2xl p-5 flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0F2249] text-[#F5C542] flex items-center justify-center font-bold text-sm shrink-0">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-950 truncate">{member.name}</h3>
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
