import React from 'react';
import { ProLnkLogo } from './Logo';

interface FooterProps {
  onOpenTrialModal: () => void;
  onOpenContactModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrialModal, onOpenContactModal }) => {
  return (
    <footer className="bg-[#050a16] border-t border-slate-800 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <a href="#top" className="inline-block" aria-label="ProLnk Home">
              <ProLnkLogo size="md" />
            </a>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Smart. Expert. Fast. Help from AI and real people, whenever you need it.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#speeds" className="hover:text-[#F6C62B] transition-colors">
                  Get help
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-[#F6C62B] transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#F6C62B] transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Learn Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Learn</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#experts" className="hover:text-[#F6C62B] transition-colors">
                  Experts
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#F6C62B] transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#F6C62B] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-[#F6C62B] transition-colors">
                  About
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenContactModal}
                  className="hover:text-[#F6C62B] transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <a href="#team" className="hover:text-[#F6C62B] transition-colors">
                  Team
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenTrialModal}
                  className="hover:text-[#F6C62B] transition-colors text-left cursor-pointer"
                >
                  Start free trial
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar matching original text */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 ProLnk. All rights reserved. ·{' '}
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy & terms
            </a>
          </div>

          <div className="text-slate-400">
            Made by Pablo, Lourdes, Juan Andrés and Juan Andrés.
          </div>
        </div>

      </div>
    </footer>
  );
};
