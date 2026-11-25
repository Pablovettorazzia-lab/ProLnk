import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, Shield } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const faqs = [
    {
      q: 'What does the 3-day free trial include?',
      a: 'Full access to 24/7 AI tutoring and a free community question to start exploring ProLnk.'
    },
    {
      q: 'Can I upload my own study notes?',
      a: 'Yes. You can attach PDFs, study guides, text files, or photos of problems so the assistant answers directly from your own class material.'
    },
    {
      q: 'How do I choose my tutor?',
      a: 'On the Tutoring page, you can filter by subject, review verified credentials, check online availability, and compare hourly rates before booking.'
    },
    {
      q: 'What if I need urgent help?',
      a: 'When booking any tutoring session, you can enable urgent priority (+Q25) to get matched in roughly 15 minutes.'
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#FAFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section 05 Editorial 2-Column FAQ Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Title */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
              05 &nbsp;/&nbsp; BEFORE YOU START
            </div>
            <h2
              className="font-editorial text-[#0F2249]"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 2.95rem)', lineHeight: 1.12 }}
            >
              Good question.
            </h2>
            <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
              We have answers for these doubts too.
            </p>
          </div>

          {/* Right Clean Accordion Rows */}
          <div className="lg:col-span-7 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
            {faqs.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full py-5 text-left flex items-center justify-between gap-4 text-[#0F2249] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span className="font-editorial text-lg sm:text-xl font-medium">
                      {item.q}
                    </span>
                    <span className="text-[#0F2249] shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pb-5 pr-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Clean Privacy & Academic Integrity Accordion */}
        <div id="privacy" className="pt-8 border-t border-slate-200/80 max-w-3xl">
          <div className="flex items-center gap-2 text-[#0F2249] mb-4">
            <Shield className="w-4 h-4" />
            <h3 className="text-xs font-mono-nums uppercase tracking-[0.15em] font-bold">
              Privacy &amp; Academic Integrity
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenPrivacy(!openPrivacy)}
                className="w-full p-4 text-left flex items-center justify-between font-semibold text-[#0F2249] text-xs cursor-pointer"
              >
                <span>Privacy Policy</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openPrivacy ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openPrivacy && (
                <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  We collect your email and academic profile strictly to manage your account, tutoring history, and study notes. We never sell student data to third parties. Request account deletion anytime via prolnk.org@gmail.com.
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenTerms(!openTerms)}
                className="w-full p-4 text-left flex items-center justify-between font-semibold text-[#0F2249] text-xs cursor-pointer"
              >
                <span>Terms of Use &amp; Academic Integrity</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    openTerms ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openTerms && (
                <div className="px-4 pb-4 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                  ProLnk is a learning and tutoring companion built around step-by-step understanding and clear citations. All prices are listed in Guatemalan Quetzales (Q).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
