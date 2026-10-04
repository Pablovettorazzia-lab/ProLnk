import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'AI answers that cite verified textbook sources',
      prolnk: 'Yes (Always cited)',
      chegg: 'Yes (Some)',
      courseHero: 'No',
      brainly: 'No'
    },
    {
      feature: 'Private 1-on-1 sessions with verified human experts',
      prolnk: 'Yes (From Q120/hr)',
      chegg: 'Not offered',
      courseHero: 'Not offered',
      brainly: 'Not offered'
    },
    {
      feature: 'Urgent live help connection speed',
      prolnk: '~15 minutes live',
      chegg: 'Not offered',
      courseHero: 'Not offered',
      brainly: 'Not offered'
    },
    {
      feature: 'Free trial with full AI experience',
      prolnk: '3 days unlimited',
      chegg: 'Paywall upfront',
      courseHero: 'Paywall upfront',
      brainly: 'Limited ads'
    },
    {
      feature: 'Free collaborative community forum',
      prolnk: 'Yes (With expert badges)',
      chegg: 'No',
      courseHero: 'No',
      brainly: 'Yes (User answers)'
    },
    {
      feature: 'Guaranteed personalized learning & notes',
      prolnk: 'Yes (Dashboard saved)',
      chegg: 'No',
      courseHero: 'No',
      brainly: 'No'
    }
  ];

  return (
    <section id="why" className="py-16 md:py-24 bg-[#080f21] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">Market Competitor Analysis</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Answers you can check. People you can book.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Chegg, Course Hero, and Brainly focus on static documents or automated unverified replies. ProLnk connects verified sources directly to human expertise.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-[#0c162e] shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080f21]">
                <th scope="col" className="p-4 sm:p-5 text-sm font-bold text-slate-300 w-2/5">
                  Platform Capabilities
                </th>
                <th scope="col" className="p-4 sm:p-5 text-center bg-[#0F2249]/90 border-x border-[#F6C62B]/30 w-1/5">
                  <div className="text-base font-extrabold text-white font-display flex items-center justify-center gap-1.5">
                    <span>ProLnk</span>
                    <ShieldCheck className="w-4 h-4 text-[#F6C62B]" />
                  </div>
                  <span className="text-[10px] text-[#F6C62B] uppercase tracking-wider font-semibold">Our Platform</span>
                </th>
                <th scope="col" className="p-4 sm:p-5 text-center text-xs font-semibold text-slate-400 w-1/7">
                  Chegg
                </th>
                <th scope="col" className="p-4 sm:p-5 text-center text-xs font-semibold text-slate-400 w-1/7">
                  Course Hero
                </th>
                <th scope="col" className="p-4 sm:p-5 text-center text-xs font-semibold text-slate-400 w-1/7">
                  Brainly
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 sm:p-5 font-medium text-slate-200">
                    {row.feature}
                  </td>

                  {/* ProLnk Column */}
                  <td className="p-4 sm:p-5 text-center font-bold text-white bg-[#0F2249]/40 border-x border-[#F6C62B]/30">
                    <div className="inline-flex items-center gap-1 text-emerald-400">
                      <Check className="w-4 h-4 text-[#F6C62B]" strokeWidth={3} />
                      <span className="text-white text-xs">{row.prolnk}</span>
                    </div>
                  </td>

                  {/* Chegg Column */}
                  <td className="p-4 sm:p-5 text-center text-slate-300">
                    {row.chegg.includes('Yes') ? (
                      <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        {row.chegg}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        {row.chegg}
                      </span>
                    )}
                  </td>

                  {/* Course Hero Column */}
                  <td className="p-4 sm:p-5 text-center text-slate-300">
                    <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      {row.courseHero}
                    </span>
                  </td>

                  {/* Brainly Column */}
                  <td className="p-4 sm:p-5 text-center text-slate-300">
                    {row.brainly.includes('Yes') ? (
                      <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        {row.brainly}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        {row.brainly}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};
