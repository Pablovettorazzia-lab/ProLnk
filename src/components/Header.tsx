import React, { useState } from 'react';
import { ProLnkLogo } from './Logo';
import { Menu, X, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  onOpenTrialModal: () => void;
  onOpenLoginModal: () => void;
  currentUser?: { name: string; email: string } | null;
  onGoToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTrialModal,
  onOpenLoginModal,
  currentUser,
  onGoToDashboard
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top trial notification banner - matching original mini-cta */}
      <div className="bg-[#0c1938] border-b border-slate-800/80 py-2 px-4 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Free to start.</span>
            <span className="text-slate-400">3-day trial, unlimited AI messages.</span>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenTrialModal}
              className="text-xs font-semibold text-slate-950 bg-[#F6C62B] hover:bg-[#ffd748] px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              Start free trial
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Header: Strict 3-zone contract */}
      <header className="sticky top-0 z-40 w-full bg-[#080f21]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single element brand wordmark */}
          <a href="#top" className="flex items-center gap-2 group cursor-pointer" aria-label="ProLnk Home">
            <ProLnkLogo size="md" />
          </a>

          {/* Zone 2: Clean 4-6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#speeds" className="hover:text-[#F6C62B] transition-colors py-1">
              Get help
            </a>
            <a href="#how" className="hover:text-[#F6C62B] transition-colors py-1">
              How it works
            </a>
            <a href="#research" className="hover:text-[#F6C62B] transition-colors py-1">
              Research
            </a>
            <a href="#experts" className="hover:text-[#F6C62B] transition-colors py-1">
              Experts
            </a>
            <a href="#community" className="hover:text-[#F6C62B] transition-colors py-1">
              Community
            </a>
            <a href="#pricing" className="hover:text-[#F6C62B] transition-colors py-1">
              Pricing
            </a>
            <a href="#about" className="hover:text-[#F6C62B] transition-colors py-1">
              About
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={onGoToDashboard}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#F6C62B] hover:bg-[#ffd748] rounded-md shadow transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard ({currentUser.name.split(' ')[0]})</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLoginModal}
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenTrialModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-[#F6C62B] hover:bg-[#ffd748] rounded-md shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={onGoToDashboard}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-[#F6C62B] rounded-md"
              >
                App
              </button>
            ) : (
              <button
                onClick={onOpenTrialModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-[#F6C62B] rounded-md"
              >
                Sign up
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d1833] border-b border-slate-800 px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm text-slate-200">
              <a
                href="#speeds"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                Get help
              </a>
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                How it works
              </a>
              <a
                href="#research"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                Research
              </a>
              <a
                href="#experts"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                Experts
              </a>
              <a
                href="#community"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                Community
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#F6C62B] transition-colors"
              >
                About
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onGoToDashboard) onGoToDashboard();
                  }}
                  className="w-full text-center py-2 text-xs text-slate-950 font-bold bg-[#F6C62B] rounded-md"
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="text-xs text-slate-300 hover:text-white"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTrialModal();
                    }}
                    className="text-xs text-slate-950 font-bold bg-[#F6C62B] px-3 py-1.5 rounded-md"
                  >
                    Start free trial
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
