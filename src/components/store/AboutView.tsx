import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sparkles,
  Shield,
  HeartHandshake,
  Sprout,
  ArrowRight,
  Edit,
  Sliders,
  Check,
  X,
  Lock,
  Unlock,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { resolveMediaSrc, compressImageFile } from '../../utils/mediaStorage';
import { PictureEditorModal } from '../common/PictureEditorModal';
import { PhilosophyConfig } from '../../types';

export const AboutView: React.FC = () => {
  const {
    philosophyConfig,
    updatePhilosophyConfig,
    siteSettings,
    updateSiteSettings,
    setActiveView,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    showToast,
  } = useStore();

  // Edit Modals State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPromiseModalOpen, setIsPromiseModalOpen] = useState(false);
  const [isPictureEditorOpen, setIsPictureEditorOpen] = useState(false);
  const [pictureEditorTarget, setPictureEditorTarget] = useState<'craftsmanship' | 'promise'>('craftsmanship');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [formConfig, setFormConfig] = useState<PhilosophyConfig>(philosophyConfig);

  useEffect(() => {
    setFormConfig(philosophyConfig);
  }, [philosophyConfig]);

  const getPillarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sprout':
        return <Sprout className="w-6 h-6 text-[#2D5A27]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#2D5A27]" />;
      case 'Shield':
        return <Shield className="w-6 h-6 text-[#2D5A27]" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-6 h-6 text-[#2D5A27]" />;
    }
  };

  const craftImageSrc =
    resolveMediaSrc(philosophyConfig?.craftImageUrl) ||
    '/src/assets/images/hero_botanical_ritual_1790696451263.jpg';

  const promiseImageSrc =
    resolveMediaSrc(philosophyConfig?.promiseImageUrl) ||
    resolveMediaSrc(siteSettings?.ourPromiseImageUrl) ||
    '/src/assets/images/hero_botanical_ritual_1790696451263.jpg';

  const promiseQuoteText =
    philosophyConfig?.promiseQuote ||
    siteSettings?.ourPromiseQuote ||
    'Care formulated backward from pure botanical wisdom.';

  const handleOpenContentModal = () => {
    setFormConfig(philosophyConfig);
    setIsContentModalOpen(true);
  };

  const handleOpenPromiseModal = () => {
    setFormConfig(philosophyConfig);
    setIsPromiseModalOpen(true);
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updatePhilosophyConfig(formConfig);
    setIsContentModalOpen(false);
    setIsPromiseModalOpen(false);
  };

  const openCraftsmanshipPictureEditor = () => {
    setPictureEditorTarget('craftsmanship');
    setIsPictureEditorOpen(true);
  };

  const openPromisePictureEditor = () => {
    setPictureEditorTarget('promise');
    setIsPictureEditorOpen(true);
  };

  const handlePictureEditorSave = (result: { url: string; caption?: string; alt?: string }) => {
    if (result.url) {
      if (pictureEditorTarget === 'craftsmanship') {
        updatePhilosophyConfig({ craftImageUrl: result.url });
        setFormConfig((prev) => ({ ...prev, craftImageUrl: result.url }));
        showToast('Craftsmanship picture updated successfully!');
      } else {
        updatePhilosophyConfig({
          promiseImageUrl: result.url,
          ...(result.caption ? { promiseQuote: result.caption } : {}),
        });
        updateSiteSettings({
          ourPromiseImageUrl: result.url,
          ...(result.caption ? { ourPromiseQuote: result.caption } : {}),
        });
        setFormConfig((prev) => ({
          ...prev,
          promiseImageUrl: result.url,
          ...(result.caption ? { promiseQuote: result.caption } : {}),
        }));
        showToast('The Envirve Promise picture updated successfully!');
      }
    }
    setIsPictureEditorOpen(false);
  };

  const handlePromiseQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 900, 900, 0.72);
        updatePhilosophyConfig({ promiseImageUrl: compressed });
        updateSiteSettings({ ourPromiseImageUrl: compressed });
        showToast('Promise picture uploaded successfully!');
      } catch (err) {
        console.warn('Promise upload notice:', err);
      }
    }
  };

  const handleCraftQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 900, 900, 0.72);
        updatePhilosophyConfig({ craftImageUrl: compressed });
        showToast('Craftsmanship picture uploaded successfully!');
      } catch (err) {
        console.warn('Craftsmanship upload notice:', err);
      }
    }
  };

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setIsLoginModalOpen(false);
      setPasswordInput('');
    }
  };

  const pillarsList = Array.isArray(philosophyConfig?.pillars) && philosophyConfig.pillars.length > 0
    ? philosophyConfig.pillars
    : [
        {
          id: 'pillar-1',
          icon: 'Sprout' as const,
          title: 'Nature-Led Formulation',
          desc: 'We formulate backward from nature’s most resilient botanicals, relying on active plant intelligence rather than chemical shortcuts.',
        },
        {
          id: 'pillar-2',
          icon: 'HeartHandshake' as const,
          title: 'Thoughtfully Handcrafted',
          desc: 'Every batch is prepared in limited micro-batches to guarantee freshness, potency, and active botanical vitality.',
        },
        {
          id: 'pillar-3',
          icon: 'Shield' as const,
          title: 'Total Ingredient Transparency',
          desc: 'Zero sulfates, zero synthetic silicones, zero parabens, and zero artificial dyes. Every ingredient is openly disclosed.',
        },
        {
          id: 'pillar-4',
          icon: 'Sparkles' as const,
          title: 'Everyday Mindful Rituals',
          desc: 'Care is the daily rhythm of honoring your body. Our natural textures and botanical aromas turn routine hygiene into moments of peace.',
        },
      ];

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-12 sm:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Action Bar */}
        <div className="mb-10 p-4 bg-white rounded-2xl border border-[#DDD7C8] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
              {isAdminLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-[#1B3218] block">
                {isAdminLoggedIn
                  ? 'Philosophy & Promise Editorial Mode Active'
                  : 'Brand Philosophy & Origin'}
              </span>
              <span className="text-[11px] text-[#697966]">
                {isAdminLoggedIn
                  ? 'You can directly edit story paragraphs, craftsmanship picture, and The Envirve Promise.'
                  : 'Explore the founding principles, ethical sourcing, and botanical rituals of Envirve Naturals.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCraftsmanshipPictureEditor}
              className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change or edit craftsmanship photo"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Philosophy Picture</span>
            </button>
            <button
              onClick={openPromisePictureEditor}
              className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change or edit promise photo"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#E5C765]" />
              <span>Edit Promise Picture</span>
            </button>
            <button
              onClick={handleOpenPromiseModal}
              className="px-3.5 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Edit Promise & Pillars</span>
            </button>
            <button
              onClick={handleOpenContentModal}
              className="px-4 py-1.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit All Text</span>
            </button>
          </div>
        </div>

        {/* 1. Story Intro (Fully Editable) */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#2D5A27] font-semibold block mb-3">
            {philosophyConfig?.introKicker || 'The Origin of Envirve'}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1B3218] leading-[1.15] mb-6 [text-wrap:balance]">
            {philosophyConfig?.introHeading || 'Rooted in nature. Thoughtfully made for you.'}
          </h1>
          {philosophyConfig?.introQuote && (
            <p className="font-serif italic text-xl text-[#394C36] mb-6">
              {philosophyConfig.introQuote}
            </p>
          )}
          <p className="text-sm sm:text-base text-[#566654] font-light leading-relaxed [text-wrap:balance]">
            {philosophyConfig?.introParagraph ||
              'Envirve Naturals was born out of a yearning for simplicity, truth, and genuine botanical care.'}
          </p>
        </div>

        {/* 2. Cinematic Imagery & Craftsmanship Section (Fully Editable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-24">
          {/* Craftsmanship Picture Container with Direct Edit Action */}
          <div className="group relative rounded-2xl overflow-hidden shadow-md bg-[#ECE7DC] aspect-[4/3]">
            <img
              src={craftImageSrc}
              alt={philosophyConfig?.craftHeading || 'Botanical craftsmanship and natural ingredients'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
            />

            {/* Direct Picture Edit Trigger Button */}
            <div className="absolute top-4 right-4 opacity-95 sm:opacity-90 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              <label className="px-3 py-2 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCraftQuickUpload}
                />
              </label>
              <button
                type="button"
                onClick={openCraftsmanshipPictureEditor}
                className="px-3.5 py-2 bg-black/80 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
                title="Change or adjust craftsmanship picture"
              >
                <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                <span>Edit Picture</span>
              </button>
            </div>
          </div>

          <div className="space-y-6 md:pl-6">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#2D5A27]">
              {philosophyConfig?.craftSectionTag || 'Our Craftsmanship'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218] leading-tight">
              {philosophyConfig?.craftHeading || 'Slow infusions, unhurried methods.'}
            </h2>
            {philosophyConfig?.craftParagraph1 && (
              <p className="text-xs sm:text-sm text-[#50604E] leading-relaxed">
                {philosophyConfig.craftParagraph1}
              </p>
            )}
            {philosophyConfig?.craftParagraph2 && (
              <p className="text-xs sm:text-sm text-[#50604E] leading-relaxed">
                {philosophyConfig.craftParagraph2}
              </p>
            )}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-[#1F3E1B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#2B5226] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{philosophyConfig?.craftButtonText || 'Discover the Formulations'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isAdminLoggedIn && (
                <button
                  onClick={handleOpenContentModal}
                  className="px-4 py-3 border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-semibold text-[#2D5A27] rounded-lg transition-colors cursor-pointer"
                >
                  Edit Narrative
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. The Core Standards / The Envirve Promise (Fully Editable with Dedicated Promise Picture) */}
        <div className="mb-24 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-7xl mx-auto border-b border-[#ECE7DA] pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] block mb-2">
                {philosophyConfig?.pillarsSectionTag || 'Our Core Standards'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218]">
                {philosophyConfig?.pillarsHeading || 'The Envirve Promise'}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={openPromisePictureEditor}
                className="px-3.5 py-2 bg-white hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                <span>Edit Promise Picture</span>
              </button>
              <button
                type="button"
                onClick={handleOpenPromiseModal}
                className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Promise & Standards</span>
              </button>
            </div>
          </div>

          {/* Featured The Envirve Promise Picture & Quote Showcase */}
          <div className="relative group rounded-3xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[21/9] bg-[#1B3218]">
            <img
              src={promiseImageSrc}
              alt={philosophyConfig?.pillarsHeading || 'The Envirve Promise'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

            {/* In-Picture Overlay Quote & Tag */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white max-w-2xl">
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#CFE4CD] font-medium block mb-2">
                Our Sincere Commitment
              </span>
              <h3 className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#FAF9F5] leading-snug drop-shadow-sm mb-3">
                “{promiseQuoteText}”
              </h3>
              <p className="text-xs sm:text-sm text-[#D8E6D5] font-light max-w-lg leading-relaxed">
                Every botanical formula is rooted in ancient integrity, unadulterated cold-pressed herbs, and an unwavering respect for your health.
              </p>
            </div>

            {/* Direct Edit Buttons Over Picture */}
            <div className="absolute top-4 right-4 opacity-95 sm:opacity-90 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              <label className="px-3 py-2 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePromiseQuickUpload}
                />
              </label>
              <button
                type="button"
                onClick={openPromisePictureEditor}
                className="px-3.5 py-2 bg-black/85 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
                title="Change or edit promise picture"
              >
                <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                <span>Edit Promise Picture</span>
              </button>
            </div>
          </div>

          {/* The 4 Core Standards Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillarsList.map((pillar) => (
              <div
                key={pillar.id}
                className="p-6 bg-white rounded-2xl border border-[#ECE7DA] shadow-xs flex flex-col justify-between hover:border-[#C5DEC0] transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EEF5EC] flex items-center justify-center mb-5">
                    {getPillarIcon(pillar.icon)}
                  </div>
                  <h3 className="font-serif text-lg text-[#1B3218] font-medium mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#52634F] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Ethical Commitment Callout Banner (Fully Editable) */}
        <div className="p-8 sm:p-12 bg-[#203D1D] rounded-3xl text-white text-center max-w-4xl mx-auto relative overflow-hidden shadow-lg">
          <div className="relative z-10 space-y-4">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#B8DBB2] font-semibold block">
              {philosophyConfig?.ethicalKicker || 'Ethical Sourcing & Earth Respect'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium">
              {philosophyConfig?.ethicalHeading || 'Packaged with conscience. Made without compromise.'}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8E6D5] max-w-2xl mx-auto font-light leading-relaxed">
              {philosophyConfig?.ethicalDescription ||
                'We package in amber recyclable glass and reusable aluminum tins whenever possible. Our labels are printed with non-toxic soy inks, and every box is secured with compostable kraft tape.'}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* PICTURE EDITOR MODAL (SUPPORTS BOTH CRAFTSMANSHIP & PROMISE PICTURES) */}
      {/* ------------------------------------------------------------------------ */}
      <PictureEditorModal
        isOpen={isPictureEditorOpen}
        onClose={() => setIsPictureEditorOpen(false)}
        initialImage={
          pictureEditorTarget === 'craftsmanship'
            ? philosophyConfig?.craftImageUrl || craftImageSrc
            : philosophyConfig?.promiseImageUrl || promiseImageSrc
        }
        title={
          pictureEditorTarget === 'craftsmanship'
            ? 'Edit Philosophy Craftsmanship Picture'
            : 'Edit The Envirve Promise Picture'
        }
        onSave={handlePictureEditorSave}
      />

      {/* ------------------------------------------------------------------------ */}
      {/* PHILOSOPHY STORY CONTENT EDIT MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                    Edit Philosophy Story & Text
                  </h3>
                  <p className="text-xs text-[#6B7968]">
                    Changes will apply instantly to your public brand philosophy.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContentModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Tagline Kicker
                  </label>
                  <input
                    type="text"
                    value={formConfig.introKicker}
                    onChange={(e) => setFormConfig({ ...formConfig, introKicker: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Philosophy Quote
                  </label>
                  <input
                    type="text"
                    value={formConfig.introQuote}
                    onChange={(e) => setFormConfig({ ...formConfig, introQuote: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] italic font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={formConfig.introHeading}
                  onChange={(e) => setFormConfig({ ...formConfig, introHeading: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-serif font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Founding Narrative Story
                </label>
                <textarea
                  rows={4}
                  value={formConfig.introParagraph}
                  onChange={(e) => setFormConfig({ ...formConfig, introParagraph: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#ECE7DA]">
                <h4 className="font-serif text-base font-bold text-[#1B3218] mb-3">
                  Craftsmanship Section
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Section Tag
                    </label>
                    <input
                      type="text"
                      value={formConfig.craftSectionTag}
                      onChange={(e) => setFormConfig({ ...formConfig, craftSectionTag: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formConfig.craftButtonText}
                      onChange={(e) => setFormConfig({ ...formConfig, craftButtonText: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Craftsmanship Heading
                  </label>
                  <input
                    type="text"
                    value={formConfig.craftHeading}
                    onChange={(e) => setFormConfig({ ...formConfig, craftHeading: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-serif font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Paragraph 1 (Infusion)
                    </label>
                    <textarea
                      rows={3}
                      value={formConfig.craftParagraph1}
                      onChange={(e) => setFormConfig({ ...formConfig, craftParagraph1: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Paragraph 2 (Outcome)
                    </label>
                    <textarea
                      rows={3}
                      value={formConfig.craftParagraph2}
                      onChange={(e) => setFormConfig({ ...formConfig, craftParagraph2: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsContentModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* DEDICATED PROMISE & STANDARDS EDIT MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {isPromiseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                    Edit The Envirve Promise & Core Standards
                  </h3>
                  <p className="text-xs text-[#6B7968]">
                    Customize the Promise heading, quote, picture, and the 4 core standards pillars.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromiseModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Promise Section Tag
                  </label>
                  <input
                    type="text"
                    value={formConfig.pillarsSectionTag}
                    onChange={(e) => setFormConfig({ ...formConfig, pillarsSectionTag: e.target.value })}
                    placeholder="Our Core Standards"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Promise Section Heading
                  </label>
                  <input
                    type="text"
                    value={formConfig.pillarsHeading}
                    onChange={(e) => setFormConfig({ ...formConfig, pillarsHeading: e.target.value })}
                    placeholder="The Envirve Promise"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] font-serif font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  The Envirve Promise Quote (Overlaid on the Promise Picture)
                </label>
                <input
                  type="text"
                  value={formConfig.promiseQuote || ''}
                  onChange={(e) => setFormConfig({ ...formConfig, promiseQuote: e.target.value })}
                  placeholder="Care formulated backward from pure botanical wisdom."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] italic font-serif"
                />
              </div>

              {/* Promise Picture Selector */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-3">
                <span className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider block">
                  The Promise Picture
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden border border-[#DDD7C8] bg-black/10 flex-shrink-0">
                    <img
                      src={resolveMediaSrc(formConfig.promiseImageUrl) || promiseImageSrc}
                      alt="Promise preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-1.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImageFile(file, 900, 900, 0.72);
                              setFormConfig((prev) => ({ ...prev, promiseImageUrl: compressed }));
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPromiseModalOpen(false);
                          openPromisePictureEditor();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-[#EEF5EC] border border-[#DDD7C8] text-xs font-semibold text-[#2D5A27] rounded-lg transition-colors cursor-pointer"
                      >
                        Open Picture Editor
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formConfig.promiseImageUrl || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, promiseImageUrl: e.target.value })}
                      placeholder="Or paste remote picture URL..."
                      className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Pillars inputs */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#1B3218] uppercase tracking-wider block">
                  The 4 Foundational Pillars
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formConfig.pillars || []).map((pillar, idx) => (
                    <div key={pillar.id || idx} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2D5A27]">Pillar #{idx + 1}</span>
                        <select
                          value={pillar.icon}
                          onChange={(e) => {
                            const next = [...(formConfig.pillars || [])];
                            next[idx] = { ...next[idx], icon: e.target.value as any };
                            setFormConfig({ ...formConfig, pillars: next });
                          }}
                          className="bg-white border border-[#DDD7C8] text-[11px] p-1 rounded text-[#1C3619]"
                        >
                          <option value="Sprout">Sprout (Nature)</option>
                          <option value="HeartHandshake">HeartHandshake (Artisan)</option>
                          <option value="Shield">Shield (Pure)</option>
                          <option value="Sparkles">Sparkles (Ritual)</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const next = [...(formConfig.pillars || [])];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setFormConfig({ ...formConfig, pillars: next });
                        }}
                        placeholder="Pillar title"
                        className="w-full bg-white border border-[#DDD7C8] p-1.5 text-xs rounded font-semibold text-[#1C3619]"
                      />
                      <textarea
                        rows={2}
                        value={pillar.desc}
                        onChange={(e) => {
                          const next = [...(formConfig.pillars || [])];
                          next[idx] = { ...next[idx], desc: e.target.value };
                          setFormConfig({ ...formConfig, pillars: next });
                        }}
                        placeholder="Pillar description"
                        className="w-full bg-white border border-[#DDD7C8] p-1.5 text-xs rounded text-[#1C3619]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsPromiseModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Promise Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* IN-APP LOGIN MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-[#DDD7C8] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-serif text-base font-bold text-[#1B3218]">
                  Editorial Portal Access
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-[#7C8879] hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickLogin} className="space-y-3">
              <p className="text-xs text-[#5E6D5B]">
                Enter administrative password to edit the philosophy narrative, promise, and pictures:
              </p>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-3 py-1.5 border border-[#DDD7C8] text-xs rounded-lg hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
