import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FirestoreErrorInfo } from '../firebase/firestoreService';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ProLnk ErrorBoundary caught:', error, info);
  }

  private parseFirestoreError(error: Error | null): FirestoreErrorInfo | null {
    if (!error?.message) return null;
    try {
      const parsed = JSON.parse(error.message) as FirestoreErrorInfo;
      if (parsed && typeof parsed.operationType === 'string' && 'authInfo' in parsed) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const fsInfo = this.parseFirestoreError(this.state.error);

    return (
      <div className="min-h-screen bg-[#080f21] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-[#0c162e] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Connection or Permission Error
              </h2>
              <p className="text-xs text-slate-400">
                Something interrupted synchronization with ProLnk cloud services.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#080f21] border border-slate-800 text-xs text-slate-300 space-y-2">
            {fsInfo ? (
              <>
                <p className="text-rose-300 font-semibold">{fsInfo.error}</p>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <p>Operation: <span className="text-slate-200">{fsInfo.operationType}</span></p>
                  {fsInfo.path && <p>Path: <span className="text-slate-200">{fsInfo.path}</span></p>}
                  <p>Signed In: <span className="text-slate-200">{fsInfo.authInfo?.userId ? 'Yes' : 'No'}</span></p>
                </div>
              </>
            ) : (
              <p className="text-rose-300 font-medium">
                {this.state.error?.message || 'An unexpected application error occurred.'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F6C62B] hover:bg-[#ffd744] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </div>
    );
  }
}
