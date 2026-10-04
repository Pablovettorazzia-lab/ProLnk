import React, { useState } from 'react';
import { EXPERTS_DATA } from '../data/mockData';
import { Expert, SubjectCategory } from '../types';
import { Star, ShieldCheck, Clock, Zap, Info, RotateCw, CheckCircle2 } from 'lucide-react';

interface ExpertDirectoryProps {
  onBookExpert: (expert: Expert) => void;
}

export const ExpertDirectory: React.FC<ExpertDirectoryProps> = ({ onBookExpert }) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredExperts = EXPERTS_DATA.filter(exp => {
    if (selectedCategory === 'all') return true;
    return exp.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All subjects' },
    { id: 'math-science', label: 'Math and science' },
    { id: 'writing-languages', label: 'Writing and languages' },
    { id: 'tech', label: 'Tech & Programming' },
    { id: 'business-career', label: 'Business & Career' }
  ];

  return (
    <section id="experts" className="py-16 md:py-24 bg-[#080f21] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">Verified Human Tutors</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Real people who know the subject.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Every tutor passes a rigorous degree check and a live teaching trial reviewed by our academic board.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id as SubjectCategory)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#F6C62B] text-slate-950 shadow-md shadow-[#F6C62B]/20 font-bold'
                  : 'bg-[#0e1b3d] text-slate-300 hover:text-white hover:bg-[#142654] border border-slate-700/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map(expert => {
            const isFlipped = !!flippedCards[expert.id];

            return (
              <div
                key={expert.id}
                className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all duration-200 shadow-lg relative group min-h-[340px]"
              >
                {/* Flip Info Toggle button */}
                <button
                  type="button"
                  onClick={() => toggleFlip(expert.id)}
                  aria-label={`Toggle info for ${expert.name}`}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors z-10 cursor-pointer"
                  title="Flip for tutor approach"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {!isFlipped ? (
                  /* Front Face */
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar & Basic details */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        {expert.avatarImage ? (
                          <img
                            src={expert.avatarImage}
                            alt={expert.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#F6C62B]/50 shrink-0 shadow-md"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${expert.avatarColor} shrink-0`}>
                            {expert.initials}
                          </div>
                        )}
                        <div className="pr-6">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-white text-base font-display">{expert.name}</h3>
                            <span title="Verified Credentials">
                              <ShieldCheck className="w-4 h-4 text-[#F6C62B]" />
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{expert.role}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{expert.credentials}</p>
                        </div>
                      </div>

                      {/* Subject tags */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {expert.subjects.map(subj => (
                          <span
                            key={subj}
                            className="text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-md"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>

                      {/* Ratings & Session Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-300 py-2 border-y border-slate-800 my-3 font-mono-nums">
                        <div className="flex items-center gap-1 text-[#F6C62B]">
                          <Star className="w-3.5 h-3.5 fill-[#F6C62B]" />
                          <span className="font-bold">{expert.rating}</span>
                        </div>
                        <span className="text-slate-500">·</span>
                        <div>
                          <span className="font-semibold text-white">{expert.sessionsCompleted}</span> sessions
                        </div>
                        <span className="text-slate-500">·</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          {expert.isOnline ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="text-emerald-400 font-medium">Online now</span>
                            </>
                          ) : (
                            <span className="text-slate-400">{expert.responseTime}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {expert.bio}
                      </p>
                    </div>

                    {/* Pricing and Booking Action */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black text-white font-display font-mono-nums leading-none">
                          Q{expert.hourlyRate}
                        </div>
                        <div className="text-[11px] text-slate-400">1-hour session</div>
                      </div>

                      <button
                        onClick={() => onBookExpert(expert)}
                        className="px-4 py-2 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <span>Book Session</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Back Face: Teaching approach & follow-up promise */
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                        <span className="text-xs font-bold text-[#F6C62B] uppercase tracking-wide">Teaching Philosophy</span>
                        <button
                          onClick={() => toggleFlip(expert.id)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Flip back</span>
                        </button>
                      </div>

                      <h4 className="font-bold text-white text-sm font-display mb-1">{expert.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {expert.teachingApproach}
                      </p>

                      <div className="bg-[#080f21] p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Includes session whiteboard notes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Urgent 15-min booking eligible</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Standard rate: Q{expert.hourlyRate}/hr</span>
                      <button
                        onClick={() => onBookExpert(expert)}
                        className="px-4 py-2 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Book with {expert.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#0e1b3d] to-[#122144] border border-[#F6C62B]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F6C62B]/20 text-[#F6C62B] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-display">Need urgent homework help tonight?</h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Add an urgent upgrade (+Q25) to any booking and we will connect you to an online tutor within 15 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onBookExpert(EXPERTS_DATA[0])}
            className="px-5 py-2.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            Request Urgent Match
          </button>
        </div>

      </div>
    </section>
  );
};
