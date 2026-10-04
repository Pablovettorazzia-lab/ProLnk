import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'AI answers citing verified academic textbook sources',
      prolnk: 'Yes (Always cited with ISBN & page)',
      others: 'No / Unverified generic answers',
      prolnkCheck: true,
      othersCheck: false
    },
    {
      feature: 'Private 1-on-1 sessions with verified human tutors',
      prolnk: 'Yes (Live HD whiteboard from Q120/hr)',
      others: 'Not offered (Static text/docs only)',
      prolnkCheck: true,
      othersCheck: false
    },
    {
      feature: 'Urgent live matching for last-minute exam prep',
      prolnk: '~15 minutes live connection',
      others: 'Not available',
      prolnkCheck: true,
      othersCheck: false
    },
    {
      feature: 'Free 3-day trial with full unlimited AI features',
      prolnk: '3 days unlimited (No upfront lock)',
      others: 'Immediate paywalls from step 1',
      prolnkCheck: true,
      othersCheck: false
    },
    {
      feature: 'Community homework board with TA verified solutions',
      prolnk: 'Yes (Expert badges & peer feedback)',
      others: 'Unmoderated user forum comments',
      prolnkCheck: true,
      othersCheck: false
    },
    {
      feature: 'Personalized study history & saved whiteboard notes',
      prolnk: 'Yes (Saved in your student portal)',
      others: 'Not available',
      prolnkCheck: true,
      othersCheck: false
    }
  ];

  return (
    <section id="why" className="py-14 md:py-20 bg-[#080f21] border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">Market Competitor Analysis</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Answers you can verify. Experts you can book.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Unlike other traditional homework platforms relying on unverified crowdsourced text, ProLnk combines rigorously cited AI with live verified human tutoring.
          </p>
        </div>

        {/* Compact Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0c162e] shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#080f21]">
                <th scope="col" className="p-3.5 sm:p-4 text-xs font-bold text-slate-300 w-1/2">
                  Platform Capabilities
                </th>
                <th scope="col" className="p-3.5 sm:p-4 text-center bg-[#0F2249] border-x border-[#F6C62B]/30 w-1/4">
                  <div className="text-sm font-extrabold text-white font-display flex items-center justify-center gap-1.5">
                    <span>ProLnk</span>
                    <ShieldCheck className="w-4 h-4 text-[#F6C62B]" />
                  </div>
                  <span className="text-[10px] text-[#F6C62B] uppercase tracking-wider font-semibold">Our Platform</span>
                </th>
                <th scope="col" className="p-3.5 sm:p-4 text-center text-xs font-semibold text-slate-400 w-1/4">
                  Other Platforms
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-xs">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 sm:p-4 font-medium text-slate-200">
                    {row.feature}
                  </td>

                  {/* ProLnk Column */}
                  <td className="p-3.5 sm:p-4 text-center font-bold text-white bg-[#0F2249]/30 border-x border-[#F6C62B]/30">
                    <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-4 h-4 text-[#F6C62B] shrink-0" strokeWidth={3} />
                      <span className="text-white text-xs">{row.prolnk}</span>
                    </div>
                  </td>

                  {/* Other Platforms Column */}
                  <td className="p-3.5 sm:p-4 text-center text-slate-400">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-xs text-slate-300">{row.others}</span>
                    </div>
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
