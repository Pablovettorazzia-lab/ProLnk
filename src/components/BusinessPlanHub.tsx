import React, { useState } from 'react';
import { TEAM_MEMBERS, HISTORY_TIMELINE, SEED_EXPENSES, FINANCIAL_GROWTH_DATA } from '../data/mockData';
import {
  Target,
  Compass,
  Heart,
  History,
  Users2,
  DollarSign,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Mail,
  Globe
} from 'lucide-react';

export const BusinessPlanHub: React.FC = () => {
  const [activePlanTab, setActivePlanTab] = useState<'strategy' | 'history' | 'team' | 'financials' | 'learnings'>('strategy');

  return (
    <section id="business-plan" className="py-16 md:py-24 bg-[#080f21] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F2249] border border-[#F6C62B]/30 text-xs font-semibold text-[#F6C62B] mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Liceo Javier · English Course Final Project</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Business Plan & Project Presentation
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Created and presented by <strong>Pablo Vettorazzi, Lourdes Monterroso, Juan Andrés Díaz & Juan Andrés Estrada</strong>.
          </p>
        </div>

        {/* Tab Navigation for Business Plan */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActivePlanTab('strategy')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activePlanTab === 'strategy'
                ? 'bg-[#F6C62B] text-slate-950 font-bold shadow'
                : 'bg-[#0c162e] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Mission, Vision & Values</span>
          </button>

          <button
            onClick={() => setActivePlanTab('history')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activePlanTab === 'history'
                ? 'bg-[#F6C62B] text-slate-950 font-bold shadow'
                : 'bg-[#0c162e] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Our History (2018–2022)</span>
          </button>

          <button
            onClick={() => setActivePlanTab('team')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activePlanTab === 'team'
                ? 'bg-[#F6C62B] text-slate-950 font-bold shadow'
                : 'bg-[#0c162e] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>The Team & Roles</span>
          </button>

          <button
            onClick={() => setActivePlanTab('financials')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activePlanTab === 'financials'
                ? 'bg-[#F6C62B] text-slate-950 font-bold shadow'
                : 'bg-[#0c162e] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Funding & 5-Yr Projections</span>
          </button>

          <button
            onClick={() => setActivePlanTab('learnings')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activePlanTab === 'learnings'
                ? 'bg-[#F6C62B] text-slate-950 font-bold shadow'
                : 'bg-[#0c162e] text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Project Learnings</span>
          </button>
        </div>

        {/* Tab 1: Strategy (Mission, Vision, Values, Brainstorming) */}
        {activePlanTab === 'strategy' && (
          <div className="space-y-10">
            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Our Mission</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  "Our mission is to make it easy to find and receive reliable professional help of any kind, by being fast and accessible for everyone."
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                  Focus: Removing the friction and high barriers to finding verified tutors and reliable answers.
                </div>
              </div>

              <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">Our Vision</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  "Our vision is to build the world’s most accessible support web/app, combining smart AI and real human expertise to make learning and problem solving easy for everyone."
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
                  Focus: A global hybrid platform where AI handles midnight emergencies and humans handle deep growth.
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div>
              <h3 className="text-xl font-bold text-white font-display mb-6 text-center">
                Our Core Company Values
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                  <span className="text-xs font-bold text-[#F6C62B] font-mono-nums">VALUE 01</span>
                  <h4 className="text-lg font-bold text-white font-display mt-1">Respect</h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    We promote a good ambience between our clients and workers, always treating each other with respect and dignity in every chat and tutoring call.
                  </p>
                </div>

                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                  <span className="text-xs font-bold text-[#F6C62B] font-mono-nums">VALUE 02</span>
                  <h4 className="text-lg font-bold text-white font-display mt-1">Commitment</h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Being responsible and dedicated to students and their individual ways of learning, ensuring every student leaves with genuine understanding.
                  </p>
                </div>

                <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-colors">
                  <span className="text-xs font-bold text-[#F6C62B] font-mono-nums">VALUE 03</span>
                  <h4 className="text-lg font-bold text-white font-display mt-1">Empathy</h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Understanding students' needs and emotional pressures, creating a respectful, supportive, and judgment-free learning environment.
                  </p>
                </div>
              </div>
            </div>

            {/* Brainstorming Names Showcase (Slide 3 & 4) */}
            <div className="bg-[#0d1833] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
              <h4 className="text-base font-bold text-white font-display mb-2">Company Name Brainstorming</h4>
              <p className="text-xs sm:text-sm text-slate-300 mb-6">
                During the initial business planning phase, our team explored several brand concepts before unanimous selection of <strong>ProLnk</strong>:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 text-slate-400 text-xs line-through">
                  Quick&Wise
                </div>
                <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 text-slate-400 text-xs line-through">
                  Knowly
                </div>
                <div className="p-3.5 rounded-xl bg-[#080f21] border border-slate-800 text-slate-400 text-xs line-through">
                  Ready-Solve-Go
                </div>
                <div className="p-3.5 rounded-xl bg-[#0F2249] border-2 border-[#F6C62B] text-white font-bold text-sm shadow-md">
                  ProLnk ⭐
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Why <strong>ProLnk</strong>? Because our fundamental goal is to make it seamless for students to link with professionals in their required subject areas, as well as link with an AI for instant late-night guidance.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: History (2018 - 2022) */}
        {activePlanTab === 'history' && (
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-10">
            <h3 className="text-2xl font-bold text-white font-display mb-2">Our History</h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-8">
              The evolution of the ProLnk concept from student frustration to an integrated hybrid platform.
            </p>

            <div className="relative border-l-2 border-slate-700 ml-4 pl-6 space-y-8">
              {HISTORY_TIMELINE.map(item => (
                <div key={item.year} className="relative group">
                  {/* Timeline node */}
                  <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#0F2249] border-2 border-[#F6C62B] flex items-center justify-center text-[10px] font-black text-white">
                    •
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-[#F6C62B] font-display font-mono-nums">
                      {item.year}
                    </span>
                    <span className="text-slate-500">·</span>
                    <h4 className="text-base font-bold text-white font-display">
                      {item.title}
                    </h4>
                  </div>
                  
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: The Team & Roles (Slide 8 & 9) */}
        {activePlanTab === 'team' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-4">
              <h3 className="text-2xl font-bold text-white font-display">The Roles & Founders</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Presenting the division of responsibilities for every member of our company.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map(member => (
                <div
                  key={member.name}
                  className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600 transition-colors"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base border ${member.accentColor} mb-4`}>
                      {member.initials}
                    </div>

                    <h4 className="text-lg font-bold text-white font-display">{member.name}</h4>
                    <div className="text-xs font-semibold text-[#F6C62B] mt-1">{member.role}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{member.focus}</div>

                    <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Liceo Javier Project Member</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Funding, Expenses & 5-Year Projections (Slides 14, 15, 16, 17, 18) */}
        {activePlanTab === 'financials' && (
          <div className="space-y-10">
            {/* Funding Strategy & Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Seed Expenses Breakdown */}
              <div className="lg:col-span-6 bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white font-display">Seed Budget Allocation</h3>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#F6C62B] font-mono-nums">$650 USD</span>
                    <div className="text-[11px] text-slate-400">≈ Q4,900 Quetzales</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  To launch ProLnk using our initial seed funding from the "Three F's" (Friends, Family, Fools), we prioritize driving student acquisition and maintaining high-availability 24/7 AI infrastructure.
                </p>

                <div className="space-y-4">
                  {SEED_EXPENSES.map(item => (
                    <div key={item.category} className="p-4 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{item.category}</span>
                        <div className="font-mono-nums font-bold text-[#F6C62B]">
                          ${item.usd} USD <span className="text-slate-400 font-normal">(~Q{item.quetzales})</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Year Financial Growth Projection Chart */}
              <div className="lg:col-span-6 bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white font-display mb-1">
                  5-Year Financial Growth Projections
                </h3>
                <p className="text-xs text-slate-300 mb-6">
                  Projected 5-year growth starting from our $650 seed. Incomes, operational maintenance, and net profit margins.
                </p>

                {/* Growth Bars Visual */}
                <div className="space-y-5">
                  {FINANCIAL_GROWTH_DATA.map(yr => (
                    <div key={yr.year} className="bg-[#080f21] p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#F6C62B] font-mono-nums text-sm">{yr.year}</span>
                        <div className="flex items-center gap-3 font-mono-nums text-[11px]">
                          <span className="text-amber-400">Income: ${yr.income}</span>
                          <span className="text-cyan-400">Exp: ${yr.expenses}</span>
                          <span className={yr.profit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {yr.profit >= 0 ? `+Net: $${yr.profit}` : `-Loss: $${Math.abs(yr.profit)}`}
                          </span>
                        </div>
                      </div>

                      {/* Visual comparative bar */}
                      <div className="grid grid-cols-12 gap-1 h-3 items-center">
                        <div
                          className="bg-amber-400 h-2.5 rounded col-span-5"
                          style={{ width: `${(yr.income / 2000) * 100}%` }}
                          title={`Income: $${yr.income}`}
                        />
                        <div
                          className="bg-cyan-500 h-2 rounded col-span-4"
                          style={{ width: `${(yr.expenses / 2000) * 100}%` }}
                          title={`Expenses: $${yr.expenses}`}
                        />
                        <div
                          className={`h-2 rounded col-span-3 ${yr.profit >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                          style={{ width: `${(Math.abs(yr.profit) / 1000) * 100}%` }}
                          title={`Net: $${yr.profit}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Incomes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <span>Expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Profit Margin</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 5: Project Learnings (Slide 18) */}
        {activePlanTab === 'learnings' && (
          <div className="bg-[#0c162e] border border-slate-700/80 rounded-2xl p-6 sm:p-10">
            <h3 className="text-2xl font-bold text-white font-display mb-2">Learnings Throughout Our Project</h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-8">
              Key competencies and personal growth achieved by our team during this comprehensive English course business venture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                  🤝
                </div>
                <h4 className="text-lg font-bold text-white font-display">Team Work & Collaboration</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Collaboration significantly enhanced our problem-solving skills and fostered innovative solutions across design, marketing, operations, and web development.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                  🧩
                </div>
                <h4 className="text-lg font-bold text-white font-display">Solving Problematics</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Many real logistical, technical, and market-fit problems were analyzed and systematically resolved during the design and research phases.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                  🤖
                </div>
                <h4 className="text-lg font-bold text-white font-display">Knowledge in AI & Programming</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We learned how modern generative AI can be anchored to verified educational curricula, and how to structure real software engineering pipelines.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  📐
                </div>
                <h4 className="text-lg font-bold text-white font-display">Modern Product Structure</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We designed a complete product hierarchy: from free AI inquiry to peer forums, verified tutor booking, and dashboard follow-up continuity.
                </p>
              </div>
            </div>

            {/* School and Contact Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-[#F6C62B]" />
                  <span>prolnk.org@gmail.com</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-[#F6C62B]" />
                  <span>ProLnk.com</span>
                </span>
              </div>
              <span className="text-[#F6C62B] font-semibold">Liceo Javier · English Course Project</span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
