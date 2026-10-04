import React from 'react';
import logoImg from '../assets/images/prolnk_logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  light?: boolean;
}

export const ProLnkLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  light = true
}) => {
  const sizeMap = {
    sm: { mark: 'h-8 w-8', text: 'text-lg', spacing: 'gap-2' },
    md: { mark: 'h-10 w-10', text: 'text-2xl', spacing: 'gap-2.5' },
    lg: { mark: 'h-12 w-12', text: 'text-3xl', spacing: 'gap-3' },
    xl: { mark: 'h-16 w-16', text: 'text-4xl', spacing: 'gap-3.5' }
  };

  const { mark, text, spacing } = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${spacing} select-none ${className}`}>
      {/* Official ProLnk Logo Image */}
      <img
        src={logoImg}
        alt="ProLnk Logo"
        className={`${mark} object-contain shrink-0 transition-transform duration-200 hover:scale-105 drop-shadow-sm`}
        loading="eager"
      />

      {showWordmark && (
        <span className={`font-bold tracking-tight ${text} font-display ${light ? 'text-white' : 'text-[#0F2249]'}`}>
          Pro<span className="text-[#FAC71D]">Lnk</span>
        </span>
      )}
    </div>
  );
};
export default ProLnkLogo;
