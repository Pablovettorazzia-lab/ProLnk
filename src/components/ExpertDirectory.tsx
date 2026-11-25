import React, { useState } from 'react';
import { EXPERTS_DATA } from '../data/mockData';
import { Expert, SubjectCategory } from '../types';
import { Star, ShieldCheck, Zap, Info, RotateCw, CheckCircle2 } from 'lucide-react';

interface ExpertDirectoryProps {
  onBookExpert: (expert: Expert) => void;
  defaultShowAll?: boolean;
}

export const ExpertDirectory: React.FC<ExpertDirectoryProps> = ({ onBookExpert, defaultShowAll = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('all');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [showAllExperts, setShowAllExperts] = useState(defaultShowAll);

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

  const displayedExperts = showAllExperts ? filteredExperts : filteredExperts.slice(0, 2);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'math-science', label: 'Math & Science' },
    { id: 'writing-languages', label: 'Writing & Languages' },
    { id: 'tech', label: 'Tech & Code' },
    { id: 'business-career', label: 'Career' }
  ];

  return (
    <section id="experts" className="py-16 md:py-24 bg-[#FAFAF7] border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80">
              Verified Human Tutors
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Real people who <span className="font-serif-accent text-[#0F2249] font-normal">know</span> the subject.
            </h2>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-full border border-slate-300 shadow-sm self-start lg:self-end">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id as SubjectCategory)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-[#0F2249] text-white'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experts Grid */}
        <div className={`grid gap-6 ${showAllExperts ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {displayedExperts.map(expert => {
            const isFlipped = !!flippedCards[expert.id];

            return (
              <div
                key={expert.id}
                className="studio-card studio-card-hover rounded-3xl p-6 flex flex-col justify-between relative min-h-[310px]"
              >
                <button
                  type="button"
                  onClick={() => toggleFlip(expert.id)}
                  aria-label={`Toggle info for ${expert.name}`}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs transition-colors z-10 cursor-pointer"
                  title="Flip for teaching approach"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {!isFlipped ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        {expert.avatarImage ? (
                          <img
                            src={expert.avatarImage}
                            alt={expert.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#0F2249] text-[#F5C542] flex items-center justify-center font-bold text-sm shrink-0">
                            {expert.initials}
                          </div>
                        )}
                        <div className="pr-8">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-950 text-base">{expert.name}</h3>
                            <ShieldCheck className="w-4 h-4 text-[#0F2249]" />
                          </div>
                          <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">{expert.role}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{expert.credentials}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 font-medium my-3">
                        {expert.subjects.join(' · ')}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-700 py-2.5 border-y border-slate-200 my-3 font-mono-nums">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-slate-950">{expert.rating}</span>
                        </div>
                        <span className="text-slate-300">·</span>
                        <div>
                          <span className="font-semibold text-slate-950">{expert.sessionsCompleted}</span> sessions
                        </div>
                        <span className="text-slate-300">·</span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {expert.isOnline ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span className="text-emerald-800 font-semibold">Online now</span>
                            </>
                          ) : (
                            <span className="text-slate-600">{expert.responseTime}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {expert.bio}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-slate-950 font-mono-nums">
                          Q{expert.hourlyRate}
                        </span>
                        <span className="text-[11px] text-slate-600 ml-1">/ hour</span>
                      </div>

                      <button
                        onClick={() => onBookExpert(expert)}
                        className="px-4 py-2 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                        <span className="text-[11px] font-bold text-[#0F2249] uppercase tracking-wider">
                          Teaching Approach
                        </span>
                        <button
                          onClick={() => toggleFlip(expert.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer pr-8"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Flip back</span>
                        </button>
                      </div>

                      <h4 className="font-bold text-slate-950 text-sm mb-1.5">{expert.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {expert.teachingApproach}
                      </p>

                      <div className="bg-[#FAFAF7] p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Includes exported whiteboard notes</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Urgent 15-min booking eligible</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono-nums">Q{expert.hourlyRate}/hr</span>
                      <button
                        onClick={() => onBookExpert(expert)}
                        className="px-4 py-2 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer"
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

        {filteredExperts.length > 2 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAllExperts(prev => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              {showAllExperts ? 'Show featured tutors' : `View all verified tutors (+${filteredExperts.length - 2} more)`}
            </button>
          </div>
        )}

        {/* Calm Urgent Match Banner */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-[#0F2249] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-950">Need urgent homework help tonight?</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Add an urgent upgrade (+Q25) to match with an online tutor within 15 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onBookExpert(EXPERTS_DATA[0])}
            className="px-5 py-2.5 rounded-full bg-[#F5C542] hover:bg-[#ffd65c] text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shrink-0"
          >
            Request Urgent Match
          </button>
        </div>

      </div>
    </section>
  );
};
