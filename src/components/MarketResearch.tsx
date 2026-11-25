import React from 'react';

export const MarketResearch: React.FC = () => {
  const stats = [
    {
      value: '24/7',
      label: 'Step-by-step AI guidance anchored to your notes and cited web sources'
    },
    {
      value: '~15 min',
      label: 'Priority live tutoring match before urgent exams and deadlines'
    },
    {
      value: '4.9 / 5',
      label: 'Average rating across 1-on-1 shared whiteboard sessions'
    },
    {
      value: '100%',
      label: 'Credential-screened instructors vetted through live mock lessons'
    }
  ];

  return (
    <section id="research" className="py-12 md:py-16 bg-white border-b border-slate-200/75">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-200/80">
          {stats.map((stat, i) => (
            <div key={i} className="pt-4 sm:pt-0 lg:px-6 first:lg:pl-0 last:lg:pr-0">
              <div className="font-editorial text-3xl sm:text-4xl text-[#0F2249] tracking-tight">
                {stat.value}
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
