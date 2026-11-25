import React from 'react';
import { VerifiedSource } from '../types';
import { Globe, FileText, BookOpen, ExternalLink, Search, Info } from 'lucide-react';

interface VerifiedSourcesBarProps {
  sources?: VerifiedSource[];
  fallbackText?: string;
  searchQueries?: string[];
  webGroundingSkipped?: boolean;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const VerifiedSourcesBar: React.FC<VerifiedSourcesBarProps> = ({
  sources,
  fallbackText,
  searchQueries,
  webGroundingSkipped = false,
  variant = 'light',
  compact = false
}) => {
  const validSources = (sources || []).filter(s => s && s.title);
  const hasAny = validSources.length > 0 || Boolean(fallbackText) || webGroundingSkipped;

  if (!hasAny) return null;

  const isDark = variant === 'dark';

  return (
    <div
      className={`mt-2.5 pt-2.5 border-t ${
        isDark ? 'border-slate-700/60' : 'border-slate-200/80'
      } space-y-1.5`}
    >
      {(validSources.length > 0 || fallbackText) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Verified Sources</span>
          </span>
          {searchQueries && searchQueries.length > 0 && !compact && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <Search className="w-2.5 h-2.5" />
              <span className="truncate max-w-[220px]">{searchQueries[0]}</span>
            </span>
          )}
        </div>
      )}

      {validSources.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {validSources.map((src, idx) => {
            const chipClasses = isDark
              ? src.type === 'document'
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/80 text-slate-200'
              : src.type === 'document'
              ? 'bg-amber-50 border-amber-300 text-[#0F2249]'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

            const icon =
              src.type === 'document' ? (
                <FileText className="w-3 h-3 shrink-0" />
              ) : src.type === 'textbook' ? (
                <BookOpen className="w-3 h-3 shrink-0" />
              ) : (
                <Globe className="w-3 h-3 shrink-0 text-emerald-600" />
              );

            if (src.uri) {
              return (
                <a
                  key={`${src.uri}-${idx}`}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors max-w-full ${chipClasses}`}
                  title={src.uri}
                >
                  {icon}
                  <span className="truncate max-w-[190px] sm:max-w-[240px]">{src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                </a>
              );
            }

            return (
              <span
                key={`${src.title}-${idx}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium max-w-full ${chipClasses}`}
              >
                {icon}
                <span className="truncate max-w-[220px]">{src.title}</span>
              </span>
            );
          })}
        </div>
      ) : (
        fallbackText && (
          <div className={`text-[11px] italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {fallbackText}
          </div>
        )
      )}

      {webGroundingSkipped && (
        <div
          className={`inline-flex items-center gap-1.5 text-[10px] ${
            isDark ? 'text-amber-300' : 'text-amber-700'
          }`}
        >
          <Info className="w-3 h-3 shrink-0" />
          <span>Web search quota reached — answered directly without live web links.</span>
        </div>
      )}
    </div>
  );
};
