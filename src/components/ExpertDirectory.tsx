import React, { useState } from 'react';
import { EXPERTS_DATA } from '../data/mockData';
import { Expert, SubjectCategory } from '../types';
import { Star, ShieldCheck, Zap, Info, RotateCw, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface ExpertDirectoryProps {
  onBookExpert: (expert: Expert) => void;
  defaultShowAll?: boolean;
}

const FEATURED_ROWS = [
  {
    name: 'Daniela Ríos',
    subjects: 'Calculus · Differential Equations · Physics',
    rate: 135,
    matchId: 'daniela-rios'
  },
  {
    name: 'Gabriel Castillo',
    subjects: 'Linear Algebra · Algorithms · Python / C++',
    rate: 125,
    matchId: 'tomas-herrera'
  },
  {
    name: 'Sofia Chang',
    subjects: 'Organic Chemistry · Biochemistry',
    rate: 120,
    matchId: 'lucia-coronado'
  },
  {
    name: 'Lucas Méndez',
    subjects: 'Probability · Microeconomics',
    rate: 130,
    matchId: 'esteban-morales'
  }
];

export const ExpertDirectory: React.FC<ExpertDirectoryProps> = ({
  onBookExpert,
  defaultShowAll = true
}) => {
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

  const displayedExperts = showAllExperts ? filteredExperts : filteredExperts.slice(0, 3);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'math-science', label: 'Math & Science' },
    { id: 'writing-languages', label: 'Writing & Languages' },
    { id: 'tech', label: 'Tech & Code' },
    { id: 'business-career', label: 'Career' }
  ];

  const handleBookFeaturedRow = (row: typeof FEATURED_ROWS[number]) => {
    const baseExpert = EXPERTS_DATA.find(e => e.id === row.matchId) || EXPERTS_DATA[0];
    onBookExpert({
      ...baseExpert,
      name: row.name,
      hourlyRate: row.rate,
      subjects: row.subjects.split('·').map(s => s.trim())
    });
  };

  const scrollToFullDirectory = () => {
    const el = document.getElementById('tutor-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="experts" className="bg-[#FAFAF5]">
      {/* Section 03 Editorial Split */}
      <div className="py-16 md:py-22 border-b border-slate-200/75">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Intro */}
            <div className="lg:col-span-5 space-y-5">
              <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
                03 &nbsp;/&nbsp; THE HUMAN SIDE OF LEARNING
              </div>

              <h1
                className="font-editorial text-[#0F2249]"
                style={{ fontSize: 'clamp(2rem, 3.6vw, 2.95rem)', lineHeight: 1.12 }}
              >
                Sometimes, you need someone on the other side.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
                A real person. Your question at the center. Find support for your most challenging subjects.
              </p>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={scrollToFullDirectory}
                  className="px-6 py-3 bg-[#0F2249] hover:bg-[#19346b] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <span>Explore experts</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <div className="text-xs text-slate-500">
                  In a hurry? Urgent ~15 min matching for +Q25.
                </div>
              </div>
            </div>

            {/* Right Clean Hairline Directory Table */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between text-[10px] font-mono-nums uppercase tracking-[0.16em] text-slate-400 pb-3 border-b border-slate-200/80">
                <span>EXPERTS</span>
                <span>PER HOUR</span>
              </div>

              <div className="divide-y divide-slate-200/80 border-b border-slate-200/80">
                {FEATURED_ROWS.map(row => (
                  <button
                    key={row.name}
                    type="button"
                    onClick={() => handleBookFeaturedRow(row)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left hover:bg-[#EBF0F7]/50 px-2 -mx-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-editorial text-lg sm:text-xl text-[#0F2249] group-hover:underline">
                        {row.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{row.subjects}</div>
                    </div>
                    <div className="font-editorial text-lg sm:text-xl text-[#0F2249] font-medium shrink-0">
                      Q{row.rate}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filterable Tutors Grid */}
      <div id="tutor-directory" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl">
              <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
                VERIFIED DIRECTORY
              </div>
              <h2 className="mt-2 font-editorial text-2xl sm:text-3xl text-[#0F2249]">
                Choose your ideal tutor by subject.
              </h2>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs self-start lg:self-end">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id as SubjectCategory)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-[#0F2249] text-white'
                      : 'text-slate-600 hover:text-[#0F2249] hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`grid gap-6 ${
              showAllExperts ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {displayedExperts.map(expert => {
              const isFlipped = !!flippedCards[expert.id];

              return (
                <div
                  key={expert.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between relative min-h-[310px] shadow-xs hover:shadow-md transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFlip(expert.id)}
                    aria-label={`Toggle teaching approach for ${expert.name}`}
                    className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#EBF0F7] hover:bg-slate-200 text-[#0F2249] flex items-center justify-center text-xs transition-colors z-10 cursor-pointer"
                    title="View teaching approach"
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
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#0F2249] text-[#F5C52C] flex items-center justify-center font-bold text-sm shrink-0">
                              {expert.initials}
                            </div>
                          )}
                          <div className="pr-8">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-editorial text-lg font-medium text-[#0F2249]">
                                {expert.name}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-[#0F2249] shrink-0" />
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5 line-clamp-1">{expert.role}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {expert.credentials}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 font-medium my-3">
                          {expert.subjects.join(' · ')}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-700 py-2.5 border-y border-slate-100 my-3 font-mono-nums">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="font-bold text-[#0F2249]">{expert.rating}</span>
                          </div>
                          <span className="text-slate-300">·</span>
                          <div>
                            <span className="font-semibold text-[#0F2249]">{expert.sessionsCompleted}</span>{' '}
                            sessions
                          </div>
                          <span className="text-slate-300">·</span>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {expert.isOnline ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Online now</span>
                              </>
                            ) : (
                              <span className="text-slate-500">{expert.responseTime}</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {expert.bio}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 flex items-center justify-between">
                        <div>
                          <span className="font-editorial text-2xl text-[#0F2249]">
                            Q{expert.hourlyRate}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1">/ hour</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onBookExpert(expert)}
                          className="px-4 py-2 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                          <span className="text-[10px] font-mono-nums font-bold text-[#0F2249] uppercase tracking-wider">
                            Teaching Approach
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleFlip(expert.id)}
                            className="text-[11px] text-slate-500 hover:text-[#0F2249] flex items-center gap-1 cursor-pointer pr-8"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Flip back</span>
                          </button>
                        </div>

                        <h4 className="font-editorial text-base text-[#0F2249] mb-1.5">{expert.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {expert.teachingApproach}
                        </p>

                        <div className="bg-[#FAF9F2] p-3.5 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Includes exported whiteboard notes</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Urgent ~15 min matching eligible</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-mono-nums">Q{expert.hourlyRate}/hr</span>
                        <button
                          type="button"
                          onClick={() => onBookExpert(expert)}
                          className="px-4 py-2 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer"
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

          {filteredExperts.length > 3 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAllExperts(prev => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EBF0F7] text-[#0F2249] border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                {showAllExperts
                  ? 'Show featured tutors'
                  : `View all verified tutors (+${filteredExperts.length - 3} more)`}
              </button>
            </div>
          )}

          {/* Urgent Match Banner */}
          <div className="mt-12 bg-[#EBF0F7] border border-slate-200/70 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F5C52C] text-[#0F2249] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-editorial text-lg text-[#0F2249]">
                  Need urgent homework help tonight?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Add urgent priority (+Q25) to match with an online tutor within ~15 minutes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBookExpert(EXPERTS_DATA[0])}
              className="px-5 py-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs whitespace-nowrap cursor-pointer transition-colors shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Request Urgent Match</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
