import React from 'react';
import { TEAM_MEMBERS, HISTORY_TIMELINE } from '../data/mockData';

export const AboutAndTeam: React.FC = () => {
  return (
    <>
      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-[#080f21] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Help should be easy to find.
            </h2>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white font-display mb-2">Our mission</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To make it easy to find and receive reliable professional help of any kind, by being fast and accessible for everyone.
              </p>
            </div>

            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white font-display mb-2">Our vision</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To build the world’s most accessible support platform, combining smart AI and real human expertise so learning and problem solving are easy for everyone.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-display">Respect</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                We treat our clients and our team with respect and dignity, and we keep every conversation friendly.
              </p>
            </div>

            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-display">Commitment</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                We are responsible and dedicated to every student and to the way they learn.
              </p>
            </div>

            <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-display">Empathy</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                We listen first, understand what a student needs, and build a supportive space to ask for it.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xl font-bold text-white font-display mb-8 text-center">
              Our history
            </h3>

            <div className="max-w-3xl mx-auto border-l-2 border-slate-700/80 pl-6 ml-4 sm:ml-auto space-y-8">
              {HISTORY_TIMELINE.map(item => (
                <div key={item.year} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0F2249] border-2 border-[#F6C62B]" />
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#F6C62B] font-display font-mono-nums">
                      {item.year}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 md:py-24 bg-[#0a1329] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              The team behind ProLnk.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map(member => (
              <div
                key={member.name}
                className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col items-center text-center hover:border-slate-600 transition-colors"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg border ${member.accentColor} mb-4`}>
                  {member.initials}
                </div>

                <h3 className="text-base font-bold text-white font-display">{member.name}</h3>
                <p className="text-xs text-[#F6C62B] font-medium mt-1">{member.role}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};
