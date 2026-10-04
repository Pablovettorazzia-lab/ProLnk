import React, { useState } from 'react';
import { FORUM_POSTS, USER_PAST_SESSIONS, EXPERTS_DATA } from '../data/mockData';
import { ForumPost, ForumComment, Expert } from '../types';
import communityStudyImg from '../assets/images/community_study.jpg';
import {
  ThumbsUp,
  MessageSquare,
  Check,
  Calendar,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Award,
  Search,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Share2
} from 'lucide-react';

interface CommunityAndDashboardProps {
  onBookExpert: (expert: Expert) => void;
  onOpenQuestionModal: () => void;
  posts?: ForumPost[];
  onVotePost?: (id: string) => void;
}

export const CommunityAndDashboard: React.FC<CommunityAndDashboardProps> = ({
  onBookExpert,
  onOpenQuestionModal,
  posts: propPosts,
  onVotePost
}) => {
  const [localPosts, setLocalPosts] = useState<ForumPost[]>(FORUM_POSTS);
  const posts = propPosts || localPosts;
  
  const [expandedPostId, setExpandedPostId] = useState<string | null>('post-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Comment inputs per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVotePost) {
      onVotePost(id);
      return;
    }
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const hasVoted = p.userVoted;
          return {
            ...p,
            votes: hasVoted ? p.votes - 1 : p.votes + 1,
            userVoted: !hasVoted
          };
        }
        return p;
      })
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedPostId(prev => (prev === id ? null : id));
  };

  const handleBookFollowUp = (expertName: string) => {
    const expert = EXPERTS_DATA.find(exp => exp.name.toLowerCase().includes(expertName.toLowerCase())) || EXPERTS_DATA[0];
    onBookExpert(expert);
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: ForumComment = {
      id: `c-${Date.now()}`,
      author: 'Student Participant',
      authorRole: 'student',
      avatarInitials: 'ST',
      text,
      timestamp: 'Just now',
      upvotes: 1,
      userVoted: true
    };

    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            repliesCount: p.repliesCount + 1,
            comments: [...currentComments, newComment]
          };
        }
        return p;
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    showToast('Your comment was posted to the discussion! 💬');
  };

  const handleVoteComment = (postId: string, commentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.comments) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                const voted = c.userVoted;
                return {
                  ...c,
                  upvotes: (c.upvotes || 0) + (voted ? -1 : 1),
                  userVoted: !voted
                };
              }
              return c;
            })
          };
        }
        return p;
      })
    );
  };

  const categories = ['All', 'Chemistry', 'Mathematics', 'Physics', 'Tech', 'Career', 'Writing'];

  const filteredPosts = posts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.expertAnswer && p.expertAnswer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="community" className="py-16 md:py-24 bg-[#0a1329] border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header & Ask Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F6C62B]/20 text-[#F6C62B] text-[10px] font-extrabold uppercase tracking-wide">
                Collaborative Student Forum
              </span>
              <span className="text-xs text-slate-400">· Over 2,400+ peer & expert solutions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Community Homework Board
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Post questions, discuss challenging textbook problems, and read verified solutions certified by university teaching assistants.
            </p>
          </div>

          <button
            onClick={onOpenQuestionModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Homework Question</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1833] p-4 rounded-2xl border border-slate-700/80 shadow-md">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F6C62B] text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search problems, topics..."
              className="w-full bg-[#122144] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F6C62B]"
            />
          </div>
        </div>

        {/* Forum Question Cards List */}
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const isExpanded = expandedPostId === post.id;
            const comments = post.comments || [];

            return (
              <div
                key={post.id}
                className={`bg-[#0c162e] border rounded-2xl overflow-hidden transition-all duration-200 shadow-lg ${
                  isExpanded ? 'border-[#F6C62B]/60 ring-1 ring-[#F6C62B]/20' : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Post Summary Row */}
                <div
                  onClick={() => toggleExpand(post.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start gap-4"
                >
                  {/* Upvote Pill */}
                  <button
                    type="button"
                    onClick={(e) => handleVote(post.id, e)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[54px] transition-all cursor-pointer font-mono-nums shrink-0 ${
                      post.userVoted
                        ? 'bg-[#F6C62B] text-slate-950 border-[#F6C62B] shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-[#F6C62B]/50 hover:bg-slate-700'
                    }`}
                    title="Upvote this question"
                  >
                    <ThumbsUp className={`w-4 h-4 ${post.userVoted ? 'fill-slate-950' : ''}`} />
                    <span className="text-xs font-black mt-1">{post.votes}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold">votes</span>
                  </button>

                  {/* Main Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0F2249] text-amber-300 border border-amber-500/30">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Asked by <strong>{post.author}</strong> · {post.timeAgo}
                      </span>
                      {post.hasExpertAnswer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full ml-auto">
                          <Award className="w-3 h-3" />
                          <span>Expert Verified Solution</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white hover:text-[#F6C62B] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">
                      {post.previewText}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <MessageSquare className="w-3.5 h-3.5 text-[#F6C62B]" />
                          <span>{post.repliesCount} comments & replies</span>
                        </span>
                        <span className="hidden sm:inline-block text-slate-500">·</span>
                        <span className="hidden sm:inline-block text-slate-400">Click to expand thread</span>
                      </div>

                      <div className="flex items-center gap-1 text-[#F6C62B] font-bold text-xs">
                        <span>{isExpanded ? 'Collapse Thread' : 'View Full Thread & Comments'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Thread Drawer */}
                {isExpanded && (
                  <div className="bg-[#080f21] border-t border-slate-800 p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
                    
                    {/* Featured Certified Expert Answer Box */}
                    {post.expertAnswer && (
                      <div className="bg-[#0c162e] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 space-y-3 relative overflow-hidden shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>Verified Solution by</span>
                                <span className="text-emerald-400 font-extrabold">{post.expertName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">Certified ProLnk Academic Instructor</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (post.expertName) {
                                handleBookFollowUp(post.expertName.split(' ')[0]);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer self-start sm:self-center shadow"
                          >
                            Book 1-on-1 with {post.expertName?.split(' ')[0]}
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans bg-[#080f21] p-4 rounded-xl border border-slate-800/80">
                          {post.expertAnswer}
                        </div>
                      </div>
                    )}

                    {/* Community Discussion Comments Stream */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Discussion & Follow-up Replies ({comments.length})
                        </h4>
                        <span className="text-[11px] text-slate-500">Chronological feed</span>
                      </div>

                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-[#0c162e] p-4 rounded-xl border border-slate-800">
                          No replies yet. Be the first to share your approach or question below!
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {comments.map(comm => (
                            <div
                              key={comm.id}
                              className="bg-[#0c162e] border border-slate-800 p-4 rounded-xl space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-bold text-[10px] flex items-center justify-center border border-slate-700">
                                    {comm.avatarInitials}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>{comm.author}</span>
                                      {comm.authorRole === 'expert' && (
                                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F6C62B] text-[9px] font-bold">
                                          Tutor
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{comm.timestamp}</div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => handleVoteComment(post.id, comm.id, e)}
                                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                                    comm.userVoted
                                      ? 'bg-[#F6C62B]/20 text-[#F6C62B] border-[#F6C62B]/40'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comm.upvotes || 0}</span>
                                </button>
                              </div>

                              <p className="text-xs text-slate-200 leading-relaxed pl-9">
                                {comm.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive "Add a Comment" Input Box */}
                    <form onSubmit={(e) => handleAddComment(post.id, e)} className="pt-2">
                      <div className="flex items-start gap-3 bg-[#0c162e] p-3 rounded-xl border border-slate-700 focus-within:border-[#F6C62B] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#0F2249] border border-[#F6C62B]/40 text-[#F6C62B] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          ST
                        </div>
                        <input
                          type="text"
                          required
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Write a comment, share your formula step, or ask a clarification..."
                          className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none py-1.5"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </form>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Part 2: Student Dashboard Preview (Bottom Section) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8 border-t border-slate-800">
          
          <div className="lg:col-span-7 bg-[#0d1833] border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F6C62B]" />
                <span className="font-bold text-white text-sm">Your Session History</span>
              </div>
              <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                3 completed this month
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {USER_PAST_SESSIONS.map(sess => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#122144] border border-[#F6C62B]/20 flex flex-col items-center justify-center shrink-0 font-mono-nums">
                      <span className="text-sm font-black text-white">{sess.day}</span>
                      <span className="text-[10px] font-bold text-[#F6C62B] uppercase">{sess.month}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{sess.topic}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tutor: {sess.expertName} · {sess.subject}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const expert = EXPERTS_DATA.find(e => e.name.toLowerCase().includes(sess.expertName.toLowerCase())) || EXPERTS_DATA[0];
                      onBookExpert(expert);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs transition-colors self-end sm:self-center cursor-pointer shadow"
                  >
                    Rebook Tutor
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl group">
              <img
                src={communityStudyImg}
                alt="Students studying collaboratively in university library"
                className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1329] via-transparent to-black/20 pointer-events-none"></div>
              <div className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700">
                Peer Review & Study Groups
              </div>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#F6C62B]">
              Integrated Student Workflow
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Everything in one centralized dashboard.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a community answer sparks a deeper question, transition directly into a 1-on-1 video call. Your tutor automatically has access to your problem thread and formulas.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenQuestionModal}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#F6C62B] hover:underline cursor-pointer"
              >
                <span>Ask your question to get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2249] text-white border-2 border-[#F6C62B] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#F6C62B] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </section>
  );
};
