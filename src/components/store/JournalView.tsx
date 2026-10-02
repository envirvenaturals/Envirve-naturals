import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BlogPost, JournalImage } from '../../types';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ArrowRight,
  Edit,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Check,
  X,
  Eye,
  Lock,
  Unlock,
  Upload,
} from 'lucide-react';
import { resolveMediaSrc, compressImageFile } from '../../utils/mediaStorage';
import { PictureEditorModal } from '../common/PictureEditorModal';

export const JournalView: React.FC = () => {
  const {
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
  } = useStore();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Editor Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Rituals',
    readTime: '4 min read',
    date: 'Current Season',
    author: 'Envirve Editorial',
    image: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    imageCaption: '',
    additionalImages: [],
    isPublished: true,
  });

  // Dedicated Picture Editor Modal State
  const [isPictureEditorOpen, setIsPictureEditorOpen] = useState(false);
  const [pictureEditorConfig, setPictureEditorConfig] = useState<{
    target: 'articleModalCover' | 'articleModalGallery' | 'liveCover' | 'liveGallery';
    targetPostId?: string;
    galleryIndex?: number;
    initialUrl: string;
    initialCaption?: string;
    initialAlt?: string;
    title: string;
  } | null>(null);

  // Quick Admin Login Dialog State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Delete confirmation
  const [deletingPostId, setDeletingPostId] = useState<{ id: string; title: string } | null>(null);

  // Find currently selected post dynamically
  const selectedPost = blogPosts.find((p) => p.id === selectedPostId) || null;

  // Filter posts based on login: admins see all, customers see published
  const displayedPosts = isAdminLoggedIn ? blogPosts : blogPosts.filter((p) => p.isPublished);

  // --- Modal Openers ---
  const openCreateArticleModal = () => {
    setEditingPostId(null);
    setArticleForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Rituals',
      readTime: '4 min read',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      author: 'Envirve Editorial',
      image: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
      imageCaption: '',
      additionalImages: [],
      isPublished: true,
    });
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setArticleForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      readTime: post.readTime,
      date: post.date,
      author: post.author,
      image: post.image,
      imageCaption: post.imageCaption || '',
      additionalImages: post.additionalImages ? [...post.additionalImages] : [],
      isPublished: post.isPublished,
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title.trim()) return;

    const slug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      ...articleForm,
      slug,
    };

    if (editingPostId) {
      updateBlogPost(editingPostId, payload);
    } else {
      addBlogPost(payload);
    }
    setIsArticleModalOpen(false);
  };

  // Picture Editor Openers
  const openCoverPictureEditorFromModal = () => {
    setPictureEditorConfig({
      target: 'articleModalCover',
      initialUrl: articleForm.image,
      initialCaption: articleForm.imageCaption,
      title: 'Edit Featured Cover Picture',
    });
    setIsPictureEditorOpen(true);
  };

  const openLiveCoverPictureEditor = (post: BlogPost) => {
    setPictureEditorConfig({
      target: 'liveCover',
      targetPostId: post.id,
      initialUrl: post.image,
      initialCaption: post.imageCaption,
      title: `Edit Cover Picture: ${post.title}`,
    });
    setIsPictureEditorOpen(true);
  };

  const openGalleryPictureEditor = (index: number, img: JournalImage) => {
    setPictureEditorConfig({
      target: 'articleModalGallery',
      galleryIndex: index,
      initialUrl: img.url,
      initialCaption: img.caption,
      initialAlt: img.alt,
      title: `Edit Story Picture #${index + 1}`,
    });
    setIsPictureEditorOpen(true);
  };

  const handlePictureEditorSave = (result: { url: string; caption?: string; alt?: string }) => {
    if (!pictureEditorConfig) return;

    if (pictureEditorConfig.target === 'articleModalCover') {
      setArticleForm((prev) => ({
        ...prev,
        image: result.url || prev.image,
        imageCaption: result.caption !== undefined ? result.caption : prev.imageCaption,
      }));
    } else if (pictureEditorConfig.target === 'articleModalGallery') {
      const idx = pictureEditorConfig.galleryIndex;
      if (typeof idx === 'number') {
        setArticleForm((prev) => {
          const nextGallery = [...(prev.additionalImages || [])];
          if (nextGallery[idx]) {
            nextGallery[idx] = {
              ...nextGallery[idx],
              url: result.url || nextGallery[idx].url,
              caption: result.caption,
              alt: result.alt,
            };
          }
          return { ...prev, additionalImages: nextGallery };
        });
      }
    } else if (pictureEditorConfig.target === 'liveCover') {
      const targetId = pictureEditorConfig.targetPostId || selectedPost?.id;
      if (targetId) {
        updateBlogPost(targetId, {
          image: result.url,
          imageCaption: result.caption || '',
        });
      }
    }

    setIsPictureEditorOpen(false);
  };

  // Quick Photo upload for modal
  const handleCoverQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 900, 900, 0.72);
        setArticleForm((prev) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.warn('Cover upload notice:', err);
      }
    }
  };

  const handleAddGalleryPicture = () => {
    const newImage: JournalImage = {
      id: 'img-' + Date.now(),
      url: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
      caption: 'Herbal harvest detail',
      alt: 'Botanical ingredient',
    };
    setArticleForm((prev) => ({
      ...prev,
      additionalImages: [...(prev.additionalImages || []), newImage],
    }));
  };

  const handleRemoveGalleryPicture = (index: number) => {
    setArticleForm((prev) => ({
      ...prev,
      additionalImages: (prev.additionalImages || []).filter((_, i) => i !== index),
    }));
  };

  // Quick admin unlock
  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setIsLoginModalOpen(false);
      setPasswordInput('');
    }
  };

  // --------------------------------------------------------------------------
  // ARTICLE DETAIL VIEW
  // --------------------------------------------------------------------------
  if (selectedPost) {
    return (
      <div className="bg-[#FAF9F5] min-h-screen py-10 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Top Navigation & Edit Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#ECE7DA]">
            <button
              onClick={() => setSelectedPostId(null)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A5E46] hover:text-[#1F3D1C] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Return to Journal Archive</span>
            </button>

            <div className="flex items-center gap-2">
              {isAdminLoggedIn ? (
                <>
                  <button
                    onClick={() => openEditArticleModal(selectedPost)}
                    className="px-3.5 py-1.5 bg-[#EEF5EC] hover:bg-[#DDECDA] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#C5DEC0] shadow-2xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Article</span>
                  </button>
                  <button
                    onClick={() => openLiveCoverPictureEditor(selectedPost)}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#FAF9F5] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-[#DDD7C8] shadow-2xs"
                    title="Edit and adjust this article's pictures"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Edit Pictures</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1 bg-white hover:bg-[#FAF9F5] text-[#556653] text-[11px] font-medium rounded-lg flex items-center gap-1 transition-colors border border-[#DDD7C8] cursor-pointer"
                  title="Unlock editor controls"
                >
                  <Lock className="w-3 h-3 text-[#798A76]" />
                  <span>Editor Controls</span>
                </button>
              )}
            </div>
          </div>

          <article>
            <div className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block">
                  {selectedPost.category}
                </span>
                {!selectedPost.isPublished && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#FFF2DE] text-[#A66C15] border border-[#EACD9B]">
                    Draft · Hidden from Public
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B3218] leading-[1.18] mb-4 [text-wrap:balance]">
                {selectedPost.title}
              </h1>
              <div className="flex items-center gap-4 text-xs text-[#71806F] font-sans pb-6 border-b border-[#ECE7DA]">
                <span>By {selectedPost.author}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedPost.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedPost.readTime}
                </span>
              </div>
            </div>

            {/* Featured Cover Picture with Direct Edit Trigger */}
            <div className="relative group aspect-[16/9] w-full rounded-2xl overflow-hidden mb-3 bg-[#E8E3D7] shadow-sm">
              <img
                src={resolveMediaSrc(selectedPost.image)}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />

              {/* Floating Edit Picture Button for easy instant access */}
              {isAdminLoggedIn && (
                <div className="absolute top-3 right-3 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openLiveCoverPictureEditor(selectedPost)}
                    className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                    <span>Edit Picture</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cover Picture Caption */}
            {selectedPost.imageCaption && (
              <p className="font-serif italic text-xs text-[#6B7968] text-center mb-8">
                {selectedPost.imageCaption}
              </p>
            )}

            {/* Short Excerpt Lead Paragraph */}
            {selectedPost.excerpt && (
              <p className="font-serif italic text-base sm:text-lg text-[#253922] leading-relaxed mb-8 pb-6 border-b border-[#ECE7DA] font-light">
                {selectedPost.excerpt}
              </p>
            )}

            {/* Body Content */}
            <div className="prose prose-stone max-w-none text-[#334230] leading-relaxed space-y-5 text-sm sm:text-base font-light">
              {(selectedPost.content || '').split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className="font-serif text-xl sm:text-2xl text-[#1B3218] font-semibold pt-4"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-2 border-[#2D5A27] pl-4 italic text-[#243B21] my-4 font-serif text-base"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            {/* Additional Story Pictures Gallery if present */}
            {selectedPost.additionalImages && selectedPost.additionalImages.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[#ECE7DA] space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg font-bold text-[#1B3218] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                    <span>Ritual Imagery & Field Chronicle</span>
                  </h4>
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => openEditArticleModal(selectedPost)}
                      className="text-xs text-[#2D5A27] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Manage Story Photos</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedPost.additionalImages.map((img, i) => (
                    <div key={img.id || i} className="group/item space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#ECE7DC] shadow-xs">
                        <img
                          src={resolveMediaSrc(img.url)}
                          alt={img.alt || img.caption || 'Journal photo'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-103"
                        />
                      </div>
                      {img.caption && (
                        <p className="font-serif italic text-xs text-[#61725E] leading-snug">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Story Footer with Edit Button */}
            <div className="mt-14 pt-6 border-t border-[#ECE7DA] flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => {
                  setSelectedPostId(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A5E46] hover:text-[#1F3D1C] transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Return to Botanical Archive</span>
              </button>

              {isAdminLoggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openLiveCoverPictureEditor(selectedPost)}
                    className="px-3.5 py-2 bg-white hover:bg-[#FAF9F5] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit Picture</span>
                  </button>
                  <button
                    onClick={() => openEditArticleModal(selectedPost)}
                    className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Article & Content</span>
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Picture Editor Modal */}
        {pictureEditorConfig && (
          <PictureEditorModal
            isOpen={isPictureEditorOpen}
            onClose={() => setIsPictureEditorOpen(false)}
            initialImage={pictureEditorConfig.initialUrl}
            initialCaption={pictureEditorConfig.initialCaption}
            initialAlt={pictureEditorConfig.initialAlt}
            title={pictureEditorConfig.title}
            onSave={handlePictureEditorSave}
          />
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // JOURNAL ARCHIVE CATALOG VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="bg-[#FAF9F5] min-h-screen py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Editorial Control Bar */}
        <div className="mb-10 p-4 bg-white rounded-2xl border border-[#DDD7C8] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
              {isAdminLoggedIn ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-[#1B3218] block">
                {isAdminLoggedIn
                  ? 'Journal Editorial Portal Active'
                  : 'Envirve Botanical Journal & Chronicles'}
              </span>
              <span className="text-[11px] text-[#697966]">
                {isAdminLoggedIn
                  ? 'You have complete editing access to stories, picture adjustments, and publishing.'
                  : 'Stories of slow botanical formulations, traditional hair rituals, and clean living.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn ? (
              <>
                <button
                  onClick={openCreateArticleModal}
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Story</span>
                </button>
                <button
                  onClick={logoutAdmin}
                  className="px-3 py-2 border border-[#DDD7C8] hover:bg-[#FAF9F5] text-xs text-[#6B7968] rounded-lg transition-colors cursor-pointer"
                  title="Exit editor mode"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-semibold text-[#2D5A27] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editor Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#2D5A27] font-semibold block mb-2">
            The Botanical Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B3218] mb-4">
            The Envirve Journal
          </h1>
          <p className="text-sm text-[#5B6B58] font-light leading-relaxed">
            Explorations into traditional herbalism, mindful scalp rituals, sustainable harvesting, and natural beauty philosophy.
          </p>
        </div>

        {/* Grid of Journal Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl border border-[#ECE7DA] hover:border-[#2D5A27] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Article Image Container */}
                <div
                  onClick={() => setSelectedPostId(post.id)}
                  className="relative aspect-[16/10] bg-[#F4F1EA] overflow-hidden cursor-pointer"
                >
                  <img
                    src={resolveMediaSrc(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Draft Badge */}
                  {!post.isPublished && (
                    <div className="absolute top-3 left-3 bg-[#FFF3E0] text-[#A66C15] border border-[#E9CCA1] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Draft (Private)
                    </div>
                  )}

                  {/* Direct Edit Picture Badge for Admins */}
                  {isAdminLoggedIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLiveCoverPictureEditor(post);
                      }}
                      className="absolute top-3 right-3 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[11px] font-medium rounded-lg flex items-center gap-1 backdrop-blur-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Edit Picture"
                    >
                      <Sliders className="w-3 h-3 text-[#E6C665]" />
                      <span>Edit Picture</span>
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-[#7B8B79] mb-2 font-sans">
                    <span className="uppercase tracking-[0.2em] font-medium text-[#2D5A27]">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedPostId(post.id)}
                    className="font-serif text-xl text-[#1B3218] group-hover:text-[#2D5A27] transition-colors leading-snug mb-3 cursor-pointer"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#5C6A5A] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-[#FAF9F5] border-t border-[#ECE7DA] flex items-center justify-between text-xs text-[#2D5A27] font-semibold tracking-wider">
                <span className="uppercase">{post.date}</span>

                <div className="flex items-center gap-2">
                  {isAdminLoggedIn && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLiveCoverPictureEditor(post);
                        }}
                        className="p-1.5 text-[#2D5A27] hover:bg-[#EEF5EC] rounded transition-colors cursor-pointer"
                        title="Edit Picture"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditArticleModal(post);
                        }}
                        className="p-1.5 text-[#2D5A27] hover:bg-[#EEF5EC] rounded transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPostId({ id: post.id, title: post.title });
                        }}
                        className="p-1.5 text-[#A63A3A] hover:bg-[#FFEBEB] rounded transition-colors cursor-pointer"
                        title="Delete Story"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedPostId(post.id)}
                    className="flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase cursor-pointer pl-1"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* ARTICLE CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                    {editingPostId ? 'Edit Journal Story' : 'Create Journal Story'}
                  </h3>
                  <p className="text-xs text-[#697966]">
                    Craft beautiful herbal stories, ritual guides, and upload edited photos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 text-[#7A8778] hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. The Ancient Ritual of Hair Oiling"
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] font-serif text-base focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Category
                  </label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619]"
                  >
                    <option value="Rituals">Rituals</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Ingredients">Ingredients</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={articleForm.readTime}
                    onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                    placeholder="e.g. 4 min read"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    placeholder="e.g. Envirve Editorial"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619]"
                  />
                </div>
              </div>

              {/* Cover Picture Section with Picture Editor */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B3218] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Featured Cover Picture
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 bg-white hover:bg-[#EEF5EC] border border-[#C5DEC0] text-[#2D5A27] text-[11px] font-semibold rounded cursor-pointer transition-colors flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverQuickUpload}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={openCoverPictureEditorFromModal}
                      className="px-3 py-1 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Open Picture Editor</span>
                    </button>
                  </div>
                </div>

                {/* Picture Preview Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-32 aspect-video rounded-lg overflow-hidden bg-[#ECE7DC] border border-[#DDD7C8] flex-shrink-0">
                    <img
                      src={resolveMediaSrc(articleForm.image)}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={articleForm.image}
                      onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                      placeholder="Picture URL or data:image/..."
                      className="w-full bg-white border border-[#DDD7C8] px-2.5 py-1.5 text-xs rounded text-[#1C3619]"
                    />
                    <input
                      type="text"
                      value={articleForm.imageCaption || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, imageCaption: e.target.value })}
                      placeholder="Cover picture caption (optional, e.g. Cold-pressed rosemary leaves in porcelain)"
                      className="w-full bg-white border border-[#DDD7C8] px-2.5 py-1.5 text-xs rounded text-[#1C3619] italic font-serif"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Story Pictures Section */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1B3218] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Story Photo Gallery ({articleForm.additionalImages?.length || 0} Pictures)
                    </span>
                    <span className="text-[11px] text-[#697966]">
                      Insert photos that appear in the article's photo chronicle.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddGalleryPicture}
                    className="px-3 py-1 bg-white hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Story Photo</span>
                  </button>
                </div>

                {articleForm.additionalImages && articleForm.additionalImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                    {articleForm.additionalImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="bg-white p-2.5 rounded-lg border border-[#DDD7C8] flex items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-[#ECE7DC] flex-shrink-0">
                          <img
                            src={resolveMediaSrc(img.url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => {
                              const updated = [...(articleForm.additionalImages || [])];
                              updated[idx].caption = e.target.value;
                              setArticleForm({ ...articleForm, additionalImages: updated });
                            }}
                            placeholder="Caption..."
                            className="w-full border-b border-[#ECE7DA] text-xs p-1 focus:outline-none focus:border-[#2D5A27]"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => openGalleryPictureEditor(idx, img)}
                              className="text-[10px] text-[#2D5A27] font-semibold underline cursor-pointer"
                            >
                              Edit Picture
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryPicture(idx)}
                              className="text-[10px] text-[#A63A3A] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Short Excerpt / Lead
                </label>
                <textarea
                  rows={2}
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Summary displayed on journal cards and archive..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#3C4C38]">
                    Story Content
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setArticleForm((prev) => ({
                          ...prev,
                          content: prev.content + '\n\n### New Section Heading\n',
                        }))
                      }
                      className="px-2 py-0.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] rounded border border-[#DDD7C8] text-[#2D5A27]"
                    >
                      + Section Heading
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setArticleForm((prev) => ({
                          ...prev,
                          content: prev.content + '\n\n> "A sacred moment in botanical care..."\n',
                        }))
                      }
                      className="px-2 py-0.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] rounded border border-[#DDD7C8] text-[#2D5A27]"
                    >
                      + Pull Quote
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Write the editorial chronicle here. Use ### for subheadings, > for pull quotes..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="journal-publish-toggle"
                  checked={articleForm.isPublished}
                  onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })}
                  className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                />
                <label
                  htmlFor="journal-publish-toggle"
                  className="text-xs text-[#2A3B27] cursor-pointer"
                >
                  Publish immediately (Visible to all storefront patrons)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPostId ? 'Update Story' : 'Publish Story'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* PICTURE EDITOR MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {pictureEditorConfig && (
        <PictureEditorModal
          isOpen={isPictureEditorOpen}
          onClose={() => setIsPictureEditorOpen(false)}
          initialImage={pictureEditorConfig.initialUrl}
          initialCaption={pictureEditorConfig.initialCaption}
          initialAlt={pictureEditorConfig.initialAlt}
          title={pictureEditorConfig.title}
          onSave={handlePictureEditorSave}
        />
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* IN-APP ADMIN LOGIN MODAL */}
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
                Enter administrative password to edit journals, upload pictures, and publish articles:
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
                  Unlock Editor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {deletingPostId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-[#DDD7C8] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-serif text-lg font-bold text-[#1B3218]">Delete Story?</h4>
            <p className="text-xs text-[#62715F]">
              Are you sure you want to delete <strong>"{deletingPostId.title}"</strong>? This will remove the article from the botanical journal.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="px-3 py-1.5 border border-[#DDD7C8] text-xs rounded-lg hover:bg-[#FAF9F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBlogPost(deletingPostId.id);
                  setDeletingPostId(null);
                }}
                className="px-4 py-1.5 bg-[#D93838] hover:bg-[#B52424] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
