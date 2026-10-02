import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../brand/Logo';
import { Search, ShoppingBag, Heart, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenTracking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenTracking }) => {
  const {
    siteSettings,
    cart,
    wishlist,
    setIsCartOpen,
    activeView,
    setActiveView,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Single Collection button next to brand:
  const primaryLeftButton = { label: 'Collection', view: 'shop' };

  const secondaryNavLinks = [
    { label: 'Ingredients', view: 'ingredients' },
    { label: 'Philosophy', view: 'about' },
    { label: 'Journal', view: 'journal' },
  ];

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      {siteSettings.announcementBar.enabled && (
        <div className="bg-[#1C3619] text-[#FAF8F5] text-[11px] font-sans tracking-[0.2em] uppercase py-2 px-4 text-center border-b border-[#2D5A27]/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="hidden sm:inline-block text-[10px] text-[#A6C4A2] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>nature.care.you.</span>
            </span>
            <span className="mx-auto font-medium tracking-wider">
              {siteSettings.announcementBar.text}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#A6C4A2]">
              100% Botanical
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF9F5]/96 backdrop-blur-md shadow-sm border-b border-[#E8E2D5] py-2.5'
            : 'bg-[#FAF9F5] border-b border-[#ECE7DA] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* EXTREME LEFT: Brand Title & Logo + The 3 Navigation Buttons */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Brand Title (at the extreme left) */}
            <button
              onClick={() => handleNavClick('home')}
              className="focus:outline-none transition-transform hover:opacity-95 text-left flex-shrink-0"
              aria-label="Envirve Naturals Home"
            >
              <Logo size={isScrolled ? 'sm' : 'md'} showSlogan={!isScrolled} />
            </button>

            {/* The Collection Button next to the brand on the left */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => handleNavClick(primaryLeftButton.view)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-[0.18em] uppercase transition-all duration-200 border ${
                  activeView === primaryLeftButton.view
                    ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs font-semibold'
                    : 'bg-white/80 border-[#DDD7C8] text-[#2C3B29] hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27]'
                }`}
              >
                {primaryLeftButton.label}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Secondary Links + Affordances */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Secondary editorial links (desktop) */}
            <div className="hidden xl:flex items-center gap-6 text-[12px] tracking-[0.18em] uppercase font-sans font-medium text-[#495945]">
              {secondaryNavLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.view)}
                  className={`hover:text-[#2D5A27] transition-colors py-1 relative ${
                    activeView === link.view ? 'text-[#2D5A27] font-semibold' : ''
                  }`}
                >
                  {link.label}
                  {activeView === link.view && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2D5A27]" />
                  )}
                </button>
              ))}
            </div>

            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#354632] hover:text-[#2D5A27] hover:bg-[#F0ECE2] rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="relative p-2 text-[#354632] hover:text-[#2D5A27] hover:bg-[#F0ECE2] rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#2D5A27] text-white text-[9px] font-sans font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#1C3619] hover:bg-[#F0ECE2] rounded-full transition-colors"
              aria-label={`Cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-[19px] h-[19px]" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#2D5A27] text-white text-[9px] font-mono tabular-nums flex items-center justify-center font-bold shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#2D5A27] hover:text-[#183115] lg:hidden rounded-lg hover:bg-[#F0ECE2] transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-[#FAF9F5] h-full shadow-2xl flex flex-col p-6 z-10 border-r border-[#ECE7DA]">
            <div className="flex items-center justify-between pb-5 border-b border-[#ECE7DA]">
              <Logo size="sm" showSlogan={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#384236] hover:text-black rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-2 py-6 font-sans text-xs tracking-[0.18em] uppercase text-[#2B3529]">
              {[primaryLeftButton, ...secondaryNavLinks].map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.view)}
                  className={`text-left py-3 px-3 rounded-lg transition-colors border-b border-[#F0ECE1] ${
                    activeView === link.view
                      ? 'bg-[#EEF5EC] text-[#2D5A27] font-bold'
                      : 'hover:bg-white text-[#2B3529]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-[#ECE7DA] text-xs text-[#6F776C] space-y-1">
              <p className="font-serif italic text-sm text-[#2D5A27]">
                nature.care.you.
              </p>
              <p className="text-[11px]">Nationwide Delivery across Pakistan</p>
              <p className="text-[11px] text-[#2D5A27] font-mono">
                {siteSettings.instagramHandle}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
