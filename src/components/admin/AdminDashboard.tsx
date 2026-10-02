import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import {
  Product,
  ProductCategory,
  OrderStatus,
  ProductBadge,
  Order,
  Ingredient,
  BlogPost,
  JournalImage,
  Review,
  InstagramPost,
  PhilosophyConfig,
  PhilosophyPillar,
} from '../../types';
import {
  compressImageFile,
  processVideoUpload,
  resolveMediaSrc,
} from '../../utils/mediaStorage';
import { PictureEditorModal } from '../common/PictureEditorModal';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sliders,
  Sparkles,
  BookOpen,
  Tag,
  Star,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  Printer,
  X,
  Eye,
  Store,
  Layers,
  Upload,
  Instagram,
  MessageSquare,
  Mail,
  Send,
  AlertCircle,
  Check,
  Sprout,
  Shield,
  HeartHandshake,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    orders,
    updateOrderStatus,
    markOrderEmailSent,
    heroConfig,
    updateHeroConfig,
    siteSettings,
    updateSiteSettings,
    philosophyConfig,
    updatePhilosophyConfig,
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    reviews,
    addReview,
    updateReview,
    toggleReviewApproval,
    deleteReview,
    instagramPosts,
    addInstagramPost,
    addMultipleInstagramPosts,
    updateInstagramPost,
    deleteInstagramPost,
    coupons,
    addCoupon,
    toggleCouponActive,
    deleteCoupon,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    setActiveView,
    showToast,
  } = useStore();

  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'products'
    | 'orders'
    | 'inventory'
    | 'gmail'
    | 'hero'
    | 'ingredients'
    | 'blog'
    | 'coupons'
    | 'reviews'
    | 'instagram'
    | 'philosophy'
    | 'settings'
  >('overview');

  const [philosophyForm, setPhilosophyForm] = useState<PhilosophyConfig>(philosophyConfig);
  useEffect(() => {
    setPhilosophyForm(philosophyConfig);
  }, [philosophyConfig]);

  const {
    user: googleUser,
    isLoggedIn: isGoogleLoggedIn,
    isLoggingIn: isGoogleLoggingIn,
    signIn: googleSignInAction,
    signOut: googleSignOutAction,
    sendOrderNotification,
    sendTestNotification,
    lastEmailStatus,
  } = useGoogleAuth();

  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [sendingEmailForOrderId, setSendingEmailForOrderId] = useState<string | null>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    slug: '',
    sku: '',
    category: 'Herbal Shampoos',
    price: 650,
    compareAtPrice: 750,
    shortDesc: '',
    description: '',
    images: ['/src/assets/images/product_herbal_shampoo_1790696462766.jpg'],
    badge: 'NEW',
    rating: 5.0,
    reviewsCount: 1,
    stock: 50,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    volumeSize: '250 ml / 8.4 fl oz',
    ingredients: ['Amla', 'Reetha', 'Rosemary'],
    benefits: ['Gently cleanses', 'Nourishes scalp'],
    howToUse: 'Massage gently onto wet scalp and rinse.',
    suitableFor: 'All hair types',
  });

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Status Filter for Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Courier tracking edit state
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [courierNameInput, setCourierNameInput] = useState('TCS Express');

  // Ingredient Modal State
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [benefitInput, setBenefitInput] = useState('');
  const [ingredientForm, setIngredientForm] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    botanicalName: '',
    origin: 'Pakistan',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: '',
    benefits: ['Scalp Nourishment', 'Bioactive Vitality'],
    featuredInProductIds: [],
  });

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<Omit<BlogPost, 'id'>>({
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

  // Dedicated Picture Editor State for Blog / Journal
  const [isBlogPictureEditorOpen, setIsBlogPictureEditorOpen] = useState(false);
  const [blogPictureEditorConfig, setBlogPictureEditorConfig] = useState<{
    target: 'blogCover' | 'blogGallery' | 'cardDirect';
    postId?: string;
    galleryIndex?: number;
    initialUrl: string;
    initialCaption?: string;
    initialAlt?: string;
    title: string;
  } | null>(null);

  // Dedicated Picture Editor State for Philosophy Craftsmanship Picture
  const [isPhilosophyPictureEditorOpen, setIsPhilosophyPictureEditorOpen] = useState(false);
  const [isPhilosophyPromisePictureEditorOpen, setIsPhilosophyPromisePictureEditorOpen] = useState(false);

  // Review Edit State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Instagram Modal State
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [editingInstagramId, setEditingInstagramId] = useState<string | null>(null);
  const [instagramModalTab, setInstagramModalTab] = useState<'single' | 'batch'>('single');
  const [instagramForm, setInstagramForm] = useState<Omit<InstagramPost, 'id'>>({
    mediaType: 'image',
    imageUrl: '',
    videoUrl: '',
    caption: '',
    likes: 240,
    url: 'https://www.instagram.com/envirvenaturals',
  });

  // Batch Multi-Post State for Botanical Journey
  const [batchPasteText, setBatchPasteText] = useState('');
  const [batchDefaultCaption, setBatchDefaultCaption] = useState('Pure botanical care & mindful everyday rituals. #envirvenaturals');
  const [batchDefaultUrl, setBatchDefaultUrl] = useState('https://www.instagram.com/envirvenaturals');
  const [batchUploadedItems, setBatchUploadedItems] = useState<Array<Omit<InstagramPost, 'id'>>>([]);
  const [isProcessingBatchFiles, setIsProcessingBatchFiles] = useState(false);

  // In-App Delete Confirmation Target (Zero window.confirm calls)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'ingredient' | 'blog' | 'coupon' | 'review' | 'instagram';
    id: string;
    name: string;
  } | null>(null);

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1000);

  // Password Login Screen
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-8 border border-[#DDD7C8] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center mx-auto">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block mb-1">
              Envirve Naturals
            </span>
            <h1 className="font-serif text-2xl text-[#1B3218]">
              Management Portal
            </h1>
            <p className="text-xs text-[#6F7C6C] mt-1">
              Please enter the administrator passcode to access store controls.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginAdmin(passwordInput);
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-4 py-3 text-sm text-[#1B3218] rounded-xl focus:outline-none focus:border-[#2D5A27] text-center"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-colors shadow-md"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('home')}
              className="text-xs text-[#52634F] hover:text-[#1B3218] transition-colors"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed');
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const averageOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;

  // Handlers for Products
  const openNewProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      slug: '',
      sku: `ENV-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Herbal Shampoos',
      price: 650,
      compareAtPrice: 750,
      shortDesc: '',
      description: '',
      images: ['/src/assets/images/product_herbal_shampoo_1790696462766.jpg'],
      badge: 'NEW',
      rating: 5.0,
      reviewsCount: 1,
      stock: 50,
      lowStockThreshold: 10,
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      isPublished: true,
      volumeSize: '250 ml / 8.4 fl oz',
      ingredients: ['Amla', 'Reetha', 'Rosemary'],
      benefits: ['Promotes scalp vitality', 'Natural herbal cleansing'],
      howToUse: 'Apply gently on wet scalp and rinse thoroughly.',
      suitableFor: 'All hair types',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice,
      shortDesc: prod.shortDesc,
      description: prod.description,
      images: prod.images,
      badge: prod.badge,
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      stock: prod.stock,
      lowStockThreshold: prod.lowStockThreshold,
      isFeatured: prod.isFeatured,
      isBestseller: prod.isBestseller,
      isNewArrival: prod.isNewArrival,
      isPublished: prod.isPublished,
      volumeSize: prod.volumeSize,
      ingredients: prod.ingredients,
      benefits: prod.benefits,
      howToUse: prod.howToUse,
      suitableFor: prod.suitableFor,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Handlers for Ingredients
  const openAddIngredientModal = () => {
    setEditingIngredientId(null);
    setIngredientForm({
      name: '',
      botanicalName: '',
      origin: 'Pakistan',
      image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
      description: '',
      benefits: ['Scalp Nourishment', 'Bioactive Vitality'],
      featuredInProductIds: [],
    });
    setBenefitInput('');
    setIsIngredientModalOpen(true);
  };

  const openEditIngredientModal = (ing: Ingredient) => {
    setEditingIngredientId(ing.id);
    setIngredientForm({
      name: ing.name,
      botanicalName: ing.botanicalName,
      origin: ing.origin,
      image: ing.image,
      description: ing.description,
      benefits: ing.benefits,
      featuredInProductIds: ing.featuredInProductIds || [],
    });
    setBenefitInput('');
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientForm.name.trim()) return;

    if (editingIngredientId) {
      updateIngredient(editingIngredientId, ingredientForm);
    } else {
      addIngredient(ingredientForm);
    }
    setIsIngredientModalOpen(false);
  };

  // Handlers for Blog / Articles
  const openAddBlogModal = () => {
    setEditingBlogId(null);
    setBlogForm({
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
    setIsBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogForm({
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
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return;

    const slug = blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dataWithSlug = { ...blogForm, slug };

    if (editingBlogId) {
      updateBlogPost(editingBlogId, dataWithSlug);
    } else {
      addBlogPost(dataWithSlug);
    }
    setIsBlogModalOpen(false);
  };

  const handleBlogPictureEditorSave = (result: { url: string; caption?: string; alt?: string }) => {
    if (!blogPictureEditorConfig) return;

    if (blogPictureEditorConfig.target === 'blogCover') {
      setBlogForm((prev) => ({
        ...prev,
        image: result.url || prev.image,
        imageCaption: result.caption !== undefined ? result.caption : prev.imageCaption,
      }));
    } else if (blogPictureEditorConfig.target === 'blogGallery') {
      const idx = blogPictureEditorConfig.galleryIndex;
      if (typeof idx === 'number') {
        setBlogForm((prev) => {
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
    } else if (blogPictureEditorConfig.target === 'cardDirect' && blogPictureEditorConfig.postId) {
      updateBlogPost(blogPictureEditorConfig.postId, {
        image: result.url,
        imageCaption: result.caption,
      });
    }

    setIsBlogPictureEditorOpen(false);
  };

  // Handlers for Reviews
  const openAddReviewModal = () => {
    setEditingReview({
      id: '',
      productId: products[0]?.id || 'prod-shampoo-1',
      productName: products[0]?.name || 'Hair Balance Herbal Shampoo',
      authorName: '',
      rating: 5,
      date: 'Just now',
      comment: '',
      verifiedPurchase: true,
      isApproved: true,
      featuredOnHome: true,
    });
    setIsReviewModalOpen(true);
  };

  const openEditReviewModal = (rev: Review) => {
    setEditingReview(rev);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.authorName.trim() || !editingReview.comment.trim()) return;

    if (editingReview.id) {
      updateReview(editingReview.id, editingReview);
    } else {
      addReview({
        authorName: editingReview.authorName,
        productId: editingReview.productId,
        productName: editingReview.productName,
        rating: editingReview.rating,
        comment: editingReview.comment,
        verifiedPurchase: editingReview.verifiedPurchase,
        featuredOnHome: editingReview.featuredOnHome,
      });
    }
    setIsReviewModalOpen(false);
    setEditingReview(null);
  };

  // Handlers for Instagram / Botanical Journey CMS
  const openAddInstagramModal = () => {
    setEditingInstagramId(null);
    setInstagramModalTab('single');
    setInstagramForm({
      mediaType: 'image',
      imageUrl: '',
      videoUrl: '',
      caption: '',
      likes: 180,
      url: siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals',
    });
    setIsInstagramModalOpen(true);
  };

  const openBatchInstagramModal = () => {
    setEditingInstagramId(null);
    setInstagramModalTab('batch');
    setBatchPasteText('');
    setBatchUploadedItems([]);
    setIsInstagramModalOpen(true);
  };

  const getParsedBatchPosts = (): Array<Omit<InstagramPost, 'id'>> => {
    const fromText: Array<Omit<InstagramPost, 'id'>> = [];
    if (batchPasteText.trim()) {
      const lines = batchPasteText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      lines.forEach((line) => {
        let url = line;
        let caption = batchDefaultCaption;
        let likes = Math.floor(190 + Math.random() * 210);

        if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          url = parts[0] || '';
          if (parts[1]) caption = parts[1];
          if (parts[2] && !isNaN(Number(parts[2]))) likes = Number(parts[2]);
        }

        if (url) {
          const isVideo =
            url.endsWith('.mp4') ||
            url.endsWith('.webm') ||
            url.includes('video/') ||
            url.includes('/reel/') ||
            url.includes('/tv/');

          fromText.push({
            mediaType: (isVideo ? 'video' : 'image') as 'image' | 'video',
            imageUrl: isVideo ? '' : url,
            videoUrl: isVideo ? url : '',
            caption: caption || 'Daily botanical self-care ritual #envirvenaturals',
            likes,
            url: url.startsWith('http') && url.includes('instagram.com') ? url : (batchDefaultUrl || siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals'),
          });
        }
      });
    }
    return [...batchUploadedItems, ...fromText];
  };

  const handleSaveBatchInstagram = (e: React.FormEvent) => {
    e.preventDefault();
    const allItems = getParsedBatchPosts();
    if (allItems.length === 0) {
      showToast('Please paste at least one post/image link or select files.');
      return;
    }
    addMultipleInstagramPosts(allItems);
    setBatchPasteText('');
    setBatchUploadedItems([]);
    setIsInstagramModalOpen(false);
  };

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
            videoUrl: videoData,
            caption: batchDefaultCaption || `Artisan botanical video #${i + 1} #envirvenaturals`,
            likes: Math.floor(180 + Math.random() * 200),
            url: batchDefaultUrl || siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals',
          });
        } else {
          const imgData = await compressImageFile(file, 900, 900, 0.76);
          newItems.push({
            mediaType: 'image',
            imageUrl: imgData,
            videoUrl: '',
            caption: batchDefaultCaption || `Sacred botanical harvest #${i + 1} #envirvenaturals`,
            likes: Math.floor(180 + Math.random() * 200),
            url: batchDefaultUrl || siteSettings.instagramUrl || 'https://www.instagram.com/envirvenaturals',
          });
        }
      }
      setBatchUploadedItems((prev) => [...prev, ...newItems]);
      showToast(`Processed ${newItems.length} media files successfully!`);
    } catch (err) {
      console.warn('Batch upload notice:', err);
      showToast('Could not process all files.');
    } finally {
      setIsProcessingBatchFiles(false);
    }
  };

  const openEditInstagramModal = (post: InstagramPost) => {
    setEditingInstagramId(post.id);
    setInstagramModalTab('single');
    setInstagramForm({
      mediaType: post.mediaType || (post.videoUrl ? 'video' : 'image'),
      imageUrl: post.imageUrl || '',
      videoUrl: post.videoUrl || '',
      caption: post.caption || '',
      likes: post.likes || 0,
      url: post.url || siteSettings.instagramUrl || '',
    });
    setIsInstagramModalOpen(true);
  };

  const handleSaveInstagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramForm.caption.trim()) return;

    const isVideo = instagramForm.mediaType === 'video';
    const payload: Omit<InstagramPost, 'id'> = {
      mediaType: (isVideo ? 'video' : 'image') as 'image' | 'video',
      imageUrl: instagramForm.imageUrl || '',
      videoUrl: isVideo ? (instagramForm.videoUrl || '') : '',
      caption: instagramForm.caption.trim(),
      likes: Number(instagramForm.likes) || 0,
      url: instagramForm.url.trim() || siteSettings.instagramUrl || '',
    };

    if (editingInstagramId) {
      updateInstagramPost(editingInstagramId, payload);
    } else {
      addInstagramPost(payload);
    }
    setIsInstagramModalOpen(false);
  };

  // Unified In-App Confirm Delete Handler (Zero prompt/confirm)
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    if (type === 'product') {
      deleteProduct(id);
    } else if (type === 'ingredient') {
      deleteIngredient(id);
    } else if (type === 'blog') {
      deleteBlogPost(id);
    } else if (type === 'coupon') {
      deleteCoupon(id);
    } else if (type === 'review') {
      deleteReview(id);
    } else if (type === 'instagram') {
      deleteInstagramPost(id);
    }
    setDeleteTarget(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: newCouponValue,
      minOrder: newCouponMin,
      expiresAt: '2027-12-31',
      isActive: true,
    });
    setNewCouponCode('');
  };

  const categories: ProductCategory[] = [
    'Herbal Shampoos',
    'Hair Care',
    'Skin Care',
    'Herbal Oils',
    'Natural Conditioners',
    'Organic Personal Care',
    'Herbal Wellness',
  ];

  const badges: ProductBadge[] = ['', 'NEW', 'BESTSELLER', 'LIMITED', 'SALE'];

  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-[#DDD7C8] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2D5A27] animate-pulse" />
            <h1 className="font-serif text-xl font-bold text-[#1B3218]">
              Envirve Management Portal
            </h1>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#EEF5EC] text-[#2D5A27] text-[11px] font-mono rounded font-medium">
            Active Store Database Sync
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('home')}
            className="px-3.5 py-2 bg-[#F3EFE7] hover:bg-[#EAE4D7] text-[#243B20] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>View Public Storefront</span>
          </button>
          <button
            onClick={logoutAdmin}
            className="p-2 text-[#7E8C7A] hover:text-[#9A3838] transition-colors rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Admin Content with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#DDD7C8] p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, count: pendingOrders.length },
            { id: 'gmail', label: 'Gmail Order Alerts', icon: <Mail className="w-4 h-4" /> },
            { id: 'inventory', label: 'Inventory', icon: <Layers className="w-4 h-4" />, count: lowStockProducts.length },
            { id: 'hero', label: 'Hero & Video CMS', icon: <Sliders className="w-4 h-4" /> },
            { id: 'philosophy', label: 'Philosophy CMS', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'ingredients', label: 'Ingredients', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'blog', label: 'Journal CMS', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'coupons', label: 'Discounts', icon: <Tag className="w-4 h-4" /> },
            { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
            { id: 'instagram', label: 'Botanical Journey', icon: <Instagram className="w-4 h-4" />, count: instagramPosts.length },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-[#2D5A27] text-white shadow-xs font-semibold'
                  : 'text-[#4A5947] hover:bg-[#F4F1EA] hover:text-[#1C3619]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === item.id
                      ? 'bg-white text-[#2D5A27] font-bold'
                      : 'bg-[#E35454] text-white'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Dashboard Overview
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Real-time storefront performance, incoming shipments, and inventory alerts.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-[#DDD7C8] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#798776] font-medium block mb-1">
                    Total Revenue
                  </span>
                  <div className="font-mono text-2xl font-bold text-[#1B3218]">
                    {siteSettings.currencySymbol} {totalSales.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#2D5A27] font-medium mt-1 inline-block">
                    Live gross order volume
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#DDD7C8] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#798776] font-medium block mb-1">
                    Pending Orders
                  </span>
                  <div className="font-mono text-2xl font-bold text-[#D96B26]">
                    {pendingOrders.length}
                  </div>
                  <span className="text-[11px] text-[#717E6F] mt-1 inline-block">
                    Require packing & courier dispatch
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#DDD7C8] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#798776] font-medium block mb-1">
                    Average Order Value
                  </span>
                  <div className="font-mono text-2xl font-bold text-[#1B3218]">
                    {siteSettings.currencySymbol} {averageOrderValue}
                  </div>
                  <span className="text-[11px] text-[#2D5A27] font-medium mt-1 inline-block">
                    Across {orders.length} total orders
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#DDD7C8] shadow-xs">
                  <span className="text-[11px] uppercase tracking-wider text-[#798776] font-medium block mb-1">
                    Low Stock Alerts
                  </span>
                  <div
                    className={`font-mono text-2xl font-bold ${
                      lowStockProducts.length > 0 ? 'text-[#B83232]' : 'text-[#2D5A27]'
                    }`}
                  >
                    {lowStockProducts.length}
                  </div>
                  <span className="text-[11px] text-[#717E6F] mt-1 inline-block">
                    {lowStockProducts.length > 0 ? 'Items below threshold' : 'All stock healthy'}
                  </span>
                </div>
              </div>

              {/* Low Stock Banner if any */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 bg-[#FFF3E8] border border-[#F2CBB2] rounded-xl text-xs text-[#8C3F1B] flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4" />
                    <span>
                      Low stock notice: {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="underline hover:text-black font-semibold"
                  >
                    Adjust Inventory →
                  </button>
                </div>
              )}

              {/* Operational Quick Actions */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] shadow-xs p-6 space-y-4">
                <h3 className="font-serif text-lg text-[#1B3218] font-bold">
                  Operational Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    onClick={openNewProductModal}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Add Product</span>
                      <span className="text-[10px] text-[#71806F]">New formula</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E37E30] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Orders ({orders.length})</span>
                      <span className="text-[10px] text-[#71806F]">{pendingOrders.length} pending</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#3C6E36] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Inventory</span>
                      <span className="text-[10px] text-[#71806F]">{lowStockProducts.length} low stock</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('philosophy')}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2D5A27] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Philosophy CMS</span>
                      <span className="text-[10px] text-[#71806F]">Promise & story</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('gmail')}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#C53929] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Gmail Alerts</span>
                      <span className="text-[10px] text-[#71806F]">Automatic emails</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] hover:border-[#2D5A27] rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#556653] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1B3218] block leading-tight">Store Settings</span>
                      <span className="text-[10px] text-[#71806F]">Currency & fees</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-[#1B3218] font-bold">
                      Recent Customer Orders
                    </h3>
                    <p className="text-xs text-[#717E6F]">
                      Showing recent purchases with real-time delivery status and payment method.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#2D5A27] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#ECE7DA] text-[#717E6F] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">City</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EEE4]">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-[#7E8B7C]">
                            <ShoppingBag className="w-8 h-8 text-[#A0AEA0] mx-auto mb-2 stroke-1" />
                            <p className="font-medium text-[#1B3218]">No customer orders recorded yet.</p>
                            <p className="text-[11px] text-[#71806F] mt-0.5">
                              Orders placed on the storefront will appear here live with instant fulfillment controls.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 6).map((o) => {
                          const getStatusStyle = (st: string) => {
                            switch (st) {
                              case 'Pending':
                                return 'bg-[#FFF4E5] text-[#B25E09] border-[#FED7AA]';
                              case 'Confirmed':
                                return 'bg-[#EEF5EC] text-[#2D5A27] border-[#C5E1BD]';
                              case 'Processing':
                                return 'bg-[#EBF5FB] text-[#1B6CA8] border-[#BAE6FD]';
                              case 'Packed':
                                return 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]';
                              case 'Shipped':
                                return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
                              case 'Delivered':
                                return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
                              case 'Cancelled':
                                return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
                              default:
                                return 'bg-[#EEF5EC] text-[#2D5A27] border-[#C5E1BD]';
                            }
                          };

                          return (
                            <tr
                              key={o.id}
                              onClick={() => {
                                setOrderStatusFilter('all');
                                setActiveTab('orders');
                              }}
                              className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-3 font-mono font-bold text-[#1B3218]">
                                {o.orderNumber}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-medium text-[#253622] block">{o.customerName}</span>
                                <span className="text-[11px] text-[#7E8B7C]">{o.customerPhone}</span>
                              </td>
                              <td className="py-3 px-3 text-[#4A5847]">{o.city}</td>
                              <td className="py-3 px-3 font-mono font-semibold text-[#183115]">
                                {siteSettings.currencySymbol} {o.total}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getStatusStyle(o.status)}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[#4A5847]">{o.paymentMethod}</td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderStatusFilter('all');
                                    setActiveTab('orders');
                                  }}
                                  className="px-2.5 py-1 text-xs text-[#2D5A27] hover:bg-[#EEF5EC] rounded font-medium transition-colors"
                                >
                                  Manage →
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Catalog Management ({products.length} Products)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Create, edit, duplicate, set stock, badges, prices, and botanical details.
                  </p>
                </div>
                <button
                  onClick={openNewProductModal}
                  className="px-4 py-2.5 bg-[#2D5A27] hover:bg-[#1E401A] text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#ECE7DA] text-[#6E7B6C] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Badge</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EEE4]">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-10 object-cover rounded bg-[#F5F2EB] flex-shrink-0"
                              />
                              <div>
                                <span className="font-serif text-sm font-semibold text-[#1B3218] block leading-tight">
                                  {prod.name}
                                </span>
                                <span className="text-[11px] font-mono text-[#7B8877]">
                                  SKU: {prod.sku} · {prod.volumeSize}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#435240]">{prod.category}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#183115]">
                            {siteSettings.currencySymbol} {prod.price}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                prod.stock <= prod.lowStockThreshold
                                  ? 'bg-[#FFEBEB] text-[#B02828]'
                                  : 'bg-[#EEF5EC] text-[#2D5A27]'
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {prod.badge ? (
                              <span className="px-2 py-0.5 bg-[#F0EBE0] text-[#2F3D2C] text-[10px] uppercase tracking-wider font-semibold rounded">
                                {prod.badge}
                              </span>
                            ) : (
                              <span className="text-[#A2ADA0]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => updateProduct(prod.id, { isPublished: !prod.isPublished })}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                prod.isPublished
                                  ? 'bg-[#EEF5EC] text-[#2D5A27]'
                                  : 'bg-[#F2EFE8] text-[#869482]'
                              }`}
                            >
                              {prod.isPublished ? 'Live' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditProductModal(prod)}
                                className="p-1.5 text-[#51634E] hover:text-[#1C3619] rounded hover:bg-[#F2EEE4]"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => duplicateProduct(prod.id)}
                                className="p-1.5 text-[#51634E] hover:text-[#1C3619] rounded hover:bg-[#F2EEE4]"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({ type: 'product', id: prod.id, name: prod.name })
                                }
                                className="p-1.5 text-[#9C3E3E] hover:text-[#B92222] rounded hover:bg-[#FFEBEB]"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Order Fulfillment ({orders.length} Orders)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Verify customer details, advance status, assign courier tracking IDs, and print invoices.
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-[#DDD7C8]">
                  {['all', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                          orderStatusFilter === st
                            ? 'bg-[#2D5A27] text-white shadow-xs'
                            : 'text-[#4F5E4B] hover:text-black'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Gmail Notification Status Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isGoogleLoggedIn
                  ? 'bg-[#EEF5EC] border-[#C5E1BD] text-[#1E3F1A]'
                  : 'bg-[#FFF9EA] border-[#E8D7A5] text-[#695420]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 flex-shrink-0 ${isGoogleLoggedIn ? 'text-[#2D5A27]' : 'text-[#B58514]'}`} />
                  <div>
                    {isGoogleLoggedIn ? (
                      <span>
                        <strong>Gmail Order Alerts Connected:</strong> Incoming orders will be automatically emailed to you by yourself (<strong className="font-mono">{googleUser?.email}</strong>).
                      </span>
                    ) : (
                      <span>
                        <strong>Google Account Not Connected:</strong> Sign in with Google so all new orders are automatically emailed to you by yourself.
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isGoogleLoggedIn ? (
                    <button
                      onClick={() => setActiveTab('gmail')}
                      className="px-3 py-1.5 bg-white hover:bg-[#FAF9F5] border border-[#C5E1BD] rounded-lg text-xs font-semibold text-[#2D5A27] transition-colors"
                    >
                      Email Settings & Test
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('gmail')}
                      className="px-3 py-1.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Connect Gmail Now
                    </button>
                  )}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 bg-white rounded-2xl border border-[#DDD7C8] text-center text-[#7B8877]">
                    <ShoppingBag className="w-10 h-10 stroke-1 mx-auto text-[#A5B2A2] mb-2" />
                    <p className="text-xs">No orders matching selected status filter.</p>
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-[#DDD7C8] p-5 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ECE7DA]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-[#1B3218]">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-[#7B8877]">Date: {ord.date}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F2EEE4] text-[#334230]">
                            {ord.paymentMethod}
                          </span>
                          {ord.transactionRef && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF2F2] text-[#D92525] border border-[#F2C2C2]" title="JazzCash Transaction Reference">
                              JazzCash TID: {ord.transactionRef}
                            </span>
                          )}
                          {ord.emailNotificationSent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDF6EB] text-[#2D5A27] border border-[#CDE5C7]">
                              <CheckCircle className="w-3 h-3" />
                              <span>Emailed to You</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Send Order to Gmail Action */}
                          <button
                            onClick={async () => {
                              if (!isGoogleLoggedIn) {
                                setActiveTab('gmail');
                                showToast('Please sign in with your Google account first.');
                                return;
                              }
                              setSendingEmailForOrderId(ord.id);
                              try {
                                const res = await sendOrderNotification(ord);
                                if (res.success) {
                                  markOrderEmailSent(ord.id);
                                  showToast(`Order #${ord.orderNumber} emailed to ${googleUser?.email || 'your Gmail'}!`);
                                } else {
                                  showToast(res.message);
                                }
                              } catch (err: any) {
                                showToast(err?.message || 'Failed to send email');
                              } finally {
                                setSendingEmailForOrderId(null);
                              }
                            }}
                            disabled={sendingEmailForOrderId === ord.id}
                            className={`px-3 py-1 border text-xs rounded-md flex items-center gap-1.5 transition-colors ${
                              ord.emailNotificationSent
                                ? 'bg-[#EEF5EC] border-[#C5E1BD] text-[#2D5A27] hover:bg-[#DDECDA]'
                                : 'bg-[#FAF9F5] border-[#DDD7C8] hover:border-[#2D5A27] text-[#283C25]'
                            }`}
                            title="Send full order details from your Google account to yourself"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#2D5A27]" />
                            <span>
                              {sendingEmailForOrderId === ord.id
                                ? 'Sending Email...'
                                : ord.emailNotificationSent
                                ? 'Resend via Gmail'
                                : 'Email to Myself'}
                            </span>
                          </button>

                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            className="px-3 py-1 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs text-[#283C25] rounded-md flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>

                          {/* Quick Status Select */}
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="bg-[#EEF5EC] border border-[#C5E1BD] text-[#245C20] text-xs font-semibold px-3 py-1.5 rounded-md focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer & Address Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#4F5E4B]">
                        <div>
                          <span className="text-[11px] text-[#869483] block uppercase tracking-wider">
                            Recipient
                          </span>
                          <span className="font-semibold text-[#1A2E17] block">
                            {ord.customerName}
                          </span>
                          <span className="text-[#2D5A27] font-mono">{ord.customerPhone}</span>
                          {ord.customerEmail && (
                            <span className="block text-[11px] text-[#71826F]">{ord.customerEmail}</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] text-[#869483] block uppercase tracking-wider">
                            Shipping Destination
                          </span>
                          <p className="text-[#2B3B28] leading-relaxed">
                            {ord.shippingAddress}, {ord.city} ({ord.postalCode})
                          </p>
                          {ord.notes && (
                            <p className="text-[11px] text-[#A66024] mt-1 font-medium">
                              Note: {ord.notes}
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] text-[#869483] block uppercase tracking-wider">
                            Courier Dispatch
                          </span>
                          {ord.trackingNumber ? (
                            <div className="text-[11px] text-[#24541F]">
                              <p className="font-semibold">{ord.courierName || 'TCS Express'}</p>
                              <p className="font-mono text-[#3C6E36]">{ord.trackingNumber}</p>
                              <button
                                onClick={() => {
                                  setTrackingOrderId(ord.id);
                                  setTrackingNumberInput(ord.trackingNumber || '');
                                  setCourierNameInput(ord.courierName || 'TCS Express');
                                }}
                                className="text-[#2D5A27] underline mt-0.5"
                              >
                                Edit tracking ID
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setTrackingOrderId(ord.id);
                                setTrackingNumberInput(`TCS-${Math.floor(10000000 + Math.random() * 90000000)}`);
                                setCourierNameInput('TCS Express');
                              }}
                              className="mt-1 px-3 py-1 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] rounded text-xs text-[#283C25] flex items-center gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5 text-[#2D5A27]" />
                              <span>Assign Tracking ID</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="pt-2 border-t border-[#F2EEE4] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3">
                          {ord.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-1.5 bg-[#FAF9F5] rounded-lg border border-[#EDE8DC] text-xs"
                            >
                              <img
                                src={it.image}
                                alt={it.productName}
                                className="w-8 h-8 object-cover rounded bg-[#F5F2EB]"
                              />
                              <span className="font-medium text-[#1C3619]">
                                {it.productName} (x{it.quantity})
                              </span>
                              <span className="font-mono text-[#586854]">
                                {siteSettings.currencySymbol} {it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-[#7E8B7A] block">Grand Total</span>
                          <span className="font-mono text-base font-bold text-[#183115]">
                            {siteSettings.currencySymbol} {ord.total}
                          </span>
                        </div>
                      </div>

                      {/* Quick Tracking Edit Modal Input */}
                      {trackingOrderId === ord.id && (
                        <div className="p-3 bg-[#EEF5EC] rounded-xl border border-[#C5E1BD] flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            value={courierNameInput}
                            onChange={(e) => setCourierNameInput(e.target.value)}
                            placeholder="Courier Name (e.g. TCS / Leopard)"
                            className="bg-white border border-[#DDD7C8] px-3 py-1 text-xs rounded text-[#1C3619]"
                          />
                          <input
                            type="text"
                            value={trackingNumberInput}
                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                            placeholder="Tracking Number"
                            className="bg-white border border-[#DDD7C8] px-3 py-1 text-xs rounded text-[#1C3619] font-mono"
                          />
                          <button
                            onClick={() => {
                              updateOrderStatus(
                                ord.id,
                                'Shipped',
                                trackingNumberInput,
                                courierNameInput
                              );
                              setTrackingOrderId(null);
                            }}
                            className="px-3 py-1 bg-[#2D5A27] text-white text-xs font-semibold rounded hover:bg-[#1C3B19]"
                          >
                            Save & Mark Shipped
                          </button>
                          <button
                            onClick={() => setTrackingOrderId(null)}
                            className="text-xs text-[#6F7D6D] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: GMAIL ORDER ALERTS */}
          {activeTab === 'gmail' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Gmail Order Notifications
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Whenever any customer places an order, all order details are automatically formatted and emailed to you by yourself from your connected Google Account.
                </p>
              </div>

              {/* Connection Card */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] p-6 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ECE7DA]">
                  <div className="flex items-center gap-4">
                    {isGoogleLoggedIn && googleUser?.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Google Account"
                        className="w-14 h-14 rounded-full border-2 border-[#2D5A27] object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#EDF6EB] text-[#2D5A27] flex items-center justify-center font-serif text-xl font-bold border border-[#C5E1BD]">
                        <Mail className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                          {isGoogleLoggedIn
                            ? googleUser?.displayName || 'Envirve Store Owner'
                            : 'Google Account Connection'}
                        </h3>
                        {isGoogleLoggedIn ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#EDF6EB] text-[#2D5A27] border border-[#C5E1BD] flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Connected</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#FFF4DC] text-[#9E6E16] border border-[#E8D19F]">
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#52634F] font-mono mt-0.5">
                        {isGoogleLoggedIn
                          ? googleUser?.email
                          : 'Connect the Google Account you wish to send order emails from'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isGoogleLoggedIn ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setIsSendingTestEmail(true);
                            try {
                              const res = await sendTestNotification();
                              if (res.success) {
                                showToast(`Test order email sent to ${googleUser?.email}! Check your inbox.`);
                              } else {
                                showToast(res.message);
                              }
                            } catch (err: any) {
                              showToast(err?.message || 'Failed to send test email');
                            } finally {
                              setIsSendingTestEmail(false);
                            }
                          }}
                          disabled={isSendingTestEmail}
                          className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingTestEmail ? 'Sending Test...' : 'Send Test Order Email'}</span>
                        </button>
                        <button
                          onClick={() => {
                            googleSignOutAction();
                            showToast('Google account disconnected.');
                          }}
                          className="px-3 py-2 border border-[#DDD7C8] hover:bg-[#FAF9F5] text-xs font-medium text-[#7C8879] rounded-lg transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <GoogleSignInButton
                        onClick={googleSignInAction}
                        isLoading={isGoogleLoggingIn}
                        text="Sign in with Google to Connect"
                      />
                    )}
                  </div>
                </div>

                {/* How it works description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-1.5">
                    <span className="font-semibold text-[#1C3619] flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                      Customer Checkout
                    </span>
                    <p className="text-[#647262] leading-relaxed">
                      Whenever any customer places an order on your store, the order record is securely stored in your cloud database.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-1.5">
                    <span className="font-semibold text-[#1C3619] flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                      Emailed By Yourself
                    </span>
                    <p className="text-[#647262] leading-relaxed">
                      The order is dispatched via the official Gmail API directly from your logged-in Google account to your own inbox.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-1.5">
                    <span className="font-semibold text-[#1C3619] flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#2D5A27] text-white flex items-center justify-center text-[10px] font-mono">3</span>
                      All Order Details Included
                    </span>
                    <p className="text-[#647262] leading-relaxed">
                      The email contains customer name, phone number, full address, ordered products list, pricing breakdown, and notes.
                    </p>
                  </div>
                </div>

                {/* Last Dispatched Email Log */}
                {lastEmailStatus && (
                  <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                    lastEmailStatus.status === 'sent'
                      ? 'bg-[#EEF5EC] border-[#C5E1BD] text-[#1E3F1A]'
                      : 'bg-[#FFF2F2] border-[#E8BCBC] text-[#8C2323]'
                  }`}>
                    <div className="flex items-center gap-2">
                      {lastEmailStatus.status === 'sent' ? (
                        <CheckCircle className="w-4 h-4 text-[#2D5A27]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#D93838]" />
                      )}
                      <span>
                        Last Email Status: Order <strong className="font-mono">#{lastEmailStatus.orderNumber}</strong> was {lastEmailStatus.status === 'sent' ? 'successfully emailed' : 'failed to email'} at {lastEmailStatus.timestamp}.
                        {lastEmailStatus.error && <span className="block text-[11px] font-mono mt-0.5">({lastEmailStatus.error})</span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Order Email Preview */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                      What the Order Email Looks Like
                    </h3>
                    <p className="text-xs text-[#6B7968]">
                      A beautifully styled botanical summary sent to your inbox:
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-1.5 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-semibold text-[#2D5A27] rounded-lg transition-colors"
                  >
                    View All {orders.length} Store Orders →
                  </button>
                </div>

                <div className="p-5 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] font-mono text-xs text-[#354632] space-y-2">
                  <div className="flex justify-between border-b border-[#ECE7DA] pb-2 text-[11px] text-[#717E6F]">
                    <span>From: {isGoogleLoggedIn ? googleUser?.email : 'you (via Gmail)'}</span>
                    <span>To: {isGoogleLoggedIn ? googleUser?.email : 'you (via Gmail)'}</span>
                  </div>
                  <div className="text-sm font-bold text-[#1B3218] pt-1">
                    Subject: 🌿 New Order #ENV-8421 - Customer Name (Rs. 4,300)
                  </div>
                  <div className="text-xs text-[#52634F] pt-2 space-y-1">
                    <p>• <strong>Customer:</strong> Ayesha Khan (+92 300 1234567)</p>
                    <p>• <strong>Address:</strong> House 42, Street 7, Block B, Gulberg III, Lahore</p>
                    <p>• <strong>Payment:</strong> Cash on Delivery (Pending Delivery)</p>
                    <p>• <strong>Items:</strong> Hair Balance Herbal Shampoo x2, Botanical Hair Oil x1</p>
                    <p>• <strong>Grand Total:</strong> Rs. 4,300</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Inventory & Stock Control
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Monitor shelf quantities, adjust units in real-time, and prevent stockouts.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#DDD7C8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#ECE7DA] text-[#6E7B6C] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Current Stock</th>
                        <th className="py-3 px-4">Alert Threshold</th>
                        <th className="py-3 px-4">Quick Adjustment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EEE4]">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-4">
                            <span className="font-serif text-sm font-semibold text-[#1B3218] block">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#7B8877]">{p.category}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#52634F]">{p.sku}</td>
                          <td className="py-3 px-4 font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 rounded text-xs ${
                                p.stock <= p.lowStockThreshold
                                  ? 'bg-[#FFEBEB] text-[#B02828]'
                                  : 'bg-[#EEF5EC] text-[#2D5A27]'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#717E6F]">
                            {p.lowStockThreshold} units
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 5) })}
                                className="px-2.5 py-1 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-mono rounded"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })}
                                className="px-2 py-1 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-mono rounded"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => updateProduct(p.id, { stock: p.stock + 1 })}
                                className="px-2 py-1 bg-[#FAF9F5] border border-[#DDD7C8] hover:border-[#2D5A27] text-xs font-mono rounded"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => updateProduct(p.id, { stock: p.stock + 10 })}
                                className="px-2.5 py-1 bg-[#EEF5EC] border border-[#C5E1BD] text-[#2D5A27] font-semibold text-xs font-mono rounded"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HERO & VIDEO CMS */}
          {activeTab === 'hero' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Hero Video & Headlines CMS
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Upload your cinematic brand video for the storefront hero. The hero exclusively features your uploaded video with zero picture fallbacks.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-6">
                  {/* Video Upload & URL */}
                  <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EDE8DC] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#2D5A27] block">
                        Storefront Hero Video
                      </span>
                      <div className="flex items-center gap-2">
                        {heroConfig.videoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              updateHeroConfig({ videoUrl: '', useVideo: true, fallbackImageUrl: '' });
                              showToast('Hero video removed from active storefront and database.');
                            }}
                            className="text-xs text-red-600 hover:underline font-medium cursor-pointer"
                          >
                            Remove Video
                          </button>
                        )}
                        <label className="px-3 py-1.5 bg-[#2D5A27] text-white hover:bg-[#1E4119] text-[11px] font-semibold rounded cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Video File (.mp4 / .webm)</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                showToast(`Processing video "${file.name}"...`);
                                processVideoUpload(file)
                                  .then((res) => {
                                    updateHeroConfig({
                                      videoUrl: res.videoUrl,
                                      useVideo: true,
                                      fallbackImageUrl: res.posterUrl || '',
                                    });
                                    showToast(`Hero video updated (${res.sizeMb} MB) with poster!`);
                                  })
                                  .catch((err) => {
                                    console.warn('Hero video processing error:', err);
                                    showToast('Unable to process video file.');
                                  });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#445241] mb-1">
                        Or Video Stream URL (.mp4 / webm / hosted link)
                      </label>
                      <input
                        type="text"
                        value={heroConfig.videoUrl}
                        onChange={(e) => updateHeroConfig({ videoUrl: e.target.value, useVideo: true, fallbackImageUrl: '' })}
                        placeholder="https://.../video.mp4 or uploaded data stream"
                        className="w-full bg-white border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                    <p className="text-[11px] text-[#7E8B7A]">
                      Plays inline, continuous loop, muted for seamless aesthetic experience across desktop and mobile.
                    </p>
                  </div>

                  {/* Headline & Subtitle */}
                  <div>
                    <label className="block text-xs font-medium text-[#445241] mb-1">
                      Hero Primary Heading
                    </label>
                    <input
                      type="text"
                      value={heroConfig.heading}
                      onChange={(e) => updateHeroConfig({ heading: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#445241] mb-1">
                      Supporting Subtitle Prose
                    </label>
                    <textarea
                      rows={3}
                      value={heroConfig.subheading}
                      onChange={(e) => updateHeroConfig({ subheading: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  {/* Slogan */}
                  <div>
                    <label className="block text-xs font-medium text-[#445241] mb-1">
                      Slogan Kicker
                    </label>
                    <input
                      type="text"
                      value={heroConfig.slogan}
                      onChange={(e) => updateHeroConfig({ slogan: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#445241] mb-1">
                        Primary CTA Text
                      </label>
                      <input
                        type="text"
                        value={heroConfig.ctaText}
                        onChange={(e) => updateHeroConfig({ ctaText: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#445241] mb-1">
                        Primary CTA Link
                      </label>
                      <input
                        type="text"
                        value={heroConfig.ctaLink}
                        onChange={(e) => updateHeroConfig({ ctaLink: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619]"
                      />
                    </div>
                  </div>

                  {/* Overlay Darkness Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-[#445241] mb-1">
                      <span>Contrast Scrim Darkness</span>
                      <span className="font-mono">{heroConfig.overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={heroConfig.overlayOpacity}
                      onChange={(e) => updateHeroConfig({ overlayOpacity: parseInt(e.target.value) })}
                      className="w-full accent-[#2D5A27]"
                    />
                  </div>
                </div>

                {/* Preview Column (5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-4">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#2D5A27] block">
                    Live Hero Appearance Preview
                  </span>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#182C16] flex items-center justify-center text-center p-4 text-white">
                    {heroConfig.videoUrl ? (
                      <video
                        key={heroConfig.videoUrl}
                        src={resolveMediaSrc(heroConfig.videoUrl)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#142612] flex items-center justify-center text-xs text-[#89A685]">
                        No video uploaded yet
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ opacity: heroConfig.overlayOpacity / 100 }}
                    />
                    <div className="relative z-10 space-y-2">
                      <span className="text-[9px] uppercase tracking-widest text-[#BBD8B6]">
                        {heroConfig.slogan}
                      </span>
                      <h4 className="font-serif text-lg font-bold leading-tight">
                        {heroConfig.heading}
                      </h4>
                      <p className="text-[10px] text-[#DCE7DA] line-clamp-2 max-w-xs mx-auto">
                        {heroConfig.subheading}
                      </p>
                      <button className="px-3 py-1 bg-white text-[#1D3B19] text-[9px] uppercase tracking-wider font-semibold rounded-full mt-2">
                        {heroConfig.ctaText}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#717E6F] text-center">
                    All updates apply instantly across desktop and mobile storefront views.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INGREDIENTS CMS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Botanical Ingredients CMS ({ingredients.length} Herbs)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Manage documented botanicals, origins, benefits, and formulation linkages. Real-time sync with storefront encyclopedia.
                  </p>
                </div>
                <button
                  onClick={openAddIngredientModal}
                  className="px-4 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="bg-white p-5 rounded-2xl border border-[#DDD7C8] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2D5A27] transition-all"
                  >
                    <div>
                      <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-[#F2EFE8]">
                        <img src={ing.image} alt={ing.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base font-bold text-[#1B3218]">
                          {ing.name}
                        </h3>
                        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-[#EEF5EC] text-[#2D5A27]">
                          {ing.origin}
                        </span>
                      </div>
                      <p className="font-serif italic text-xs text-[#6A7866] mb-2">
                        {ing.botanicalName}
                      </p>
                      <p className="text-xs text-[#52604F] line-clamp-3 leading-relaxed mb-3">
                        {ing.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F2EEE4]">
                        {ing.benefits.map((b, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#ECE7DA] text-[#3E503B]">
                            ✓ {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F2EEE4] flex items-center justify-between">
                      <span className="text-[11px] text-[#7E8B7A]">
                        {ing.featuredInProductIds?.length || 0} Products linked
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditIngredientModal(ing)}
                          className="px-2.5 py-1 text-xs font-medium text-[#2D5A27] bg-[#EEF5EC] hover:bg-[#DDECDA] rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'ingredient', id: ing.id, name: ing.name })}
                          className="px-2.5 py-1 text-xs font-medium text-[#A63A3A] hover:bg-[#FFEBEB] rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOG / JOURNAL CMS */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Journal & Editorial CMS ({blogPosts.length} Articles)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Publish rich magazine stories on hair rituals, ancient herbalism, and clean beauty.
                  </p>
                </div>
                <button
                  onClick={openAddBlogModal}
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Article</span>
                </button>
              </div>

              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 bg-white rounded-2xl border border-[#DDD7C8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={resolveMediaSrc(post.image)}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover bg-[#F2EEE4] flex-shrink-0 border border-[#DDD7C8]"
                      />
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#2D5A27] font-semibold">
                          {post.category} · {post.readTime}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#1B3218] leading-snug">
                          {post.title}
                        </h4>
                        <span className="text-xs text-[#717E6F]">
                          By {post.author} on {post.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setBlogPictureEditorConfig({
                            target: 'cardDirect',
                            postId: post.id,
                            initialUrl: post.image,
                            initialCaption: post.imageCaption,
                            title: `Edit Picture: ${post.title}`,
                          });
                          setIsBlogPictureEditorOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-[#2D5A27] bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] rounded transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit and adjust picture"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Picture</span>
                      </button>
                      <button
                        onClick={() => openEditBlogModal(post)}
                        className="px-2.5 py-1 text-xs font-medium text-[#2D5A27] bg-[#EEF5EC] hover:bg-[#DDECDA] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Story</span>
                      </button>
                      <button
                        onClick={() => updateBlogPost(post.id, { isPublished: !post.isPublished })}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          post.isPublished ? 'bg-[#EEF5EC] text-[#2D5A27]' : 'bg-[#F2EFE8] text-[#7E8B7A]'
                        }`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'blog', id: post.id, name: post.title })}
                        className="p-1.5 text-[#9C3838] hover:text-red-700 cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Promotional Discounts & Coupons
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Create percentage discounts, fixed vouchers, and free shipping triggers.
                </p>
              </div>

              {/* Create Coupon Box */}
              <form
                onSubmit={handleCreateCoupon}
                className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-[#4F5E4B] mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. GLOW15"
                    required
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded uppercase font-mono font-bold text-[#1C3619]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4F5E4B] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4F5E4B] mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4F5E4B] mb-1">
                    Minimum Order
                  </label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    min={0}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#1E401A] transition-colors"
                >
                  Create Code
                </button>
              </form>

              {/* Coupons List */}
              <div className="bg-white rounded-2xl border border-[#DDD7C8] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#ECE7DA] text-[#6E7B6C] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Min. Spend</th>
                      <th className="py-3 px-4">Used</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EEE4]">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-[#FAF9F5]">
                        <td className="py-3 px-4 font-mono font-bold text-[#1B3218]">
                          {c.code}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#2D5A27] font-semibold">
                          {c.type === 'percentage' ? `${c.value}% OFF` : `Rs ${c.value} OFF`}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#52634F]">
                          Rs {c.minOrder}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#717E6F]">
                          {c.usageCount} times
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleCouponActive(c.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              c.isActive ? 'bg-[#EEF5EC] text-[#2D5A27]' : 'bg-[#FFEBEB] text-[#B02828]'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDeleteTarget({ type: 'coupon', id: c.id, name: c.code })}
                            className="text-[#A43B3B] hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS & COMMUNITY VOICES */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Community Voices & Testimonials ({reviews.length} Total)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Add, edit, approve, and choose which customer voices are showcased on the homepage.
                  </p>
                </div>
                <button
                  onClick={openAddReviewModal}
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center gap-1.5 shadow-xs self-start sm:self-auto transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Community Voice</span>
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white rounded-2xl border border-[#DDD7C8] shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-serif font-bold text-sm text-[#1B3218]">
                          {rev.authorName}
                        </span>
                        <span className="text-xs text-[#717E6D]">on {rev.productName}</span>
                        <div className="flex text-[#D99A26] ml-2">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        {rev.featuredOnHome !== false && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#EDF6EB] text-[#2D5A27]">
                            Featured on Homepage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#4F5E4B] leading-relaxed">
                        "{rev.comment}"
                      </p>
                      <span className="text-[11px] text-[#869483] font-mono mt-1 block">
                        {rev.date} · {rev.verifiedPurchase ? 'Verified Customer' : 'Visitor Review'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => openEditReviewModal(rev)}
                        className="px-2.5 py-1 rounded text-xs border border-[#DDD7C8] text-[#334230] hover:bg-[#FAF9F5] cursor-pointer flex items-center gap-1"
                        title="Edit testimonial"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          updateReview(rev.id, {
                            featuredOnHome: rev.featuredOnHome === false ? true : false,
                          })
                        }
                        className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                          rev.featuredOnHome !== false
                            ? 'bg-[#EEF5EC] text-[#2D5A27] border-[#C5E1BD]'
                            : 'bg-white text-[#717E6F] border-[#DDD7C8]'
                        }`}
                        title="Toggle Homepage Feature"
                      >
                        {rev.featuredOnHome !== false ? '★ On Home' : 'Off Home'}
                      </button>
                      <button
                        onClick={() => toggleReviewApproval(rev.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                          rev.isApproved ? 'bg-[#EEF5EC] text-[#2D5A27]' : 'bg-[#FFEBEB] text-[#9A3838]'
                        }`}
                      >
                        {rev.isApproved ? 'Live' : 'Hidden'}
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'review',
                            id: rev.id,
                            name: `Review by ${rev.authorName}`,
                          })
                        }
                        className="p-1.5 text-[#9A3838] hover:text-red-700 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BOTANICAL JOURNEY / INSTAGRAM CMS */}
          {activeTab === 'instagram' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Follow Our Botanical Journey CMS ({instagramPosts.length} Media)
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Curate remote photos and videos shown on your public homepage. Upload or paste remote links to photos or videos from your Instagram page.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={openBatchInstagramModal}
                    className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#2D5A27]" />
                    <span>Paste Multiple Posts</span>
                  </button>
                  <button
                    onClick={openAddInstagramModal}
                    className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Single Post</span>
                  </button>
                </div>
              </div>

              {instagramPosts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-[#DDD7C8] p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center mx-auto">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                    No Botanical Journey Media Added
                  </h3>
                  <p className="text-xs text-[#6F7D6D] max-w-sm mx-auto">
                    Add or paste multiple Instagram photos or videos to showcase behind-the-scenes rituals and customer moments on the homepage.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={openBatchInstagramModal}
                      className="px-5 py-2.5 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs uppercase tracking-wider font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Paste Multiple Posts</span>
                    </button>
                    <button
                      onClick={openAddInstagramModal}
                      className="px-5 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Media Item</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {instagramPosts.map((post) => {
                    const isVideo =
                      post.mediaType === 'video' ||
                      Boolean(post.videoUrl && post.videoUrl.trim().length > 0) ||
                      Boolean(post.imageUrl && (post.imageUrl.endsWith('.mp4') || post.imageUrl.endsWith('.webm') || post.imageUrl.includes('video/')));
                    const mediaSrc = post.videoUrl || post.imageUrl;

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-2xl border border-[#DDD7C8] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="relative aspect-square bg-[#1B3218] overflow-hidden">
                          {isVideo ? (
                            <video
                              src={resolveMediaSrc(mediaSrc)}
                              muted
                              playsInline
                              autoPlay
                              loop
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={resolveMediaSrc(post.imageUrl || post.videoUrl)}
                              alt={post.caption}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-mono rounded">
                              {isVideo ? '▶ Video' : '📷 Photo'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <p className="text-xs text-[#283825] line-clamp-3 leading-relaxed">
                              {post.caption}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-[#697A66] pt-2 mt-2 border-t border-[#F0EBE0]">
                              <span>❤️ {post.likes} likes</span>
                              {post.url && (
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#2D5A27] hover:underline font-medium"
                                >
                                  View Post ↗
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECE7DA]">
                            <button
                              onClick={() => openEditInstagramModal(post)}
                              className="p-1.5 text-[#2D5A27] hover:bg-[#EEF5EC] rounded-lg transition-colors cursor-pointer"
                              title="Edit Media"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'instagram',
                                  id: post.id,
                                  name: post.caption.slice(0, 30) || 'Instagram Media',
                                })
                              }
                              className="p-1.5 text-[#9A3838] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
                              title="Delete from Live Showcase and Database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PHILOSOPHY CMS */}
          {activeTab === 'philosophy' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                    Philosophy & Brand Story CMS
                  </h2>
                  <p className="text-xs text-[#6B7968]">
                    Make every part of your public philosophy page editable — story origin, craftsmanship narrative, craftsmanship picture, core standards/pillars, and ethical packaging commitment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updatePhilosophyConfig(philosophyForm);
                    showToast('Philosophy page updated and saved to database!');
                  }}
                  className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Save All Philosophy Changes
                </button>
              </div>

              {/* Form Container */}
              <div className="space-y-8">
                {/* 1. Origin & Story Intro */}
                <div className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-4">
                  <div className="border-b border-[#ECE7DA] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                        1. Origin & Story Introduction
                      </h3>
                      <p className="text-xs text-[#717E6F]">
                        Top title, tagline kicker, and primary founding story text.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#EEF5EC] text-[#2D5A27] px-2 py-0.5 rounded font-semibold">
                      Public Top Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Kicker Tagline
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.introKicker}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, introKicker: e.target.value })}
                        placeholder="The Origin of Envirve"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Philosophy Quote
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.introQuote}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, introQuote: e.target.value })}
                        placeholder="“nature . care . you .”"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] font-serif italic focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={philosophyForm.introHeading}
                      onChange={(e) => setPhilosophyForm({ ...philosophyForm, introHeading: e.target.value })}
                      placeholder="Rooted in nature. Thoughtfully made for you."
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] font-serif font-semibold text-base focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Founding Narrative Prose
                    </label>
                    <textarea
                      rows={4}
                      value={philosophyForm.introParagraph}
                      onChange={(e) => setPhilosophyForm({ ...philosophyForm, introParagraph: e.target.value })}
                      placeholder="Envirve Naturals was born out of a yearning for simplicity, truth, and genuine botanical care..."
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] leading-relaxed focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>

                {/* 2. Craftsmanship Section & Picture */}
                <div className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-4">
                  <div className="border-b border-[#ECE7DA] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                        2. Craftsmanship Narrative & Picture
                      </h3>
                      <p className="text-xs text-[#717E6F]">
                        Section describing your formulation methods, alongside a high-resolution craftsmanship image.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#EEF5EC] text-[#2D5A27] px-2 py-0.5 rounded font-semibold">
                      Middle Visual Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left details */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                            Section Tag
                          </label>
                          <input
                            type="text"
                            value={philosophyForm.craftSectionTag}
                            onChange={(e) => setPhilosophyForm({ ...philosophyForm, craftSectionTag: e.target.value })}
                            placeholder="Our Craftsmanship"
                            className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={philosophyForm.craftButtonText}
                            onChange={(e) => setPhilosophyForm({ ...philosophyForm, craftButtonText: e.target.value })}
                            placeholder="Discover the Formulations"
                            className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                          Craftsmanship Heading
                        </label>
                        <input
                          type="text"
                          value={philosophyForm.craftHeading}
                          onChange={(e) => setPhilosophyForm({ ...philosophyForm, craftHeading: e.target.value })}
                          placeholder="Slow infusions, unhurried methods."
                          className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-serif font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                          Paragraph 1 (Extraction philosophy)
                        </label>
                        <textarea
                          rows={3}
                          value={philosophyForm.craftParagraph1}
                          onChange={(e) => setPhilosophyForm({ ...philosophyForm, craftParagraph1: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                          Paragraph 2 (Sensory outcome & results)
                        </label>
                        <textarea
                          rows={3}
                          value={philosophyForm.craftParagraph2}
                          onChange={(e) => setPhilosophyForm({ ...philosophyForm, craftParagraph2: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Right picture manager */}
                    <div className="lg:col-span-5 p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] block">
                        Craftsmanship Picture
                      </span>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD7C8] bg-black/10 relative">
                        <img
                          src={resolveMediaSrc(philosophyForm.craftImageUrl) || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
                          alt="Craft Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="py-2 px-3 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  showToast(`Optimizing craftsmanship picture...`);
                                  compressImageFile(file, 900, 900, 0.74)
                                    .then((dataUrl) => {
                                      setPhilosophyForm((prev) => ({ ...prev, craftImageUrl: dataUrl }));
                                      updatePhilosophyConfig({ craftImageUrl: dataUrl });
                                      showToast(`Picture "${file.name}" uploaded successfully!`);
                                    })
                                    .catch(() => showToast('Failed to process image file.'));
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsPhilosophyPictureEditorOpen(true)}
                            className="py-2 px-3 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                            <span>Edit Picture</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste remote image URL"
                          value={philosophyForm.craftImageUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhilosophyForm({ ...philosophyForm, craftImageUrl: val });
                          }}
                          className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. The Core Standards / 4 Pillars */}
                <div className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-4">
                  <div className="border-b border-[#ECE7DA] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                        3. Core Standards & The Envirve Promise (4 Pillars)
                      </h3>
                      <p className="text-xs text-[#717E6F]">
                        The 4 foundational pillars displayed in cards on the philosophy page.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#EEF5EC] text-[#2D5A27] px-2 py-0.5 rounded font-semibold">
                      4 Pillars Section
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Pillars Section Tag
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.pillarsSectionTag}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, pillarsSectionTag: e.target.value })}
                        placeholder="Our Core Standards"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Pillars Section Heading
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.pillarsHeading}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, pillarsHeading: e.target.value })}
                        placeholder="The Envirve Promise"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                      />
                    </div>
                  </div>

                  {/* Promise Quote & Picture Editor */}
                  <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                        The Envirve Promise Quote (Overlaid on Promise Picture)
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.promiseQuote || ''}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, promiseQuote: e.target.value })}
                        placeholder="Care formulated backward from pure botanical wisdom."
                        className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] italic font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-4 aspect-video rounded-lg overflow-hidden border border-[#DDD7C8] bg-black/10">
                        <img
                          src={resolveMediaSrc(philosophyForm.promiseImageUrl) || resolveMediaSrc(siteSettings.ourPromiseImageUrl) || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
                          alt="Promise Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="sm:col-span-8 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] block">
                          The Promise Picture
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="py-2 px-3 bg-white hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Picture</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  showToast('Optimizing promise picture...');
                                  compressImageFile(file, 900, 900, 0.72)
                                    .then((dataUrl) => {
                                      setPhilosophyForm((prev) => ({ ...prev, promiseImageUrl: dataUrl }));
                                      updatePhilosophyConfig({ promiseImageUrl: dataUrl });
                                      updateSiteSettings({ ourPromiseImageUrl: dataUrl });
                                      showToast('Promise picture uploaded successfully!');
                                    })
                                    .catch(() => showToast('Could not process image file.'));
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsPhilosophyPromisePictureEditorOpen(true)}
                            className="py-2 px-3 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#E5C765]" />
                            <span>Edit Picture</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste remote promise picture URL..."
                          value={philosophyForm.promiseImageUrl || ''}
                          onChange={(e) => setPhilosophyForm({ ...philosophyForm, promiseImageUrl: e.target.value })}
                          className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {(philosophyForm.pillars || []).map((pillar, idx) => (
                      <div
                        key={pillar.id || idx}
                        className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider">
                            Pillar {idx + 1}
                          </span>
                          <select
                            value={pillar.icon}
                            onChange={(e) => {
                              const updated = [...philosophyForm.pillars];
                              updated[idx] = { ...updated[idx], icon: e.target.value as any };
                              setPhilosophyForm({ ...philosophyForm, pillars: updated });
                            }}
                            className="bg-white border border-[#DDD7C8] text-xs px-2 py-1 rounded text-[#1C3619]"
                          >
                            <option value="Sprout">Sprout (Plant/Nature)</option>
                            <option value="HeartHandshake">HeartHandshake (Handcrafted)</option>
                            <option value="Shield">Shield (Zero Chemicals/Safety)</option>
                            <option value="Sparkles">Sparkles (Rituals/Mindfulness)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#485744] mb-1">
                            Pillar Title
                          </label>
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => {
                              const updated = [...philosophyForm.pillars];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setPhilosophyForm({ ...philosophyForm, pillars: updated });
                            }}
                            className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#485744] mb-1">
                            Pillar Description
                          </label>
                          <textarea
                            rows={3}
                            value={pillar.desc}
                            onChange={(e) => {
                              const updated = [...philosophyForm.pillars];
                              updated[idx] = { ...updated[idx], desc: e.target.value };
                              setPhilosophyForm({ ...philosophyForm, pillars: updated });
                            }}
                            className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Ethical Commitment Callout Banner */}
                <div className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-4">
                  <div className="border-b border-[#ECE7DA] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1B3218]">
                        4. Ethical Sourcing & Earth Respect Callout
                      </h3>
                      <p className="text-xs text-[#717E6F]">
                        Dark botanical banner at the foot of the philosophy page highlighting your packaging and ethical principles.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#EEF5EC] text-[#2D5A27] px-2 py-0.5 rounded font-semibold">
                      Bottom Callout Banner
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Banner Kicker
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.ethicalKicker}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, ethicalKicker: e.target.value })}
                        placeholder="Ethical Sourcing & Earth Respect"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                        Banner Heading
                      </label>
                      <input
                        type="text"
                        value={philosophyForm.ethicalHeading}
                        onChange={(e) => setPhilosophyForm({ ...philosophyForm, ethicalHeading: e.target.value })}
                        placeholder="Packaged with conscience. Made without compromise."
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Banner Detailed Description
                    </label>
                    <textarea
                      rows={3}
                      value={philosophyForm.ethicalDescription}
                      onChange={(e) => setPhilosophyForm({ ...philosophyForm, ethicalDescription: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded-lg text-[#1C3619] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Save Button Footer */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      updatePhilosophyConfig(philosophyForm);
                      showToast('All philosophy page changes saved to live cloud!');
                    }}
                    className="px-8 py-3 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-widest font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Save All Philosophy Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl text-[#1B3218] font-bold">
                  Store & Brand Settings
                </h2>
                <p className="text-xs text-[#6B7968]">
                  Upload custom brand logo picture, remote Our Promise section picture, store announcements, shipping limits, and contact points.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#DDD7C8] shadow-xs space-y-6 max-w-2xl">
                {/* Brand Logo Picture Upload Section */}
                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] block">
                      Brand Logo Picture
                    </span>
                    {siteSettings.logoImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateSiteSettings({ logoImageUrl: '' });
                          showToast('Brand logo image removed.');
                        }}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#52634F] leading-relaxed">
                    Upload your picture for Envirve Naturals. It will appear on the extreme left in the header alongside "ENVÍRVE NATURALS" and "nature . care . you .".
                  </p>

                  {siteSettings.logoImageUrl ? (
                    <div className="p-3 bg-white rounded-lg border border-[#DDD7C8] flex items-center gap-4">
                      <img
                        src={siteSettings.logoImageUrl}
                        alt="Logo Preview"
                        className="h-12 w-auto max-w-[160px] object-contain bg-[#FAF9F5] p-1 rounded"
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#1C3619] block">
                          Custom Logo Picture Active
                        </span>
                        <span className="text-[11px] text-[#717E6F]">
                          Showing on top left header and footer
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-dashed border-[#DDD7C8] text-xs text-[#717E6F] text-center">
                      No picture uploaded yet. The refined typographic name "ENVÍRVE NATURALS" is displayed.
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <label className="w-full sm:w-auto px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-2 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            showToast('Optimizing logo image...');
                            compressImageFile(file, 800, 800, 0.9)
                              .then((dataUrl) => {
                                updateSiteSettings({ logoImageUrl: dataUrl });
                                showToast('Brand logo picture uploaded successfully!');
                              })
                              .catch(() => showToast('Could not process logo picture.'));
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-[#8A9687]">or</span>
                    <input
                      type="text"
                      placeholder="Paste Image URL"
                      value={siteSettings.logoImageUrl || ''}
                      onChange={(e) => updateSiteSettings({ logoImageUrl: e.target.value })}
                      className="flex-1 w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>

                {/* Our Promise Background Picture Section */}
                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DDD7C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] block">
                      Our Promise Section Background Picture (Homepage)
                    </span>
                    {siteSettings.ourPromiseImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateSiteSettings({
                            ourPromiseImageUrl: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
                          });
                          showToast('Reset Our Promise picture to botanical ritual default.');
                        }}
                        className="text-xs text-[#2D5A27] hover:underline font-medium cursor-pointer"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#52634F] leading-relaxed">
                    Decide the background picture for the "Our Promise" editorial philosophy banner on your homepage. Upload a file or paste any remote image URL.
                  </p>

                  <div className="p-3 bg-white rounded-lg border border-[#DDD7C8] flex items-center gap-4">
                    <img
                      src={resolveMediaSrc(siteSettings.ourPromiseImageUrl) || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
                      alt="Our Promise Preview"
                      className="h-20 w-28 object-cover rounded shadow-xs border border-[#E7E2D5]"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-[#1C3619] block">
                        Active Philosophy Picture
                      </span>
                      <p className="text-[11px] text-[#717E6F] truncate">
                        {siteSettings.ourPromiseImageUrl || 'Default botanical ritual image'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <label className="w-full sm:w-auto px-4 py-2 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-2 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Picture File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            showToast('Optimizing background picture...');
                            compressImageFile(file, 1600, 1600, 0.82)
                              .then((dataUrl) => {
                                updateSiteSettings({ ourPromiseImageUrl: dataUrl });
                                showToast('Our Promise background picture updated successfully!');
                              })
                              .catch(() => showToast('Could not process image file.'));
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-[#8A9687]">or</span>
                    <input
                      type="text"
                      placeholder="Paste Remote Picture URL (https://...)"
                      value={siteSettings.ourPromiseImageUrl || ''}
                      onChange={(e) => updateSiteSettings({ ourPromiseImageUrl: e.target.value })}
                      className="flex-1 w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                      Our Promise Quote (Displayed over picture)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.ourPromiseQuote || ''}
                      onChange={(e) => updateSiteSettings({ ourPromiseQuote: e.target.value })}
                      placeholder="e.g. Care formulated backward from pure botanical wisdom."
                      className="w-full bg-white border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>
                {/* Announcement Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1C3619]">
                      Top Announcement Bar Message
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[#4F5E4B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettings.announcementBar.enabled}
                        onChange={(e) =>
                          updateSiteSettings({
                            announcementBar: {
                              ...siteSettings.announcementBar,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span>Enable</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={siteSettings.announcementBar.text}
                    onChange={(e) =>
                      updateSiteSettings({
                        announcementBar: {
                          ...siteSettings.announcementBar,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619]"
                  />
                </div>

                {/* Delivery Rates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                      Standard Nationwide Delivery Fee (Rs)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.defaultDeliveryFee}
                      onChange={(e) => updateSiteSettings({ defaultDeliveryFee: Number(e.target.value) })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                      Complimentary Shipping Threshold (Rs)
                    </label>
                    <input
                      type="number"
                      value={siteSettings.freeShippingThreshold}
                      onChange={(e) => updateSiteSettings({ freeShippingThreshold: Number(e.target.value) })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619] font-mono"
                    />
                  </div>
                </div>

                {/* Support Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                      Customer Inquiries Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => updateSiteSettings({ contactEmail: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                      WhatsApp Support Number (Country code + digits)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.whatsappNumber}
                      onChange={(e) => updateSiteSettings({ whatsappNumber: e.target.value })}
                      placeholder="e.g. 923001234567"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619] font-mono"
                    />
                  </div>
                </div>

                {/* Social URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                    Instagram Account URL
                  </label>
                  <input
                    type="text"
                    value={siteSettings.instagramUrl}
                    onChange={(e) => updateSiteSettings({ instagramUrl: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619]"
                  />
                </div>

                {/* Admin Password Change */}
                <div className="pt-4 border-t border-[#ECE7DA]">
                  <label className="block text-xs font-semibold text-[#1C3619] mb-1">
                    Admin Portal Passcode
                  </label>
                  <input
                    type="text"
                    value={siteSettings.adminPasswordHash}
                    onChange={(e) => updateSiteSettings({ adminPasswordHash: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2.5 text-xs rounded text-[#1C3619] font-mono"
                  />
                  <p className="text-[11px] text-[#717E6F] mt-1">
                    Default: <code className="bg-[#F2EEE4] px-1 py-0.5 rounded">envirvenaturals1313</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT CREATE / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#DDD7C8] overflow-hidden flex flex-col my-8">
            <div className="p-6 bg-[#FAF9F5] border-b border-[#ECE7DA] flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                {editingProductId ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[#5D6B5A] hover:text-black rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Rosemary Hair Density Tonic"
                    required
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Retail Price (Rs) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Compare-at Price (Rs)
                  </label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 850"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    required
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Volume / Size
                  </label>
                  <input
                    type="text"
                    value={productForm.volumeSize}
                    onChange={(e) => setProductForm({ ...productForm, volumeSize: e.target.value })}
                    placeholder="250 ml / 8.4 fl oz"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Promotional Badge
                  </label>
                  <select
                    value={productForm.badge || ''}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value as any })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  >
                    {badges.map((b) => (
                      <option key={b} value={b}>
                        {b || 'None'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    SKU Identifier
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[#495945]">
                    Primary Product Image
                  </label>
                  <label className="px-3 py-1 bg-[#EEF5EC] text-[#2D5A27] hover:bg-[#DDECDA] text-[11px] font-semibold rounded cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3 h-3" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          showToast(`Optimizing photo "${file.name}"...`);
                          compressImageFile(file)
                            .then((dataUrl) => {
                              setProductForm((prev) => ({
                                ...prev,
                                images: [dataUrl, ...prev.images.filter((img) => img !== dataUrl)],
                              }));
                              showToast(`Uploaded & optimized "${file.name}".`);
                            })
                            .catch(() => showToast('Failed to process image file.'));
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={productForm.images[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  placeholder="Or paste image URL (e.g. /src/assets/images/...)"
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#495945] mb-1">
                  Short Descriptor
                </label>
                <input
                  type="text"
                  value={productForm.shortDesc}
                  onChange={(e) => setProductForm({ ...productForm, shortDesc: e.target.value })}
                  placeholder="Infused with rosemary and cold-pressed sweet almond"
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#495945] mb-1">
                  Full Botanical Ritual Description
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    Ingredients (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.ingredients.join(', ')}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        ingredients: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#495945] mb-1">
                    How to Use Ritual
                  </label>
                  <input
                    type="text"
                    value={productForm.howToUse}
                    onChange={(e) => setProductForm({ ...productForm, howToUse: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors"
                >
                  {editingProductId ? 'Update Product' : 'Add to Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="font-serif text-2xl font-bold text-[#1B3218]">
                  ENVÍRVE NATURALS
                </span>
                <p className="text-xs text-[#5D6B5A]">nature.care.you. — Packing & Dispatch Slip</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-[#1B3218] block">
                  {invoiceOrder.orderNumber}
                </span>
                <span className="text-xs text-[#717E6F]">{invoiceOrder.date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-[#4F5E4B]">
              <div>
                <span className="font-bold text-[#1C3619] block mb-1">Deliver To:</span>
                <p>{invoiceOrder.customerName}</p>
                <p>{invoiceOrder.shippingAddress}</p>
                <p>{invoiceOrder.city}, Pakistan ({invoiceOrder.postalCode})</p>
                <p className="font-mono mt-1 font-semibold">{invoiceOrder.customerPhone}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#1C3619] block mb-1">Payment & Logistics:</span>
                <p>Method: {invoiceOrder.paymentMethod}</p>
                {invoiceOrder.transactionRef && (
                  <p className="font-mono text-[#D92525] font-bold">
                    JazzCash TID: {invoiceOrder.transactionRef}
                  </p>
                )}
                <p>Status: {invoiceOrder.paymentStatus}</p>
                <p>Courier: {invoiceOrder.courierName || 'TCS Express'}</p>
                {invoiceOrder.trackingNumber && (
                  <p className="font-mono text-[#2D5A27] font-bold">
                    Tracking: {invoiceOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-[#7E8B7A]">
                    <th className="py-2">Item</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EEE4]">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{it.productName}</td>
                      <td className="py-2 font-mono">{it.quantity}</td>
                      <td className="py-2 font-mono text-right">Rs {it.price}</td>
                      <td className="py-2 font-mono text-right font-semibold">
                        Rs {it.price * it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t space-y-1 text-xs text-right">
                <div className="text-[#6D7B69]">
                  Subtotal: Rs {invoiceOrder.subtotal}
                </div>
                <div className="text-[#6D7B69]">
                  Delivery Fee: Rs {invoiceOrder.deliveryFee}
                </div>
                {invoiceOrder.discountAmount > 0 && (
                  <div className="text-[#2D5A27]">
                    Discount: -Rs {invoiceOrder.discountAmount}
                  </div>
                )}
                <div className="font-serif text-base font-bold text-[#1B3218] pt-1">
                  Grand Total Due: Rs {invoiceOrder.total}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-[11px] text-[#717E6F]">
                Support: {siteSettings.contactEmail} · Handcrafted Herbal Care
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#2D5A27] text-white text-xs font-semibold rounded"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="px-4 py-2 border text-xs font-semibold rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INGREDIENT MODAL (ADD / EDIT) */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                {editingIngredientId ? 'Edit Botanical Herb' : 'Add New Botanical Herb'}
              </h3>
              <button
                type="button"
                onClick={() => setIsIngredientModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Common Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                    placeholder="e.g. Mountain Rosemary"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Botanical (Latin) Name
                  </label>
                  <input
                    type="text"
                    value={ingredientForm.botanicalName}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, botanicalName: e.target.value })}
                    placeholder="e.g. Rosmarinus officinalis"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-serif italic focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Harvest Origin
                  </label>
                  <input
                    type="text"
                    value={ingredientForm.origin}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, origin: e.target.value })}
                    placeholder="e.g. Organic Mediterranean & Valleys"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#3C4C38]">
                      Herb Image
                    </label>
                    <label className="text-[10px] text-[#2D5A27] font-semibold underline cursor-pointer hover:text-[#183115]">
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            showToast(`Optimizing photo "${file.name}"...`);
                            compressImageFile(file)
                              .then((dataUrl) => {
                                setIngredientForm((prev) => ({ ...prev, image: dataUrl }));
                                showToast(`Uploaded photo for ${ingredientForm.name || 'herb'}`);
                              })
                              .catch(() => showToast('Failed to process image file.'));
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={ingredientForm.image}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, image: e.target.value })}
                    placeholder="/src/assets/images/... or URL"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Botanical Lore & Description
                </label>
                <textarea
                  rows={3}
                  value={ingredientForm.description}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, description: e.target.value })}
                  placeholder="Detailed description of the herb's properties, traditional folklore, and cosmetic mechanisms..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              {/* Benefits Tag List & Add Input */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Documented Benefits
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ingredientForm.benefits.map((b, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[#EEF5EC] text-[#2D5A27] rounded-md border border-[#D0E6CC]"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setIngredientForm({
                            ...ingredientForm,
                            benefits: ingredientForm.benefits.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[#557750] hover:text-red-700 ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (benefitInput.trim()) {
                          setIngredientForm({
                            ...ingredientForm,
                            benefits: [...ingredientForm.benefits, benefitInput.trim()],
                          });
                          setBenefitInput('');
                        }
                      }
                    }}
                    placeholder="Add benefit tag and press Enter or click Add"
                    className="flex-1 bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-1.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (benefitInput.trim()) {
                        setIngredientForm({
                          ...ingredientForm,
                          benefits: [...ingredientForm.benefits, benefitInput.trim()],
                        });
                        setBenefitInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#EEF5EC] hover:bg-[#DCECD9] text-[#2D5A27] text-xs font-semibold rounded border border-[#C5DEC0] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Linked Formulations */}
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Featured In Formulations (Catalog Linkage)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#FAF9F5] rounded-lg border border-[#DDD7C8]">
                  {products.map((p) => {
                    const isLinked = ingredientForm.featuredInProductIds?.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 text-xs text-[#2B3B28] cursor-pointer hover:bg-white p-1.5 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => {
                            const current = ingredientForm.featuredInProductIds || [];
                            if (e.target.checked) {
                              setIngredientForm({
                                ...ingredientForm,
                                featuredInProductIds: [...current, p.id],
                              });
                            } else {
                              setIngredientForm({
                                ...ingredientForm,
                                featuredInProductIds: current.filter((id) => id !== p.id),
                              });
                            }
                          }}
                          className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsIngredientModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs"
                >
                  {editingIngredientId ? 'Update Herb' : 'Save Herb'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG / ARTICLE MODAL */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                {editingBlogId ? 'Edit Journal Story' : 'Create Journal Story'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="e.g. The Ancient Ritual of Hair Oiling"
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Category
                  </label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
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
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    placeholder="e.g. 4 min read"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    placeholder="e.g. Envirve Editorial"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
              </div>

              {/* Cover Picture & Picture Editor Section */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#3C4C38] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Featured Cover Picture
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#2D5A27] font-semibold underline cursor-pointer hover:text-[#183115]">
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            showToast(`Optimizing cover photo "${file.name}"...`);
                            compressImageFile(file, 1400, 1400, 0.85)
                              .then((dataUrl) => {
                                setBlogForm((prev) => ({ ...prev, image: dataUrl }));
                                showToast(`Cover image uploaded.`);
                              })
                              .catch(() => showToast('Failed to process image file.'));
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBlogPictureEditorConfig({
                          target: 'blogCover',
                          initialUrl: blogForm.image,
                          initialCaption: blogForm.imageCaption,
                          title: 'Edit Featured Cover Picture',
                        });
                        setIsBlogPictureEditorOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-[11px] font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Open Picture Editor</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-28 aspect-video rounded-lg overflow-hidden bg-[#ECE7DC] border border-[#DDD7C8] flex-shrink-0">
                    <img
                      src={resolveMediaSrc(blogForm.image)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={blogForm.image}
                      onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                      placeholder="/src/assets/images/... or image URL"
                      className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                    <input
                      type="text"
                      value={blogForm.imageCaption || ''}
                      onChange={(e) => setBlogForm({ ...blogForm, imageCaption: e.target.value })}
                      placeholder="Picture caption (optional, e.g. Cold-pressed rosemary infusion)"
                      className="w-full bg-white border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] italic font-serif"
                    />
                  </div>
                </div>
              </div>

              {/* Story Pictures Gallery */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#ECE7DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3C4C38] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Story Photo Chronicle ({blogForm.additionalImages?.length || 0} Pictures)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newImg: JournalImage = {
                        id: 'img-' + Date.now(),
                        url: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
                        caption: 'Field harvest details',
                      };
                      setBlogForm((prev) => ({
                        ...prev,
                        additionalImages: [...(prev.additionalImages || []), newImg],
                      }));
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-[#EEF5EC] border border-[#DDD7C8] text-[#2D5A27] text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {blogForm.additionalImages && blogForm.additionalImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                    {blogForm.additionalImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="bg-white p-2 rounded-lg border border-[#DDD7C8] flex items-center gap-2.5"
                      >
                        <div className="w-12 h-12 rounded overflow-hidden bg-[#ECE7DC] flex-shrink-0">
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
                              const updated = [...(blogForm.additionalImages || [])];
                              updated[idx].caption = e.target.value;
                              setBlogForm({ ...blogForm, additionalImages: updated });
                            }}
                            placeholder="Caption..."
                            className="w-full border-b border-[#ECE7DA] text-xs p-0.5 focus:outline-none focus:border-[#2D5A27]"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setBlogPictureEditorConfig({
                                  target: 'blogGallery',
                                  galleryIndex: idx,
                                  initialUrl: img.url,
                                  initialCaption: img.caption,
                                  initialAlt: img.alt,
                                  title: `Edit Story Picture #${idx + 1}`,
                                });
                                setIsBlogPictureEditorOpen(true);
                              }}
                              className="text-[10px] text-[#2D5A27] font-semibold underline cursor-pointer"
                            >
                              Edit Picture
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBlogForm((prev) => ({
                                  ...prev,
                                  additionalImages: (prev.additionalImages || []).filter((_, i) => i !== idx),
                                }));
                              }}
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
                  Short Excerpt
                </label>
                <textarea
                  rows={2}
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  placeholder="Summary displayed on journal catalog and cards..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Story Content
                </label>
                <textarea
                  rows={6}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  placeholder="Write the full editorial ritual chronicle here..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="blog-publish-toggle"
                  checked={blogForm.isPublished}
                  onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                  className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                />
                <label htmlFor="blog-publish-toggle" className="text-xs text-[#2A3B27] cursor-pointer">
                  Publish immediately (Visible in Journal view)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs"
                >
                  {editingBlogId ? 'Update Story' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL (ADD / EDIT) */}
      {isReviewModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                {editingReview.id ? 'Edit Community Voice' : 'Add Community Voice'}
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Patron / Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.authorName}
                    onChange={(e) => setEditingReview({ ...editingReview, authorName: e.target.value })}
                    placeholder="e.g. Maryam K."
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Product / Formulation Name
                  </label>
                  <select
                    value={editingReview.productName}
                    onChange={(e) => {
                      const matched = products.find((p) => p.name === e.target.value);
                      setEditingReview({
                        ...editingReview,
                        productName: e.target.value,
                        productId: matched?.id || editingReview.productId,
                      });
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="Envirve Botanical Ritual">General Ritual Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Star Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editingReview.rating
                            ? 'text-[#D99A26] fill-[#D99A26]'
                            : 'text-[#DDD7C8]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                  Review Commentary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  placeholder="Share authentic patron feedback regarding texture, herbal aroma, and ritual results..."
                  className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#2F3E2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.featuredOnHome !== false}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, featuredOnHome: e.target.checked })
                    }
                    className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                  />
                  <span>Feature on Storefront Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#2F3E2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.verifiedPurchase}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, verifiedPurchase: e.target.checked })
                    }
                    className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                  />
                  <span>Mark as Verified Customer</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#2F3E2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.isApproved}
                    onChange={(e) =>
                      setEditingReview({ ...editingReview, isApproved: e.target.checked })
                    }
                    className="text-[#2D5A27] focus:ring-[#2D5A27] rounded"
                  />
                  <span>Approved & Live (Visible to public)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTAGRAM / BOTANICAL JOURNEY MODAL (ADD / EDIT PHOTO OR VIDEO / BATCH MULTI-POST) */}
      {isInstagramModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#ECE7DA] pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1B3218]">
                  {editingInstagramId
                    ? 'Edit Botanical Journey Media'
                    : instagramModalTab === 'batch'
                    ? 'Multi-Paste Posts (Botanical Journey)'
                    : 'Add Photo or Video to Botanical Journey'}
                </h3>
                <p className="text-xs text-[#6F7E6D]">
                  {instagramModalTab === 'batch'
                    ? 'Paste multiple links or select multiple files at once to publish in bulk.'
                    : 'Curate remote content from your Instagram page to display on the public storefront.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(false)}
                className="p-1 text-[#7A8778] hover:text-black rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs (Only when adding new posts) */}
            {!editingInstagramId && (
              <div className="flex border-b border-[#ECE7DA] gap-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInstagramModalTab('single')}
                  className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
                    instagramModalTab === 'single'
                      ? 'border-[#2D5A27] text-[#2D5A27]'
                      : 'border-transparent text-[#717E6F] hover:text-[#1B3218]'
                  }`}
                >
                  Single Post
                </button>
                <button
                  type="button"
                  onClick={() => setInstagramModalTab('batch')}
                  className={`pb-2.5 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    instagramModalTab === 'batch'
                      ? 'border-[#2D5A27] text-[#2D5A27]'
                      : 'border-transparent text-[#717E6F] hover:text-[#1B3218]'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Paste Multiple Posts (Bulk Import)</span>
                </button>
              </div>
            )}

            {/* BATCH MULTI-POST FORM */}
            {instagramModalTab === 'batch' && !editingInstagramId ? (
              <form onSubmit={handleSaveBatchInstagram} className="space-y-4">
                <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EDE8DC] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1B3218] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                      Multi-Post Fast Importer
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const exampleText = [
                          'https://images.unsplash.com/photo-1540555700478-4be289fbecef | Pure herbal oils slow-infused with mountain rosemary. #EnvirveNaturals | 290',
                          'https://images.unsplash.com/photo-1608248597359-548455b57d60 | Hand-poured cold-process artisan botanical bars. #OrganicLiving | 215',
                          'https://images.unsplash.com/photo-1556228720-195a672e8a03 | Sacred botanical scalp nectar formulated with wild amla and reetha. #CleanBeauty | 340',
                        ].join('\n');
                        setBatchPasteText(exampleText);
                        showToast('Example botanical posts loaded into paste box!');
                      }}
                      className="text-[11px] text-[#2D5A27] underline hover:text-[#173014] font-medium cursor-pointer"
                    >
                      Paste Botanical Examples
                    </button>
                  </div>
                  <p className="text-[11px] text-[#556453] leading-relaxed">
                    Paste multiple Instagram links, photo URLs, or video links below (one per line). Format can be pure URLs or <code className="bg-white px-1.5 py-0.5 rounded text-[#2D5A27] border border-[#DDD7C8]">URL | Caption | Likes</code>. You can also select multiple files from your device.
                  </p>
                </div>

                {/* Multi-URL Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#3C4C38]">
                      Paste Multiple URLs / Links (One Per Line) *
                    </label>
                    <span className="text-[11px] font-mono text-[#2D5A27] font-semibold">
                      {getParsedBatchPosts().length} Post(s) Ready
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={batchPasteText}
                    onChange={(e) => setBatchPasteText(e.target.value)}
                    placeholder={`https://www.instagram.com/p/DB12345/\nhttps://images.unsplash.com/.../photo.jpg | Handcrafted herbal soap | 240\nhttps://assets.mixkit.co/.../video.mp4 | Slow botanical infusion | 310`}
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-3 text-xs rounded-xl font-mono text-[#1C3619] leading-relaxed focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                {/* Multiple Files Uploader */}
                <div className="p-3.5 bg-white rounded-xl border border-[#DDD7C8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="text-xs font-semibold text-[#1B3218] block">
                      Or Select Multiple Photos / Videos from Device
                    </span>
                    <span className="text-[11px] text-[#6E7B6C]">
                      Choose several images (.jpg, .png, .webp) or videos (.mp4) from your device at once.
                    </span>
                  </div>
                  <label className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EEF5EC] border border-[#2D5A27] text-[#2D5A27] text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingBatchFiles ? 'Processing Files...' : 'Select Multiple Files'}</span>
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
                      Default Caption (Used if line has no custom text)
                    </label>
                    <input
                      type="text"
                      value={batchDefaultCaption}
                      onChange={(e) => setBatchDefaultCaption(e.target.value)}
                      placeholder="Pure botanical care & mindful everyday rituals. #envirvenaturals"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
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
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619]"
                    />
                  </div>
                </div>

                {/* Live Preview List */}
                {getParsedBatchPosts().length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1B3218] uppercase tracking-wider">
                        Live Preview Queue ({getParsedBatchPosts().length} Posts)
                      </span>
                      {batchUploadedItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setBatchUploadedItems([])}
                          className="text-[11px] text-[#A63A3A] underline hover:text-red-700 cursor-pointer"
                        >
                          Clear Uploaded Files ({batchUploadedItems.length})
                        </button>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-[#ECE7DA] p-2.5 rounded-xl bg-[#FAF9F5]">
                      {getParsedBatchPosts().map((post, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-[#EDE8DC] text-xs">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-[#EEF5EC] text-[#2D5A27] font-mono text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded bg-black/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {post.mediaType === 'video' ? (
                                <video src={resolveMediaSrc(post.videoUrl)} className="w-full h-full object-cover" muted playsInline />
                              ) : (
                                <img src={resolveMediaSrc(post.imageUrl)} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 bg-[#F2EEE4] text-[#334230] text-[9px] rounded font-mono uppercase">
                                  {post.mediaType}
                                </span>
                                <span className="text-[10px] text-[#717E6F]">
                                  ❤️ {post.likes} likes
                                </span>
                              </div>
                              <span className="text-[#1B3218] font-medium truncate block max-w-md">
                                {post.caption}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                  <button
                    type="button"
                    onClick={() => setIsInstagramModalOpen(false)}
                    className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={getParsedBatchPosts().length === 0}
                    className="px-6 py-2 bg-[#2D5A27] hover:bg-[#1E4119] disabled:bg-gray-400 text-white text-xs uppercase tracking-widest font-semibold rounded transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E5C765]" />
                    <span>Add All ({getParsedBatchPosts().length}) Posts to Botanical Journey</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SINGLE POST FORM */
              <form onSubmit={handleSaveInstagram} className="space-y-4">
                {/* Media Type Toggle: Photo vs Video */}
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1.5">
                    Select Media Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInstagramForm({ ...instagramForm, mediaType: 'image' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        instagramForm.mediaType !== 'video'
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs'
                          : 'bg-[#FAF9F5] text-[#42523E] border-[#DDD7C8] hover:bg-white'
                      }`}
                    >
                      <span>📷 Photo / Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstagramForm({ ...instagramForm, mediaType: 'video' })}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        instagramForm.mediaType === 'video'
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs'
                          : 'bg-[#FAF9F5] text-[#42523E] border-[#DDD7C8] hover:bg-white'
                      }`}
                    >
                      <span>▶ Video / Reel</span>
                    </button>
                  </div>
                </div>

                {/* Photo Input (Upload or URL) */}
                {instagramForm.mediaType !== 'video' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#3C4C38]">
                        Photo / Image Source *
                      </label>
                      <label className="text-[11px] text-[#2D5A27] font-semibold underline cursor-pointer hover:text-[#193516]">
                        Upload Photo File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              showToast(`Compressing & preparing "${file.name}"...`);
                              compressImageFile(file)
                                .then((optimizedUrl) => {
                                  setInstagramForm((prev) => ({
                                    ...prev,
                                    imageUrl: optimizedUrl,
                                    mediaType: 'image',
                                  }));
                                  showToast(`Photo "${file.name}" optimized & loaded.`);
                                })
                                .catch((err) => {
                                  console.warn('Photo compression error:', err);
                                  showToast('Could not process photo file.');
                                });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      required={!instagramForm.imageUrl}
                      value={instagramForm.imageUrl}
                      onChange={(e) => setInstagramForm({ ...instagramForm, imageUrl: e.target.value })}
                      placeholder="Paste remote image URL (https://...)"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                ) : (
                  /* Video Input (Upload or URL) */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#3C4C38]">
                        Video Source (.mp4 / .webm) *
                      </label>
                      <label className="text-[11px] text-[#2D5A27] font-semibold underline cursor-pointer hover:text-[#193516]">
                        Upload Video File
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              showToast(`Processing video "${file.name}"...`);
                              processVideoUpload(file)
                                .then((res) => {
                                  setInstagramForm((prev) => ({
                                    ...prev,
                                    videoUrl: res.videoUrl,
                                    imageUrl: res.posterUrl || prev.imageUrl,
                                    mediaType: 'video',
                                  }));
                                  showToast(`Video "${file.name}" (${res.sizeMb} MB) processed with thumbnail!`);
                                })
                                .catch((err) => {
                                  console.warn('Video processing error:', err);
                                  showToast('Could not process video file.');
                                });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      required={!instagramForm.videoUrl && !instagramForm.imageUrl}
                      value={instagramForm.videoUrl}
                      onChange={(e) =>
                        setInstagramForm({
                          ...instagramForm,
                          videoUrl: e.target.value,
                        })
                      }
                      placeholder="Paste remote video URL (https://.../reel.mp4)"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                    <p className="text-[11px] text-[#717E6F]">
                      Supports video files (.mp4/.webm) or remote video/reel stream URLs. A poster thumbnail is automatically created.
                    </p>
                  </div>
                )}

                {/* Media Live Preview */}
                {(instagramForm.imageUrl || instagramForm.videoUrl) && (
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE8DC] flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {instagramForm.mediaType === 'video' ? (
                        <video
                          src={resolveMediaSrc(instagramForm.videoUrl || instagramForm.imageUrl)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={resolveMediaSrc(instagramForm.imageUrl)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-xs text-[#52634F] min-w-0">
                      <span className="font-semibold text-[#1C3619] block">
                        Live Media Preview ({instagramForm.mediaType === 'video' ? 'Video' : 'Photo'})
                      </span>
                      <p className="text-[11px] text-[#717E6F] truncate">
                        Ready to showcase on public homepage.
                      </p>
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                    Caption / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={instagramForm.caption}
                    onChange={(e) => setInstagramForm({ ...instagramForm, caption: e.target.value })}
                    placeholder="e.g. Infusing mountain rosemary and cold-pressed sweet almond nectar for pure scalp vitality. #EnvirveNaturals"
                    className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                {/* Likes & Instagram Post URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Display Likes Count
                    </label>
                    <input
                      type="number"
                      value={instagramForm.likes}
                      onChange={(e) => setInstagramForm({ ...instagramForm, likes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] font-mono focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3C4C38] mb-1">
                      Instagram Post Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={instagramForm.url}
                      onChange={(e) => setInstagramForm({ ...instagramForm, url: e.target.value })}
                      placeholder="https://www.instagram.com/p/..."
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] p-2 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
                  <button
                    type="button"
                    onClick={() => setIsInstagramModalOpen(false)}
                    className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors cursor-pointer shadow-xs"
                  >
                    {editingInstagramId ? 'Update Media' : 'Add to Live Showcase'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG (ZERO WINDOW.CONFIRM) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#DDD7C8] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFEBEB] text-[#B83232] flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#1B3218]">
                  Confirm Deletion
                </h4>
                <p className="text-xs text-[#6F7D6D]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#4F5E4C] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1C3619]">"{deleteTarget.name}"</strong>? It will immediately be removed from your catalog and storefront across desktop and mobile.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#ECE7DA]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-[#DDD7C8] text-xs font-semibold rounded hover:bg-[#FAF9F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-[#B83232] hover:bg-[#9B2525] text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors cursor-pointer shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PICTURE EDITOR MODAL FOR JOURNAL / ARTICLES */}
      {blogPictureEditorConfig && (
        <PictureEditorModal
          isOpen={isBlogPictureEditorOpen}
          onClose={() => setIsBlogPictureEditorOpen(false)}
          initialImage={blogPictureEditorConfig.initialUrl}
          initialCaption={blogPictureEditorConfig.initialCaption}
          initialAlt={blogPictureEditorConfig.initialAlt}
          title={blogPictureEditorConfig.title}
          onSave={handleBlogPictureEditorSave}
        />
      )}

      {/* PICTURE EDITOR MODAL FOR PHILOSOPHY CRAFTSMANSHIP PICTURE */}
      <PictureEditorModal
        isOpen={isPhilosophyPictureEditorOpen}
        onClose={() => setIsPhilosophyPictureEditorOpen(false)}
        initialImage={philosophyForm.craftImageUrl || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
        title="Edit Philosophy Craftsmanship Picture"
        onSave={(result) => {
          if (result.url) {
            setPhilosophyForm((prev) => ({ ...prev, craftImageUrl: result.url }));
            updatePhilosophyConfig({ craftImageUrl: result.url });
            showToast('Craftsmanship picture updated successfully!');
          }
          setIsPhilosophyPictureEditorOpen(false);
        }}
      />

      {/* PICTURE EDITOR MODAL FOR THE ENVIRVE PROMISE PICTURE */}
      <PictureEditorModal
        isOpen={isPhilosophyPromisePictureEditorOpen}
        onClose={() => setIsPhilosophyPromisePictureEditorOpen(false)}
        initialImage={philosophyForm.promiseImageUrl || siteSettings.ourPromiseImageUrl || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg'}
        initialCaption={philosophyForm.promiseQuote || siteSettings.ourPromiseQuote || ''}
        title="Edit The Envirve Promise Picture & Quote"
        onSave={(result) => {
          if (result.url) {
            setPhilosophyForm((prev) => ({
              ...prev,
              promiseImageUrl: result.url,
              ...(result.caption ? { promiseQuote: result.caption } : {}),
            }));
            updatePhilosophyConfig({
              promiseImageUrl: result.url,
              ...(result.caption ? { promiseQuote: result.caption } : {}),
            });
            updateSiteSettings({
              ourPromiseImageUrl: result.url,
              ...(result.caption ? { ourPromiseQuote: result.caption } : {}),
            });
            showToast('The Envirve Promise picture and quote updated successfully!');
          }
          setIsPhilosophyPromisePictureEditorOpen(false);
        }}
      />
    </div>
  );
};
