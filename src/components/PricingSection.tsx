import React, { useState } from 'react';
import { Check, Sparkles, Calculator, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PricingSectionProps {
  onOpenTrialModal: () => void;
  onSelectPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenTrialModal, onSelectPlan }) => {
  // Calculator state
  const [sessionsCount, setSessionsCount] = useState(3);
  const [urgentCount, setUrgentCount] = useState(1);

  // Quiz state
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Calculations
  const payAsYouGoTotal = sessionsCount * 120 + urgentCount * 25;
  
  // Study Pass: Q319 covers 3 sessions + 1 urgent.
  // Additional sessions at discounted Q100, additional urgent at Q25.
  const extraSessions = Math.max(0, sessionsCount - 3);
  const extraUrgent = Math.max(0, urgentCount - 1);
  const studyPassTotal = 319 + extraSessions * 100 + extraUrgent * 25;
  const savings = payAsYouGoTotal - studyPassTotal;

  // Quiz Questions
  const questions = [
    {
      q: 'How often do you need help at the last minute?',
      options: [
        { text: 'Almost never — I plan ahead and study during the week', value: 'free' },
        { text: 'Sometimes, right before a major midterm or final', value: 'single' },
        { text: 'Frequently — it always seems to be an urgent emergency', value: 'pass' }
      ]
    },
    {
      q: 'What subject gives you the most headaches this semester?',
      options: [
        { text: 'Physics, Calculus, or Advanced Math', value: 'math' },
        { text: 'Chemistry, Biology, or Lab Reports', value: 'science' },
        { text: 'Essays, Thesis Statements, or Languages', value: 'humanities' }
      ]
    },
    {
      q: 'How do you prefer to resolve questions when stuck?',
      options: [
        { text: 'Self-guided reading with instant step-by-step AI breakdowns', value: 'free' },
        { text: '1-on-1 private tutoring with notes and whiteboard work', value: 'single' },
        { text: 'Hybrid: Quick AI answers at night + regular weekly tutor sessions', value: 'pass' }
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

  // Determine recommendation
  const recommendedPlan = quizAnswers.filter(a => a === 'pass').length >= 1
    ? { name: 'Study Pass (Q319/mo)', desc: 'Because you frequently study late and want both AI and included urgent live sessions.', plan: 'Study Pass' }
    : quizAnswers.filter(a => a === 'single').length >= 1
    ? { name: 'Single Session (Q120)', desc: 'Perfect for targeting tough exam weeks with a verified specialist on demand.', plan: 'Single session' }
    : { name: 'Free AI + Community', desc: 'Ideal for self-guided homework help with instant step-by-step citations.', plan: 'Free' };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-[#091124] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">Transparent Pricing</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Simple prices. Try it before you pay.
          </h2>
          <p className="mt-3 text-base text-slate-300">
            No unexpected charges or credit card requirements to test our platform.
          </p>
        </div>

        {/* Free trial highlight banner */}
        <div className="bg-gradient-to-r from-[#0e1f44] via-[#152a5a] to-[#0e1f44] border-2 border-[#F6C62B]/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F6C62B] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Risk Free</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              3-day free trial of the full ProLnk service
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Three days of general-knowledge classes and unlimited messages with our AI assistant with full citations. If it isn’t for you, you’ve lost nothing.
            </p>
          </div>

          <button
            onClick={onOpenTrialModal}
            className="px-6 py-3 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-[#F6C62B]/20 transition-all cursor-pointer shrink-0"
          >
            Start free trial
          </button>
        </div>

        {/* 3 Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Tier */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-display font-mono-nums">Q0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                For quick midnight questions and browsing peer answers.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>AI chatbot with cited textbook sources</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Community student discussion forum</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Personal dashboard & notebook</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span className="w-4 h-4 text-center">·</span>
                  <span>Human 1-on-1 sessions not included</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenTrialModal}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Create free account
            </button>
          </div>

          {/* Single Session */}
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Single session</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-display font-mono-nums">Q120</span>
                <span className="text-xs text-slate-400">/ per 1-hour</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Pay only when you want a verified human tutor.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Private 1-on-1 with a verified degree expert</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Written whiteboard notes saved to dashboard</span>
                </li>
                <li className="flex items-center gap-2 text-amber-300">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Urgent live upgrade eligible for +Q25</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" />
                  <span>Includes all Free AI & Community features</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan('Single session', 'Q120')}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Book a session
            </button>
          </div>

          {/* Study Pass (Featured) */}
          <div className="bg-[#0f1f42] border-2 border-[#F6C62B] rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-[#F6C62B]/10">
            <div>
              <div className="text-[11px] font-bold text-[#F6C62B] uppercase tracking-wider mb-2">
                Most Popular · Made for exam season
              </div>
              <h3 className="text-xl font-bold text-white font-display">Study Pass</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#F6C62B] font-display font-mono-nums">Q319</span>
                <span className="text-xs text-slate-300">/ per month</span>
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Three sessions a month with priority tutor matching.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200 border-t border-slate-700 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" strokeWidth={3} />
                  <span><strong>3 expert sessions</strong> of 1 hour included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" strokeWidth={3} />
                  <span><strong>1 urgent upgrade included</strong> (saves Q25)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" strokeWidth={3} />
                  <span>Priority expert scheduling during finals week</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#F6C62B] shrink-0" strokeWidth={3} />
                  <span>Cancel anytime with zero penalties</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan('Study Pass', 'Q319/mo')}
              className="mt-8 w-full py-2.5 px-4 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Get Study Pass
            </button>
          </div>

        </div>

        {/* Interactive Savings Calculator */}
        <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2 text-[#F6C62B]">
            <Calculator className="w-5 h-5" />
            <h3 className="text-xl font-bold text-white font-display">Do the math yourself.</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mb-8">
            Compare Pay-As-You-Go vs. the Study Pass based on your expected monthly study load.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sliders Box */}
            <div className="space-y-6 bg-[#080f21] p-6 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <label htmlFor="sessions-slider" className="text-slate-200 font-medium">
                    Expert sessions this month (1 hour each):
                  </label>
                  <span className="font-bold text-[#F6C62B] text-base font-mono-nums">{sessionsCount}</span>
                </div>
                <input
                  id="sessions-slider"
                  type="range"
                  min="1"
                  max="8"
                  value={sessionsCount}
                  onChange={e => setSessionsCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#F6C62B]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono-nums">
                  <span>1 session</span>
                  <span>4 sessions</span>
                  <span>8 sessions</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <label htmlFor="urgent-slider" className="text-slate-200 font-medium">
                    Urgent upgrades requested (+Q25 each):
                  </label>
                  <span className="font-bold text-[#F6C62B] text-base font-mono-nums">{urgentCount}</span>
                </div>
                <input
                  id="urgent-slider"
                  type="range"
                  min="0"
                  max="3"
                  value={urgentCount}
                  onChange={e => setUrgentCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#F6C62B]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono-nums">
                  <span>0 urgent</span>
                  <span>1 urgent</span>
                  <span>3 urgent</span>
                </div>
              </div>
            </div>

            {/* Price Output Comparison Box */}
            <div className="bg-[#080f21] p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-300">Pay as you go</div>
                  <div className="text-[11px] text-slate-400">Q120/hr standard + Q25 per urgent</div>
                </div>
                <div className="text-xl font-bold text-white font-mono-nums">
                  Q{payAsYouGoTotal}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-semibold text-[#F6C62B]">Study Pass</div>
                  <div className="text-[11px] text-slate-400">Includes 3 sessions & 1 urgent upgrade</div>
                </div>
                <div className="text-xl font-extrabold text-[#F6C62B] font-mono-nums">
                  Q{studyPassTotal}
                </div>
              </div>

              <div className="pt-1">
                {savings > 0 ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>The Study Pass saves you <strong>Q{savings}</strong> this month!</span>
                  </div>
                ) : savings === 0 ? (
                  <div className="p-3 bg-slate-800/80 rounded-lg text-slate-300 text-xs">
                    Both options cost the exact same (Q{studyPassTotal}) for 3 sessions and 1 urgent upgrade.
                  </div>
                ) : (
                  <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-lg text-blue-200 text-xs">
                    For 1–2 occasional sessions, Pay As You Go is more cost-effective (saves Q{Math.abs(savings)}).
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Recommendation Quiz */}
        <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2 text-[#F6C62B]">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-xl font-bold text-white font-display">Not sure which plan to pick?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mb-6">
            Answer three quick questions and we’ll point you directly to the ideal plan.
          </p>

          {!quizCompleted ? (
            <div className="space-y-4">
              {/* Step indicator dots */}
              <div className="flex items-center gap-2 mb-4">
                {[0, 1, 2].map(idx => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === quizStep
                        ? 'w-8 bg-[#F6C62B]'
                        : idx < quizStep
                        ? 'w-2 bg-emerald-400'
                        : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
                <span className="text-[11px] text-slate-400 ml-2 font-mono-nums">Step {quizStep + 1} of 3</span>
              </div>

              <h4 className="text-base font-bold text-white font-display">
                {questions[quizStep].q}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {questions[quizStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectQuizOption(opt.value)}
                    className="p-4 rounded-xl bg-[#080f21] hover:bg-[#122248] border border-slate-800 hover:border-[#F6C62B]/50 text-left text-xs sm:text-sm text-slate-200 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span>{opt.text}</span>
                    <span className="text-[11px] text-[#F6C62B] font-semibold mt-3 flex items-center gap-1">
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#080f21] border border-[#F6C62B]/40 rounded-xl p-6 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white font-display">
                Recommended For You: <span className="text-[#F6C62B]">{recommendedPlan.name}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {recommendedPlan.desc}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onSelectPlan(recommendedPlan.plan, recommendedPlan.name)}
                  className="px-5 py-2.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs cursor-pointer shadow"
                >
                  Choose {recommendedPlan.plan}
                </button>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Retake quiz
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
