import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

const SPANISH_MONTHS_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const SHORT_MONTHS_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

const SHORT_MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export const getSessionSquareMeta = (
  session: { day?: string; month?: string; date?: string },
  now: Date = new Date()
) => {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowDay = String(tomorrow.getDate());
  const tomorrowMonthEs = SHORT_MONTHS_ES[tomorrow.getMonth()].toLowerCase();
  const tomorrowMonthEn = SHORT_MONTHS_EN[tomorrow.getMonth()].toLowerCase();

  const rawDay = (session.day || '').trim();
  const rawMonth = (session.month || '').trim();
  const rawDate = (session.date || '').trim();
  const combined = `${rawDay} ${rawDate}`.toLowerCase();

  let dayNumber = '';
  let monthLabel = rawMonth ? rawMonth.slice(0, 3).toUpperCase() : SHORT_MONTHS_ES[now.getMonth()].toUpperCase();

  if (/^\d{1,2}$/.test(rawDay)) {
    dayNumber = String(Number(rawDay));
  } else {
    const match = rawDate.match(/\b(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]{3,})/);
    if (match) {
      dayNumber = String(Number(match[1]));
      if (!rawMonth) {
        monthLabel = match[2].slice(0, 3).toUpperCase();
      }
    } else if (combined.includes('mañana') || combined.includes('manana') || combined.includes('tomorrow')) {
      dayNumber = tomorrowDay;
      monthLabel = (rawMonth || SHORT_MONTHS_ES[tomorrow.getMonth()]).slice(0, 3).toUpperCase();
    } else if (combined.includes('hoy') || combined.includes('today')) {
      dayNumber = String(now.getDate());
      monthLabel = (rawMonth || SHORT_MONTHS_ES[now.getMonth()]).slice(0, 3).toUpperCase();
    } else {
      const anyNum = rawDate.match(/\b(\d{1,2})\b/);
      dayNumber = anyNum ? String(Number(anyNum[1])) : String(now.getDate());
    }
  }

  const normalizedMonth = monthLabel.toLowerCase();
  const matchesTomorrowCalendar =
    dayNumber === tomorrowDay &&
    (normalizedMonth === tomorrowMonthEs || normalizedMonth === tomorrowMonthEn);
  const mentionsTomorrowText =
    combined.includes('mañana') || combined.includes('manana') || combined.includes('tomorrow');

  return {
    dayNumber,
    monthLabel,
    isTomorrow: matchesTomorrowCalendar || mentionsTomorrowText
  };
};

const WEEKDAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const parseLocalDateKey = (dateKey: string): Date => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1, 0, 0, 0, 0);
};

export const formatTime12h = (time24: string): string => {
  if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return '--:--';
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad2(m)} ${period}`;
};

export const getMinimumTimeForDate = (dateKey: string, now: Date = new Date()): string | null => {
  const todayKey = toLocalDateKey(now);
  if (dateKey !== todayKey) return null;
  // Require at least 5 minutes in the future for today
  const minDate = new Date(now.getTime() + 5 * 60 * 1000);
  if (toLocalDateKey(minDate) !== todayKey) {
    return '23:59';
  }
  return `${pad2(minDate.getHours())}:${pad2(minDate.getMinutes())}`;
};

export const isScheduleInPast = (
  dateKey: string,
  time24: string,
  now: Date = new Date()
): boolean => {
  if (!dateKey || !time24 || !/^\d{2}:\d{2}$/.test(time24)) return true;
  const todayKey = toLocalDateKey(now);
  if (dateKey < todayKey) return true;
  if (dateKey > todayKey) return false;

  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time24.split(':').map(Number);
  const candidate = new Date(y, m - 1, d, hh, mm, 0, 0);
  return candidate.getTime() <= now.getTime();
};

export const getDefaultFutureSchedule = (
  now: Date = new Date()
): { dateKey: string; time24: string } => {
  const todayKey = toLocalDateKey(now);
  // Default to +30 minutes rounded up to nearest 15 minutes
  const candidate = new Date(now.getTime() + 30 * 60 * 1000);
  const roundedMinutes = Math.ceil(candidate.getMinutes() / 15) * 15;
  candidate.setMinutes(roundedMinutes, 0, 0);

  const candidateKey = toLocalDateKey(candidate);
  if (candidateKey !== todayKey) {
    return {
      dateKey: candidateKey,
      time24: '10:00'
    };
  }

  return {
    dateKey: candidateKey,
    time24: `${pad2(candidate.getHours())}:${pad2(candidate.getMinutes())}`
  };
};

export const formatScheduleSummary = (dateKey: string, time24: string) => {
  const parsed = parseLocalDateKey(dateKey);
  const day = String(parsed.getDate());
  const month = SHORT_MONTHS_ES[parsed.getMonth()] || 'Mes';
  const year = parsed.getFullYear();
  const timeLabel = formatTime12h(time24);
  const dateLabel = `${day} ${month} ${year}`;
  return {
    day,
    month,
    dateLabel,
    timeLabel,
    fullDate: `${day} ${month} · ${timeLabel}`
  };
};

interface SessionSchedulePickerProps {
  dateKey: string;
  time24: string;
  onChange: (next: { dateKey: string; time24: string }) => void;
  compact?: boolean;
}

export const SessionSchedulePicker: React.FC<SessionSchedulePickerProps> = ({
  dateKey,
  time24,
  onChange,
  compact = false
}) => {
  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const initialParsed = parseLocalDateKey(dateKey || todayKey);

  const [viewYear, setViewYear] = useState(initialParsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialParsed.getMonth());

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const isAtCurrentMonth = viewYear === currentYear && viewMonth === currentMonth;

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday = 0 ... Sunday = 6
    const startOffset = (firstOfMonth.getDay() + 6) % 7;

    const cells: { day: number | null; key: string; isPast: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, key: `empty-${i}`, isPast: true, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`;
      cells.push({
        day: d,
        key,
        isPast: key < todayKey,
        isToday: key === todayKey
      });
    }
    return cells;
  }, [viewYear, viewMonth, todayKey]);

  const minTimeToday = getMinimumTimeForDate(dateKey, now);
  const isPastTime = isScheduleInPast(dateKey, time24, now);
  const summary = formatScheduleSummary(dateKey, time24);

  const handlePrevMonth = () => {
    if (isAtCurrentMonth) return;
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelectDay = (nextKey: string) => {
    let nextTime = time24;
    if (isScheduleInPast(nextKey, nextTime, new Date())) {
      const minT = getMinimumTimeForDate(nextKey, new Date());
      if (minT) {
        nextTime = minT;
      }
    }
    onChange({ dateKey: nextKey, time24: nextTime });
  };

  const baseSlots = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];
  const quickTimeSuggestions = baseSlots.filter(slot => !isScheduleInPast(dateKey, slot, now));

  return (
    <div className="space-y-3">
      {/* Interactive Monthly Calendar */}
      <div className="rounded-xl bg-[#F4F6FA] border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F2249]">
            <Calendar className="w-3.5 h-3.5 text-[#F5C52C]" />
            <span>
              {SPANISH_MONTHS_FULL[viewMonth]} {viewYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isAtCurrentMonth}
              aria-label="Mes anterior"
              className="p-1 rounded-lg border border-slate-200 bg-white text-[#0F2249] hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
              className="p-1 rounded-lg border border-slate-200 bg-white text-[#0F2249] hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAYS_SHORT.map(wd => (
            <div
              key={wd}
              className="text-[10px] font-semibold text-slate-500 uppercase py-0.5"
            >
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map(cell => {
            if (!cell.day) {
              return <div key={cell.key} className={compact ? 'h-7' : 'h-8'} />;
            }
            const isSelected = cell.key === dateKey;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={cell.isPast}
                onClick={() => handleSelectDay(cell.key)}
                title={
                  cell.isPast
                    ? 'Día pasado no disponible'
                    : cell.isToday
                      ? 'Hoy'
                      : cell.key
                }
                className={`${
                  compact ? 'h-7 text-[11px]' : 'h-8 text-xs'
                } rounded-lg font-semibold transition-all flex items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#0F2249] text-white shadow-xs ring-2 ring-[#F5C52C]'
                    : cell.isPast
                      ? 'text-slate-400 opacity-35 cursor-not-allowed line-through'
                      : cell.isToday
                        ? 'bg-white text-[#0F2249] border border-[#F5C52C] hover:bg-amber-50 cursor-pointer'
                        : 'bg-white text-[#0F2249] border border-slate-200/80 hover:border-[#0F2249]/50 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <span>{cell.day}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Time Selection */}
      <div className="rounded-xl bg-[#F4F6FA] border border-slate-200 p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-[#0F2249] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F5C52C]" />
            <span>Hora personalizada</span>
          </label>
          <span className="text-[11px] font-medium text-slate-500">
            {summary.dateLabel} · <strong className="text-[#0F2249]">{summary.timeLabel}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="time"
            required
            value={time24}
            min={minTimeToday || undefined}
            onChange={e => onChange({ dateKey, time24: e.target.value })}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0F2249] focus:outline-none focus:border-[#0F2249]"
          />
          {minTimeToday && (
            <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
              Hoy desde {formatTime12h(minTimeToday)}
            </span>
          )}
        </div>

        {quickTimeSuggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-500 mr-0.5">Sugeridos:</span>
            {quickTimeSuggestions.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => onChange({ dateKey, time24: slot })}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                  time24 === slot
                    ? 'bg-[#0F2249] text-white border-[#0F2249]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#0F2249]/40'
                }`}
              >
                {formatTime12h(slot)}
              </button>
            ))}
          </div>
        )}

        {isPastTime && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              No puedes elegir una fecha u hora que ya pasó. Selecciona un horario futuro.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
