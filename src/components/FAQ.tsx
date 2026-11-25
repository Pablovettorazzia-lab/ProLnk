import React, { useState } from 'react';
import { ChevronDown, Shield } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const faqs = [
    {
      q: 'How much does a tutoring session cost?',
      a: 'A 1-hour private session starts at Q120, an urgent 15-minute connection adds Q25, and the Study Pass is Q319 per month (including 3 live sessions plus 1 priority urgent upgrade). The ProLnk AI assistant and community forum are free.'
    },
    {
      q: 'Which subjects do you cover?',
      a: 'Physics, Mathematics, and Chemistry are core STEM pillars, alongside Academic Writing, French, Spanish, Computer Science/Python, Economics, and Career Advising.'
    },
    {
      q: 'How does the 3-day free trial work?',
      a: 'You get 3 full days of unlimited interactive messages with our cited AI assistant with zero payment information required upfront.'
    },
    {
      q: 'Can I trust the AI’s answers and calculations?',
      a: 'Yes. ProLnk AI cites exact textbook sections (OpenStax, Stewart Calculus, Giancoli Physics) behind its formulas. You can also match with a verified tutor in one tap.'
    },
    {
      q: 'How are human tutors verified?',
      a: 'Every tutor undergoes an academic degree check and a live mock teaching evaluation before onboarding, and student ratings govern rankings.'
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-22 bg-[#FAFAF7] border-b border-slate-200/70">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80">
            Questions &amp; Answers
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950 tracking-tight">
            Frequently asked <span className="font-serif-accent text-[#0F2249] font-normal">questions</span>.
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-300/80 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-950 text-sm hover:text-[#0F2249] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-600 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#0F2249]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div id="privacy" className="pt-6 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-700 mb-2">
            <Shield className="w-4 h-4 text-[#0F2249]" />
            <h3 className="text-sm font-bold">Privacy &amp; Academic Integrity</h3>
          </div>

          <div className="bg-white border border-slate-300/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenPrivacy(!openPrivacy)}
              className="w-full p-4 text-left flex items-center justify-between font-semibold text-slate-900 text-xs cursor-pointer"
            >
              <span>Privacy Policy</span>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${openPrivacy ? 'rotate-180' : ''}`} />
            </button>
            {openPrivacy && (
              <div className="px-4 pb-4 text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                <p>We collect the email address you submit strictly to manage your account, sessions, and trial updates. We never sell student data to third parties. Request data deletion anytime via prolnk.org@gmail.com.</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-300/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenTerms(!openTerms)}
              className="w-full p-4 text-left flex items-center justify-between font-semibold text-slate-900 text-xs cursor-pointer"
            >
              <span>Terms of Use &amp; Academic Integrity</span>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${openTerms ? 'rotate-180' : ''}`} />
            </button>
            {openTerms && (
              <div className="px-4 pb-4 text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                <p>ProLnk is strictly a learning and tutoring aid. Students are expected to adhere to their institution’s academic honor code. Prices are in Guatemalan Quetzales (Q).</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
