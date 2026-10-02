import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { InstagramPost } from '../../types';
import {
  X,
  Upload,
  Instagram,
  Copy,
  Plus,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  Film,
  Check,
  Heart,
  ExternalLink,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  resolveMediaSrc,
  compressImageFile,
  processVideoUpload,
} from '../../utils/mediaStorage';

// Curated high-fidelity fallback botanical photos for links without direct image file access
const BOTANICAL_PRESET_IMAGES = [
  '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
  '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
  '/src/assets/images/product_botanical_oil_1790696473722.jpg',
  '/src/assets/images/product_glow_soap_1790696485480.jpg',
  '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
];

interface BotanicalJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'batch' | 'single';
  editingPost?: InstagramPost | null;
}

export const BotanicalJourneyModal: React.FC<BotanicalJourneyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'batch',
  editingPost = null,
}) => {
  const {
    siteSettings,
    addInstagramPost,
    addMultipleInstagramPosts,
    updateInstagramPost,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'batch' | 'single'>(
    editingPost ? 'single' : initialTab
  );

  // Single Post Form State
  const [singleForm, setSingleForm] = useState<Omit<InstagramPost, 'id'>>({
    mediaType: editingPost?.mediaType || 'image',
    imageUrl: editingPost?.imageUrl || '',
    videoUrl: editingPost?.videoUrl || '',
    caption: editingPost?.caption || '',
    likes: editingPost?.likes ?? 220,
    url: editingPost?.url || siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals',
  });
  const [isProcessingSingleFile, setIsProcessingSingleFile] = useState(false);

  // Batch Multi-Post State
  const [batchPasteText, setBatchPasteText] = useState('');
  const [batchDefaultCaption, setBatchDefaultCaption] = useState(
    'Pure botanical formulations & mindful daily rituals. #EnvirveNaturals #ArtisanCare'
  );
  const [batchDefaultUrl, setBatchDefaultUrl] = useState(
    siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals'
  );
  const [batchUploadedItems, setBatchUploadedItems] = useState<Array<Omit<InstagramPost, 'id'>>>([]);
  const [isProcessingBatchFiles, setIsProcessingBatchFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setActiveTab('single');
      setSingleForm({
        mediaType: editingPost.mediaType || 'image',
        imageUrl: editingPost.imageUrl || '',
        videoUrl: editingPost.videoUrl || '',
        caption: editingPost.caption || '',
        likes: editingPost.likes ?? 220,
        url: editingPost.url || siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals',
      });
    } else {
      setActiveTab(initialTab);
    }
  }, [editingPost, initialTab, siteSettings.instagramUrl]);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // PARSER: Supports Newlines, Comma-Separated URLs, Pipes, JSON, Instagram links
  // --------------------------------------------------------------------------
  const getParsedBatchPosts = (): Array<Omit<InstagramPost, 'id'>> => {
    const fromText: Array<Omit<InstagramPost, 'id'>> = [];
    const raw = batchPasteText.trim();

    if (raw) {
      // 1. Try parsing as JSON array first if it begins with [
      if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item, idx) => {
              if (typeof item === 'string' && item.trim()) {
                fromText.push(createPostFromUrl(item.trim(), idx));
              } else if (item && typeof item === 'object') {
                const img = item.imageUrl || item.image || item.url || '';
                const vid = item.videoUrl || item.video || '';
                const isVid = Boolean(vid || (img && (img.endsWith('.mp4') || img.endsWith('.webm'))));
                fromText.push({
                  mediaType: isVid ? 'video' : 'image',
                  imageUrl: isVid ? '' : img,
                  videoUrl: isVid ? (vid || img) : '',
                  caption: item.caption || batchDefaultCaption,
                  likes: typeof item.likes === 'number' ? item.likes : 180 + Math.floor(Math.random() * 180),
                  url: item.postUrl || item.url || batchDefaultUrl,
                });
              }
            });
            return [...batchUploadedItems, ...fromText];
          }
        } catch (_) {
          // Fall through to regex/delimiter parser
        }
      }

      // 2. Normalize and extract lines or items
      // Check if text has multiple URLs separated by commas or spaces without newlines
      let candidateItems: string[] = [];
      if (!raw.includes('\n') && (raw.includes(',') || raw.includes(';'))) {
        candidateItems = raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
      } else {
        // Split by newlines
        candidateItems = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      }

      candidateItems.forEach((line, idx) => {
        // If line has multiple http links separated by spaces
        const httpMatches = line.match(/https?:\/\/[^\s"',]+/gi);
        if (httpMatches && httpMatches.length > 1 && !line.includes('|')) {
          httpMatches.forEach((matchUrl, subIdx) => {
            fromText.push(createPostFromUrl(matchUrl, idx * 10 + subIdx));
          });
          return;
        }

        // Standard Pipe Format: URL | Caption | Likes | PostLink
        if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          const primaryUrl = parts[0] || '';
          const customCaption = parts[1] || batchDefaultCaption;
          const customLikes = parts[2] && !isNaN(Number(parts[2])) ? Number(parts[2]) : 200 + Math.floor(Math.random() * 150);
          const customPostLink = parts[3] || (primaryUrl.includes('instagram.com') ? primaryUrl : batchDefaultUrl);

          const isVid =
            primaryUrl.endsWith('.mp4') ||
            primaryUrl.endsWith('.webm') ||
            primaryUrl.includes('video/') ||
            primaryUrl.includes('/reel/') ||
            primaryUrl.includes('/tv/');

          let actualImage = isVid ? '' : primaryUrl;
          // If Instagram post URL is given as image, provide nice botanical fallback
          if (!isVid && primaryUrl.includes('instagram.com/p/')) {
            actualImage = BOTANICAL_PRESET_IMAGES[idx % BOTANICAL_PRESET_IMAGES.length];
          }

          fromText.push({
            mediaType: isVid ? 'video' : 'image',
            imageUrl: actualImage,
            videoUrl: isVid ? primaryUrl : '',
            caption: customCaption,
            likes: customLikes,
            url: customPostLink,
          });
          return;
        }

        // Otherwise pure link or Instagram link
        if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('data:') || line.startsWith('/')) {
          fromText.push(createPostFromUrl(line, idx));
        } else if (line.length > 5) {
          // Pure caption line or text post
          fromText.push({
            mediaType: 'image',
            imageUrl: BOTANICAL_PRESET_IMAGES[idx % BOTANICAL_PRESET_IMAGES.length],
            videoUrl: '',
            caption: line,
            likes: 195 + Math.floor(Math.random() * 140),
            url: batchDefaultUrl,
          });
        }
      });
    }

    return [...batchUploadedItems, ...fromText];
  };

  const createPostFromUrl = (url: string, index: number): Omit<InstagramPost, 'id'> => {
    const isVid =
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.includes('video/') ||
      url.includes('/reel/') ||
      url.includes('/tv/');

    const isInstagramPost = url.includes('instagram.com/p/') || url.includes('instagram.com/reel/');
    let resolvedImage = isVid ? '' : url;
    let postLink = batchDefaultUrl;

    if (isInstagramPost) {
      postLink = url;
      if (!isVid) {
        resolvedImage = BOTANICAL_PRESET_IMAGES[index % BOTANICAL_PRESET_IMAGES.length];
      }
    }

    return {
      mediaType: isVid ? 'video' : 'image',
      imageUrl: resolvedImage,
      videoUrl: isVid ? url : '',
      caption: batchDefaultCaption,
      likes: 180 + Math.floor(Math.random() * 190),
      url: postLink,
    };
  };

  // --------------------------------------------------------------------------
  // CLIPBOARD PASTE HANDLER: Capture Ctrl+V Image files directly from clipboard!
  // --------------------------------------------------------------------------
  const handleClipboardPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToProcess: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
        const file = items[i].getAsFile();
        if (file) filesToProcess.push(file);
      }
    }

    if (filesToProcess.length > 0) {
      e.preventDefault();
      setIsProcessingBatchFiles(true);
      showToast(`Pasting and compressing ${filesToProcess.length} image(s) from clipboard...`);

      const newItems: Array<Omit<InstagramPost, 'id'>> = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        if (file.type.startsWith('video/')) {
          const videoData = await processVideoUpload(file);
          newItems.push({
            mediaType: 'video',
            imageUrl: '',
            videoUrl: videoData.videoUrl,
            caption: batchDefaultCaption,
            likes: 210 + Math.floor(Math.random() * 140),
            url: batchDefaultUrl,
          });
        } else {
          const imgData = await compressImageFile(file, 900, 900, 0.76);
          newItems.push({
            mediaType: 'image',
            imageUrl: imgData,
            videoUrl: '',
            caption: batchDefaultCaption,
            likes: 190 + Math.floor(Math.random() * 160),
            url: batchDefaultUrl,
          });
        }
      }
      setBatchUploadedItems((prev) => [...prev, ...newItems]);
      setIsProcessingBatchFiles(false);
      showToast(`Added ${filesToProcess.length} clipboard post(s) to queue!`);
    }
  };

  // --------------------------------------------------------------------------
  // MULTI-FILE UPLOADER HANDLER (Images & Videos from Device)
  // --------------------------------------------------------------------------
  const handleBatchFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingBatchFiles(true);
    showToast(`Optimizing & processing ${files.length} media files...`);
    try {
      const newItems: Array<Omit<InstagramPost, 'id'>> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('video/')) {
          const videoData = await processVideoUpload(file);
          newItems.push({
            mediaType: 'video',
            imageUrl: '',
            videoUrl: videoData.videoUrl,
            caption: batchDefaultCaption,
            likes: 220 + Math.floor(Math.random() * 160),
            url: batchDefaultUrl,
          });
        } else {
          const imgData = await compressImageFile(file, 900, 900, 0.76);
          newItems.push({
            mediaType: 'image',
            imageUrl: imgData,
            videoUrl: '',
            caption: batchDefaultCaption,
            likes: 195 + Math.floor(Math.random() * 170),
            url: batchDefaultUrl,
          });
        }
      }
      setBatchUploadedItems((prev) => [...prev, ...newItems]);
      showToast(`Loaded ${files.length} botanical media files into preview queue!`);
    } catch (err) {
      console.warn('Batch file upload notice:', err);
      showToast('Finished processing media files.');
    } finally {
      setIsProcessingBatchFiles(false);
      e.target.value = '';
    }
  };

  // Single File Upload Handler
  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingSingleFile(true);
    try {
      if (file.type.startsWith('video/')) {
        const videoData = await processVideoUpload(file);
        setSingleForm((prev) => ({
          ...prev,
          mediaType: 'video',
          videoUrl: videoData.videoUrl,
          imageUrl: '',
        }));
        showToast('Video processed successfully.');
      } else {
        const compressed = await compressImageFile(file, 900, 900, 0.76);
        setSingleForm((prev) => ({
          ...prev,
          mediaType: 'image',
          imageUrl: compressed,
          videoUrl: '',
        }));
        showToast('Photo compressed & ready.');
      }
    } catch (err) {
      console.warn('Single file process notice:', err);
    } finally {
      setIsProcessingSingleFile(false);
      e.target.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // SAVE HANDLERS
  // --------------------------------------------------------------------------
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const allItems = getParsedBatchPosts();
    if (allItems.length === 0) {
      showToast('Please paste at least one post/image link or select files from your device.');
      return;
    }

    setIsSubmitting(true);
    try {
      addMultipleInstagramPosts(allItems);
      setBatchPasteText('');
      setBatchUploadedItems([]);
      onClose();
    } catch (err) {
      console.warn('Batch save notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (singleForm.mediaType === 'image' && !singleForm.imageUrl.trim()) {
      showToast('Please provide an image link or upload a photo.');
      return;
    }
    if (singleForm.mediaType === 'video' && !singleForm.videoUrl?.trim()) {
      showToast('Please provide a video link or upload a video file.');
      return;
    }

    if (editingPost) {
      updateInstagramPost(editingPost.id, singleForm);
    } else {
      addInstagramPost(singleForm);
    }
    onClose();
  };

  // Quick Preset Loader
  const handleLoadSampleBatch = () => {
    const samples = [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef | Pure organic cold-infused rosemary & wild amla hair nectar. #BotanicalRitual | 340',
      'https://images.unsplash.com/photo-1608248597359-548455b57d60 | Handcrafted herbal soap curing slowly in our botanical workshop. #SlowBeauty | 280',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03 | Sacred botanical scalp nectar formulated with wild reetha & shikakai. #CleanLiving | 410',
      'https://images.unsplash.com/photo-1512290900672-1f41d0879c93 | Mountain spring harvests & fresh therapeutic botanical extractions. #EnvirveNaturals | 265',
    ].join('\n');
    setBatchPasteText(samples);
    showToast('Loaded 4 botanical example posts into the paste box!');
  };

  const allParsed = getParsedBatchPosts();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onPaste={handleClipboardPaste}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-5 sm:p-6 space-y-4 my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center flex-shrink-0">
              <Instagram className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1B3218]">
                {editingPost
                  ? 'Edit Botanical Journey Media'
                  : activeTab === 'batch'
                  ? 'Paste Multiple Posts (Botanical Journey)'
                  : 'Add Photo or Video to Botanical Journey'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6F7E6D]">
                {activeTab === 'batch'
                  ? 'Paste multiple links, paste images from clipboard (Ctrl+V), or select multiple files.'
                  : 'Curate a single photo or video to display on your storefront and link to Instagram.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7A8778] hover:text-black hover:bg-[#FAF9F5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Only when adding new posts) */}
        {!editingPost && (
          <div className="flex border-b border-[#ECE7DA] gap-6 text-xs font-semibold flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'border-[#2D5A27] text-[#2D5A27]'
                  : 'border-transparent text-[#717E6F] hover:text-[#1B3218]'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Paste Multiple Posts (Bulk Add)</span>
              {allParsed.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#2D5A27] text-white text-[10px] rounded-full font-mono">
                  {allParsed.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'single'
                  ? 'border-[#2D5A27] text-[#2D5A27]'
                  : 'border-transparent text-[#717E6F] hover:text-[#1B3218]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Single Post</span>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* ================================================================ */}
          {/* BATCH MULTI-POST MODE */}
          {/* ================================================================ */}
          {activeTab === 'batch' && !editingPost ? (
            <form onSubmit={handleSaveBatch} className="space-y-4">
              {/* Instructions banner with Quick Load Button */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EDE8DC] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-[#1B3218] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                    Fast Multi-Post Importer (Any Format)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleBatch}
                      className="text-[11px] text-[#2D5A27] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#E5C765]" />
                      <span>Paste Botanical Examples</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#556453] leading-relaxed">
                  Paste multiple links (one per line, or comma-separated). Supports formats like <code className="bg-white px-1 py-0.5 rounded text-[#2D5A27] border border-[#DDD7C8]">URL</code> or <code className="bg-white px-1 py-0.5 rounded text-[#2D5A27] border border-[#DDD7C8]">URL | Caption | Likes</code>. You can also press <kbd className="px-1 py-0.5 bg-white border border-[#DDD7C8] rounded font-mono text-[10px]">Ctrl+V</kbd> to paste images directly from clipboard!
                </p>
              </div>

              {/* Paste Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#3C4C38]">
                    Paste Multiple URLs or Post Links *
                  </label>
                  <span className="text-[11px] font-mono text-[#2D5A27] font-semibold">
                    {allParsed.length} Post(s) in Queue
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  rows={5}
                  value={batchPasteText}
                  onChange={(e) => setBatchPasteText(e.target.value)}
                  placeholder={`https://images.unsplash.com/photo-1540555700478-4be289fbecef | Pure herbal ritual | 310\nhttps://images.unsplash.com/photo-1608248597359-548455b57d60 | Handcrafted botanical soaps | 280\nhttps://www.instagram.com/p/DB12345/ | Scalp nectar formula | 415\nhttps://assets.mixkit.co/.../video.mp4 | Slow herbal infusion | 340`}
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-3 text-xs rounded-xl font-mono text-[#1C3619] leading-relaxed focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                />
              </div>

              {/* Multiple Files Uploader & Clipboard Zone */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DDD7C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-[#1B3218] block">
                    Or Select Multiple Photos / Videos from Device
                  </span>
                  <span className="text-[11px] text-[#6E7B6C]">
                    Choose several files at once (.jpg, .png, .webp, .mp4). They will automatically be compressed client-side.
                  </span>
                </div>
                <label className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#2D5A27] text-[#2D5A27] text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingBatchFiles ? 'Processing Media...' : 'Select Multiple Files'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    disabled={isProcessingBatchFiles}
                    className="hidden"
                    onChange={handleBatchFilesChange}
                  />
                </label>
              </div>

              {/* Batch Defaults */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3C4C38] mb-1">
                    Default Caption (Applied when link has no custom text)
                  </label>
                  <input
                    type="text"
                    value={batchDefaultCaption}
                    onChange={(e) => setBatchDefaultCaption(e.target.value)}
                    placeholder="Pure botanical care & mindful everyday rituals. #EnvirveNaturals"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#3C4C38] mb-1">
                    Default Instagram Page URL
                  </label>
                  <input
                    type="text"
                    value={batchDefaultUrl}
                    onChange={(e) => setBatchDefaultUrl(e.target.value)}
                    placeholder="https://www.instagram.com/envirvenaturals"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              {/* Live Preview Queue */}
              {allParsed.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#ECE7DA]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B3218] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>Ready to Add ({allParsed.length} Posts)</span>
                    </span>
                    {batchUploadedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBatchUploadedItems([])}
                        className="text-[11px] text-[#A63A3A] underline hover:text-red-700 cursor-pointer"
                      >
                        Clear Uploaded ({batchUploadedItems.length})
                      </button>
                    )}
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 border border-[#ECE7DA] p-2 rounded-xl bg-[#FAF9F5]">
                    {allParsed.map((post, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-[#EDE8DC] text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-[#EEF5EC] text-[#2D5A27] font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="w-10 h-10 rounded bg-[#ECE7DC] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#DDD7C8]">
                            {post.mediaType === 'video' ? (
                              <video
                                src={resolveMediaSrc(post.videoUrl)}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={resolveMediaSrc(post.imageUrl)}
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    BOTANICAL_PRESET_IMAGES[idx % BOTANICAL_PRESET_IMAGES.length];
                                }}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 bg-[#F2EEE4] text-[#334230] text-[9px] rounded font-mono uppercase font-semibold">
                                {post.mediaType}
                              </span>
                              <span className="text-[10px] text-[#717E6F]">
                                ❤️ {post.likes} likes
                              </span>
                            </div>
                            <span className="text-[#1B3218] font-medium truncate block max-w-sm sm:max-w-md">
                              {post.caption}
                            </span>
                          </div>
                        </div>

                        {/* Remove item button */}
                        {idx < batchUploadedItems.length && (
                          <button
                            type="button"
                            onClick={() =>
                              setBatchUploadedItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-[#9EAAA0] hover:text-red-600 transition-colors cursor-pointer flex-shrink-0"
                            title="Remove this post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] transition-colors cursor-pointer text-[#4A5746]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allParsed.length === 0 || isSubmitting}
                  className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] disabled:bg-gray-400 text-white text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C765]" />
                  <span>
                    {isSubmitting
                      ? 'Publishing...'
                      : `Add All (${allParsed.length}) Posts to Botanical Journey`}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* ================================================================ */
            /* SINGLE POST MODE */
            /* ================================================================ */
            <form onSubmit={handleSaveSingle} className="space-y-4">
              {/* Media Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1.5">
                  Select Media Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSingleForm({ ...singleForm, mediaType: 'image' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      singleForm.mediaType !== 'video'
                        ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-2xs'
                        : 'bg-white text-[#4B5E47] border-[#DDD7C8] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Botanical Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleForm({ ...singleForm, mediaType: 'video' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      singleForm.mediaType === 'video'
                        ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-2xs'
                        : 'bg-white text-[#4B5E47] border-[#DDD7C8] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Reel / Video</span>
                  </button>
                </div>
              </div>

              {/* Photo vs Video Input */}
              {singleForm.mediaType !== 'video' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#3C4C38]">
                    Photo Source (Direct URL or Upload from Device) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={singleForm.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Auto-detect multiple URLs pasted into single field!
                        if (
                          !editingPost &&
                          (val.includes('\n') || (val.match(/https?:\/\//g) || []).length > 1)
                        ) {
                          setBatchPasteText(val);
                          setActiveTab('batch');
                          showToast('Detected multiple posts! Switched to Multi-Paste mode.');
                          return;
                        }
                        setSingleForm({ ...singleForm, imageUrl: val });
                      }}
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      className="flex-1 bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                    <label className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#2D5A27] text-[#2D5A27] text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isProcessingSingleFile ? 'Compressing...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isProcessingSingleFile}
                        className="hidden"
                        onChange={handleSingleFileChange}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#3C4C38]">
                    Video Source (.mp4 link or Upload from Device) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={singleForm.videoUrl}
                      onChange={(e) => setSingleForm({ ...singleForm, videoUrl: e.target.value })}
                      placeholder="https://assets.mixkit.co/.../video.mp4"
                      className="flex-1 bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                    <label className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#2D5A27] text-[#2D5A27] text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isProcessingSingleFile ? 'Processing...' : 'Upload Video'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        disabled={isProcessingSingleFile}
                        className="hidden"
                        onChange={handleSingleFileChange}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Live Preview Card */}
              {(singleForm.imageUrl || singleForm.videoUrl) && (
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE8DC] flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-[#ECE7DC] overflow-hidden flex-shrink-0 border border-[#DDD7C8]">
                    {singleForm.mediaType === 'video' ? (
                      <video
                        src={resolveMediaSrc(singleForm.videoUrl)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        autoPlay
                        loop
                      />
                    ) : (
                      <img
                        src={resolveMediaSrc(singleForm.imageUrl)}
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = BOTANICAL_PRESET_IMAGES[0];
                        }}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-xs text-[#556453] min-w-0 flex-1">
                    <span className="font-semibold text-[#1B3218] block mb-0.5">Live Media Preview</span>
                    <span className="truncate block font-mono text-[11px] text-[#71806F]">
                      {singleForm.videoUrl || singleForm.imageUrl}
                    </span>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Caption / Botanical Ritual Description *
                </label>
                <textarea
                  rows={3}
                  value={singleForm.caption}
                  onChange={(e) => setSingleForm({ ...singleForm, caption: e.target.value })}
                  placeholder="Pure rosemary scalp nectar infusion bottled by hand. #EnvirveNaturals"
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              {/* Likes & External Instagram Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Like Count (Displayed on hover)
                  </label>
                  <input
                    type="number"
                    value={singleForm.likes}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, likes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Instagram Post Link (Opens on click)
                  </label>
                  <input
                    type="text"
                    value={singleForm.url}
                    onChange={(e) => setSingleForm({ ...singleForm, url: e.target.value })}
                    placeholder="https://www.instagram.com/envirvenaturals"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] transition-colors cursor-pointer text-[#4A5746]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingPost ? 'Save Media Changes' : 'Publish to Botanical Journey'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
