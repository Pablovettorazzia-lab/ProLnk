import React, { useState } from 'react';
import { ProLnkLogo } from './Logo';
import { Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { PublicPage } from '../types';

interface HeaderProps {
  onOpenTrialModal: () => void;
  onOpenLoginModal: () => void;
  onEnterDemo?: () => void;
  currentUser?: { name: string; email: string } | null;
  onGoToDashboard?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  activePage?: PublicPage;
  onNavigate?: (page: PublicPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTrialModal,
  onOpenLoginModal,
  onEnterDemo,
  currentUser,
  onGoToDashboard,
  isDarkMode = false,
  onToggleDarkMode,
  activePage = 'home',
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { page: PublicPage; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'how', label: 'How it works' },
    { page: 'experts', label: 'Experts' },
    { page: 'community', label: 'Community' },
    { page: 'pricing', label: 'Pricing' },
    { page: 'about', label: 'About' }
  ];

  const handleNavClick = (page: PublicPage) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer shrink-0 text-left"
          aria-label="ProLnk Home"
        >
          <ProLnkLogo size="md" light={isDarkMode} />
        </button>

        {/* Clean Page Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
          {navLinks.map(link => {
            const isActive = activePage === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => handleNavClick(link.page)}
                className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F2249] text-white font-semibold'
                    : 'text-slate-600 hover:text-[#0F2249] hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#F5C542]" /> : <Moon className="w-4 h-4 text-[#0F2249]" />}
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2249] hover:bg-[#19346b] rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#F5C542]" />
              <span>Dashboard ({currentUser.name.split(' ')[0]})</span>
            </button>
          ) : (
            <>
              {onEnterDemo && (
                <button
                  onClick={onEnterDemo}
                  className="text-xs font-semibold text-[#0F2249] hover:bg-amber-50 border border-amber-300/80 bg-amber-50/60 px-3.5 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  Demo Portal
                </button>
              )}
              <button
                onClick={onOpenLoginModal}
                className="text-xs font-medium text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                Log in
              </button>
              <button
                onClick={onOpenTrialModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F2249] hover:bg-[#19346b] rounded-full transition-colors whitespace-nowrap cursor-pointer shadow-sm"
              >
                Start free trial
              </button>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-2">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-white border border-slate-300 text-slate-700 cursor-pointer"
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#F5C542]" /> : <Moon className="w-4 h-4 text-[#0F2249]" />}
            </button>
          )}
          {currentUser ? (
            <button
              onClick={onGoToDashboard}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F2249] rounded-full"
            >
              Portal
            </button>
          ) : (
            <button
              onClick={onOpenTrialModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F2249] rounded-full"
            >
              Sign up
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <nav className="grid grid-cols-2 gap-2 text-sm text-slate-700">
            {navLinks.map(link => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleNavClick(link.page)}
                  className={`py-2 px-3 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2249] text-white font-semibold'
                      : 'bg-[#FAFAF7] hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGoToDashboard) onGoToDashboard();
                }}
                className="w-full text-center py-2 text-xs text-white font-semibold bg-[#0F2249] rounded-full"
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
                  className="text-xs font-medium text-slate-600 hover:text-slate-950"
                >
                  Log in
                </button>
                <div className="flex items-center gap-2">
                  {onEnterDemo && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onEnterDemo();
                      }}
                      className="text-xs text-[#0F2249] font-semibold bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-full"
                    >
                      Demo Portal
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenTrialModal();
                    }}
                    className="text-xs text-white font-semibold bg-[#0F2249] px-3.5 py-1.5 rounded-full"
                  >
                    Start trial
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
