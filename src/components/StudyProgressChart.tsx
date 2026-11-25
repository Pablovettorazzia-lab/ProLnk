import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';

interface StudyProgressChartProps {
  xpPoints?: number;
  streakDays?: number;
  sessionsCount?: number;
  isDarkMode?: boolean;
}

interface DailyStudyPoint {
  dateLabel: string;
  fullDate: string;
  dailyXp: number;
  cumulativeXp: number;
  streak: number;
  active: boolean;
}

type RangeFilter = 30 | 14 | 7;
type ChartView = 'combined' | 'cumulative' | 'streak';

function buildMonthlyStudyData(totalXpInput: number, currentStreakInput: number): DailyStudyPoint[] {
  const days = 30;
  const currentStreak = Math.max(1, Math.min(days, Math.round(currentStreakInput || 5)));
  const currentTotalXp = Math.max(120, Math.round(totalXpInput || 840));

  // Deterministic pattern for earlier days in the 30-day window (0 = rest day, >0 = study intensity weight)
  const baseWeights = [
    1.1, 1.3, 0.9, 0, 1.2, 1.5, 1.4, 1.0, 0, 0.8,
    1.3, 1.6, 1.2, 1.4, 1.1, 0, 1.0, 1.5, 1.7, 1.3,
    0, 1.2, 1.4, 1.1, 1.6, 1.3, 1.5, 1.2, 1.8, 1.6
  ];

  const tailStartIndex = days - currentStreak;
  const activeFlags: boolean[] = [];
  const rawWeights: number[] = [];

  for (let i = 0; i < days; i++) {
    if (i >= tailStartIndex) {
      // Last `currentStreak` days are guaranteed active to match the current streak
      activeFlags.push(true);
      rawWeights.push(baseWeights[i] > 0 ? baseWeights[i] : 1.3);
    } else if (i === tailStartIndex - 1) {
      // Day immediately before current streak started was a rest day so streak resets accurately
      activeFlags.push(false);
      rawWeights.push(0);
    } else {
      const w = baseWeights[i];
      activeFlags.push(w > 0);
      rawWeights.push(w);
    }
  }

  // Monthly XP gain accounts for ~65% of total lifetime XP (or all if small)
  const monthlyGainBudget = Math.max(240, Math.round(currentTotalXp * 0.65));
  const startingXp = Math.max(0, currentTotalXp - monthlyGainBudget);
  const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0) || 1;

  const today = new Date();
  let runningXp = startingXp;
  let runningStreak = 0;
  let allocatedGain = 0;

  const points: DailyStudyPoint[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));

    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const isActive = activeFlags[i];
    if (isActive) {
      runningStreak += 1;
    } else {
      runningStreak = 0;
    }

    let dailyXp = 0;
    if (isActive) {
      if (i === days - 1) {
        dailyXp = Math.max(15, monthlyGainBudget - allocatedGain);
      } else {
        dailyXp = Math.max(15, Math.round((rawWeights[i] / totalWeight) * monthlyGainBudget));
        allocatedGain += dailyXp;
      }
    }

    runningXp += dailyXp;

    points.push({
      dateLabel,
      fullDate,
      dailyXp,
      cumulativeXp: i === days - 1 ? currentTotalXp : runningXp,
      streak: runningStreak,
      active: isActive
    });
  }

  return points;
}

interface TooltipPayloadEntry {
  payload?: DailyStudyPoint;
}

const StudyChartTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[170px]">
      <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
        {point.fullDate}
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Daily XP Gained</span>
        <span className="font-bold text-[#0F2249] tabular-nums">+{point.dailyXp} XP</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Total XP</span>
        <span className="font-semibold text-slate-900 tabular-nums">{point.cumulativeXp} XP</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Active Streak</span>
        <span className="font-bold text-amber-600 tabular-nums">
          {point.streak > 0 ? `${point.streak} day${point.streak === 1 ? '' : 's'}` : 'Rest day'}
        </span>
      </div>
    </div>
  );
};

export const StudyProgressChart: React.FC<StudyProgressChartProps> = ({
  xpPoints = 840,
  streakDays = 5,
  sessionsCount = 3,
  isDarkMode = false
}) => {
  const [range, setRange] = useState<RangeFilter>(30);
  const [viewMode, setViewMode] = useState<ChartView>('combined');
  const gridColor = isDarkMode ? '#1e293b' : '#e2e8f0';
  const xpColor = isDarkMode ? '#F5C542' : '#0F2249';
  const streakColor = isDarkMode ? '#fb923c' : '#ea580c';
  const dotBorder = isDarkMode ? '#080f21' : '#ffffff';

  const fullMonthData = useMemo(
    () => buildMonthlyStudyData(xpPoints, streakDays),
    [xpPoints, streakDays]
  );

  const visibleData = useMemo(
    () => fullMonthData.slice(fullMonthData.length - range),
    [fullMonthData, range]
  );

  const summary = useMemo(() => {
    const xpGained = visibleData.reduce((sum, p) => sum + p.dailyXp, 0);
    const activeDays = visibleData.filter(p => p.active).length;
    const peakStreak = visibleData.reduce((max, p) => Math.max(max, p.streak), 0);
    const avgDailyXp = activeDays > 0 ? Math.round(xpGained / activeDays) : 0;
    return { xpGained, activeDays, peakStreak, avgDailyXp };
  }, [visibleData]);

  return (
    <section
      aria-label="XP Gain and Streak History"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6"
    >
      {/* Header & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            XP Gain & Streak History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Past {range} days of study consistency across AI problem solving and {sessionsCount} tutoring sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric View Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#FAFAF7] border border-slate-200 text-xs">
            {(
              [
                { id: 'combined', label: 'XP & Streak' },
                { id: 'cumulative', label: 'Total XP' },
                { id: 'streak', label: 'Streak' }
              ] as const
            ).map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === option.id
                    ? 'bg-[#0F2249] text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Time Range Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#FAFAF7] border border-slate-200 text-xs">
            {([30, 14, 7] as const).map(daysOption => (
              <button
                key={daysOption}
                type="button"
                onClick={() => setRange(daysOption)}
                className={`px-3 py-1 rounded-full font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  range === daysOption
                    ? 'bg-[#F5C542] text-slate-950 font-bold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {daysOption}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unboxed Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>XP Gained ({range}d)</span>
          </div>
          <div className="text-lg font-bold text-slate-950 tabular-nums mt-1">
            +{summary.xpGained} XP
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Peak Streak</span>
          </div>
          <div className="text-lg font-bold text-slate-950 tabular-nums mt-1">
            {summary.peakStreak} Days
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span>Active Days</span>
          </div>
          <div className="text-lg font-bold text-slate-950 tabular-nums mt-1">
            {summary.activeDays} / {range}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Avg / Study Day</span>
          </div>
          <div className="text-lg font-bold text-slate-950 tabular-nums mt-1">
            {summary.avgDailyXp} XP
          </div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="w-full h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'combined' ? (
            <ComposedChart data={visibleData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="xpBarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={xpColor} stopOpacity={0.92} />
                  <stop offset="100%" stopColor={xpColor} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={22}
              />
              <YAxis
                yAxisId="xp"
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}`}
              />
              <YAxis
                yAxisId="streak"
                orientation="right"
                stroke={streakColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<StudyChartTooltip />} cursor={{ fill: isDarkMode ? 'rgba(245, 197, 66, 0.08)' : 'rgba(15, 34, 73, 0.06)' }} />
              <Bar
                yAxisId="xp"
                dataKey="dailyXp"
                name="Daily XP"
                fill="url(#xpBarFill)"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Line
                yAxisId="streak"
                type="monotone"
                dataKey="streak"
                name="Streak Days"
                stroke={streakColor}
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: streakColor, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: streakColor, stroke: dotBorder, strokeWidth: 2 }}
              />
            </ComposedChart>
          ) : viewMode === 'cumulative' ? (
            <AreaChart data={visibleData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeXpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={xpColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={xpColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={22}
              />
              <YAxis
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 40', 'dataMax + 20']}
              />
              <Tooltip content={<StudyChartTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeXp"
                name="Cumulative XP"
                stroke={xpColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cumulativeXpGradient)"
                activeDot={{ r: 5, fill: xpColor, stroke: dotBorder, strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <AreaChart data={visibleData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={streakColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={streakColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={22}
              />
              <YAxis
                stroke={streakColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<StudyChartTooltip />} />
              <Area
                type="monotone"
                dataKey="streak"
                name="Active Streak"
                stroke={streakColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#streakGradient)"
                activeDot={{ r: 5, fill: streakColor, stroke: dotBorder, strokeWidth: 2 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Quiet Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          {viewMode !== 'streak' && (
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${isDarkMode ? 'bg-[#F5C542]' : 'bg-[#0F2249]'}`} />
              <span>{viewMode === 'cumulative' ? 'Cumulative XP' : 'Daily XP Gained'}</span>
            </span>
          )}
          {viewMode !== 'cumulative' && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-orange-500 rounded-full" />
              <span>Consecutive Streak (Days)</span>
            </span>
          )}
        </div>
        <span>Hover any day to inspect daily XP and streak</span>
      </div>
    </section>
  );
};
