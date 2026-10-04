import React from 'react';
import { Bot, Users, UserCheck, Zap, ArrowRight } from 'lucide-react';

interface SpeedLadderProps {
  onOpenTrialModal: () => void;
  onExploreExperts: () => void;
}

export const SpeedLadder: React.FC<SpeedLadderProps> = ({ onOpenTrialModal, onExploreExperts }) => {
  const ladderItems = [
    {
      id: 'ai',
      icon: Bot,
      title: 'Ask the AI',
      description: 'A chatbot trained by our academic specialists. Explains step by step and cites textbook sources.',
      timeLabel: 'Seconds',
      timeSub: 'to a first answer',
      costLabel: 'Free',
      costSub: 'unlimited during your trial',
      highlight: false,
      badge: 'Fastest',
      action: onOpenTrialModal,
      actionText: 'Try AI Now'
    },
    {
      id: 'community',
      icon: Users,
      title: 'Ask the community',
      description: 'Post your question or explain your assignment. Fellow students and verified tutors reply and vote.',
      timeLabel: 'Under 1 hr',
      timeSub: 'typical first reply',
      costLabel: 'Free',
      costSub: 'always free for all students',
      highlight: false,
      badge: 'Collaborative',
      action: () => {
        const el = document.getElementById('community');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      actionText: 'Browse Forum'
    },
    {
      id: 'expert',
      icon: UserCheck,
      title: 'Match with an expert',
      description: 'A verified tutor or professional for your specific subject. Book a private 1-on-1 session and get notes afterward.',
      timeLabel: 'Same day',
      timeSub: 'you pick the exact hour',
      costLabel: 'From Q120',
      costSub: 'per 1-hour private session',
      highlight: true,
      badge: 'Most Popular',
      action: onExploreExperts,
      actionText: 'View Tutors'
    },
    {
      id: 'urgent',
      icon: Zap,
      title: 'Urgent live help',
      description: 'An optional upgrade for when your exam or deadline is tonight. We ping the highest-rated tutor online right now.',
      timeLabel: '~15 mins',
      timeSub: 'to a live tutor call',
      costLabel: '+Q25',
      costSub: 'added to any session',
      highlight: false,
      badge: 'Emergency',
      action: onExploreExperts,
      actionText: 'Request Urgent'
    }
  ];

  return (
    <section id="speeds" className="py-16 md:py-24 bg-[#091124] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Pick the speed you need.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            Start completely free with our AI and move up to a human expert only when you want personalized 1-on-1 attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ladderItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between ${
                  item.highlight
                    ? 'bg-[#0f1f42] border-2 border-[#F6C62B] shadow-xl shadow-[#F6C62B]/10'
                    : 'bg-[#0c162e] border border-slate-700/70 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      item.highlight ? 'bg-[#F6C62B] text-slate-950' : 'bg-slate-800 text-[#F6C62B]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      item.highlight ? 'text-[#F6C62B]' : 'text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-display">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[56px]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-white font-display leading-tight">{item.timeLabel}</div>
                      <div className="text-[11px] text-slate-400">{item.timeSub}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#F6C62B] font-display leading-tight">{item.costLabel}</div>
                      <div className="text-[11px] text-slate-400">{item.costSub}</div>
                    </div>
                  </div>

                  <button
                    onClick={item.action}
                    className={`w-full py-2.5 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      item.highlight
                        ? 'bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
