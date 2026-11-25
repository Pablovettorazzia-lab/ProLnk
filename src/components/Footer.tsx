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
  onOpenTrialModal,
  onOpenContactModal,
  isDarkMode = false,
  onNavigate
}) => {
  const go = (page: PublicPage, sectionId?: string) => {
    if (onNavigate) {
      onNavigate(page, sectionId);
    }
  };

  return (
    <footer className="bg-[#F3F1EC] border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200/90">
          
          <div className="md:col-span-2 space-y-4">
            <button
              type="button"
              onClick={() => go('home')}
              className="inline-block cursor-pointer text-left"
              aria-label="ProLnk Home"
            >
              <ProLnkLogo size="md" light={isDarkMode} />
            </button>
            <p className="text-xs text-slate-700 max-w-xs leading-relaxed">
              Source-cited AI tutoring paired with verified live educators whenever you need help.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-slate-700">
              <li>
                <button type="button" onClick={() => go('home', 'speeds')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  Get help
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('how')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  How it works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('pricing')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Learn</h4>
            <ul className="space-y-2 text-slate-700">
              <li>
                <button type="button" onClick={() => go('experts')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  Experts
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('community')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  Community
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('how', 'faq')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-slate-700">
              <li>
                <button type="button" onClick={() => go('about')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  About
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenContactModal} className="hover:text-[#0F2249] transition-colors text-left cursor-pointer">
                  Contact
                </button>
              </li>
              <li>
                <button type="button" onClick={() => go('about', 'team')} className="hover:text-[#0F2249] transition-colors cursor-pointer">
                  Team
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenTrialModal} className="hover:text-[#0F2249] transition-colors text-left cursor-pointer">
                  Start free trial
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <div>
            © 2026 ProLnk. All rights reserved. ·{' '}
            <button
              type="button"
              onClick={() => go('how', 'privacy')}
              className="hover:text-slate-900 underline transition-colors cursor-pointer"
            >
              Privacy &amp; terms
            </button>
          </div>
          <div>ProLnk Learning Technologies</div>
        </div>

      </div>
    </footer>
  );
};
