import React, { useState } from 'react';
import { FORUM_POSTS, USER_PAST_SESSIONS, EXPERTS_DATA } from '../data/mockData';
import { ForumPost, ForumComment, Expert } from '../types';
import communityStudyImg from '../assets/images/community_study.jpg';
import {
  ThumbsUp,
  MessageSquare,
  Calendar,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Award,
  Search,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CommunityAndDashboardProps {
  onBookExpert: (expert: Expert) => void;
  onOpenQuestionModal: () => void;
  posts?: ForumPost[];
  onVotePost?: (id: string) => void;
  defaultShowAll?: boolean;
}

export const CommunityAndDashboard: React.FC<CommunityAndDashboardProps> = ({
  onBookExpert,
  onOpenQuestionModal,
  posts: propPosts,
  onVotePost,
  defaultShowAll = true
}) => {
  const [localPosts, setLocalPosts] = useState<ForumPost[]>(FORUM_POSTS);
  const posts = propPosts || localPosts;

  const [expandedPostId, setExpandedPostId] = useState<string | null>('post-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showAllPosts, setShowAllPosts] = useState(defaultShowAll);
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
    const expert =
      EXPERTS_DATA.find(exp => exp.name.toLowerCase().includes(expertName.toLowerCase())) ||
      EXPERTS_DATA[0];
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
    showToast('Your reply was posted to the discussion!');
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
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.expertAnswer && p.expertAnswer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayedPosts = showAllPosts ? filteredPosts : filteredPosts.slice(0, 3);

  return (
    <section id="community" className="py-16 md:py-22 bg-[#FAFAF5] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
              PEER &amp; EXPERT FORUM &nbsp;·&nbsp; 2,400+ SOLUTIONS
            </div>
            <h1
              className="font-editorial text-[#0F2249]"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 2.95rem)', lineHeight: 1.12 }}
            >
              Learning <span className="font-serif-accent italic font-normal">community</span>.
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenQuestionModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#F5C52C]" />
            <span>Ask a question</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EBF0F7] p-2.5 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F2249] text-white'
                    : 'text-slate-700 hover:text-[#0F2249] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[230px]">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topics or questions..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2249]"
            />
          </div>
        </div>

        {/* Forum Cards */}
        <div className="space-y-4">
          {displayedPosts.map(post => {
            const isExpanded = expandedPostId === post.id;
            const comments = post.comments || [];

            return (
              <div
                key={post.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? 'border-[#0F2249]/40 shadow-md shadow-[#0F2249]/8'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => toggleExpand(post.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start gap-4"
                >
                  <button
                    type="button"
                    onClick={e => handleVote(post.id, e)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[50px] transition-colors cursor-pointer font-mono-nums shrink-0 ${
                      post.userVoted
                        ? 'bg-[#0F2249] text-white border-[#0F2249]'
                        : 'bg-[#FAF9F2] text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    title="Upvote question"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${post.userVoted ? 'fill-white' : ''}`} />
                    <span className="text-xs font-bold mt-1">{post.votes}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5 text-xs">
                      <span className="font-mono-nums font-bold text-[#0F2249] uppercase tracking-wider text-[10px]">
                        {post.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">
                        {post.author} · {post.timeAgo}
                      </span>
                      {post.hasExpertAnswer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md ml-auto">
                          <Award className="w-3 h-3" />
                          <span>Verified Solution</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-editorial text-lg sm:text-xl text-[#0F2249] leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                      {post.previewText}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium font-mono-nums">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.repliesCount} replies</span>
                      </span>

                      <div className="flex items-center gap-1 text-[#0F2249] font-semibold text-xs">
                        <span>{isExpanded ? 'Collapse' : 'View Answer'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-[#FAF9F2] border-t border-slate-200/70 p-5 sm:p-6 space-y-5">
                    {post.expertAnswer && (
                      <div className="bg-emerald-50/75 border border-emerald-200 rounded-xl p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#0F2249]">
                                Verified Solution by{' '}
                                <span className="text-emerald-700">{post.expertName}</span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Certified ProLnk Instructor
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (post.expertName) {
                                handleBookFollowUp(post.expertName.split(' ')[0]);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-center"
                          >
                            Book 1-on-1 with {post.expertName?.split(' ')[0]}
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {post.expertAnswer}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-mono-nums font-bold uppercase tracking-wider text-slate-400">
                        Replies ({comments.length})
                      </h4>

                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-500 italic bg-white p-4 rounded-xl border border-slate-200/70">
                          No replies yet. Share your step or question below.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {comments.map(comm => (
                            <div
                              key={comm.id}
                              className="bg-white border border-slate-200/70 p-4 rounded-xl space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#EBF0F7] text-[#0F2249] font-bold text-[10px] flex items-center justify-center">
                                    {comm.avatarInitials}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-[#0F2249] flex items-center gap-1.5">
                                      <span>{comm.author}</span>
                                      {comm.authorRole === 'expert' && (
                                        <span className="text-[#0F2249] text-[10px] font-semibold">
                                          · Tutor
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400">{comm.timestamp}</div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={e => handleVoteComment(post.id, comm.id, e)}
                                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer font-mono-nums ${
                                    comm.userVoted
                                      ? 'bg-[#0F2249] text-white border-[#0F2249]'
                                      : 'bg-[#FAF9F2] text-slate-500 border-slate-200 hover:text-[#0F2249]'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comm.upvotes || 0}</span>
                                </button>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed pl-9">
                                {comm.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <form onSubmit={e => handleAddComment(post.id, e)} className="pt-1">
                      <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 focus-within:border-[#0F2249] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-[#F5C52C] text-[#0F2249] font-bold text-xs flex items-center justify-center shrink-0">
                          ST
                        </div>
                        <input
                          type="text"
                          required
                          value={commentInputs[post.id] || ''}
                          onChange={e =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          placeholder="Add a reply or formula step..."
                          className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none py-1"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
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

        {filteredPosts.length > 3 && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAllPosts(prev => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EBF0F7] text-[#0F2249] border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {showAllPosts
                ? 'Show fewer questions'
                : `View more questions (+${filteredPosts.length - 3} more)`}
            </button>
          </div>
        )}

        {/* Recent Sessions & Unified Portal Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-10 border-t border-slate-200/80">
          <div className="lg:col-span-7 bg-[#EBF0F7] border border-slate-200/70 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0F2249]" />
                <span className="font-editorial text-lg text-[#0F2249]">Recent Sessions</span>
              </div>
              <span className="text-xs font-medium text-slate-500 font-mono-nums">
                3 this month
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {USER_PAST_SESSIONS.map(sess => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-lg bg-[#FAF9F2] border border-slate-200 flex flex-col items-center justify-center shrink-0 font-mono-nums">
                      <span className="text-sm font-extrabold text-[#0F2249] leading-none">
                        {sess.day}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {sess.month}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F2249]">{sess.topic}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sess.expertName} · {sess.subject}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const expert =
                        EXPERTS_DATA.find(e =>
                          e.name.toLowerCase().includes(sess.expertName.toLowerCase())
                        ) || EXPERTS_DATA[0];
                      onBookExpert(expert);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0F2249] hover:bg-[#19346b] text-white font-semibold text-xs transition-colors self-end sm:self-center cursor-pointer"
                  >
                    Rebook
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
              <img
                src={communityStudyImg}
                alt="Students studying collaboratively"
                className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="text-[11px] font-mono-nums uppercase tracking-[0.16em] text-slate-400">
              ONE STUDENT PORTAL
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#0F2249] leading-tight">
              Everything organized in one place.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Move smoothly from a peer forum question into a 1-on-1 call. Your tutor sees your formula notes automatically.
            </p>
            <button
              type="button"
              onClick={onOpenQuestionModal}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0F2249] hover:opacity-75 cursor-pointer"
            >
              <span>Post a question to get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F2249] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#F5C52C] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </section>
  );
};
