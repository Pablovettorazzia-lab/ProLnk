import React, { useState } from 'react';
import { TEAM_MEMBERS, HISTORY_TIMELINE } from '../data/mockData';
import { Target, Eye, ChevronDown, ChevronUp, Clock } from 'lucide-react';

export const AboutAndTeam: React.FC = () => {
  const [historyExpanded, setHistoryExpanded] = useState(false);

  return (
    <>
      {/* About Section */}
      <section id="about" className="py-14 md:py-20 bg-[#080f21] border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">About ProLnk</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Getting verified academic help should be straightforward.
            </h2>
          </div>

          {/* Mission & Vision - Compact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#F6C62B] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">Our Mission</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  To empower every student to find reliable, verified academic help for any subject by combining fast AI guidance with live human expertise.
                </p>
              </div>
            </div>

            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">Our Vision</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  To build the most accessible learning support platform, uniting cited academic sources and live peer tutoring into one unified student portal.
                </p>
              </div>
            </div>
          </div>

          {/* Values - Compact Strip */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 sm:p-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center sm:text-left">
              Our Core Values
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-[#F6C62B]"></span>
                  <span>Respect</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We treat each learner with dignity, cultivating a welcoming and secure study environment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Commitment</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated to ensuring you master every core principle, step by step without shortcuts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Empathy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We listen to your specific academic hurdles and tailor instruction to your individual pace.
                </p>
              </div>
            </div>
          </div>

          {/* History Section - Compact with Expandable Full View */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F6C62B]" />
                  <h3 className="text-lg font-bold text-white font-display">Our History</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Founded in Guatemala in 2024 to solve student frustration with unverified hallucinated answers and the lack of live tutors during exam periods.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHistoryExpanded(prev => !prev)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#122144] hover:bg-[#1a2f60] text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all shrink-0 shadow-sm"
              >
                <span>{historyExpanded ? 'Collapse Details' : 'Read Full History'}</span>
                {historyExpanded ? <ChevronUp className="w-4 h-4 text-[#F6C62B]" /> : <ChevronDown className="w-4 h-4 text-[#F6C62B]" />}
              </button>
            </div>

            {/* Expandable History Timeline */}
            {historyExpanded && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="max-w-2xl border-l-2 border-slate-700/80 pl-6 ml-2 sm:ml-4 space-y-6">
                  {HISTORY_TIMELINE.map(item => (
                    <div key={item.year} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#0F2249] border-2 border-[#F6C62B]" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F6C62B] font-display font-mono-nums">
                          {item.year}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setHistoryExpanded(false)}
                    className="text-xs text-slate-400 hover:text-[#F6C62B] cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Collapse history</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-14 md:py-20 bg-[#0a1329] border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              The Team Behind ProLnk
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              University students and software engineers passionate about STEM education and academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.name}
                className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col items-center text-center hover:border-slate-600 transition-colors shadow"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base border ${member.accentColor} mb-3 shadow`}>
                  {member.initials}
                </div>

                <h3 className="text-sm font-bold text-white font-display">{member.name}</h3>
                <p className="text-xs text-[#F6C62B] font-medium mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};
