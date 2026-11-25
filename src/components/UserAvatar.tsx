import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  photoURL?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  className?: string;
  iconClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  name = 'Student',
  size = 'md',
  shape = 'circle',
  className = '',
  iconClassName = ''
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  const sizeMap = {
    xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5' },
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { box: 'w-9 h-9', icon: 'w-4 h-4' },
    lg: { box: 'w-14 h-14', icon: 'w-6 h-6' },
    xl: { box: 'w-20 h-20', icon: 'w-9 h-9' }
  };

  const radius = shape === 'circle' ? 'rounded-full' : size === 'xl' ? 'rounded-2xl' : 'rounded-xl';
  const cleanUrl = photoURL?.trim();

  if (cleanUrl && !imgError) {
    return (
      <img
        src={cleanUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeMap[size].box} ${radius} object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size].box} ${radius} bg-[#E8EEF6] text-[#0F2249] border border-slate-200/90 flex items-center justify-center shrink-0 ${className}`}
      aria-label={name}
    >
      <User className={`${sizeMap[size].icon} stroke-[2] ${iconClassName}`} />
    </div>
  );
};
