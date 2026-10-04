import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, FileText } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const faqs = [
    {
      q: 'How much does a tutoring session cost?',
      a: 'A 1-hour private session starts at Q120, an urgent 15-minute connection adds Q25, and the Study Pass is Q319 a month (which includes 3 sessions plus 1 urgent upgrade). The ProLnk AI assistant and student community forum are completely free. Prices are based on our survey of 40 Liceo Javier students.'
    },
    {
      q: 'Which subjects do you cover first?',
      a: 'Physics, Mathematics, and Chemistry are our primary focus because 35% and 22.5% of surveyed students identified them as their hardest subjects. Academic writing, French, Spanish, Computer Science/Python, and Career guidance are fully supported as well.'
    },
    {
      q: 'How does the 3-day free trial work?',
      a: 'You get 3 full days of general-knowledge classes and unlimited interactive messages with our AI assistant. You can experience the whole platform with zero payment information required upfront.'
    },
    {
      q: 'Can I trust the AI’s answers and calculations?',
      a: 'Yes. Unlike generic chatbots, ProLnk AI is programmed to show the exact academic source or textbook section behind its formulas (such as OpenStax, Stewart Calculus, or Giancoli Physics). If a problem requires nuanced human intuition, you can match with a verified tutor in one tap.'
    },
    {
      q: 'How are human experts and tutors verified?',
      a: 'Every tutor undergoes an academic credential and degree review, followed by a live mock teaching session evaluated by our team. Following onboarding, student ratings and written feedback directly determine tutor rankings.'
    },
    {
      q: 'What is urgent help and when should I use it?',
      a: 'It’s an optional upgrade designed for midnight emergencies and last-minute exam preparation. We immediately alert the highest-rated tutor in that subject who is online, connecting you in approximately 15 minutes.'
    },
    {
      q: 'Is ProLnk only for high school and university students?',
      a: 'Students are our primary target audience, but young professionals and self-taught developers also use ProLnk for CV reviews, coding debugging in Python/SQL, and career interview coaching.'
    },
    {
      q: 'Can I rebook the same expert who helped me last time?',
      a: 'Absolutely. Your personal student dashboard keeps a continuous timeline of every completed session, your tutor’s saved notes, and whiteboard screenshots so you can rebook the same tutor with one tap.'
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#091124] border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2249] border border-[#F6C62B]/30 text-xs font-semibold text-[#F6C62B] mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Questions students ask us.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Everything you need to know about our AI tutor, human matching, and pricing.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#0c162e] border border-slate-700/80 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-[#F6C62B] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#F6C62B] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Privacy & Terms Accordion */}
        <div id="privacy" className="pt-8 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-slate-200">
            <Shield className="w-4 h-4 text-[#F6C62B]" />
            <h3 className="text-base font-bold font-display">Privacy & Terms of Service</h3>
          </div>

          <div className="bg-[#0c162e] border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenPrivacy(!openPrivacy)}
              className="w-full p-4 text-left flex items-center justify-between font-semibold text-slate-200 text-xs sm:text-sm cursor-pointer hover:text-white"
            >
              <span>Privacy Policy</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openPrivacy ? 'rotate-180' : ''}`} />
            </button>
            {openPrivacy && (
              <div className="px-4 pb-4 text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <p>We collect the email address you submit to initiate your 3-day trial and the subjects or experts you are interested in. We use this strictly to facilitate your sessions and provide trial updates.</p>
                <p>Questions typed into the AI chat are processed by our academic engine to generate citations. Please never share passwords, national identification numbers, or confidential school portal credentials in the chat.</p>
                <p>We do not sell student data to third parties. You may request data deletion at any time by emailing prolnk.org@gmail.com.</p>
              </div>
            )}
          </div>

          <div className="bg-[#0c162e] border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenTerms(!openTerms)}
              className="w-full p-4 text-left flex items-center justify-between font-semibold text-slate-200 text-xs sm:text-sm cursor-pointer hover:text-white"
            >
              <span>Terms of Use & Academic Integrity</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openTerms ? 'rotate-180' : ''}`} />
            </button>
            {openTerms && (
              <div className="px-4 pb-4 text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <p>ProLnk connects students with AI-generated study help and verified independent tutors. AI answers can occasionally contain errors, so students are encouraged to check cited textbook chapters and class guidelines.</p>
                <p>Academic Integrity: ProLnk is strictly a learning and tutoring aid. Students are expected to adhere to Liceo Javier and their respective school's honor codes and must not submit platform explanations directly as their own unassisted work during proctored exams.</p>
                <p>All prices are listed in Guatemalan Quetzales (Q). The 3-day free trial requires zero payment methods to initiate.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
