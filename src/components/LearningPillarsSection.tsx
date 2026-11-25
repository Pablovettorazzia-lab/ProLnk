import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PublicPage } from '../types';

interface LearningPillarsSectionProps {
  onNavigate: (page: PublicPage, sectionId?: string) => void;
}

export const LearningPillarsSection: React.FC<LearningPillarsSectionProps> = ({ onNavigate }) => {
  const pillars = [
    {
      num: '01',
      title: 'Ask without hesitation.',
      description:
        'Solve doubts step by step, at any hour. Attach your notes and learn with real context.',
      cta: 'Explore ProLnk AI',
      onClick: () => {
        const el = document.getElementById('asistente');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          onNavigate('how', 'asistente');
        }
      }
    },
    {
      num: '02',
      title: 'Click with an expert.',
      description:
        'Go deeper on that topic with a verified tutor. A one-on-one session, focused on you.',
      cta: 'Find my tutor',
      onClick: () => onNavigate('experts')
    },
    {
      num: '03',
      title: 'Move forward together.',
      description:
        'Share questions, compare approaches, and learn with fellow students and expert answers.',
      cta: 'Explore the community',
      onClick: () => onNavigate('community')
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#FAFAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono-nums uppercase tracking-[0.18em] text-slate-400">
            01 &nbsp;/&nbsp; YOUR WAY OF LEARNING
          </div>
          <h2
            className="font-editorial text-[#0F2249]"
            style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)', lineHeight: 1.12 }}
          >
            You don’t have to figure it all out alone.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map(item => (
            <div
              key={item.num}
              className="bg-[#EBF0F7] rounded-xl p-7 sm:p-8 flex flex-col justify-between min-h-[240px] border border-slate-200/60 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                <div className="text-xs font-mono-nums text-slate-400 font-medium">
                  {item.num}
                </div>
                <h3 className="font-editorial text-xl sm:text-2xl text-[#0F2249] font-medium">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                onClick={item.onClick}
                className="mt-8 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2249] hover:opacity-75 transition-opacity cursor-pointer self-start"
              >
                <span>{item.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
