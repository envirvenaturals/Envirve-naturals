import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronDown } from 'lucide-react';
import { resolveMediaSrc } from '../../utils/mediaStorage';

export const Hero: React.FC = () => {
  const { heroConfig } = useStore();

  const handleScrollDown = () => {
    const target = document.getElementById('featured-collection');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  };

  const videoSrc = resolveMediaSrc(heroConfig.videoUrl);

  return (
    <section className="relative w-full h-[88vh] sm:min-h-[90vh] flex items-end justify-center overflow-hidden bg-[#182C16]">
      {/* Background Media: ONLY VIDEO AS HERO */}
      {videoSrc ? (
        <video
          key={videoSrc}
          className="absolute inset-0 w-full h-full object-cover object-center"
          src={videoSrc}
          autoPlay={heroConfig.autoplay !== false}
          loop={heroConfig.loop !== false}
          muted={heroConfig.muted !== false}
          playsInline
          preload="auto"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#182C16] via-[#10200F] to-[#0A1609]" />
      )}

      {/* Dynamic Overlay controlled by Admin */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
        style={{ opacity: heroConfig.overlayOpacity / 100 }}
      />

      {/* Subtle Botanical Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

      {/* Only 'Swipe down' indicator - All other text, headings, badges and buttons removed */}
      <div className="relative z-10 pb-8 sm:pb-10 flex flex-col items-center justify-center">
        <button
          onClick={handleScrollDown}
          className="group flex flex-col items-center gap-1.5 text-white/85 hover:text-white transition-all cursor-pointer py-2 px-4 focus:outline-none"
          aria-label="Swipe down to explore"
        >
          <span className="text-[11px] sm:text-xs font-sans tracking-[0.25em] uppercase font-light text-white/90 drop-shadow-sm select-none">
            Swipe down
          </span>
          <ChevronDown className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-y-1 transition-transform duration-300 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

