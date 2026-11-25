import React, { useState } from 'react';
import { Check, Sparkles, Calculator, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PricingSectionProps {
  onOpenTrialModal: () => void;
  onSelectPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenTrialModal, onSelectPlan }) => {
  const [helperTab, setHelperTab] = useState<'calculator' | 'quiz'>('calculator');
  const [sessionsCount, setSessionsCount] = useState(3);
  const [urgentCount, setUrgentCount] = useState(1);

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const payAsYouGoTotal = sessionsCount * 120 + urgentCount * 25;
  const extraSessions = Math.max(0, sessionsCount - 3);
  const extraUrgent = Math.max(0, urgentCount - 1);
  const studyPassTotal = 319 + extraSessions * 100 + extraUrgent * 25;
  const savings = payAsYouGoTotal - studyPassTotal;

  const questions = [
    {
      q: 'How often do you need help at the last minute?',
      options: [
        { text: 'Almost never — I study steadily during the week', value: 'free' },
        { text: 'Sometimes, right before midterms or finals', value: 'single' },
        { text: 'Frequently — I often need urgent live help', value: 'pass' }
      ]
    },
    {
      q: 'What subject takes up most of your study time?',
      options: [
        { text: 'Physics, Calculus, or Advanced Math', value: 'math' },
        { text: 'Chemistry, Biology, or Lab Reports', value: 'science' },
        { text: 'Essays, Thesis Writing, or Languages', value: 'humanities' }
      ]
    },
    {
      q: 'How do you learn best when stuck?',
      options: [
        { text: 'Self-guided AI breakdowns with citations', value: 'free' },
        { text: 'Private 1-on-1 whiteboard sessions', value: 'single' },
        { text: 'Both AI at night and weekly tutor sessions', value: 'pass' }
      ]
    }
  ];

  const handleSelectQuizOption = (val: string) => {
    const updated = [...quizAnswers, val];
    setQuizAnswers(updated);
    if (quizStep < questions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizCompleted(false);
  };

  const recommendedPlan = quizAnswers.filter(a => a === 'pass').length >= 1
    ? { name: 'Study Pass (Q319/mo)', desc: 'Ideal if you want both unlimited AI and monthly live sessions with urgent priority.', plan: 'Study Pass' }
    : quizAnswers.filter(a => a === 'single').length >= 1
    ? { name: 'Single Session (Q120)', desc: 'Best for occasional exam prep with a verified subject specialist.', plan: 'Single session' }
    : { name: 'Free AI + Community', desc: 'Great for daily self-study with instant textbook-cited answers.', plan: 'Free' };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-[#FAFAF7] border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2249]/80">
            Simple Pricing
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Clear plans. <span className="font-serif-accent text-[#0F2249] font-normal">Try it free</span> first.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Every account includes a 3-day free trial with zero card required.
          </p>
        </div>

        {/* 3 Clean Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Free */}
          <div className="studio-card rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Free</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-950 font-mono-nums">Q0</span>
                <span className="text-xs text-slate-600">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                For quick midnight questions and peer forum access.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 border-t border-slate-200 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>AI tutor with cited textbook sources</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Community Q&amp;A homework board</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Personal study portal &amp; notebook</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenTrialModal}
              className="mt-8 w-full py-3 px-4 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-[#0F2249] font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Create free account
            </button>
          </div>

          {/* Single Session */}
          <div className="studio-card rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Single session</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-950 font-mono-nums">Q120</span>
                <span className="text-xs text-slate-600">/ 1-hour session</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Pay only when you want a verified 1-on-1 tutor.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 border-t border-slate-200 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Private 1-on-1 with a degree-vetted expert</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Whiteboard notes saved to your portal</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Optional 15-min urgent match (+Q25)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan('Single session', 'Q120')}
              className="mt-8 w-full py-3 px-4 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-[#0F2249] font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Book a session
            </button>
          </div>

          {/* Featured Study Pass */}
          <div className="bg-[#0F2249] text-white rounded-3xl p-7 flex flex-col justify-between shadow-2xl shadow-[#0F2249]/20">
            <div>
              <div className="text-[10px] font-bold text-[#F5C542] uppercase tracking-[0.16em] mb-2">
                Most Popular · Exam Season
              </div>
              <h3 className="text-lg font-bold text-white">Study Pass</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-[#F5C542] font-mono-nums">Q319</span>
                <span className="text-xs text-slate-300">/ per month</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Three 1-on-1 sessions monthly with priority matching.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200 border-t border-white/15 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                  <span><strong>3 expert sessions</strong> of 1 hour included</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                  <span><strong>1 urgent upgrade included</strong> (saves Q25)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                  <span>Priority scheduling · Cancel anytime</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan('Study Pass', 'Q319/mo')}
              className="mt-8 w-full py-3 px-4 rounded-full bg-[#F5C542] hover:bg-[#ffd65c] text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Get Study Pass
            </button>
          </div>

        </div>

        {/* Compact Tabbed Helper (Savings Calculator OR 3-Step Plan Finder) */}
        <div className="studio-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {helperTab === 'calculator' ? 'Calculate your monthly savings' : 'Find the right plan in 3 steps'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {helperTab === 'calculator'
                  ? 'Compare Pay-As-You-Go vs. Study Pass for your workload.'
                  : 'Answer three quick questions for a tailored recommendation.'}
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-full bg-[#FAFAF7] border border-slate-300 self-start sm:self-center">
              <button
                onClick={() => setHelperTab('calculator')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  helperTab === 'calculator' ? 'bg-[#0F2249] text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Savings Calculator</span>
              </button>
              <button
                onClick={() => setHelperTab('quiz')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  helperTab === 'quiz' ? 'bg-[#0F2249] text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Plan Finder</span>
              </button>
            </div>
          </div>

          {helperTab === 'calculator' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-6">
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <label htmlFor="sessions-slider" className="text-slate-700 font-medium">
                      Expert sessions per month:
                    </label>
                    <span className="font-bold text-[#0F2249] text-sm font-mono-nums">{sessionsCount}</span>
                  </div>
                  <input
                    id="sessions-slider"
                    type="range"
                    min="1"
                    max="8"
                    value={sessionsCount}
                    onChange={e => setSessionsCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2249]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <label htmlFor="urgent-slider" className="text-slate-700 font-medium">
                      Urgent upgrades (+Q25 each):
                    </label>
                    <span className="font-bold text-[#0F2249] text-sm font-mono-nums">{urgentCount}</span>
                  </div>
                  <input
                    id="urgent-slider"
                    type="range"
                    min="0"
                    max="3"
                    value={urgentCount}
                    onChange={e => setUrgentCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F2249]"
                  />
                </div>
              </div>

              <div className="bg-[#FAFAF7] p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Pay as you go</span>
                  <span className="font-bold text-slate-900 text-base font-mono-nums">Q{payAsYouGoTotal}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-3">
                  <span className="font-semibold text-[#0F2249]">Study Pass</span>
                  <span className="font-extrabold text-[#0F2249] text-lg font-mono-nums">Q{studyPassTotal}</span>
                </div>
                {savings > 0 ? (
                  <div className="text-emerald-700 text-xs font-semibold flex items-center gap-2 pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Study Pass saves you <strong>Q{savings}</strong> per month.</span>
                  </div>
                ) : (
                  <div className="text-slate-600 text-xs pt-1">
                    {savings === 0
                      ? `Both options equal Q${studyPassTotal} at this level.`
                      : `Pay As You Go saves Q${Math.abs(savings)} for lighter use.`}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-6">
              {!quizCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map(idx => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === quizStep ? 'w-8 bg-[#0F2249]' : idx < quizStep ? 'w-3 bg-emerald-500' : 'w-2 bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-2 font-mono-nums">Step {quizStep + 1} of 3</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{questions[quizStep].q}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {questions[quizStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectQuizOption(opt.value)}
                        className="p-4 rounded-2xl bg-[#FAFAF7] hover:bg-slate-100 border border-slate-200 text-left text-xs text-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
                      >
                        <span>{opt.text}</span>
                        <span className="text-[11px] text-[#0F2249] font-bold mt-3 inline-flex items-center gap-1">
                          <span>Select</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-[#0F2249] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-950">
                    Recommended: {recommendedPlan.name}
                  </h4>
                  <p className="text-xs text-slate-600">{recommendedPlan.desc}</p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectPlan(recommendedPlan.plan, recommendedPlan.name)}
                      className="px-5 py-2 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs cursor-pointer"
                    >
                      Choose {recommendedPlan.plan}
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
