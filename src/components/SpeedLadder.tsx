import React from 'react';
import { Bot, Users, UserCheck, Zap, ArrowRight } from 'lucide-react';

interface SpeedLadderProps {
  onOpenTrialModal: () => void;
  onExploreExperts: () => void;
  onBrowseCommunity?: () => void;
}

export const SpeedLadder: React.FC<SpeedLadderProps> = ({
  onOpenTrialModal,
  onExploreExperts,
  onBrowseCommunity
}) => {
  const ladderItems = [
    {
      id: 'ai',
      icon: Bot,
      title: 'Ask the AI',
      description: 'Step-by-step explanations grounded in real textbook sources.',
      meta: 'Seconds · Free trial',
      action: onOpenTrialModal,
      actionText: 'Try AI',
      featured: false
    },
    {
      id: 'community',
      icon: Users,
      title: 'Ask the community',
      description: 'Post assignments and get verified peer and TA replies.',
      meta: 'Under 1 hr · Always free',
      action: () => {
        if (onBrowseCommunity) {
          onBrowseCommunity();
          return;
        }
        const el = document.getElementById('community');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      actionText: 'Browse forum',
      featured: false
    },
    {
      id: 'expert',
      icon: UserCheck,
      title: '1-on-1 Verified Tutor',
      description: 'Private live whiteboard session with a vetted subject specialist.',
      meta: 'Same day · From Q120',
      action: onExploreExperts,
      actionText: 'View tutors',
      featured: true
    },
    {
      id: 'urgent',
      icon: Zap,
      title: 'Urgent Live Help',
      description: 'Instant alert to top online tutors before tonight’s deadline.',
      meta: '~15 mins · +Q25',
      action: onExploreExperts,
      actionText: 'Request help',
      featured: false
    }
  ];

  return (
    <section id="speeds" className="py-16 md:py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="font-kicker text-[#0F2249]/75">
              Four ways to get unstuck
            </div>
            <h2 className="mt-2 font-editorial text-3xl sm:text-[2.65rem] text-slate-950">
              Pick the <span className="font-serif-accent text-[#0F2249]">speed</span> you need.
            </h2>
          </div>
          <p className="font-subtitle text-sm text-slate-600 max-w-md">
            Start free with cited AI, or step up to a live specialist only when you want personal coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ladderItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                  item.featured
                    ? 'bg-[#0F2249] text-white shadow-xl shadow-[#0F2249]/20'
                    : 'bg-[#FAFAF7] hover:bg-white border border-slate-300/80 hover:border-[#0F2249]/35 hover:shadow-lg'
                }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                      item.featured
                        ? 'bg-[#F5C542] text-slate-950'
                        : 'bg-white border border-slate-300 text-[#0F2249]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className={`font-editorial text-xl sm:text-2xl ${item.featured ? 'text-white' : 'text-slate-950'}`}>
                    {item.title}
                  </h3>
                  <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${item.featured ? 'text-slate-200' : 'text-slate-700'}`}>
                    {item.description}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${item.featured ? 'border-white/15' : 'border-slate-300/70'}`}>
                  <span className={`text-[11px] font-semibold font-mono-nums ${item.featured ? 'text-[#F5C542]' : 'text-slate-700'}`}>
                    {item.meta}
                  </span>
                  <span className={`text-xs font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${item.featured ? 'text-white' : 'text-[#0F2249]'}`}>
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
