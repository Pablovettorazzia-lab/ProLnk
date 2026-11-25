import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'AI answers citing verified academic textbook sources',
      prolnk: 'Always cited (ISBN & section)',
      others: 'Unverified generic text'
    },
    {
      feature: 'Private 1-on-1 sessions with verified human tutors',
      prolnk: 'Live HD whiteboard (from Q120/hr)',
      others: 'Not offered'
    },
    {
      feature: 'Urgent live matching for last-minute exam prep',
      prolnk: '~15 minutes live connection',
      others: 'Not available'
    },
    {
      feature: 'Free 3-day trial with full unlimited AI features',
      prolnk: '3 days unlimited (no card lock)',
      others: 'Immediate paywall'
    },
    {
      feature: 'Community homework board with TA verified solutions',
      prolnk: 'Expert badges & peer votes',
      others: 'Unmoderated comments'
    },
    {
      feature: 'Personalized study history & saved whiteboard notes',
      prolnk: 'Saved in student portal',
      others: 'Not available'
    }
  ];

  return (
    <section id="why" className="py-16 md:py-22 bg-[#060913] border-b border-white/[0.07]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5C542]">
            Platform Comparison
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Answers you can verify. Experts you can book.
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unlike platforms built around unverified crowdsourced text, ProLnk combines rigorously cited AI with live verified tutoring.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b1120]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#080d1a]">
                <th scope="col" className="p-4 text-xs font-bold text-slate-300 w-1/2">
                  Platform Capabilities
                </th>
                <th scope="col" className="p-4 text-center bg-[#F5C542]/[0.08] border-x border-[#F5C542]/25 w-1/4">
                  <div className="text-sm font-extrabold text-white font-display flex items-center justify-center gap-1.5">
                    <span>ProLnk</span>
                    <ShieldCheck className="w-4 h-4 text-[#F5C542]" />
                  </div>
                </th>
                <th scope="col" className="p-4 text-center text-xs font-semibold text-slate-400 w-1/4">
                  Other Platforms
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06] text-xs">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-slate-200">
                    {row.feature}
                  </td>

                  <td className="p-4 text-center font-semibold text-white bg-[#F5C542]/[0.04] border-x border-[#F5C542]/20">
                    <div className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#F5C542] shrink-0" strokeWidth={2.5} />
                      <span className="text-white text-xs">{row.prolnk}</span>
                    </div>
                  </td>

                  <td className="p-4 text-center text-slate-400">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <X className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                      <span className="text-xs text-slate-400">{row.others}</span>
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
