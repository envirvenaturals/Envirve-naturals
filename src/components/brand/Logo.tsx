import React from 'react';
import { useStore } from '../../context/StoreContext';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  showSlogan = true,
}) => {
  const { siteSettings } = useStore();
  const isLight = variant === 'light';
  const textColor = isLight ? '#FAF9F5' : '#1A3816';
  const mutedColor = isLight ? 'rgba(250, 249, 245, 0.75)' : '#5A6E55';
  const ruleColor = isLight ? 'rgba(250, 249, 245, 0.5)' : '#2D5A27';

  const titleSizes = {
    sm: 'text-sm sm:text-base tracking-[0.24em]',
    md: 'text-base sm:text-lg tracking-[0.26em]',
    lg: 'text-xl sm:text-2xl tracking-[0.28em]',
    xl: 'text-2xl sm:text-3xl tracking-[0.3em]',
  };

  const sloganSizes = {
    sm: 'text-[8px] sm:text-[9px] tracking-[0.28em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.3em]',
    lg: 'text-[11px] tracking-[0.32em]',
    xl: 'text-xs tracking-[0.35em]',
  };

  const imageSizes = {
    sm: 'h-7 max-w-[120px]',
    md: 'h-9 max-w-[150px]',
    lg: 'h-12 max-w-[180px]',
    xl: 'h-16 max-w-[220px]',
  };

  return (
    <div className={`group flex items-center gap-3 select-none text-left ${className}`}>
      {/* If picture logo is uploaded via admin section, display here */}
      {siteSettings.logoImageUrl ? (
        <img
          src={siteSettings.logoImageUrl}
          alt={siteSettings.brandName || "Envirve Naturals"}
          className={`${imageSizes[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-102 flex-shrink-0`}
        />
      ) : null}

      {/* Written brand text with typography and slogan */}
      <div className="flex flex-col items-start leading-tight">
        <div className="flex items-center gap-2">
          <span
            className={`font-serif uppercase font-semibold transition-colors duration-300 ${titleSizes[size]}`}
            style={{ color: textColor }}
          >
            ENVÍRVE
          </span>
          <span
            className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.32em]"
            style={{ color: ruleColor }}
          >
            NATURALS
          </span>
        </div>

        {/* Slogan */}
        {showSlogan && (
          <span
            className={`font-sans uppercase font-normal mt-0.5 transition-opacity ${sloganSizes[size]}`}
            style={{ color: mutedColor }}
          >
            {siteSettings.slogan || 'nature . care . you .'}
          </span>
        )}
      </div>
    </div>
  );
};
