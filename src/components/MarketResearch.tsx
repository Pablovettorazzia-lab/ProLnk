import React from 'react';

export const MarketResearch: React.FC = () => {
  return (
    <section id="research" className="py-16 md:py-24 bg-[#0a1329] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Eyebrow & Title matching original */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">
            Market research · 40 students surveyed
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Built on what students told us.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Before building anything, we surveyed 40 students. Their answers shaped who our experts are, how fast we help and what we charge.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          <div className="bg-[#0e1b3d] border border-slate-700/80 rounded-2xl p-6">
            <div className="text-4xl font-black text-[#F6C62B] font-display font-mono-nums">
              77.5%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-snug">
              seek outside help with schoolwork at least occasionally
            </p>
          </div>

          <div className="bg-[#0e1b3d] border border-slate-700/80 rounded-2xl p-6">
            <div className="text-4xl font-black text-white font-display font-mono-nums">
              57.5%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-snug">
              need help for late-night or last-minute questions
            </p>
          </div>

          <div className="bg-[#0e1b3d] border border-slate-700/80 rounded-2xl p-6">
            <div className="text-4xl font-black text-[#F6C62B] font-display font-mono-nums">
              82.5%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-snug">
              would pay Q71 or more for professional tutoring
            </p>
          </div>

          <div className="bg-[#0e1b3d] border border-slate-700/80 rounded-2xl p-6">
            <div className="text-4xl font-black text-white font-display font-mono-nums">
              75%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-snug">
              rate verified credentials and reviews 4 or 5 out of 5
            </p>
          </div>
        </div>

        {/* 3 Real Survey Bar Charts from original */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Chart 1 */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              Subjects students struggle with most
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Physics</span>
                  <b className="text-[#F6C62B] font-mono-nums">35%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Mathematics</span>
                  <b className="text-[#F6C62B] font-mono-nums">35%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Chemistry</span>
                  <b className="text-[#F6C62B] font-mono-nums">22.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '22.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Social studies</span>
                  <b className="text-[#F6C62B] font-mono-nums">20%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              When students would use AI
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Late-night / last-minute</span>
                  <b className="text-[#F6C62B] font-mono-nums">57.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '57.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Urgent live exam prep</span>
                  <b className="text-[#F6C62B] font-mono-nums">37.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '37.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Grammar & essay review</span>
                  <b className="text-[#F6C62B] font-mono-nums">32.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '32.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Step-by-step math / science</span>
                  <b className="text-[#F6C62B] font-mono-nums">25%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3 */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              What makes tutoring worth the cost
            </h3>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Guaranteed grade improvement</span>
                  <b className="text-[#F6C62B] font-mono-nums">47.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '47.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Personalized attention</span>
                  <b className="text-[#F6C62B] font-mono-nums">45%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Convenience & flexibility</span>
                  <b className="text-[#F6C62B] font-mono-nums">32.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '32.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Speed of help</span>
                  <b className="text-[#F6C62B] font-mono-nums">27.5%</b>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6C62B] rounded-full" style={{ width: '27.5%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        <p className="text-xs text-slate-400 text-center mt-10">
          Source: ProLnk student survey, 40 responses.
        </p>

      </div>
    </section>
  );
};
