import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { resolveMediaSrc } from '../../utils/mediaStorage';

export const Hero: React.FC = () => {
  const { heroConfig, setActiveView } = useStore();

  const handleCta = (link: string) => {
    if (link === '#philosophy' || link.includes('about')) {
      setActiveView('about');
    } else {
      setActiveView('shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const videoSrc = resolveMediaSrc(heroConfig.videoUrl);

  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#182C16]">
      {/* Background Media: ONLY VIDEO AS HERO (No picture setup) */}
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

      {/* Subtle Botanical Gradient Scrim for maximum text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#122311]/90 via-black/30 to-black/40 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20 flex flex-col items-center">
        {/* Slogan Kicker */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-white/20 rounded-full backdrop-blur-sm bg-white/5 text-[11px] font-sans tracking-[0.35em] uppercase text-[#E5EFEB]">
          <Sparkles className="w-3 h-3 text-[#B7D8B2]" />
          <span>{heroConfig.slogan || 'nature . care . you .'}</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#FAF9F5] leading-[1.12] mb-6 max-w-3xl [text-wrap:balance]">
          {heroConfig.heading}
        </h1>

        {/* Refined Subtitle */}
        <p className="font-sans text-base sm:text-lg md:text-xl text-[#E0E8DD] font-light max-w-2xl leading-relaxed mb-10 [text-wrap:balance]">
          {heroConfig.subheading}
        </p>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <button
            onClick={() => handleCta(heroConfig.ctaLink)}
            className="w-full sm:w-auto px-8 py-4 bg-[#FAF9F5] text-[#1D3B19] hover:bg-[#EAE5D8] transition-all duration-300 text-xs tracking-[0.22em] uppercase font-semibold rounded-full shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <span>{heroConfig.ctaText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => handleCta(heroConfig.secondaryCtaLink)}
            className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/40 hover:border-white transition-all duration-300 text-xs tracking-[0.22em] uppercase font-medium rounded-full backdrop-blur-sm"
          >
            {heroConfig.secondaryCtaText}
          </button>
        </div>

        {/* Quick Trust Markers */}
        <div className="mt-16 pt-8 border-t border-white/15 w-full max-w-2xl flex flex-wrap items-center justify-around gap-6 text-[11px] tracking-[0.2em] uppercase text-[#C4D9C0]">
          <span>100% Herbal Botanicals</span>
          <span>·</span>
          <span>Zero Sulfates & Silicones</span>
          <span>·</span>
          <span>Mindfully Handcrafted</span>
        </div>
      </div>
    </section>
  );
};
