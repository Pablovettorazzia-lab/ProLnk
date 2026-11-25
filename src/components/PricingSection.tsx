import React, { useState } from 'react';
import { Check, ArrowUpRight, Calculator, HelpCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onOpenTrialModal: () => void;
  onSelectPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onOpenTrialModal,
  onSelectPlan
}) => {
  const [helperTab, setHelperTab] = useState<'calculator' | 'quiz'>('calculator');
  const [sessionsCount, setSessionsCount] = useState(3);
  const [urgentCount, setUrgentCount] = useState(1);

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const payAsYouGoTotal = sessionsCount * 120 + urgentCount * 25;
  const extraSessions = Math.max(0, sessionsCount - 3);
  const extraUrgent = Math.max(0, urgentCount - 1);
  const plusPlanTotal = 240 + extraSessions * 95 + extraUrgent * 25;
  const savings = payAsYouGoTotal - plusPlanTotal;

  const questions = [
    {
      q: 'How often do you need help at the last minute?',
      options: [
        { text: 'Almost never — I study steadily throughout the week', value: 'starter' },
        { text: 'Sometimes, right before midterms or finals', value: 'plus' },
        { text: 'Frequently — I need quick tutors and answers every week', value: 'unlimited' }
      ]
    },
    {
      q: 'Which subjects take up most of your study time?',
      options: [
        { text: 'Calculus, Physics, or University Math', value: 'stem' },
        { text: 'Organic Chemistry, Biochemistry, or Labs', value: 'stem' },
        { text: 'Programming, Economics, or Academic Writing', value: 'plus' }
      ]
    },
    {
      q: 'How do you prefer to get unstuck?',
      options: [
        { text: 'AI explanations plus 1 key session per month', value: 'starter' },
        { text: 'Unlimited AI + 3 monthly 1-on-1 tutoring hours', value: 'plus' },
        { text: 'Top urgent priority and 6 hours/month with experts', value: 'unlimited' }
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

  const recommendedPlan =
    quizAnswers.filter(a => a === 'unlimited').length >= 1
      ? {
          name: 'Unlimited STEM (Q450/mo)',
          desc: 'Ideal for going deep across demanding subjects with 6 tutoring hours and priority urgent matching.',
          plan: 'Unlimited STEM'
        }
      : quizAnswers.filter(a => a === 'plus' || a === 'stem').length >= 1
      ? {
          name: 'Plus (Q240/mo)',
          desc: 'Our most balanced choice: 3 hours of 1-on-1 tutoring monthly, unlimited AI, and saved whiteboard notes.',
          plan: 'Plus'
        }
      : {
          name: 'Starter (Q120/mo)',
          desc: 'Great for clearing your first questions with 1 tutoring hour and 50 AI questions per month.',
          plan: 'Starter'
        };

  return (
    <section id="pricing" className="py-16 md:py-22 bg-[#FAFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section 04 Editorial Header */}
        <div className="space-y-3 max-w-xl">
          <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
            04 &nbsp;/&nbsp; INVEST IN THAT «I GET IT» MOMENT
          </div>
          <h1
            className="font-editorial text-[#0F2249]"
            style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', lineHeight: 1.1 }}
          >
            A plan for every pace.
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Start with a 3-day trial. Get the support you need to keep moving forward.
          </p>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h2 className="font-editorial text-2xl text-[#0F2249]">Starter</h2>
              <p className="mt-1.5 text-xs text-slate-500">To clear up your first doubts.</p>

              <div className="mt-6 pb-6 border-b border-slate-100 flex items-baseline gap-2">
                <span className="font-editorial text-5xl text-[#0F2249] tracking-tight">Q120</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>1 hour of 1-on-1 tutoring</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>50 AI questions per month</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('Starter', 'Q120/mo')}
              className="mt-8 w-full py-3.5 px-4 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <span>Choose Starter</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plus (Featured Dark Navy Card) */}
          <div className="bg-[#0F2249] text-white rounded-2xl p-7 sm:p-8 flex flex-col justify-between shadow-xl shadow-[#0F2249]/20 relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-editorial text-2xl text-white">Plus</h2>
                <span className="px-2.5 py-1 rounded bg-[#F5C52C] text-[#0F2249] text-[10px] font-mono-nums font-bold uppercase tracking-[0.12em]">
                  MOST SUPPORT
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-300">To make progress a daily habit.</p>

              <div className="mt-6 pb-6 border-b border-white/15 flex items-baseline gap-2">
                <span className="font-editorial text-5xl text-white tracking-tight">Q240</span>
                <span className="text-xs text-slate-300">/ month</span>
              </div>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C52C] shrink-0" />
                  <span>3 hours of 1-on-1 tutoring</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C52C] shrink-0" />
                  <span>Unlimited AI questions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#F5C52C] shrink-0" />
                  <span>Whiteboard notes from your sessions</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('Plus', 'Q240/mo')}
              className="mt-8 w-full py-3.5 px-4 rounded-lg bg-[#F5C52C] hover:bg-[#eab921] text-[#0F2249] font-bold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <span>Choose Plus</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Unlimited STEM */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <h2 className="font-editorial text-2xl text-[#0F2249]">Unlimited STEM</h2>
              <p className="mt-1.5 text-xs text-slate-500">To go deep in every subject.</p>

              <div className="mt-6 pb-6 border-b border-slate-100 flex items-baseline gap-2">
                <span className="font-editorial text-5xl text-[#0F2249] tracking-tight">Q450</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>6 hours of 1-on-1 tutoring</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Unlimited AI questions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                  <span>Priority urgent matching</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('Unlimited STEM', 'Q450/mo')}
              className="mt-8 w-full py-3.5 px-4 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <span>Choose Unlimited</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Trial Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#EBF0F7] border border-slate-200/70 rounded-2xl px-6 py-4 text-xs sm:text-sm">
          <div className="text-[#0F2249]">
            <span className="font-semibold">Want to test it out first with zero commitment?</span>{' '}
            <span className="text-slate-600">
              Start your free 3-day trial with no credit card required.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenTrialModal}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#0F2249] font-semibold text-xs cursor-pointer shrink-0"
          >
            Create free account
          </button>
        </div>

        {/* Interactive Calculator & Plan Finder */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="font-editorial text-xl text-[#0F2249]">
                {helperTab === 'calculator'
                  ? 'Calculate your monthly savings'
                  : 'Find your ideal plan in 3 steps'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {helperTab === 'calculator'
                  ? 'Compare pay-as-you-go sessions vs. the Plus plan for your study schedule.'
                  : 'Answer three quick questions for a tailored recommendation.'}
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-[#FAF9F2] border border-slate-200 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setHelperTab('calculator')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  helperTab === 'calculator'
                    ? 'bg-[#0F2249] text-white'
                    : 'text-slate-600 hover:text-[#0F2249]'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Savings Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => setHelperTab('quiz')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  helperTab === 'quiz'
                    ? 'bg-[#0F2249] text-white'
                    : 'text-slate-600 hover:text-[#0F2249]'
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
                      1-on-1 sessions per month:
                    </label>
                    <span className="font-bold text-[#0F2249] text-sm font-mono-nums">
                      {sessionsCount}
                    </span>
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
                      Urgent priorities (+Q25 each):
                    </label>
                    <span className="font-bold text-[#0F2249] text-sm font-mono-nums">
                      {urgentCount}
                    </span>
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

              <div className="bg-[#FAF9F2] p-5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Pay as you go (Q120 each)</span>
                  <span className="font-bold text-[#0F2249] text-base font-mono-nums">
                    Q{payAsYouGoTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-3">
                  <span className="font-semibold text-[#0F2249]">Plus Plan</span>
                  <span className="font-extrabold text-[#0F2249] text-lg font-mono-nums">
                    Q{plusPlanTotal}
                  </span>
                </div>
                {savings > 0 ? (
                  <div className="text-emerald-700 text-xs font-semibold flex items-center gap-2 pt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      The Plus Plan saves you <strong>Q{savings}</strong> per month.
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-600 text-xs pt-1">
                    For 1 session a month, Starter (Q120) is your lightest choice.
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
                          idx === quizStep
                            ? 'w-8 bg-[#0F2249]'
                            : idx < quizStep
                            ? 'w-3 bg-emerald-500'
                            : 'w-2 bg-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-2 font-mono-nums">
                      Step {quizStep + 1} of 3
                    </span>
                  </div>

                  <h4 className="font-editorial text-lg text-[#0F2249]">
                    {questions[quizStep].q}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {questions[quizStep].options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectQuizOption(opt.value)}
                        className="p-4 rounded-xl bg-[#FAF9F2] hover:bg-[#EBF0F7] border border-slate-200/80 text-left text-xs text-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
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
                <div className="bg-[#FAF9F2] border border-slate-200/80 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
                  <div className="w-10 h-10 rounded-full bg-[#F5C52C] text-[#0F2249] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-editorial text-xl text-[#0F2249]">
                    Recommended: {recommendedPlan.name}
                  </h4>
                  <p className="text-xs text-slate-600">{recommendedPlan.desc}</p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(recommendedPlan.plan, recommendedPlan.name)}
                      className="px-5 py-2 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs cursor-pointer"
                    >
                      Choose {recommendedPlan.plan}
                    </button>
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
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
