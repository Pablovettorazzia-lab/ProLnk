import React from 'react';
import { ProLnkLogo } from './Logo';
import { PublicPage } from '../types';

interface FooterProps {
  onOpenTrialModal: () => void;
  onOpenContactModal: () => void;
  isDarkMode?: boolean;
  onNavigate?: (page: PublicPage, sectionId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenContactModal,
  onNavigate
}) => {
  const go = (page: PublicPage, sectionId?: string) => {
    if (onNavigate) {
      onNavigate(page, sectionId);
    }
  };

  return (
    <footer className="bg-[#0F2249] text-white border-t border-white/10 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Brand Block */}
          <div className="md:col-span-4 space-y-2.5">
            <button
              type="button"
              onClick={() => go('home')}
              className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg cursor-pointer shadow-xs"
              aria-label="ProLnk Home"
            >
              <ProLnkLogo size="sm" light={false} />
            </button>
            <p className="text-xs text-slate-300 pt-1">
              Learning is connecting.
            </p>
          </div>

          {/* Center Summary & Page Navigation */}
          <div className="md:col-span-5 space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">
                AI · Tutoring · Community
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Real support for your next big step.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => go('how')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => go('experts')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                Tutoring
              </button>
              <button
                type="button"
                onClick={() => go('community')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                Community
              </button>
              <button
                type="button"
                onClick={() => go('pricing')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => go('about')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => go('how', 'privacy')}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={onOpenContactModal}
                className="hover:text-[#F5C52C] transition-colors cursor-pointer"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Right Copyright */}
          <div className="md:col-span-3 md:text-right text-xs text-slate-300 font-mono-nums">
            © 2026 ProLnk
          </div>
        </div>
      </div>
    </footer>
  );
};
