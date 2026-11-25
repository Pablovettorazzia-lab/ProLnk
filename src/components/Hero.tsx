import React, { useState, useRef } from 'react';
import { AI_PRESET_QUESTIONS, EXPERTS_DATA } from '../data/mockData';
import { Expert, StudyDocumentPayload, VerifiedSource } from '../types';
import {
  Send,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Star,
  BookOpen,
  Paperclip,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import heroStudyImg from '../assets/images/hero_study.jpg';
import { VerifiedSourcesBar } from './VerifiedSourcesBar';
import { readStudyFile, MAX_STUDY_FILES } from '../utils/studyFiles';

interface HeroProps {
  onOpenTrialModal: () => void;
  onBookExpert: (expert: Expert) => void;
  onEnterDemo?: () => void;
  isSubscribed?: boolean;
}

interface HeroChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  source?: string;
  sources?: VerifiedSource[];
  searchQueries?: string[];
  webGroundingSkipped?: boolean;
  attachedFileNames?: string[];
  expertId?: string;
  isError?: boolean;
}

const FREE_QUESTION_LIMIT = 3;

export const Hero: React.FC<HeroProps> = ({
  onOpenTrialModal,
  onBookExpert,
  onEnterDemo,
  isSubscribed = false
}) => {
  const [selectedTopic, setSelectedTopic] = useState('Calculus');
  const [questionsCount, setQuestionsCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<HeroChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Why is the derivative of ln(x) equal to 1/x? I have an exam tomorrow.'
    },
    {
      id: 'm2',
      sender: 'ai',
      text: 'Start with y = ln(x), which means e^y = x.\nDifferentiate both sides: e^y · y′ = 1.\nSince e^y equals x, you get y′ = 1/x.\nTry it once yourself on ln(2x) to lock it in.',
      source: 'OpenStax Calculus Volume 1, Section 3.9',
      sources: [
        {
          title: 'OpenStax Calculus Vol. 1 · Sec. 3.9 (Derivatives of Logs)',
          uri: 'https://openstax.org/books/calculus-volume-1/pages/3-9-derivatives-of-exponential-and-logarithmic-functions',
          type: 'textbook'
        }
      ],
      expertId: 'daniela-rios'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<StudyDocumentPayload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (topic: string) => {
    setSelectedTopic(topic);
    setSavedFeedback(false);
    setUploadError(null);
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
            sources: item.sources,
            expertId: item.expertId
          }
        ]);
        setIsTyping(false);
      }, 80);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    if (attachedDocs.length + files.length > MAX_STUDY_FILES) {
      setUploadError(`You can attach up to ${MAX_STUDY_FILES} study files per message.`);
      return;
    }

    try {
      const encoded = await Promise.all(files.map(readStudyFile));
      setAttachedDocs(prev => [...prev, ...encoded].slice(0, MAX_STUDY_FILES));
    } catch (err: any) {
      setUploadError(err?.message || 'Unable to attach file.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputVal.trim() && attachedDocs.length === 0) || isTyping) return;

    if (!isSubscribed && questionsCount >= FREE_QUESTION_LIMIT) {
      onOpenTrialModal();
      return;
    }

    const userText =
      inputVal.trim() || 'Please explain and solve the attached study material step-by-step.';
    const docsToSend = [...attachedDocs];
    setInputVal('');
    setAttachedDocs([]);
    setUploadError(null);
    setSavedFeedback(false);
    setQuestionsCount(prev => prev + 1);

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now() + '-u',
        sender: 'user',
        text: userText,
        attachedFileNames: docsToSend.map(d => d.name)
      }
    ]);

    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatMessages
            .filter(m => !m.isError)
            .map(m => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text
            })),
          documents: docsToSend.map(d => ({
            name: d.name,
            mimeType: d.mimeType,
            base64Data: d.base64Data
          })),
          groundingMode: 'hybrid',
          userContext: { isSubscribed }
        })
      });

      const data = await res.json();

      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || 'Could not verify answer with ProLnk AI.');
      }

      const cleanLines = data.reply
        .split('\n')
        .filter((line: string) => !line.toLowerCase().startsWith('source:'))
        .join('\n')
        .trim();

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
          text: cleanLines || data.reply,
          sources: Array.isArray(data.sources) ? data.sources : [],
          searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
          webGroundingSkipped: Boolean(data.webGroundingSkipped),
          expertId
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + '-err',
          sender: 'ai',
          text:
            err?.message ||
            'Unable to reach ProLnk AI right now. Please try again in a moment or match with a live tutor.',
          isError: true,
          expertId: 'daniela-rios'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentAiMessage = [...chatMessages].reverse().find(m => m.sender === 'ai');
  const matchedExpert = currentAiMessage?.expertId
    ? EXPERTS_DATA.find(e => e.id === currentAiMessage.expertId) || EXPERTS_DATA[0]
    : EXPERTS_DATA[0];

  const hasReachedLimit = !isSubscribed && questionsCount >= FREE_QUESTION_LIMIT;

  return (
    <section id="top" className="relative pt-14 pb-20 md:pt-20 md:pb-28 bg-[#FAFAF7] overflow-hidden border-b border-slate-200/70">
      {/* Subtle Dreamy Warm Mesh */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] bg-sky-200/40 rounded-full blur-[110px]" />
      <div className="pointer-events-none absolute top-10 right-0 w-[440px] h-[440px] bg-amber-200/45 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Simple, Serene Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F2249]">
              Web-Verified AI · Your Study PDFs · 1-on-1 Tutors
            </div>

            <h1
              className="text-slate-950 font-hero-headline"
              style={{ fontSize: 'clamp(2.5rem, 4.3vw, 3.9rem)', textWrap: 'balance' }}
            >
              Homework help that{' '}
              <span className="font-serif-accent text-[#0F2249] font-normal">doesn’t wait</span>{' '}
              until morning.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              Get step-by-step AI answers backed by live web sources or your own uploaded PDFs and class notes, plus verified human tutors in minutes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenTrialModal}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#0F2249] hover:bg-[#19346b] rounded-full transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-[#0F2249]/15"
              >
                <span>Start free 3-day trial</span>
                <ArrowRight className="w-4 h-4 text-[#F5C542]" />
              </button>
              {onEnterDemo && (
                <button
                  onClick={onEnterDemo}
                  className="px-5 py-3.5 text-sm font-semibold text-[#0F2249] hover:text-slate-950 bg-white hover:bg-amber-50 border border-slate-300 hover:border-[#0F2249]/40 rounded-full transition-colors cursor-pointer shadow-sm"
                >
                  Enter Demo Portal
                </button>
              )}
            </div>

            {/* Clean Single Trust Strip */}
            <div className="pt-6 mt-2 border-t border-slate-200/80 flex items-center gap-4 max-w-md">
              <img
                src={heroStudyImg}
                alt="Student studying with ProLnk"
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-mono-nums">4.9/5</span>
                  <span className="text-slate-400">·</span>
                  <span>14,000+ students</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Real clickable web links &amp; PDF grounding · Live help in ~15 min
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bright Floating AI Tutor Workbench */}
          <div className="lg:col-span-6">
            <div className="studio-card rounded-3xl overflow-hidden flex flex-col h-[540px]">
              
              {/* Clean Light Card Header */}
              <div className="px-5 py-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300/80 text-[#0F2249] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 leading-none">ProLnk AI Tutor</h3>
                    <div className="text-[11px] text-slate-600 mt-0.5">Live web citations · PDF/notes upload</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Verified 24/7
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FCFBF9] text-xs sm:text-sm">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#0F2249] text-white shadow-sm'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200/80 shadow-sm'
                      }`}
                    >
                      {msg.attachedFileNames && msg.attachedFileNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {msg.attachedFileNames.map(name => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-medium"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">{name}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      
                      {!msg.isError && (
                        <VerifiedSourcesBar
                          sources={msg.sources}
                          fallbackText={msg.source}
                          searchQueries={msg.searchQueries}
                          webGroundingSkipped={msg.webGroundingSkipped}
                          variant="light"
                          compact
                        />
                      )}
                    </div>

                    {msg.sender === 'ai' && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 pl-0.5">
                        <button
                          onClick={() => onBookExpert(matchedExpert)}
                          className="px-3 py-1.5 rounded-full bg-[#F5C542] hover:bg-[#ffd65c] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Match with {matchedExpert.name.split(' ')[0]}</span>
                        </button>
                        <button
                          onClick={() => setSavedFeedback(true)}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                        >
                          {savedFeedback ? 'Saved' : 'Save note'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs bg-white w-fit px-3.5 py-2 rounded-full border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.3s]"></span>
                    <span className="text-[11px] ml-1">Verifying live sources...</span>
                  </div>
                )}

                {savedFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Saved to your student notebook.</span>
                  </div>
                )}
              </div>

              {/* Topic Switcher */}
              <div className="px-4 py-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-600 shrink-0 font-semibold text-[11px]">Try:</span>
                {['Calculus', 'Essay thesis', 'Physics', 'Chemistry'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleSelectPreset(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTopic.toLowerCase() === t.toLowerCase()
                        ? 'bg-[#0F2249] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              {!hasReachedLimit ? (
                <div className="p-3.5 bg-white border-t border-slate-200/80 space-y-2">
                  {uploadError && (
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setUploadError(null)}
                        className="cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {attachedDocs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {attachedDocs.map(doc => (
                        <span
                          key={doc.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-[#0F2249] text-[11px] font-medium"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachedDocs(prev => prev.filter(d => d.id !== doc.id))
                            }
                            className="hover:text-rose-600 cursor-pointer"
                            aria-label={`Remove ${doc.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md,.csv,.png,.jpg,.jpeg,.webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer shrink-0"
                      title="Attach PDF, study notes, or homework photo"
                      aria-label="Attach study file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder="Ask a question or attach a study PDF…"
                      className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-950 placeholder-slate-500 focus:outline-none focus:border-[#0F2249] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={(!inputVal.trim() && attachedDocs.length === 0) || isTyping}
                      className="p-2.5 bg-[#0F2249] hover:bg-[#19346b] disabled:opacity-40 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  {questionsCount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
                      <span className="font-mono-nums">Preview {questionsCount}/{FREE_QUESTION_LIMIT} used</span>
                      <button
                        onClick={onOpenTrialModal}
                        className="text-[#0F2249] hover:underline cursor-pointer font-semibold"
                      >
                        Unlock unlimited →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-[#0F2249] flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Preview limit reached</div>
                      <div className="text-[11px] text-slate-600">Start your 3-day free trial for unlimited AI tutoring.</div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenTrialModal}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs rounded-full whitespace-nowrap cursor-pointer transition-colors"
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
