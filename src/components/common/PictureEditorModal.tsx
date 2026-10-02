import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Check,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Sun,
  Contrast,
  Palette,
} from 'lucide-react';
import { compressImageFile } from '../../utils/mediaStorage';

interface PictureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  initialCaption?: string;
  initialAlt?: string;
  title?: string;
  onSave: (result: { url: string; caption?: string; alt?: string }) => void;
}

// Curated aesthetic botanical photography presets
const BOTANICAL_PRESETS = [
  {
    name: 'Herbal Ritual (Hero)',
    url: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    tag: 'Rituals',
  },
  {
    name: 'Botanical Herbarium Banner',
    url: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    tag: 'Botanicals',
  },
  {
    name: 'Golden Botanical Elixir',
    url: '/src/assets/images/product_botanical_oil_1790696473722.jpg',
    tag: 'Oils',
  },
  {
    name: 'Herbal Shampoo & Infusions',
    url: '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
    tag: 'Hair Care',
  },
  {
    name: 'Cold-Press Artisan Soap',
    url: '/src/assets/images/product_glow_soap_1790696485480.jpg',
    tag: 'Skin Care',
  },
  {
    name: 'Organic Rosemary & Botanicals',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    tag: 'Herbs',
  },
  {
    name: 'Ancient Mortar & Pestle Herbs',
    url: 'https://images.unsplash.com/photo-1512290900672-1f41634b6b19?auto=format&fit=crop&w=1200&q=80',
    tag: 'Apothecary',
  },
  {
    name: 'Pure Botanical Amber Dropper',
    url: 'https://images.unsplash.com/photo-1608248597359-3a3399583c2e?auto=format&fit=crop&w=1200&q=80',
    tag: 'Elixirs',
  },
  {
    name: 'Sunlit Botanical Garden Harvest',
    url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
    tag: 'Gardens',
  },
];

type FilterPreset = 'none' | 'warm-botanical' | 'vintage-herbarium' | 'crisp-natural' | 'olive-glow' | 'noir-minimal';

export const PictureEditorModal: React.FC<PictureEditorModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  initialCaption = '',
  initialAlt = '',
  title = 'Edit Picture',
  onSave,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(initialImage || '');
  const [caption, setCaption] = useState<string>(initialCaption || '');
  const [altText, setAltText] = useState<string>(initialAlt || '');
  const [urlInput, setUrlInput] = useState<string>('');

  // Editing controls
  const [activeTab, setActiveTab] = useState<'adjust' | 'filter' | 'presets' | 'upload'>('adjust');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturate, setSaturate] = useState<number>(100);
  const [sepia, setSepia] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'original' | '16:9' | '4:3' | '1:1'>('original');
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('none');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentImage(initialImage || '');
      setCaption(initialCaption || '');
      setAltText(initialAlt || '');
      setUrlInput(initialImage?.startsWith('data:') ? '' : initialImage || '');
      // reset adjustments
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setSepia(0);
      setRotation(0);
      setFlipH(false);
      setAspectRatio('original');
      setFilterPreset('none');
    }
  }, [isOpen, initialImage, initialCaption, initialAlt]);

  if (!isOpen) return null;

  // Apply quick filter preset
  const applyPresetFilter = (preset: FilterPreset) => {
    setFilterPreset(preset);
    switch (preset) {
      case 'none':
        setBrightness(100);
        setContrast(100);
        setSaturate(100);
        setSepia(0);
        break;
      case 'warm-botanical':
        setBrightness(104);
        setContrast(108);
        setSaturate(115);
        setSepia(18);
        break;
      case 'vintage-herbarium':
        setBrightness(98);
        setContrast(112);
        setSaturate(85);
        setSepia(35);
        break;
      case 'crisp-natural':
        setBrightness(105);
        setContrast(115);
        setSaturate(105);
        setSepia(0);
        break;
      case 'olive-glow':
        setBrightness(102);
        setContrast(105);
        setSaturate(125);
        setSepia(10);
        break;
      case 'noir-minimal':
        setBrightness(100);
        setContrast(120);
        setSaturate(0);
        setSepia(0);
        break;
    }
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Compress client-side safely into optimal lightweight size (< 45KB)
      const dataUrl = await compressImageFile(file, 900, 900, 0.72);
      setCurrentImage(dataUrl);
      setUrlInput('');
      setRotation(0);
      setFlipH(false);
    } catch (err) {
      console.error('Failed to process image file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Build the CSS filter string for live preview
  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%)`;

  // Render transformed canvas and export
  const handleApplyAndSave = () => {
    if (!currentImage) {
      onSave({ url: '', caption, alt: altText });
      onClose();
      return;
    }

    const hasEdits =
      brightness !== 100 ||
      contrast !== 100 ||
      saturate !== 100 ||
      sepia !== 0 ||
      rotation !== 0 ||
      flipH ||
      aspectRatio !== 'original';

    // If no visual edits made and it's already a clean URL, keep it as is
    if (!hasEdits) {
      try {
        onSave({ url: currentImage, caption, alt: altText });
      } catch (err) {
        console.warn('onSave error:', err);
      }
      onClose();
      return;
    }

    // Render edits onto Canvas safely
    setIsProcessing(true);
    const img = new Image();
    if (!currentImage.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          try {
            onSave({ url: currentImage, caption, alt: altText });
          } catch (_) {}
          onClose();
          return;
        }

        let srcWidth = img.width || 800;
        let srcHeight = img.height || 600;

        // Calculate aspect ratio crop if requested
        let cropX = 0;
        let cropY = 0;
        let cropW = srcWidth;
        let cropH = srcHeight;

        if (aspectRatio === '16:9') {
          const targetH = Math.round((srcWidth * 9) / 16);
          if (targetH <= srcHeight) {
            cropY = Math.round((srcHeight - targetH) / 2);
            cropH = targetH;
          } else {
            const targetW = Math.round((srcHeight * 16) / 9);
            cropX = Math.round((srcWidth - targetW) / 2);
            cropW = targetW;
          }
        } else if (aspectRatio === '4:3') {
          const targetH = Math.round((srcWidth * 3) / 4);
          if (targetH <= srcHeight) {
            cropY = Math.round((srcHeight - targetH) / 2);
            cropH = targetH;
          } else {
            const targetW = Math.round((srcHeight * 4) / 3);
            cropX = Math.round((srcWidth - targetW) / 2);
            cropW = targetW;
          }
        } else if (aspectRatio === '1:1') {
          const size = Math.min(srcWidth, srcHeight);
          cropX = Math.round((srcWidth - size) / 2);
          cropY = Math.round((srcHeight - size) / 2);
          cropW = size;
          cropH = size;
        }

        // Limit maximum exported dimensions for ultra-lightweight size (< 50KB)
        const maxDimension = 850;
        let destW = cropW;
        let destH = cropH;
        if (destW > maxDimension || destH > maxDimension) {
          if (destW > destH) {
            destH = Math.round((destH * maxDimension) / destW);
            destW = maxDimension;
          } else {
            destW = Math.round((destW * maxDimension) / destH);
            destH = maxDimension;
          }
        }

        const isRotated90or270 = rotation === 90 || rotation === 270;
        canvas.width = isRotated90or270 ? destH : destW;
        canvas.height = isRotated90or270 ? destW : destH;

        ctx.filter = filterString;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180);
        }
        if (flipH) {
          ctx.scale(-1, 1);
        }

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropW,
          cropH,
          -destW / 2,
          -destH / 2,
          destW,
          destH
        );

        let finalUrl = currentImage;
        try {
          finalUrl = canvas.toDataURL('image/jpeg', 0.74);
        } catch (taintErr) {
          console.warn('Canvas export tainted or restricted, preserving URL:', taintErr);
          finalUrl = currentImage;
        }

        try {
          onSave({ url: finalUrl, caption, alt: altText });
        } catch (saveErr) {
          console.warn('onSave error:', saveErr);
        }
        onClose();
      } catch (err) {
        console.warn('Canvas processing fallback:', err);
        try {
          onSave({ url: currentImage, caption, alt: altText });
        } catch (_) {}
        onClose();
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      try {
        onSave({ url: currentImage, caption, alt: altText });
      } catch (_) {}
      onClose();
      setIsProcessing(false);
    };

    img.src = currentImage;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#DDD7C8] flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE7DA] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1B3218]">{title}</h3>
              <p className="text-[11px] text-[#6B7968]">
                Adjust tones, crop, apply botanical presets, replace or upload photos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#7A8778] hover:text-[#1B3218] hover:bg-[#EAE4D7] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Left Column: Live Canvas / Image Preview (7 cols) */}
          <div className="md:col-span-7 bg-[#162514] p-5 flex flex-col justify-between items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between text-xs text-[#B2CBB0] pb-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E6C665]" />
                Live Picture Preview
              </span>
              <span>
                {rotation !== 0 && `${rotation}° `}
                {flipH && 'Flipped '}
                {aspectRatio !== 'original' && `${aspectRatio} `}
              </span>
            </div>

            {/* Picture Display Box */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/10 shadow-inner">
              {currentImage ? (
                <div
                  className="w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  }}
                >
                  <img
                    src={currentImage}
                    alt={altText || 'Preview'}
                    className="max-w-full max-h-full object-contain transition-all duration-200"
                    style={{ filter: filterString }}
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-[#8BA786] space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto opacity-50 stroke-1" />
                  <p className="text-xs">No image loaded yet.</p>
                  <p className="text-[11px] text-[#698565]">
                    Select a curated preset or upload a picture from your device.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Toolbar underneath preview */}
            <div className="w-full pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs text-[#DCE7DA]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                    flipH ? 'bg-[#2D5A27] text-white font-semibold' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title="Flip horizontally"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setSaturate(100);
                    setSepia(0);
                    setRotation(0);
                    setFlipH(false);
                    setAspectRatio('original');
                    setFilterPreset('none');
                  }}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] flex items-center gap-1 text-[#A1B89F] cursor-pointer"
                  title="Reset all adjustments"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#8FA88D] text-[10px] uppercase tracking-wider">Crop:</span>
                {(['original', '16:9', '4:3', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                      aspectRatio === ratio
                        ? 'bg-[#2D5A27] text-white font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-[#D4E2D2]'
                    }`}
                  >
                    {ratio === 'original' ? 'Fit' : ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Controls & Presets (5 cols) */}
          <div className="md:col-span-5 p-5 bg-white space-y-4 border-l border-[#ECE7DA] flex flex-col justify-between">
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-[#ECE7DA] pb-2 mb-4 gap-1">
                {[
                  { id: 'adjust', label: 'Tones', icon: <Sliders className="w-3.5 h-3.5" /> },
                  { id: 'filter', label: 'Filters', icon: <Palette className="w-3.5 h-3.5" /> },
                  { id: 'presets', label: 'Presets', icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { id: 'upload', label: 'Upload / URL', icon: <Upload className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-[#EEF5EC] text-[#2D5A27]'
                        : 'text-[#6C7B6A] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: TONES & SLIDERS */}
              {activeTab === 'adjust' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#374934] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-[#C98A2C]" /> Brightness
                      </span>
                      <span className="font-mono text-[11px]">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="160"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#374934] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-[#2D5A27]" /> Contrast
                      </span>
                      <span className="font-mono text-[11px]">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#374934] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-[#327A3A]" /> Saturation
                      </span>
                      <span className="font-mono text-[11px]">{saturate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturate}
                      onChange={(e) => setSaturate(parseInt(e.target.value))}
                      className="w-full accent-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#374934] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#A66C32]" /> Warm Herbarium (Sepia)
                      </span>
                      <span className="font-mono text-[11px]">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={sepia}
                      onChange={(e) => setSepia(parseInt(e.target.value))}
                      className="w-full accent-[#2D5A27]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BOTANICAL FILTER PRESETS */}
              {activeTab === 'filter' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'none', label: 'Natural Clean', desc: 'True natural tones' },
                    { id: 'warm-botanical', label: 'Warm Sunlight', desc: 'Golden amber glow' },
                    { id: 'vintage-herbarium', label: 'Vintage Herbarium', desc: 'Earthy aged botanical' },
                    { id: 'crisp-natural', label: 'Crisp Clarity', desc: 'Enhanced micro-detail' },
                    { id: 'olive-glow', label: 'Olive Grove', desc: 'Lush green vitality' },
                    { id: 'noir-minimal', label: 'Noir Apothecary', desc: 'Timeless monochrome' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPresetFilter(p.id as FilterPreset)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        filterPreset === p.id
                          ? 'border-[#2D5A27] bg-[#EEF5EC] shadow-xs'
                          : 'border-[#E5DFD3] hover:border-[#2D5A27]/50 bg-[#FAF9F5]'
                      }`}
                    >
                      <div className="font-serif text-xs font-bold text-[#1B3218] flex items-center justify-between">
                        <span>{p.label}</span>
                        {filterPreset === p.id && <Check className="w-3.5 h-3.5 text-[#2D5A27]" />}
                      </div>
                      <p className="text-[10px] text-[#697867] mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 3: CURATED PRESET BOTANICAL PHOTOS */}
              {activeTab === 'presets' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-[#6B7968]">
                    Select high-resolution botanical photography ready for editorial rituals:
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {BOTANICAL_PRESETS.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentImage(item.url);
                          setUrlInput('');
                        }}
                        className={`group relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          currentImage === item.url
                            ? 'border-2 border-[#2D5A27] ring-2 ring-[#2D5A27]/20 shadow-xs'
                            : 'border-[#DDD7C8] hover:border-[#2D5A27]'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate drop-shadow-xs">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: UPLOAD / URL */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-[#C5DEC0] hover:border-[#2D5A27] bg-[#FAF9F5] hover:bg-[#EEF5EC]/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                    <div className="w-10 h-10 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#1C3619]">
                      {isProcessing ? 'Optimizing photo...' : 'Upload Picture from Device'}
                    </span>
                    <span className="text-[10px] text-[#71806F] mt-1">
                      PNG, JPG, WEBP — automatically optimized for fast cloud sync
                    </span>
                  </label>

                  {/* Direct Web URL */}
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Or Paste Image Web URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-1.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (urlInput.trim()) {
                            setCurrentImage(urlInput.trim());
                          }
                        }}
                        className="px-3 py-1.5 bg-[#EEF5EC] text-[#2D5A27] hover:bg-[#DDECDA] text-xs font-semibold rounded border border-[#C5DEC0] cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Captions & Alt Text Fields (Always available) */}
              <div className="pt-4 mt-4 border-t border-[#ECE7DA] space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#3C4C38] mb-1">
                    Picture Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Traditional slow infusion of mountain rosemary & amla oils"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-1.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#3C4C38] mb-1">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="e.g. Envirve hair oiling herbal ritual bottle and pipette"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-1.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#ECE7DA] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded-lg hover:bg-[#FAF9F5] text-[#556353] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAndSave}
                disabled={isProcessing}
                className="px-5 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Apply Picture'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
