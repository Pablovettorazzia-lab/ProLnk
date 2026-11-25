import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Calendar,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  ArrowRight,
  Paperclip,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Expert, PublicPage, StudyDocumentPayload, VerifiedSource } from '../types';
import { EXPERTS_DATA } from '../data/mockData';
import { VerifiedSourcesBar } from './VerifiedSourcesBar';
import { readStudyFile, MAX_STUDY_FILES } from '../utils/studyFiles';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  source?: string;
  sources?: VerifiedSource[];
  searchQueries?: string[];
  webGroundingSkipped?: boolean;
  attachedFileNames?: string[];
  isError?: boolean;
  action?: 'book_expert' | 'start_trial' | 'view_pricing' | 'ask_community';
}

interface ChatbotWidgetProps {
  isSubscribed: boolean;
  onOpenTrialModal: () => void;
  onOpenLoginModal?: () => void;
  onBookExpert?: (expert: Expert) => void;
  onOpenQuestionModal?: () => void;
  onNavigatePage?: (page: PublicPage) => void;
  studentName?: string;
  initiallyOpen?: boolean;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'model',
  text: 'Hello! I am ProLnk AI, your 24/7 academic tutor. Ask any homework question for live web-verified sources, upload a PDF or study notes, or let me help you book a verified human tutor.',
};

const SUGGESTED_PROMPTS = [
  'How do I book a 1-on-1 tutor?',
  'Differentiate y = ln(3x^2) step by step',
  'What are your pricing plans?',
  'How does urgent match work?'
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  isSubscribed,
  onOpenTrialModal,
  onOpenLoginModal,
  onBookExpert,
  onOpenQuestionModal,
  onNavigatePage,
  studentName,
  initiallyOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputVal, setInputVal] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<StudyDocumentPayload[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FREE_QUESTION_LIMIT = 3;
  const hasReachedLimit = !isSubscribed && questionsCount >= FREE_QUESTION_LIMIT;
  const questionsLeft = Math.max(0, FREE_QUESTION_LIMIT - questionsCount);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  useEffect(() => {
    if (initiallyOpen) {
      setIsOpen(true);
    }
  }, [initiallyOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    if (attachedDocs.length + files.length > MAX_STUDY_FILES) {
      setUploadError(`Attach up to ${MAX_STUDY_FILES} files per message.`);
      return;
    }

    try {
      const encoded = await Promise.all(files.map(readStudyFile));
      setAttachedDocs(prev => [...prev, ...encoded].slice(0, MAX_STUDY_FILES));
    } catch (err: any) {
      setUploadError(err?.message || 'Unable to read attached file.');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (
      textToSend ||
      inputVal.trim() ||
      (attachedDocs.length > 0 ? 'Please explain and solve the attached study material step-by-step.' : '')
    ).trim();
    if (!text || isLoading) return;

    if (hasReachedLimit) {
      onOpenTrialModal();
      return;
    }

    const docsToSend = textToSend ? [] : [...attachedDocs];
    setInputVal('');
    if (!textToSend) setAttachedDocs([]);
    setUploadError(null);

    const userMsgId = 'u-' + Date.now();
    const newCount = questionsCount + 1;
    setQuestionsCount(newCount);

    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text,
        attachedFileNames: docsToSend.map(d => d.name)
      }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          documents: docsToSend.map(d => ({
            name: d.name,
            mimeType: d.mimeType,
            base64Data: d.base64Data
          })),
          groundingMode: 'hybrid',
          userContext: {
            isSubscribed,
            studentName
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || 'Could not retrieve a verified AI response.');
      }

      const rawReply: string = data.reply;
      let action: ChatMessage['action'] | undefined;
      let cleanText = rawReply;

      if (cleanText.includes('[ACTION:book_expert]')) {
        action = 'book_expert';
        cleanText = cleanText.replace(/\[ACTION:book_expert\]/g, '').trim();
      } else if (cleanText.includes('[ACTION:start_trial]')) {
        action = 'start_trial';
        cleanText = cleanText.replace(/\[ACTION:start_trial\]/g, '').trim();
      } else if (cleanText.includes('[ACTION:view_pricing]')) {
        action = 'view_pricing';
        cleanText = cleanText.replace(/\[ACTION:view_pricing\]/g, '').trim();
      } else if (cleanText.includes('[ACTION:ask_community]')) {
        action = 'ask_community';
        cleanText = cleanText.replace(/\[ACTION:ask_community\]/g, '').trim();
      }

      cleanText = cleanText
        .split('\n')
        .filter(line => !line.toLowerCase().startsWith('source:'))
        .join('\n')
        .trim();

      setMessages(prev => [
        ...prev,
        {
          id: 'model-' + Date.now(),
          role: 'model',
          text: cleanText,
          sources: Array.isArray(data.sources) ? data.sources : [],
          searchQueries: Array.isArray(data.searchQueries) ? data.searchQueries : [],
          webGroundingSkipped: Boolean(data.webGroundingSkipped),
          action
        }
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'model-err-' + Date.now(),
          role: 'model',
          text:
            err?.message ||
            'I could not verify an answer right now. You can retry or book a verified human tutor.',
          isError: true,
          action: 'book_expert'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setAttachedDocs([]);
    setUploadError(null);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white shadow-xl shadow-[#0F2249]/25 transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          title="Open ProLnk AI Tutor Chatbot"
          aria-label="Open AI Tutor Chat"
        >
          <div className="w-8 h-8 rounded-full bg-[#F5C542] text-slate-950 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4 text-slate-950" />
          </div>

          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-bold text-white flex items-center gap-1 leading-none">
              <span>Ask AI Tutor</span>
              <Sparkles className="w-3 h-3 text-[#F5C542]" />
            </div>
            <div className="text-[10px] text-slate-300 font-medium leading-none mt-1 font-mono-nums">
              {isSubscribed ? 'Unlimited AI Active' : `${questionsLeft} free questions`}
            </div>
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/15 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          <div className="px-4 py-3.5 bg-[#0F2249] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5C542] text-slate-950 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white">ProLnk AI Tutor</h3>
                  <span className="text-[10px] text-emerald-300 font-medium">· Verified</span>
                </div>
                <div className="text-[10px] text-slate-300">
                  {isSubscribed ? (
                    <span className="text-emerald-300 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Web search &amp; PDF grounding active</span>
                    </span>
                  ) : (
                    <span className="font-mono-nums">
                      Free preview: <strong className="text-[#F5C542]">{questionsLeft}/{FREE_QUESTION_LIMIT}</strong> left
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-rose-300 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {!isSubscribed && (
                <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-mono-nums">
                    Guest preview: <strong className="text-slate-900">{questionsCount}/{FREE_QUESTION_LIMIT}</strong> used
                  </span>
                  {questionsLeft > 0 ? (
                    <button
                      onClick={onOpenTrialModal}
                      className="text-[#0F2249] hover:underline font-bold cursor-pointer"
                    >
                      Unlock unlimited →
                    </button>
                  ) : (
                    <span className="text-rose-600 font-bold">Limit reached</span>
                  )}
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FCFBF9]">
                {messages.map(msg => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                          isUser
                            ? 'bg-[#0F2249] text-white'
                            : msg.isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-white text-slate-700 border border-slate-200/80 shadow-sm'
                        }`}
                      >
                        {msg.attachedFileNames && msg.attachedFileNames.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {msg.attachedFileNames.map(name => (
                              <span
                                key={name}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px]"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[140px]">{name}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="whitespace-pre-line text-xs">{msg.text}</div>

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

                        {msg.action && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {msg.action === 'book_expert' && onBookExpert && (
                              <button
                                onClick={() => onBookExpert(EXPERTS_DATA[0])}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5C542] hover:bg-[#ffd65c] text-slate-950 font-bold text-[11px] cursor-pointer transition-colors"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Book a Tutor</span>
                              </button>
                            )}
                            {msg.action === 'start_trial' && (
                              <button
                                onClick={onOpenTrialModal}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0F2249] text-white font-semibold text-[11px] cursor-pointer transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-[#F5C542]" />
                                <span>Start Free Trial</span>
                              </button>
                            )}
                            {msg.action === 'view_pricing' && (
                              <button
                                onClick={() => {
                                  if (onNavigatePage) {
                                    onNavigatePage('pricing');
                                    return;
                                  }
                                  const el = document.getElementById('pricing');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] cursor-pointer transition-colors"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>View Pricing</span>
                              </button>
                            )}
                            {msg.action === 'ask_community' && onOpenQuestionModal && (
                              <button
                                onClick={onOpenQuestionModal}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] cursor-pointer transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Ask Community</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs bg-white w-fit px-3 py-2 rounded-full border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F2249] animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] ml-1">Verifying live sources...</span>
                  </div>
                )}

                {hasReachedLimit && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                    <div className="w-9 h-9 rounded-full bg-[#0F2249] text-[#F5C542] flex items-center justify-center mx-auto">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">
                        You've reached your 3 free questions
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Create your free student account to unlock unlimited 24/7 AI tutoring and 1-on-1 expert matches.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={onOpenTrialModal}
                        className="w-full py-2.5 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#F5C542]" />
                        <span>Create Free Account</span>
                      </button>

                      {onOpenLoginModal && (
                        <button
                          onClick={onOpenLoginModal}
                          className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                        >
                          Already have an account? Log In
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {!hasReachedLimit && (
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                  <span className="text-slate-400 shrink-0 text-[10px]">Try:</span>
                  {SUGGESTED_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => handleSendMessage(p)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                {uploadError && (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </span>
                    <button type="button" onClick={() => setUploadError(null)} className="cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {attachedDocs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {attachedDocs.map(doc => (
                      <span
                        key={doc.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-[#0F2249] text-[10px] font-medium"
                      >
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedDocs(prev => prev.filter(d => d.id !== doc.id))}
                          className="cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {hasReachedLimit ? (
                  <button
                    onClick={onOpenTrialModal}
                    className="w-full py-2.5 rounded-full bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Unlock Unlimited Questions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F5C542]" />
                  </button>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
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
                      className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Attach PDF or study notes"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder={
                        isSubscribed
                          ? 'Ask or attach a PDF...'
                          : `Ask a question (${questionsLeft} left)...`
                      }
                      className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
                    />
                    <button
                      type="submit"
                      disabled={(!inputVal.trim() && attachedDocs.length === 0) || isLoading}
                      className="p-2 rounded-full bg-[#0F2249] hover:bg-[#19346b] disabled:opacity-40 text-white transition-colors cursor-pointer"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
