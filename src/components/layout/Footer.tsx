import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../brand/Logo';
import { ArrowRight, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{ onOpenTracking: () => void }> = ({ onOpenTracking }) => {
  const { siteSettings, setActiveView, showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    showToast('Welcome to the Envirve Journal! Use code WELCOME10 for 10% off your first ritual.');
  };

  return (
    <footer className="bg-[#1A3117] text-[#EDE9DF] border-t border-[#274823] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Editorial Invite */}
        <div className="border-b border-[#2B4B27] pb-14 mb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#96B890] block mb-2 font-medium">
              The Envirve Journal
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] leading-snug max-w-xl">
              Come back to nature. Receive mindful botanical rituals, ingredient chronicles, and private invitations.
            </h3>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="bg-[#264422] p-4 rounded-lg border border-[#386233] text-sm text-[#D7E8D3]">
                <p className="font-serif italic text-base text-white mb-1">
                  Thank you for joining our community.
                </p>
                <p className="text-xs text-[#A8C8A3]">
                  Use promo code <span className="font-mono font-bold text-white tracking-wider">WELCOME10</span> at checkout for 10% off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-[#244220] border border-[#376132] px-4 py-3 text-sm text-[#FAF9F5] placeholder-[#7E967A] focus:outline-none focus:border-[#96B890] rounded sm:rounded-r-none flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#FAF9F5] text-[#1A3117] hover:bg-[#EBE7DC] px-6 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-colors flex items-center justify-center gap-2 rounded sm:rounded-l-none whitespace-nowrap"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-[#7E967A] mt-2 font-sans">
              We respect your peace. Never spam, unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#2B4B27]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-left inline-block">
              <Logo variant="light" size="sm" showSlogan={false} />
            </div>
            <p className="font-serif italic text-base text-[#B0C9AC] max-w-sm leading-relaxed">
              “nature.care.you.”
            </p>
            <p className="text-xs text-[#8EAA8B] leading-relaxed max-w-sm">
              Rooted in pure botanical wisdom. Handcrafted herbal personal care formulated without sulfates, artificial silicones, or parabens. Pure care for mindful daily rituals.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#274623] hover:bg-[#345C2F] flex items-center justify-center text-[#E5EFEB] transition-colors"
                aria-label="Envirve Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              {siteSettings.whatsappNumber && (
                <a
                  href={`https://wa.me/${siteSettings.whatsappNumber}?text=Hello%20Envirve%20Naturals,%20I%20have%20an%20inquiry%20regarding%20products.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#274623] hover:bg-[#345C2F] flex items-center justify-center text-[#E5EFEB] transition-colors"
                  aria-label="Envirve WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Collection Column */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] uppercase font-semibold text-[#BBD8B6] mb-4">
              Rituals & Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8C4A5]">
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  All Botanicals
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Herbal Shampoos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Herbal Scalp Oils
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Handcrafted Soaps
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Natural Conditioners
                </button>
              </li>
            </ul>
          </div>

          {/* About Envirve */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] uppercase font-semibold text-[#BBD8B6] mb-4">
              The Brand
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8C4A5]">
              <li>
                <button
                  onClick={() => {
                    setActiveView('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Our Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('ingredients');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Botanical Ingredients
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('journal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Journal & Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-sans tracking-[0.2em] uppercase font-semibold text-[#BBD8B6] mb-4">
              Care & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A8C4A5]">
              <li>
                <span className="text-[#8EAA8B]">Delivery:</span> 2–4 Business Days
              </li>
              <li>
                <span className="text-[#8EAA8B]">Payment:</span> Cash on Delivery & JazzCash
              </li>
              <li>
                <span className="text-[#8EAA8B]">Inquiries:</span> {siteSettings.contactEmail}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col items-center justify-center text-xs text-[#7B9577] gap-3">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Envirve Naturals. All rights reserved. Made with natural care.</p>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
              <span>Cash on Delivery</span>
              <span>·</span>
              <span>JazzCash Advance Payment</span>
              <span>·</span>
              <span>100% Botanical Care</span>
            </div>
          </div>

          {/* Discreet Admin Portal Dot Under Copyright */}
          <div className="pt-1 flex justify-center">
            <button
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-2 h-2 rounded-full bg-[#244220] hover:bg-[#5E9459] transition-all focus:outline-none opacity-40 hover:opacity-100 cursor-pointer"
              title="·"
              aria-label="Admin Portal"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
