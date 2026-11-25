import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  ArrowUpRight,
  ArrowUp,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  UserCheck,
  Lock
} from 'lucide-react';
import { Expert, StudyDocumentPayload, VerifiedSource } from '../types';
import { EXPERTS_DATA } from '../data/mockData';
import { VerifiedSourcesBar } from './VerifiedSourcesBar';
import { readStudyFile, MAX_STUDY_FILES } from '../utils/studyFiles';

interface UnderstandSpaceSectionProps {
  onOpenTrialModal: () => void;
  onExploreHow?: () => void;
  onBookExpert?: (expert: Expert) => void;
  prefilledTopic?: { subject: string; prompt: string; nonce: number } | null;
  isSubscribed?: boolean;
}

interface WorkspaceMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: VerifiedSource[];
  searchQueries?: string[];
  webGroundingSkipped?: boolean;
  attachedFileNames?: string[];
  expertId?: string;
  isError?: boolean;
}

const FREE_PREVIEW_LIMIT = 3;

export const UnderstandSpaceSection: React.FC<UnderstandSpaceSectionProps> = ({
  onOpenTrialModal,
  onExploreHow,
  onBookExpert,
  prefilledTopic,
  isSubscribed = false
}) => {
  const [groundingMode, setGroundingMode] = useState<'document' | 'hybrid'>('document');
  const [showSampleDoc, setShowSampleDoc] = useState(true);
  const [attachedDocs, setAttachedDocs] = useState<StudyDocumentPayload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputFieldRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefilledTopic?.prompt) {
      setInputVal(prefilledTopic.prompt);
      setGroundingMode('hybrid');
      setTimeout(() => {
        inputFieldRef.current?.focus();
      }, 250);
    }
  }, [prefilledTopic]);

  useEffect(() => {
    if (messages.length > 0) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    if (attachedDocs.length + files.length > MAX_STUDY_FILES) {
      setUploadError(`You can attach up to ${MAX_STUDY_FILES} files per question.`);
      return;
    }

    try {
      const encoded = await Promise.all(files.map(readStudyFile));
      setAttachedDocs(prev => [...prev, ...encoded].slice(0, MAX_STUDY_FILES));
    } catch (err: any) {
      setUploadError(err?.message || 'Unable to read the selected file.');
    }
  };

  const sendQuestion = async (rawText: string) => {
    if ((!rawText.trim() && attachedDocs.length === 0) || isLoading) return;

    if (!isSubscribed && questionsUsed >= FREE_PREVIEW_LIMIT) {
      onOpenTrialModal();
      return;
    }

    const userText =
      rawText.trim() || 'Please explain and solve the attached study material step by step.';
    const docsToSend = [...attachedDocs];
    setInputVal('');
    setAttachedDocs([]);
    setUploadError(null);
    setQuestionsUsed(prev => prev + 1);

    setMessages(prev => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: userText,
        attachedFileNames: docsToSend.map(d => d.name)
      }
    ]);

    setIsLoading(true);

    try {
      const effectiveMode =
        docsToSend.length > 0 && groundingMode === 'document'
          ? 'document'
          : 'hybrid';

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages
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
          groundingMode: effectiveMode,
          userContext: { isSubscribed }
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || 'Could not reach ProLnk AI right now.');
      }

      const lower = userText.toLowerCase();
      let expertId = 'daniela-rios';
      if (lower.includes('physics') || lower.includes('force') || lower.includes('kinematics') || lower.includes('momentum')) {
        expertId = 'andres-molina';
      } else if (lower.includes('chem') || lower.includes('redox') || lower.includes('bio') || lower.includes('molecule')) {
        expertId = 'marcus-bell';
      } else if (lower.includes('python') || lower.includes('code') || lower.includes('program') || lower.includes('sql')) {
        expertId = 'tomas-herrera';
      } else if (lower.includes('econ') || lower.includes('financ')) {
        expertId = 'esteban-morales';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          sources: Array.isArray(data.sources) ? data.sources : [],
          searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
          webGroundingSkipped: Boolean(data.webGroundingSkipped),
          expertId
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text:
            err?.message ||
            'Unable to get an answer right now. Please try again in a moment or match with a live tutor.',
          isError: true,
          expertId: 'daniela-rios'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputVal);
  };

  const hasReachedLimit = !isSubscribed && questionsUsed >= FREE_PREVIEW_LIMIT;

  return (
    <section id="asistente" className="py-16 md:py-24 bg-[#FAFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
              02 &nbsp;/&nbsp; A NUDGE, NOT A SHORTCUT
            </div>

            <h2
              className="font-editorial text-[#0F2249]"
              style={{ fontSize: 'clamp(1.95rem, 3.3vw, 2.8rem)', lineHeight: 1.12 }}
            >
              It’s 11 PM. Your learning keeps going.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Turn an “I don’t get it” into your next step forward. Ask, upload your notes, and follow the reasoning with an assistant that speaks your language.
            </p>

            <ul className="space-y-3 pt-1 text-xs sm:text-sm text-[#0F2249] font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                <span>Step-by-step explanations</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                <span>Answers grounded in your documents</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#0F2249] shrink-0" />
                <span>Cited sources when available</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onExploreHow) {
                    onExploreHow();
                  } else {
                    inputFieldRef.current?.focus();
                  }
                }}
                className="px-6 py-3 bg-[#0F2249] hover:bg-[#19346b] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <span>Explore the assistant</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Live Interactive Card: Your space to understand */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_14px_38px_-16px_rgba(15,34,73,0.12)] overflow-hidden">
              {/* Top Header */}
              <div className="px-6 sm:px-7 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <h3 className="font-editorial text-lg sm:text-xl text-[#0F2249]">
                  Your space to understand
                </h3>
                {questionsUsed > 0 && !isSubscribed && (
                  <span className="text-[11px] font-mono-nums text-slate-400">
                    {questionsUsed}/{FREE_PREVIEW_LIMIT} free
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                {/* Segmented Tabs */}
                <div className="bg-[#FAF9F2] p-1 rounded-lg grid grid-cols-2 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setGroundingMode('document')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      groundingMode === 'document'
                        ? 'bg-white text-[#0F2249] shadow-xs'
                        : 'text-slate-500 hover:text-[#0F2249]'
                    }`}
                  >
                    Your documents
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroundingMode('hybrid')}
                    className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      groundingMode === 'hybrid'
                        ? 'bg-white text-[#0F2249] shadow-xs'
                        : 'text-slate-500 hover:text-[#0F2249]'
                    }`}
                  >
                    Web + documents
                  </button>
                </div>

                {/* Attached Document Chips Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {showSampleDoc && attachedDocs.length === 0 && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#EBF0F7] text-[#0F2249] text-[10px] font-mono-nums font-medium">
                      <span>CALCULUS_NOTES.pdf</span>
                      <button
                        type="button"
                        onClick={() => setShowSampleDoc(false)}
                        className="text-slate-500 hover:text-[#0F2249] cursor-pointer"
                        aria-label="Remove CALCULUS_NOTES.pdf"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {attachedDocs.map(doc => (
                    <span
                      key={doc.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#EBF0F7] text-[#0F2249] text-[10px] font-mono-nums font-medium"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[160px]">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedDocs(prev => prev.filter(d => d.id !== doc.id))}
                        className="text-slate-500 hover:text-rose-600 cursor-pointer"
                        aria-label={`Remove ${doc.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-slate-300 text-[10px] font-mono-nums text-slate-600 hover:text-[#0F2249] hover:border-[#0F2249]/50 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>Attach PDF or notes</span>
                  </button>
                </div>

                {uploadError && (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </span>
                    <button type="button" onClick={() => setUploadError(null)} className="cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Initial Clean Editorial Prompt OR Live Conversation Thread */}
                {messages.length === 0 ? (
                  <div className="py-2 space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        sendQuestion('Explain the chain rule with a simple example.')
                      }
                      className="text-left group cursor-pointer block"
                    >
                      <div className="font-editorial text-xl sm:text-2xl text-[#0F2249] leading-snug group-hover:opacity-75 transition-opacity">
                        Explain the chain rule
                        <br />
                        with a simple example.
                      </div>
                    </button>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
                      Uses your materials as a starting point. If the answer isn’t in them, we’ll let you know.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[290px] overflow-y-auto space-y-3.5 pr-1">
                    {messages.map(msg => {
                      const matchedExpert =
                        EXPERTS_DATA.find(e => e.id === msg.expertId) || EXPERTS_DATA[1];

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === 'user' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-[92%] rounded-xl px-4 py-3 text-xs sm:text-sm ${
                              msg.sender === 'user'
                                ? 'bg-[#0F2249] text-white'
                                : msg.isError
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-[#FAF9F2] text-slate-800 border border-slate-200/70'
                            }`}
                          >
                            {msg.attachedFileNames && msg.attachedFileNames.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {msg.attachedFileNames.map(name => (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-[10px]"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate max-w-[140px]">{name}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                            {!msg.isError && msg.sender === 'ai' && (
                              <VerifiedSourcesBar
                                sources={msg.sources}
                                searchQueries={msg.searchQueries}
                                webGroundingSkipped={msg.webGroundingSkipped}
                                variant="light"
                                compact
                              />
                            )}
                          </div>

                          {msg.sender === 'ai' && !msg.isError && onBookExpert && (
                            <button
                              type="button"
                              onClick={() => onBookExpert(matchedExpert)}
                              className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5C52C] text-[#0F2249] text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Review with {matchedExpert.name.split(' ')[0]}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="text-xs text-slate-500 bg-[#FAF9F2] w-fit px-3.5 py-2 rounded-lg border border-slate-200/70 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.3s]" />
                        <span>Checking sources...</span>
                      </div>
                    )}
                    <div ref={threadEndRef} />
                  </div>
                )}

                {/* Bottom Prompt Input Bar */}
                {!hasReachedLimit ? (
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex items-center gap-2 bg-[#FAF9F2] border border-slate-200/80 rounded-xl px-3.5 py-2 focus-within:border-[#0F2249] transition-colors"
                  >
                    <input
                      ref={inputFieldRef}
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder="Type your next question..."
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1.5"
                    />
                    <button
                      type="submit"
                      disabled={(!inputVal.trim() && attachedDocs.length === 0) || isLoading}
                      aria-label="Send question"
                      className="w-9 h-9 rounded-lg bg-[#F5C52C] hover:bg-[#eab921] disabled:opacity-45 text-[#0F2249] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EBF0F7] border border-slate-200 rounded-xl p-4 text-xs">
                    <div className="flex items-center gap-2.5 text-[#0F2249]">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">
                        You reached the 3 free preview questions. Start your free trial to continue without limits.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenTrialModal}
                      className="px-4 py-2 rounded-lg bg-[#0F2249] text-white font-semibold whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Start 3-day free trial
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
