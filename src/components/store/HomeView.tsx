import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, InstagramPost } from '../../types';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { resolveMediaSrc, compressImageFile } from '../../utils/mediaStorage';
import { PictureEditorModal } from '../common/PictureEditorModal';
import { BotanicalJourneyModal } from './BotanicalJourneyModal';
import {
  ArrowRight,
  Sprout,
  Shield,
  Star,
  CheckCircle,
  Instagram,
  Heart,
  MessageCircle,
  Sparkles,
  Sliders,
  Edit,
  Upload,
  Check,
  X,
  Lock,
  Copy,
  Plus,
} from 'lucide-react';

interface HomeViewProps {
  onSelectProduct: (p: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectProduct }) => {
  const {
    products,
    ingredients,
    reviews,
    siteSettings,
    updateSiteSettings,
    updatePhilosophyConfig,
    instagramPosts,
    setActiveView,
    isAdminLoggedIn,
    loginAdmin,
    showToast,
  } = useStore();

  const [isPictureEditorOpen, setIsPictureEditorOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteInput, setQuoteInput] = useState(siteSettings.ourPromiseQuote || '');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Botanical Journey Multi-Paste Modal State
  const [isBotanicalModalOpen, setIsBotanicalModalOpen] = useState(false);
  const [botanicalModalTab, setBotanicalModalTab] = useState<'batch' | 'single'>('batch');
  const [editingBotanicalPost, setEditingBotanicalPost] = useState<InstagramPost | null>(null);

  const featuredProducts = products
    .filter((p) => p.isPublished && (p.isBestseller || p.isFeatured))
    .slice(0, 4);

  const featuredIngredients = ingredients.slice(0, 4);

  // Filter approved and featured community voices
  const approvedReviews = reviews.filter((r) => r.isApproved && (r.featuredOnHome !== false));

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Cinematic Hero with Video Background */}
      <Hero />

      {/* 2. Bestsellers & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#ECE7DA]">
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block mb-1">
              Hand-Bottled Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218]">
              Most Beloved Formulations
            </h2>
          </div>
          <button
            onClick={() => {
              setActiveView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs uppercase tracking-widest font-semibold text-[#2D5A27] hover:underline self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>View All {products.length} Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 3. Brand Philosophy / Editorial Banner */}
      <section className="bg-[#FAF8F2] border-y border-[#ECE7DA] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Our Promise Picture with Direct Visual Editing */}
            <div className="lg:col-span-6 group relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-md bg-[#1B3218]">
              <img
                src={resolveMediaSrc(siteSettings.ourPromiseImageUrl) || "/src/assets/images/hero_botanical_ritual_1790696451263.jpg"}
                alt="Envirve Philosophy & Promise"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#CFE4CD] font-medium block">
                    Our Promise
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteInput(siteSettings.ourPromiseQuote || '');
                      setIsQuoteModalOpen(true);
                    }}
                    className="text-[10px] text-[#CFE4CD] hover:text-white underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Quote</span>
                  </button>
                </div>
                <p className="font-serif italic text-base sm:text-lg text-[#FAF9F5] leading-snug">
                  “{siteSettings.ourPromiseQuote || 'Care formulated backward from pure botanical wisdom.'}”
                </p>
              </div>

              {/* Floating Action Buttons over Our Promise Picture */}
              <div className="absolute top-4 right-4 opacity-95 sm:opacity-90 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                <label className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImageFile(file, 900, 900, 0.72);
                          updateSiteSettings({ ourPromiseImageUrl: compressed });
                          updatePhilosophyConfig({ promiseImageUrl: compressed });
                          showToast('Our Promise picture updated successfully!');
                        } catch (err) {
                          console.warn('Upload error:', err);
                        }
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setIsPictureEditorOpen(true)}
                  className="px-3.5 py-1.5 bg-black/85 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
                  title="Edit Our Promise Picture"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                  <span>Edit Picture</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#2D5A27] font-semibold block">
                The Envirve Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B3218] leading-[1.18] [text-wrap:balance]">
                Pure herbal care without chemical shortcuts.
              </h2>
              <p className="text-xs sm:text-sm text-[#50604E] leading-relaxed">
                Conventional hair care strips away natural protective lipids with aggressive detergents, masking the damage with synthetic silicones. We chose a different path: ancient herbal infusions, cold-pressed seed oils, and pure plant saponins that respect your scalp’s delicate microbiome.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-[#EDE8DC]">
                  <Sprout className="w-5 h-5 text-[#2D5A27] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#1C3619]">
                      Nature-Led
                    </h4>
                    <p className="text-[11px] text-[#697866] mt-0.5">
                      Bioactive herbs harvested in peak botanical vitality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-[#EDE8DC]">
                  <Shield className="w-5 h-5 text-[#2D5A27] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#1C3619]">
                      Zero Synthetic Chemicals
                    </h4>
                    <p className="text-[11px] text-[#697866] mt-0.5">
                      Free from sulfates, artificial silicones, and parabens.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveView('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#1F3E1B] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#2B5326] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Read Our Philosophy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteInput(siteSettings.ourPromiseQuote || '');
                      setIsQuoteModalOpen(true);
                    }}
                    className="px-4 py-3 border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-semibold text-[#2D5A27] rounded-lg transition-colors cursor-pointer"
                  >
                    Edit Promise Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Botanical Ingredients Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block mb-1">
            Ingredient Transparency
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218]">
            Key Botanicals in Our Apothecary
          </h2>
          <p className="text-xs text-[#6B7968] mt-2">
            Click any herb to discover its lore, origin, and documented cosmetic benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredIngredients.map((ing) => (
            <div
              key={ing.id}
              onClick={() => {
                setActiveView('ingredients');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-white p-5 rounded-2xl border border-[#ECE7DA] hover:border-[#2D5A27] cursor-pointer transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-[#F2EFE8]">
                  <img
                    src={ing.image}
                    alt={ing.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h4 className="font-serif text-lg text-[#1B3218] group-hover:text-[#2D5A27] font-medium leading-snug mb-1">
                  {ing.name}
                </h4>
                <p className="font-serif italic text-xs text-[#71806E] mb-2">
                  {ing.botanicalName}
                </p>
                <p className="text-xs text-[#52604F] line-clamp-2 leading-relaxed">
                  {ing.description}
                </p>
              </div>

              <span className="text-[11px] font-semibold text-[#2D5A27] uppercase tracking-wider pt-3 border-t border-[#F2EEE4] mt-3 flex items-center justify-between">
                <span>Explore Lore</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Community Voices (Editable from Admin) */}
      <section className="bg-white border-y border-[#ECE7DA] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#ECE7DA]">
            <div>
              <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block mb-1">
                Community Voices
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218]">
                Stories from Mindful Rituals
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#2D5A27] font-medium bg-[#EEF5EC] px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Patron Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-[#FAF9F5] rounded-2xl border border-[#ECE7DA] hover:border-[#D0C7B5] transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex text-[#D99A26] mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif italic text-sm text-[#273624] leading-relaxed mb-2">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EDE8DC] flex items-center justify-between text-xs text-[#63725F]">
                  <span className="font-semibold text-[#1B3218] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2D5A27]" />
                    {rev.authorName}
                  </span>
                  <span className="text-[11px] font-medium text-[#4D604A]">
                    {rev.productName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM SECTION: Envirve Naturals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F9F2] text-[#2D5A27] rounded-full text-xs font-semibold mb-2">
              <Instagram className="w-3.5 h-3.5" />
              <span>@envirvenaturals on Instagram</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1B3218]">
              Follow Our Botanical Journey
            </h2>
            <p className="text-xs sm:text-sm text-[#61705E] mt-1.5">
              Behind the formulations, seasonal harvests, mindful rituals, and customer journeys.
            </p>
          </div>

          {/* Direct Post Management Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditingBotanicalPost(null);
                setBotanicalModalTab('batch');
                setIsBotanicalModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Paste multiple Instagram posts or image links at once"
            >
              <Copy className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Paste Multiple Posts</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingBotanicalPost(null);
                setBotanicalModalTab('single');
                setIsBotanicalModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Add a single photo or video"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Post</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {instagramPosts.map((post) => {
            const isVideo =
              post.mediaType === 'video' ||
              Boolean(post.videoUrl && post.videoUrl.trim().length > 0) ||
              Boolean(post.imageUrl && (post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.webm') || post.imageUrl.includes('video/')));
            const videoSrc = post.videoUrl || post.imageUrl;
            const imgSrc = post.imageUrl || post.videoUrl;

            return (
              <a
                key={post.id}
                href={post.url || siteSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#ECE7DC] shadow-xs block"
              >
                {isVideo ? (
                  <video
                    src={resolveMediaSrc(videoSrc)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                ) : (
                  <img
                    src={resolveMediaSrc(imgSrc)}
                    alt={post.caption}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/src/assets/images/hero_botanical_ritual_1790696451263.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                  <div className="flex items-center justify-between">
                    {isVideo && (
                      <span className="px-2 py-0.5 bg-black/50 text-[#C2E0BD] text-[10px] font-medium rounded-full backdrop-blur-xs flex items-center gap-1">
                        ▶ Video
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingBotanicalPost(post);
                          setBotanicalModalTab('single');
                          setIsBotanicalModalOpen(true);
                        }}
                        className="px-2 py-0.5 bg-black/60 hover:bg-black text-[#E5C765] hover:text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors backdrop-blur-xs"
                        title="Edit post media or caption"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs line-clamp-3 leading-snug font-sans text-[#EAECE8]">
                    {post.caption}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#D7E2D5] pt-2 border-t border-white/20">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      {post.likes}
                    </span>
                    <span>View on Instagram →</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <a
            href={siteSettings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C3619] hover:bg-[#2A4D26] text-white text-xs uppercase tracking-widest font-semibold rounded-full shadow-md transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>Visit @envirvenaturals on Instagram</span>
          </a>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      {siteSettings.whatsappNumber && (
        <a
          href={`https://wa.me/${siteSettings.whatsappNumber}?text=Hello%20Envirve%20Naturals,%20I%20have%20an%20inquiry%20regarding%20products.`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
          title="Chat with Envirve Care Specialist"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </a>
      )}

      {/* Picture Editor Modal for Our Promise */}
      <PictureEditorModal
        isOpen={isPictureEditorOpen}
        onClose={() => setIsPictureEditorOpen(false)}
        initialImage={siteSettings.ourPromiseImageUrl || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
        initialCaption={siteSettings.ourPromiseQuote}
        title="Edit Our Promise Picture & Quote"
        onSave={(result) => {
          if (result.url) {
            updateSiteSettings({
              ourPromiseImageUrl: result.url,
              ...(result.caption ? { ourPromiseQuote: result.caption } : {}),
            });
            updatePhilosophyConfig({
              promiseImageUrl: result.url,
              ...(result.caption ? { promiseQuote: result.caption } : {}),
            });
            showToast('Our Promise picture & quote saved to store!');
          }
          setIsPictureEditorOpen(false);
        }}
      />

      {/* Quick Quote Editor Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-[#DDD7C8] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                Edit Our Promise Quote
              </h3>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-[#728070] hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSiteSettings({ ourPromiseQuote: quoteInput });
                updatePhilosophyConfig({ promiseQuote: quoteInput });
                setIsQuoteModalOpen(false);
                showToast('Our Promise quote updated!');
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-semibold text-[#3C4C38]">
                Promise Quote (Displayed over the homepage picture)
              </label>
              <textarea
                rows={3}
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
                placeholder="Care formulated backward from pure botanical wisdom."
                className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] italic font-serif leading-relaxed"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-3 py-1.5 border border-[#DDD7C8] text-xs rounded-lg hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 border border-[#DDD7C8] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
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
                className="text-[#728070] hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (loginAdmin(passwordInput)) {
                  setIsLoginModalOpen(false);
                  setPasswordInput('');
                }
              }}
              className="space-y-3"
            >
              <p className="text-xs text-[#5E6D5B]">
                Enter admin password to edit the homepage promise picture and quote:
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
      {/* Botanical Journey Multi-Paste and Media Modal */}
      <BotanicalJourneyModal
        isOpen={isBotanicalModalOpen}
        onClose={() => {
          setIsBotanicalModalOpen(false);
          setEditingBotanicalPost(null);
        }}
        initialTab={botanicalModalTab}
        editingPost={editingBotanicalPost}
      />
    </div>
  );
};
