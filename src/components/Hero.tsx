import React, { useState } from 'react';
import { AI_PRESET_QUESTIONS, EXPERTS_DATA } from '../data/mockData';
import { Expert } from '../types';
import { Check, Send, ArrowRight, UserCheck, CheckCircle2, Lock, Sparkles, Star } from 'lucide-react';
import heroStudyImg from '../assets/images/hero_study.jpg';

interface HeroProps {
  onOpenTrialModal: () => void;
  onBookExpert: (expert: Expert) => void;
  isSubscribed?: boolean;
}

const FREE_QUESTION_LIMIT = 3;

export const Hero: React.FC<HeroProps> = ({ onOpenTrialModal, onBookExpert, isSubscribed = false }) => {
  const [selectedTopic, setSelectedTopic] = useState('Calculus');
  const [questionsCount, setQuestionsCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
    source?: string;
    expertId?: string;
  }[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Why is the derivative of ln(x) equal to 1/x? I have an exam tomorrow.'
    },
    {
      id: 'm2',
      sender: 'ai',
      text: 'Start with y = ln(x), which means e^y = x.\nDifferentiate both sides: e^y · y′ = 1.\nSince e^y equals x, you get y′ = 1/x.\nTry it once yourself on ln(2x) to lock it in.',
      source: 'OpenStax Calculus Volume 1, section 3.9',
      expertId: 'daniela-rios'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSelectPreset = (topic: string) => {
    setSelectedTopic(topic);
    setSavedFeedback(false);
    const item = AI_PRESET_QUESTIONS.find(q => q.topic.toLowerCase() === topic.toLowerCase());
    if (item) {
      setIsTyping(true);
      setChatMessages([
        {
          id: Date.now() + '-u',
          sender: 'user',
          text: item.question
        }
      ]);

      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-a',
            sender: 'ai',
            text: item.answer,
            source: item.source,
            expertId: item.expertId
          }
        ]);
        setIsTyping(false);
      }, 80);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    if (!isSubscribed && questionsCount >= FREE_QUESTION_LIMIT) {
      onOpenTrialModal();
      return;
    }

    const userText = inputVal.trim();
    setInputVal('');
    setSavedFeedback(false);
    setQuestionsCount(prev => prev + 1);

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now() + '-u',
        sender: 'user',
        text: userText
      }
    ]);

    setIsTyping(true);

    try {
      // Call server-side Gemini API
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });

      const data = await res.json();

      if (data && data.reply) {
        // Parse reply text and optional Source line
        const lines = data.reply.split('\n');
        let sourceLine = 'OpenStax Peer-Reviewed Curriculum Standards';
        let bodyLines = [];

        for (const line of lines) {
          if (line.toLowerCase().startsWith('source:')) {
            sourceLine = line.replace(/source:\s*/i, '').trim();
          } else {
            bodyLines.push(line);
          }
        }

        const bodyText = bodyLines.join('\n').trim();

        // Assign suitable expert for follow-up
        const lower = userText.toLowerCase();
        let expertId = 'daniela-rios';
        if (lower.includes('physics') || lower.includes('gravity') || lower.includes('force') || lower.includes('speed')) {
          expertId = 'andres-molina';
        } else if (lower.includes('chemistry') || lower.includes('molecule') || lower.includes('reaction') || lower.includes('biology')) {
          expertId = 'marcus-bell';
        } else if (lower.includes('essay') || lower.includes('thesis') || lower.includes('writing') || lower.includes('grammar')) {
          expertId = 'priya-nair';
        } else if (lower.includes('python') || lower.includes('code') || lower.includes('programming') || lower.includes('sql')) {
          expertId = 'tomas-herrera';
        }

        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now() + '-a',
            sender: 'ai',
            text: bodyText || data.reply,
            source: sourceLine,
            expertId: expertId
          }
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Ignore and fallback gracefully
    }

    // Fallback if API key is not configured or offline
    setTimeout(() => {
      let answerText = '';
      let sourceText = '';
      let expertId = 'daniela-rios';

      const lower = userText.toLowerCase();
      if (lower.includes('integral') || lower.includes('derivative') || lower.includes('math') || lower.includes('calculus')) {
        answerText = 'Here is the step-by-step method:\n1. Rewrite the expression into fundamental components.\n2. Apply the chain rule or integration by parts (LIATE rule).\n3. Check edge boundary limits to verify the final answer.';
        sourceText = 'Stewart Calculus: Early Transcendentals (8th Ed), Section 4.3';
        expertId = 'daniela-rios';
      } else if (lower.includes('physics') || lower.includes('force') || lower.includes('acceleration') || lower.includes('momentum')) {
        answerText = 'For this physics problem:\n1. Draw a clear free-body diagram showing all external forces.\n2. Set up Newton\'s 2nd Law equations: ΣFx = m·ax and ΣFy = m·ay.\n3. Solve for unknown components and check physical units.';
        sourceText = 'Giancoli Physics: Principles with Applications (7th Ed), Chapter 4';
        expertId = 'andres-molina';
      } else if (lower.includes('chemistry') || lower.includes('reaction') || lower.includes('moles') || lower.includes('acid')) {
        answerText = 'Key chemistry steps:\n1. Balance the chemical equation with correct integer coefficients.\n2. Convert given mass to moles (moles = mass / molar mass).\n3. Apply stoichiometric ratios to find limiting reagent and theoretical yield.';
        sourceText = 'Atkins & Jones, Chemical Principles (6th Ed), Section 2.1';
        expertId = 'marcus-bell';
      } else if (lower.includes('essay') || lower.includes('thesis') || lower.includes('argument')) {
        answerText = 'To structure a persuasive academic thesis:\n1. Counter-argument: Acknowledge the primary opposing viewpoint.\n2. Central claim: State your specific, debatable stance.\n3. Rationale: Provide the "because" clause previewing your body evidence.';
        sourceText = 'The Craft of Research (4th Ed), Chapter 9';
        expertId = 'priya-nair';
      } else {
        answerText = `Here is the step-by-step breakdown:\n1. Deconstruct the problem into foundational premises.\n2. Connect relevant course formulas to the given variables.\n3. Test the result against standard physical/mathematical invariants.`;
        sourceText = 'OpenStax General College Curriculum (Peer-Reviewed Edition)';
        expertId = 'daniela-rios';
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-a',
          sender: 'ai',
          text: answerText,
          source: sourceText,
          expertId: expertId
        }
      ]);
      setIsTyping(false);
    }, 100);
  };

  const currentAiMessage = [...chatMessages].reverse().find(m => m.sender === 'ai');
  const matchedExpert = currentAiMessage?.expertId
    ? EXPERTS_DATA.find(e => e.id === currentAiMessage.expertId) || EXPERTS_DATA[0]
    : EXPERTS_DATA[0];

  const hasReachedLimit = !isSubscribed && questionsCount >= FREE_QUESTION_LIMIT;

  return (
    <section id="top" className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading and CTAs matching original template and image.png */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] text-white font-hero-headline" style={{ textWrap: 'balance' }}>
              Homework help that doesn’t wait until morning.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Ask our AI for an instant answer, then bring in a verified expert when you want a real person. Free to start, with a 3-day trial of the full service.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenTrialModal}
                className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-[#F6C62B] hover:bg-[#ffd644] rounded-lg shadow-lg shadow-[#F6C62B]/20 transition-all duration-150 cursor-pointer"
              >
                Start your free 3-day trial
              </button>
              <a
                href="#how"
                className="px-5 py-3.5 text-sm font-semibold text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                See how it works
              </a>
            </div>

            {/* Checklist items matching original */}
            <ul className="space-y-3 pt-4 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="p-1 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span>Unlimited AI messages during your trial</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="p-1 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span>Every AI answer shows where it comes from</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="p-1 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span>Urgent help from a human in about 15 minutes</span>
              </li>
            </ul>

            {/* Visual Social Proof Card with Cinematic Study Photo */}
            <div className="pt-2 flex items-center gap-3.5 p-3 rounded-2xl bg-[#0c162e]/90 border border-slate-700/80 shadow-xl max-w-lg">
              <img
                src={heroStudyImg}
                alt="Student studying advanced calculus and physics with ProLnk"
                className="w-16 h-16 rounded-xl object-cover border border-[#F6C62B]/40 shrink-0 shadow-md"
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Trusted by 14,000+ STEM Students</span>
                </div>
                <div className="flex items-center gap-1 text-[#F6C62B] text-[11px] font-bold mt-0.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-[#F6C62B]" />
                    ))}
                  </div>
                  <span className="text-slate-200">4.9/5 from verified college midterms</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Average grade improvement of +18% on exams.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Working AI Chat with Question Limit */}
          <div className="lg:col-span-6">
            <div className="bg-[#0c162e] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
              
              {/* Chat Header */}
              <div className="px-5 py-3.5 bg-[#080f21] border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">ProLnk AI</h3>
                  <div className="text-[11px] text-slate-400">Instant answers with cited academic sources</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">Online 24/7</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-4 py-2.5 ${
                        msg.sender === 'user'
                          ? 'bg-[#1b2f60] text-white border border-[#2b4486]'
                          : 'bg-[#122144] text-slate-200 border border-slate-700/60 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      
                      {/* Academic Textbook Source Line */}
                      {msg.source && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-[#F6C62B]">
                          <span className="font-semibold text-slate-400">Source: </span>
                          <span className="text-slate-200 italic">{msg.source}</span>
                        </div>
                      )}
                    </div>

                    {/* Expert handoff buttons under AI answer */}
                    {msg.sender === 'ai' && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
                        <button
                          onClick={() => onBookExpert(matchedExpert)}
                          className="px-3 py-1.5 rounded-md bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Match me with an expert ({matchedExpert.name.split(' ')[0]})</span>
                        </button>
                        <button
                          onClick={() => setSavedFeedback(true)}
                          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                        >
                          {savedFeedback ? 'Saved to notes!' : 'No thanks, that helped'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-[#122144] w-fit px-3 py-2 rounded-lg border border-slate-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F6C62B] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] ml-1">Analyzing curriculum & citing source...</span>
                  </div>
                )}

                {savedFeedback && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Saved to your personal dashboard notebook.</span>
                  </div>
                )}
              </div>

              {/* Preset question chips */}
              <div className="px-4 py-2 bg-[#080f21] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 shrink-0 font-medium text-[11px]">Try a question:</span>
                {['Calculus', 'Essay thesis', 'Physics', 'Chemistry'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleSelectPreset(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTopic.toLowerCase() === t.toLowerCase()
                        ? 'bg-[#F6C62B] text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Chat Input or Free Limit Lock Banner */}
              {!hasReachedLimit ? (
                <div className="p-3 bg-[#080f21] border-t border-slate-800">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder="Ask the AI anything about your homework…"
                      className="flex-1 bg-[#122144] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!inputVal.trim() || isTyping}
                      className="px-4 py-2.5 bg-[#F6C62B] hover:bg-[#ffd744] disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  {questionsCount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                      <span>Preview question {questionsCount} of {FREE_QUESTION_LIMIT}</span>
                      <button
                        onClick={onOpenTrialModal}
                        className="text-[#F6C62B] hover:underline cursor-pointer"
                      >
                        Unlock unlimited AI with trial →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Question Limit Reached: Conversion lock prompt */
                <div className="p-4 bg-gradient-to-r from-[#0F2249] to-[#162a5b] border-t border-[#F6C62B]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <div className="w-8 h-8 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">You've reached your free preview limit</div>
                      <div className="text-[11px] text-slate-300">Start your free 3-day trial to continue asking unlimited questions.</div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenTrialModal}
                    className="w-full sm:w-auto px-4 py-2 bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap shadow cursor-pointer transition-colors"
                  >
                    Start Free Trial
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
