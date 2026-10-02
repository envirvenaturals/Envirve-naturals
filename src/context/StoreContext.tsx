import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { firestoreService, seedInitialFirestoreData } from '../firebase/firestoreService';
import { safeLocalStorageSet, safeLocalStorageGet } from '../utils/safeStorage';
import {
  Product,
  CartItem,
  Order,
  Ingredient,
  BlogPost,
  Review,
  Coupon,
  HeroConfig,
  SiteSettings,
  OrderStatus,
  InstagramPost,
  PhilosophyConfig,
} from '../types';

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  deliveryFee: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartTotal: number;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;
  markOrderEmailSent: (orderId: string) => void;
  getOrderByIdOrPhone: (query: string) => Order | undefined;

  // Ingredients
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Blog
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
  updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'isApproved'>) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  toggleReviewApproval: (id: string) => void;
  deleteReview: (id: string) => void;

  // Instagram Feed
  instagramPosts: InstagramPost[];
  addInstagramPost: (post: Omit<InstagramPost, 'id'>) => void;
  addMultipleInstagramPosts: (posts: Array<Omit<InstagramPost, 'id'>>) => void;
  updateInstagramPost: (id: string, updates: Partial<InstagramPost>) => void;
  deleteInstagramPost: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCouponActive: (id: string) => void;
  deleteCoupon: (id: string) => void;

  // Hero & CMS
  heroConfig: HeroConfig;
  updateHeroConfig: (updates: Partial<HeroConfig>) => void;

  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (updates: Partial<SiteSettings>) => void;

  // Philosophy CMS
  philosophyConfig: PhilosophyConfig;
  updatePhilosophyConfig: (updates: Partial<PhilosophyConfig>) => void;

  // Admin Auth & Mode
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  activeView: string; // 'home' | 'shop' | 'product' | 'ingredients' | 'about' | 'journal' | 'cart' | 'checkout' | 'account' | 'tracking' | 'admin'
  setActiveView: (view: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Seed Data
const initialHeroConfig: HeroConfig = {
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-water-falling-on-green-leaves-41656-large.mp4',
  useVideo: true, // Only video as hero
  fallbackImageUrl: '', // Picture setup removed
  heading: 'Nature, thoughtfully made.',
  subheading: 'Pure herbal formulations crafted with sacred botanicals for daily rituals that nourish hair, skin, and spirit.',
  slogan: 'nature.care.you.',
  ctaText: 'Explore the Collection',
  ctaLink: '#collection',
  secondaryCtaText: 'Our Philosophy',
  secondaryCtaLink: '#philosophy',
  overlayOpacity: 35,
  autoplay: true,
  loop: true,
  muted: true,
};

const initialInstagramPosts: InstagramPost[] = [
  {
    id: 'insta-1',
    mediaType: 'image',
    imageUrl: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    caption: 'Pure organic botanicals for mindful daily rituals. Infused with wild mountain rosemary and amla. #EnvirveNaturals',
    likes: 248,
    url: 'https://www.instagram.com/envirvenaturals',
  },
  {
    id: 'insta-2',
    mediaType: 'image',
    imageUrl: '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
    caption: 'Hair Balance Herbal Shampoo: Cleansing powered by wild Reetha and Shikakai saponins. Zero sulfates.',
    likes: 184,
    url: 'https://www.instagram.com/envirvenaturals',
  },
  {
    id: 'insta-3',
    mediaType: 'image',
    imageUrl: '/src/assets/images/product_botanical_oil_1790696473722.jpg',
    caption: 'Golden rosemary and cold-pressed sweet almond scalp nectar. Nourish your roots deeply.',
    likes: 312,
    url: 'https://www.instagram.com/envirvenaturals',
  },
  {
    id: 'insta-4',
    mediaType: 'image',
    imageUrl: '/src/assets/images/product_glow_soap_1790696485480.jpg',
    caption: 'Fresh batch of Beetroot Glow artisan cold-process bars curing in our botanical studio.',
    likes: 219,
    url: 'https://www.instagram.com/envirvenaturals',
  },
];

const initialSiteSettings: SiteSettings = {
  brandName: 'Envirve Naturals',
  slogan: 'nature.care.you.',
  ourPromiseImageUrl: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
  ourPromiseQuote: 'Care formulated backward from pure botanical wisdom.',
  announcementBar: {
    enabled: true,
    text: 'Naturally crafted. Thoughtfully made. Complimentary shipping on orders over Rs 2,500.',
    link: '#shop',
  },
  currency: 'PKR',
  currencySymbol: 'Rs',
  freeShippingThreshold: 2500,
  defaultDeliveryFee: 350,
  contactEmail: 'envirvenaturals@gmail.com',
  contactPhone: '+92 300 0000000',
  whatsappNumber: '923000000000',
  instagramHandle: '@envirvenaturals',
  instagramUrl: 'https://www.instagram.com/envirvenaturals',
  facebookUrl: 'https://facebook.com/envirvenaturals',
  adminPasswordHash: 'envirvenaturals1313', // default secure password
};

const initialPhilosophyConfig: PhilosophyConfig = {
  introKicker: 'The Origin of Envirve',
  introHeading: 'Rooted in nature. Thoughtfully made for you.',
  introQuote: '“nature . care . you .”',
  introParagraph:
    'Envirve Naturals was born out of a yearning for simplicity, truth, and genuine botanical care. In an industry saturated with chemical cleansers disguised as natural remedies, we returned to first principles: ancient herbal infusions, cold-pressed seed oils, and pure plant saponins that nurture both body and earth.',
  craftSectionTag: 'Our Craftsmanship',
  craftHeading: 'Slow infusions, unhurried methods.',
  craftParagraph1:
    'Industrial cosmetics prioritize shelf stability over bio-activity, boiling herbs at extreme temperatures that extinguish delicate phytochemicals. At Envirve, our rosemary, bhringraj, and amla extractions undergo gentle sun infusions and low-temperature cold-pressing.',
  craftParagraph2:
    'The result is a sensory experience unlike anything else: living botanicals whose earthy aromas ground your senses and whose clean formulas rinse away leaving your hair bouncy and skin radiant.',
  craftImageUrl: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
  craftButtonText: 'Discover the Formulations',
  promiseImageUrl: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
  promiseQuote: 'Care formulated backward from pure botanical wisdom.',
  pillarsSectionTag: 'Our Core Standards',
  pillarsHeading: 'The Envirve Promise',
  pillars: [
    {
      id: 'pillar-1',
      icon: 'Sprout',
      title: 'Nature-Led Formulation',
      desc: 'We formulate backward from nature’s most resilient botanicals—amla, wild reetha, fragrant rosemary, and cold-pressed sweet almond—relying on active plant intelligence rather than chemical shortcuts.',
    },
    {
      id: 'pillar-2',
      icon: 'HeartHandshake',
      title: 'Thoughtfully Handcrafted',
      desc: 'Every shampoo batch, artisan soap block, and botanical hair elixir is slowly prepared in limited micro-batches to guarantee freshness, shelf life, and concentrated nutrient potency.',
    },
    {
      id: 'pillar-3',
      icon: 'Shield',
      title: 'Total Ingredient Transparency',
      desc: 'Zero sulfates (SLS/SLES), zero synthetic silicones, zero parabens, zero phthalates, and zero artificial dyes. Every single ingredient is disclosed on our bottles and botanical library.',
    },
    {
      id: 'pillar-4',
      icon: 'Sparkles',
      title: 'Everyday Mindful Rituals',
      desc: 'Care is not an occasional indulgence; it is the daily rhythm of honoring your body. Our textures, natural aromas, and gentle formulas turn routine hygiene into moments of grounding peace.',
    },
  ],
  ethicalKicker: 'Ethical Sourcing & Earth Respect',
  ethicalHeading: 'Packaged with conscience. Made without compromise.',
  ethicalDescription:
    'We package in amber recyclable glass and reusable aluminum tins whenever possible. Our labels are printed with non-toxic soy inks, and every box is secured with compostable kraft tape.',
};

const initialProducts: Product[] = [
  {
    id: 'prod-shampoo-1',
    name: 'Hair Balance Herbal Shampoo',
    slug: 'hair-balance-herbal-shampoo',
    sku: 'ENV-HBS-250',
    category: 'Herbal Shampoos',
    price: 650,
    compareAtPrice: 750,
    shortDesc: 'A rich infusion of Amla, Reetha, Shikakai, and Rosemary to cleanse and balance scalp flora.',
    description: 'Our signature shampoo harnesses cold-pressed plant extracts and natural saponins. Formulated without sulfates, synthetic parabens, or harsh detergents, it purifies the scalp gently while preserving essential lipid barriers. Amla strengthens the roots, Reetha creates a velvet foam, and rosemary stimulates active circulation for hair that feels resilient and featherlight.',
    images: [
      '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
      '/src/assets/images/product_botanical_oil_1790696473722.jpg',
    ],
    badge: 'BESTSELLER',
    rating: 4.9,
    reviewsCount: 38,
    stock: 45,
    lowStockThreshold: 10,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    volumeSize: '250 ml / 8.4 fl oz',
    ingredients: ['Amla', 'Reetha', 'Shikakai', 'Rosemary Oil', 'Aqua', 'Vegetable Glycerin'],
    benefits: [
      'Gently purifies without stripping natural scalp moisture',
      'Encourages balanced sebum production and scalp comfort',
      'Rich in vitamin C to nurture strand strength and shine',
      'Free from sulfates, parabens, silicones, and artificial dyes',
    ],
    howToUse: 'Massage 1–2 pumps onto wet scalp and roots. Breathe in the earthy herbal scent. Gently work into a creamy lather and rinse thoroughly with cool water.',
    suitableFor: 'All hair types, sensitive scalps, and color-treated hair.',
    pairsWith: ['prod-oil-1', 'prod-conditioner-1'],
  },
  {
    id: 'prod-oil-1',
    name: 'Botanical Nourish Scalp & Hair Oil',
    slug: 'botanical-nourish-scalp-oil',
    sku: 'ENV-BNO-100',
    category: 'Herbal Oils',
    price: 950,
    compareAtPrice: 1100,
    shortDesc: 'Slow-infused rosemary, amla, and cold-pressed sweet almond elixir for profound scalp vitality.',
    description: 'An artisanal hair treatment slowly sun-infused with fresh rosemary leaves, bhringraj, and sweet almond oil. Deeply penetrating yet non-greasy, this golden botanical elixir nurtures dormant follicles, calms irritation, and locks moisture into split or parched ends.',
    images: [
      '/src/assets/images/product_botanical_oil_1790696473722.jpg',
      '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    ],
    badge: 'BESTSELLER',
    rating: 5.0,
    reviewsCount: 52,
    stock: 28,
    lowStockThreshold: 8,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    isPublished: true,
    volumeSize: '100 ml / 3.4 fl oz',
    ingredients: ['Sweet Almond Oil', 'Rosemary Infusion', 'Bhringraj', 'Amla Extract', 'Vitamin E'],
    benefits: [
      'Stimulates microcirculation at the roots for optimal growth environment',
      'Seals hydration into dry strands, reducing frizz and flyaways',
      'Provides antioxidant protection against environmental stressors',
      'Lightweight and absorbs seamlessly without heavy residue',
    ],
    howToUse: 'Dispense 1 full pipette into palms. Part dry hair and massage in circular motions across the scalp. Leave on for 45 minutes or overnight before washing with Hair Balance Shampoo.',
    suitableFor: 'Dry, thinning, flaky, or brittle hair needing restorative care.',
    pairsWith: ['prod-shampoo-1'],
  },
  {
    id: 'prod-soap-1',
    name: 'Beetroot Glow Artisan Botanical Soap',
    slug: 'beetroot-glow-soap',
    sku: 'ENV-BGS-120',
    category: 'Skin Care',
    price: 450,
    compareAtPrice: 500,
    shortDesc: 'Hand-pressed with organic beetroot extract, goat milk, and calming lavender essential oil.',
    description: 'Handcrafted in micro-batches using traditional cold-process soapmaking. Pure organic beetroot extract lends its natural ruby hue and rich antioxidant potency, while goat milk provides lactic acid to refine texture gently. Leaves your skin velvety, soft, and naturally luminous.',
    images: [
      '/src/assets/images/product_glow_soap_1790696485480.jpg',
      '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    ],
    badge: 'NEW',
    rating: 4.8,
    reviewsCount: 24,
    stock: 60,
    lowStockThreshold: 15,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    volumeSize: '120 g / 4.2 oz Bar',
    ingredients: ['Saponified Olive Oil', 'Virgin Coconut Oil', 'Beetroot Extract', 'Goat Milk', 'Lavender Oil'],
    benefits: [
      'Gentle enzymatic exfoliation for an even, glowing skin tone',
      'Soothes inflammation and replenishes moisture barriers',
      'Zero synthetic detergents, phthalates, or artificial colors',
      '100% biodegradable and packaged in tree-free seed paper',
    ],
    howToUse: 'Lather between damp hands until a thick creamy foam forms. Massage over damp face and body in circular strokes. Rinse clean with lukewarm water.',
    suitableFor: 'Normal, dry, and combination skin.',
    pairsWith: ['prod-shampoo-1', 'prod-oil-1'],
  },
  {
    id: 'prod-conditioner-1',
    name: 'Botanical Velvet Conditioner & Rinse',
    slug: 'botanical-velvet-conditioner',
    sku: 'ENV-BVC-200',
    category: 'Natural Conditioners',
    price: 750,
    compareAtPrice: 850,
    shortDesc: 'Raw aloe vera, golden flaxseed gel, and virgin coconut lipids for weightless silkiness.',
    description: 'A botanical rinse that detangles effortlessly without synthetic silicones. Formulated with fresh aloe vera pulp and flaxseed mucilage, it coats each cuticle with breathable plant moisture, leaving hair touchably soft, lustrous, and easy to comb.',
    images: [
      '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
    ],
    badge: 'LIMITED',
    rating: 4.9,
    reviewsCount: 19,
    stock: 35,
    lowStockThreshold: 8,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    isPublished: true,
    volumeSize: '200 ml / 6.7 fl oz',
    ingredients: ['Aloe Vera Leaf Juice', 'Flaxseed Extract', 'Cetearyl Alcohol (Plant Derived)', 'Shea Butter', 'Peppermint Oil'],
    benefits: [
      'Smooths rough hair cuticles without silicone buildup',
      'Imparts natural bounce, slip, and high-shine reflection',
      'Cooling peppermint calms and refreshes the senses',
    ],
    howToUse: 'After cleansing with Hair Balance Shampoo, apply evenly from mid-lengths to ends. Leave for 3 minutes, then rinse gently.',
    suitableFor: 'Fine to medium, chemically treated, or tangly hair.',
    pairsWith: ['prod-shampoo-1'],
  },
  {
    id: 'prod-tonic-1',
    name: 'Herbal Scalp Mist & Botanical Tonic',
    slug: 'herbal-scalp-mist-tonic',
    sku: 'ENV-SMT-150',
    category: 'Hair Care',
    price: 550,
    compareAtPrice: 650,
    shortDesc: 'Pure steam-distilled rosemary hydrolat with witch hazel and tea tree leaf water.',
    description: 'An invigorating leave-in mist formulated to rebalance scalp pH between wash days. Crafted by steam distilling mountain-grown rosemary, this lightweight tonic clarifies residue and soothes itchiness.',
    images: [
      '/src/assets/images/product_botanical_oil_1790696473722.jpg',
    ],
    badge: '',
    rating: 4.7,
    reviewsCount: 15,
    stock: 40,
    lowStockThreshold: 10,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    isPublished: true,
    volumeSize: '150 ml / 5.1 fl oz',
    ingredients: ['Rosemary Hydrolat', 'Hamamelis Virginiana (Witch Hazel)', 'Tea Tree Extract', 'Vegetable Glycerin'],
    benefits: [
      'Refreshes oily roots between wash days without white residue',
      'Tightens pores and cools scalp temperature',
      'Fast-drying and featherweight on fine hair',
    ],
    howToUse: 'Shake well. Spray directly onto clean damp or dry roots. Massage lightly with fingertips. Do not rinse.',
    suitableFor: 'Oily roots, active lifestyles, and post-workout refresh.',
    pairsWith: ['prod-oil-1'],
  },
  {
    id: 'prod-scrub-1',
    name: 'Wild Turmeric & Sandalwood Body Polish',
    slug: 'wild-turmeric-sandalwood-polish',
    sku: 'ENV-WTP-150',
    category: 'Organic Personal Care',
    price: 850,
    compareAtPrice: 950,
    shortDesc: 'Pure Himalayan wild turmeric, fragrant red sandalwood, and raw cane crystals.',
    description: 'An opulent ritual polish combining antioxidant-dense wild kasturi manjal (turmeric) with sustainably harvested sandalwood. Buffs away dull skin cells while enveloping the body in a grounding warm wood fragrance.',
    images: [
      '/src/assets/images/product_glow_soap_1790696485480.jpg',
    ],
    badge: '',
    rating: 5.0,
    reviewsCount: 11,
    stock: 22,
    lowStockThreshold: 5,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    isPublished: true,
    volumeSize: '150 g / 5.3 oz Jar',
    ingredients: ['Cane Sugar', 'Wild Kasturi Manjal', 'Red Sandalwood Powder', 'Sweet Almond Oil', 'Cardamom Seed Oil'],
    benefits: [
      'Gentle dual action: physical polish plus herbal brightening',
      'Transforms into a milky emulsion upon contact with water',
      'Leaves limbs satin-soft without sticky residue',
    ],
    howToUse: 'Scoop a palmful onto damp skin in the bath or shower. Buff in sweeping circular motions towards the heart. Rinse with warm water.',
    suitableFor: 'Dry, lackluster, or sun-drenched skin.',
    pairsWith: ['prod-soap-1'],
  },
];

const initialIngredients: Ingredient[] = [
  {
    id: 'ing-amla',
    name: 'Amla (Indian Gooseberry)',
    botanicalName: 'Phyllanthus emblica',
    origin: 'Subtropical foothills of South Asia',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'Revered in traditional herbal texts for centuries, Amla is one of nature’s richest sources of bio-available Vitamin C, tannins, and amino acids. It reinforces hair strand integrity and provides antioxidant defense against dullness.',
    benefits: ['Fortifies hair roots', 'Enhances natural luster', 'Combats environmental oxidation', 'Soothes dry scalp'],
    featuredInProductIds: ['prod-shampoo-1', 'prod-oil-1'],
  },
  {
    id: 'ing-reetha',
    name: 'Reetha (Soapnut)',
    botanicalName: 'Sapindus mukorossi',
    origin: 'Wild Himalayan valleys',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'The dried berry shells of the soapnut tree contain natural saponins that create a silky, low-pH lather. It removes excess sebum and styling residue without stripping the protective cuticle layer.',
    benefits: ['Natural plant-based cleansing', 'Maintains scalp acidic mantle', 'Hypoallergenic and gentle', 'Zero sulfate chemicals'],
    featuredInProductIds: ['prod-shampoo-1'],
  },
  {
    id: 'ing-shikakai',
    name: 'Shikakai (Fruit for Hair)',
    botanicalName: 'Acacia concinna',
    origin: 'Warm plains of Central Asia',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'Known colloquially as "fruit for hair," the pods of Acacia concinna contain natural astringents and micro-nutrients that condition, detangle, and impart a luminous silk touch.',
    benefits: ['Smooths cuticle scales', 'Assists painless detangling', 'Natural shine enhancer', 'Prevents dry split ends'],
    featuredInProductIds: ['prod-shampoo-1'],
  },
  {
    id: 'ing-rosemary',
    name: 'Mountain Rosemary',
    botanicalName: 'Rosmarinus officinalis',
    origin: 'Organic Mediterranean & High Altitude Valleys',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'A prized aromatic herb rich in carnosic acid and rosmarinic acid. Research demonstrates rosemary’s remarkable ability to support microcirculation around dermal papilla cells, fostering vibrant hair density.',
    benefits: ['Stimulates root microcirculation', 'Clarifies scalp congestion', 'Grounding botanical aroma', 'Antioxidant shielding'],
    featuredInProductIds: ['prod-shampoo-1', 'prod-oil-1', 'prod-tonic-1'],
  },
  {
    id: 'ing-beetroot',
    name: 'Organic Beetroot Extract',
    botanicalName: 'Beta vulgaris',
    origin: 'Cold-pressed from heirloom roots',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'Beetroot contains powerful betalains and nitrates that promote microvascular radiance. In artisan soap, it delivers vital enzymes and gentle polishing qualities for soft, dewy skin.',
    benefits: ['Natural radiant skin glow', 'Rich in betalain antioxidants', 'Soothes irritation', 'Plant-derived nutrient bath'],
    featuredInProductIds: ['prod-soap-1'],
  },
  {
    id: 'ing-almond',
    name: 'Cold-Pressed Sweet Almond',
    botanicalName: 'Prunus amygdalus dulcis',
    origin: 'Sun-drenched orchards',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    description: 'Extracted purely via hydraulic cold-pressing to preserve vitamins E, A, and omega-9 fatty acids. Absorbs deeply into hair shafts and stratum corneum without pore-clogging film.',
    benefits: ['Deep lipid replenishment', 'High in natural Vitamin E', 'Seals cuticle moisture', 'Non-comedogenic softness'],
    featuredInProductIds: ['prod-oil-1', 'prod-scrub-1'],
  },
];

const initialBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Ancient Ritual of Hair Oiling: Modern Science & Sacred Care',
    slug: 'ancient-ritual-hair-oiling-modern-science',
    excerpt: 'How slow botanical infusions of rosemary, amla, and sweet almond awaken the scalp and restore natural vitality.',
    content: `For generations, the weekly ritual of hair oiling was not merely a cosmetic routine—it was a mindful pause, a sacred gesture of self-care passed down through hands of care. 

In modern trichology, this ancient practice is validated. Scalp skin contains over 100,000 follicular pores that require active microcirculation and barrier lipid support. When you apply nutrient-dense cold-pressed oils enriched with rosemary and amla, you create an ideal microclimate for follicular endurance.

### The 3-Step Evening Ritual
1. Warm 1–2 pipettes of Botanical Nourish Oil between your palms.
2. Section hair and massage using circular pad movements, applying moderate pressure at the crown and temples.
3. Allow the botanicals to infuse for at least 45 minutes or overnight under a silk wrap, washing out with gentle sulfate-free shampoo.`,
    category: 'Hair Care',
    readTime: '4 min read',
    date: 'March 2026',
    author: 'Envirve Botanical Team',
    image: '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    isPublished: true,
  },
  {
    id: 'blog-2',
    title: 'Why We Reject Synthetic Sulfates: Understanding Botanical Cleansing',
    slug: 'why-we-reject-synthetic-sulfates',
    excerpt: 'Explore how wild soapnut (Reetha) and shikakai cleanse thoroughly while honoring your scalp’s natural lipid mantle.',
    content: `Commercial shampoos often lean on sodium lauryl sulfate (SLS) to create voluminous, billowing bubbles. Yet these harsh surfactants indiscriminately strip away natural sebum, triggering a rebound cycle of oiliness and irritation.

At Envirve Naturals, we look to the botanical wisdom of wild-harvested Reetha and Shikakai. These time-tested plants contain saponins—nature’s amphiphilic molecules that bind to grime and rinse cleanly with water, leaving the skin barrier intact and calm.`,
    category: 'Ingredients',
    readTime: '5 min read',
    date: 'February 2026',
    author: 'Envirve Botanical Team',
    image: '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg',
    isPublished: true,
  },
  {
    id: 'blog-3',
    title: 'Mindful Morning Rituals for Radiant, Dewy Skin',
    slug: 'mindful-morning-rituals-radiant-dewy-skin',
    excerpt: 'Simple, calming steps to ground your day with organic cold-pressed soaps and herbal botanical mists.',
    content: `A beauty ritual is at its most potent when it transforms everyday hygiene into a moment of sensory connection. Start by drinking warm spring water, then cleanse the face with our cold-process Beetroot Glow soap, noticing the earthy sweet scent and creamy lather. Pat dry gently with unbleached organic linen.`,
    category: 'Rituals',
    readTime: '3 min read',
    date: 'January 2026',
    author: 'Envirve Editorial',
    image: '/src/assets/images/product_glow_soap_1790696485480.jpg',
    isPublished: true,
  },
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-shampoo-1',
    productName: 'Hair Balance Herbal Shampoo',
    authorName: 'Ayesha K.',
    rating: 5,
    date: '2 weeks ago',
    comment: 'After years of chemical shampoos that irritated my scalp, this feels like an antidote. It smells like pure herbal tea and leaves my hair soft and balanced.',
    verifiedPurchase: true,
    isApproved: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-oil-1',
    productName: 'Botanical Nourish Scalp & Hair Oil',
    authorName: 'Bilal R.',
    rating: 5,
    date: '1 month ago',
    comment: 'The scent of real rosemary and almond is wonderful. Non-sticky, washes out easily with the shampoo, and my hair feels visibly thicker at the crown.',
    verifiedPurchase: true,
    isApproved: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-soap-1',
    productName: 'Beetroot Glow Artisan Botanical Soap',
    authorName: 'Zainab M.',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Luxurious lather and lovely natural pink color. Doesn’t dry out my skin like normal soap bars. Reordering 3 more bars today.',
    verifiedPurchase: true,
    isApproved: true,
  },
];

const initialCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 1000,
    expiresAt: '2027-12-31',
    isActive: true,
    usageCount: 42,
  },
  {
    id: 'coup-2',
    code: 'NATUREFREE',
    type: 'fixed',
    value: 350,
    minOrder: 1500,
    expiresAt: '2027-12-31',
    isActive: true,
    usageCount: 18,
  },
];

const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ENV-9482',
    date: '2026-09-28',
    customerName: 'Fatima Tariq',
    customerPhone: '0301-8492019',
    customerEmail: 'fatima.t@example.com',
    shippingAddress: 'House 42, Street 8, Phase 5, DHA',
    city: 'Lahore',
    postalCode: '54000',
    items: [
      {
        productId: 'prod-shampoo-1',
        productName: 'Hair Balance Herbal Shampoo',
        price: 650,
        quantity: 2,
        image: '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
      },
      {
        productId: 'prod-oil-1',
        productName: 'Botanical Nourish Scalp & Hair Oil',
        price: 950,
        quantity: 1,
        image: '/src/assets/images/product_botanical_oil_1790696473722.jpg',
      },
    ],
    subtotal: 2250,
    deliveryFee: 350,
    discountAmount: 0,
    total: 2600,
    status: 'Shipped',
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    trackingNumber: 'TCS-89241029',
    courierName: 'TCS Express',
    notes: 'Please call before delivery.',
  },
  {
    id: 'ord-102',
    orderNumber: 'ENV-9483',
    date: '2026-09-29',
    customerName: 'Ahmed Hassan',
    customerPhone: '0321-4829103',
    customerEmail: 'ahmed.h@example.com',
    shippingAddress: 'Apartment 4B, Creek Vista, Clifton',
    city: 'Karachi',
    postalCode: '75600',
    items: [
      {
        productId: 'prod-soap-1',
        productName: 'Beetroot Glow Artisan Botanical Soap',
        price: 450,
        quantity: 3,
        image: '/src/assets/images/product_glow_soap_1790696485480.jpg',
      },
      {
        productId: 'prod-shampoo-1',
        productName: 'Hair Balance Herbal Shampoo',
        price: 650,
        quantity: 1,
        image: '/src/assets/images/product_herbal_shampoo_1790696462766.jpg',
      },
    ],
    subtotal: 2000,
    deliveryFee: 350,
    discountAmount: 200,
    total: 2150,
    status: 'Processing',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    trackingNumber: 'LEO-4019241',
    courierName: 'Leopard Courier',
  },
];

// Sanitizers to prevent runtime white-screen crashes from missing fields or corrupt cloud payloads
export const sanitizePhilosophyConfig = (data: Partial<PhilosophyConfig> | null | undefined): PhilosophyConfig => {
  if (!data) return initialPhilosophyConfig;
  return {
    introKicker: data.introKicker || initialPhilosophyConfig.introKicker,
    introHeading: data.introHeading || initialPhilosophyConfig.introHeading,
    introQuote: data.introQuote || initialPhilosophyConfig.introQuote,
    introParagraph: data.introParagraph || initialPhilosophyConfig.introParagraph,
    craftSectionTag: data.craftSectionTag || initialPhilosophyConfig.craftSectionTag,
    craftHeading: data.craftHeading || initialPhilosophyConfig.craftHeading,
    craftParagraph1: data.craftParagraph1 || initialPhilosophyConfig.craftParagraph1,
    craftParagraph2: data.craftParagraph2 || initialPhilosophyConfig.craftParagraph2,
    craftImageUrl: data.craftImageUrl || initialPhilosophyConfig.craftImageUrl,
    craftButtonText: data.craftButtonText || initialPhilosophyConfig.craftButtonText,
    promiseImageUrl: data.promiseImageUrl || initialPhilosophyConfig.promiseImageUrl || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    promiseQuote: data.promiseQuote || initialPhilosophyConfig.promiseQuote || 'Care formulated backward from pure botanical wisdom.',
    pillarsSectionTag: data.pillarsSectionTag || initialPhilosophyConfig.pillarsSectionTag,
    pillarsHeading: data.pillarsHeading || initialPhilosophyConfig.pillarsHeading,
    pillars: Array.isArray(data.pillars) && data.pillars.length > 0 ? data.pillars : initialPhilosophyConfig.pillars,
    ethicalKicker: data.ethicalKicker || initialPhilosophyConfig.ethicalKicker,
    ethicalHeading: data.ethicalHeading || initialPhilosophyConfig.ethicalHeading,
    ethicalDescription: data.ethicalDescription || initialPhilosophyConfig.ethicalDescription,
  };
};

export const sanitizeSiteSettings = (data: Partial<SiteSettings> | null | undefined): SiteSettings => {
  if (!data) return initialSiteSettings;
  return {
    ...initialSiteSettings,
    ...data,
    announcementBar: {
      ...initialSiteSettings.announcementBar,
      ...(data.announcementBar || {}),
    },
    ourPromiseImageUrl: data.ourPromiseImageUrl || initialSiteSettings.ourPromiseImageUrl || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    ourPromiseQuote: data.ourPromiseQuote || initialSiteSettings.ourPromiseQuote || 'Care formulated backward from pure botanical wisdom.',
  };
};

export const sanitizeBlogPost = (data: Partial<BlogPost> | null | undefined): BlogPost => {
  return {
    id: data?.id || 'blog-' + Date.now(),
    title: data?.title || 'Botanical Journal Entry',
    slug: data?.slug || 'botanical-entry',
    excerpt: data?.excerpt || '',
    content: data?.content || '',
    category: data?.category || 'Rituals',
    readTime: data?.readTime || '4 min read',
    date: data?.date || 'Current Season',
    author: data?.author || 'Envirve Editorial',
    image: data?.image || '/src/assets/images/hero_botanical_ritual_1790696451263.jpg',
    imageCaption: data?.imageCaption || '',
    additionalImages: Array.isArray(data?.additionalImages) ? data.additionalImages : [],
    isPublished: data?.isPublished !== false,
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    return safeLocalStorageGet('envirve_products_v2', initialProducts);
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeLocalStorageGet('envirve_cart_v2', []);
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return safeLocalStorageGet('envirve_wishlist_v2', []);
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    return safeLocalStorageGet('envirve_orders_v2', initialOrders);
  });

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    return safeLocalStorageGet('envirve_ingredients_v2', initialIngredients);
  });

  // Blog Posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    return safeLocalStorageGet('envirve_blog_v2', initialBlogPosts);
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    return safeLocalStorageGet('envirve_reviews_v2', initialReviews);
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return safeLocalStorageGet('envirve_coupons_v2', initialCoupons);
  });

  // Instagram Feed
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>(() => {
    return safeLocalStorageGet('envirve_instagram_v2', initialInstagramPosts);
  });

  // Hero & Settings
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => {
    const parsed = safeLocalStorageGet<HeroConfig>('envirve_hero_v2', initialHeroConfig);
    if (parsed && parsed.useVideo === undefined) parsed.useVideo = true;
    return parsed;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    return safeLocalStorageGet('envirve_settings_v2', initialSiteSettings);
  });

  const [philosophyConfig, setPhilosophyConfig] = useState<PhilosophyConfig>(() => {
    return safeLocalStorageGet('envirve_philosophy_v2', initialPhilosophyConfig);
  });

  // Navigation / Views
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Admin Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeLocalStorageGet('envirve_admin_session', false);
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Sync to safe localStorage (Quota-safe & non-blocking)
  useEffect(() => {
    safeLocalStorageSet('envirve_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeLocalStorageSet('envirve_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorageSet('envirve_wishlist_v2', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    safeLocalStorageSet('envirve_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorageSet('envirve_ingredients_v2', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    safeLocalStorageSet('envirve_blog_v2', JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    safeLocalStorageSet('envirve_reviews_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeLocalStorageSet('envirve_coupons_v2', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    safeLocalStorageSet('envirve_hero_v2', JSON.stringify(heroConfig));
  }, [heroConfig]);

  useEffect(() => {
    safeLocalStorageSet('envirve_settings_v2', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    safeLocalStorageSet('envirve_instagram_v2', JSON.stringify(instagramPosts));
  }, [instagramPosts]);

  useEffect(() => {
    safeLocalStorageSet('envirve_philosophy_v2', JSON.stringify(philosophyConfig));
  }, [philosophyConfig]);

  // Firebase Firestore Real-time Sync & Initialization
  useEffect(() => {
    // 1. Initial Seed to Cloud Firestore
    seedInitialFirestoreData({
      products: initialProducts,
      ingredients: initialIngredients,
      blogPosts: initialBlogPosts,
      reviews: initialReviews,
      coupons: initialCoupons,
      heroConfig: initialHeroConfig,
      siteSettings: initialSiteSettings,
      instagramPosts: initialInstagramPosts,
      philosophyConfig: initialPhilosophyConfig,
    });

    // 2. Real-time Firestore Listeners
    const isDbInitialized = () => localStorage.getItem('envirve_db_initialized') === 'true';

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const cloudProducts: Product[] = [];
      snap.forEach((doc) => cloudProducts.push(doc.data() as Product));
      if (!snap.empty || isDbInitialized()) {
        setProducts(cloudProducts);
      }
    }, (err) => console.warn('Products sync notice:', err));

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const cloudOrders: Order[] = [];
      snap.forEach((doc) => cloudOrders.push(doc.data() as Order));
      cloudOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(cloudOrders);
    }, (err) => console.warn('Orders sync notice:', err));

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      const cloudReviews: Review[] = [];
      snap.forEach((doc) => cloudReviews.push(doc.data() as Review));
      if (!snap.empty || isDbInitialized()) {
        setReviews(cloudReviews);
      }
    }, (err) => console.warn('Reviews sync notice:', err));

    const unsubHero = onSnapshot(doc(db, 'heroConfig', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as HeroConfig;
        setHeroConfig(data);
      }
    }, (err) => console.warn('Hero sync notice:', err));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = sanitizeSiteSettings(docSnap.data() as SiteSettings);
        setSiteSettings(data);
      }
    }, (err) => console.warn('Settings sync notice:', err));

    const unsubIngredients = onSnapshot(collection(db, 'ingredients'), (snap) => {
      const cloudIng: Ingredient[] = [];
      snap.forEach((doc) => cloudIng.push(doc.data() as Ingredient));
      if (!snap.empty || isDbInitialized()) {
        setIngredients(cloudIng);
      }
    }, (err) => console.warn('Ingredients sync notice:', err));

    const unsubBlog = onSnapshot(collection(db, 'blogPosts'), (snap) => {
      const cloudPosts: BlogPost[] = [];
      snap.forEach((doc) => cloudPosts.push(sanitizeBlogPost(doc.data() as BlogPost)));
      if (!snap.empty || isDbInitialized()) {
        setBlogPosts(cloudPosts);
      }
    }, (err) => console.warn('Blog sync notice:', err));

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      const cloudCoupons: Coupon[] = [];
      snap.forEach((doc) => cloudCoupons.push(doc.data() as Coupon));
      if (!snap.empty || isDbInitialized()) {
        setCoupons(cloudCoupons);
      }
    }, (err) => console.warn('Coupons sync notice:', err));

    const unsubInstagram = onSnapshot(collection(db, 'instagramPosts'), (snap) => {
      const cloudInsta: InstagramPost[] = [];
      snap.forEach((doc) => cloudInsta.push(doc.data() as InstagramPost));
      if (!snap.empty || isDbInitialized()) {
        setInstagramPosts(cloudInsta);
      }
    }, (err) => console.warn('Instagram sync notice:', err));

    const unsubPhilosophy = onSnapshot(doc(db, 'settings', 'philosophy'), (docSnap) => {
      if (docSnap.exists()) {
        const data = sanitizePhilosophyConfig(docSnap.data() as PhilosophyConfig);
        setPhilosophyConfig(data);
      }
    }, (err) => console.warn('Philosophy sync notice:', err));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubReviews();
      unsubHero();
      unsubSettings();
      unsubIngredients();
      unsubBlog();
      unsubCoupons();
      unsubInstagram();
      unsubPhilosophy();
    };
  }, []);

  // Product actions
  const addProduct = (newProdData: Omit<Product, 'id'>) => {
    const id = 'prod-' + Date.now();
    const newProd: Product = { ...newProdData, id };
    setProducts((prev) => [newProd, ...prev]);
    firestoreService.saveProduct(newProd).catch(console.warn);
    showToast(`Product "${newProd.name}" added to catalog.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          firestoreService.saveProduct(updated).catch(console.warn);
          return updated;
        }
        return item;
      })
    );
    showToast('Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    firestoreService
      .deleteProduct(id)
      .then(() => showToast('Product deleted from database & catalog.'))
      .catch((err) => {
        console.warn('Product database delete notice:', err);
        showToast('Product removed from catalog.');
      });
  };

  const duplicateProduct = (id: string) => {
    const item = products.find((p) => p.id === id);
    if (!item) return;
    const duplicated: Product = {
      ...item,
      id: 'prod-' + Date.now(),
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      slug: `${item.slug}-copy`,
    };
    setProducts((prev) => [duplicated, ...prev]);
    firestoreService.saveProduct(duplicated).catch(console.warn);
    showToast(`Duplicated "${item.name}".`);
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    showToast(`Added ${quantity} × ${product.name} to ritual.`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from basket.');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const deliveryFee =
    cartSubtotal === 0 || cartSubtotal >= siteSettings.freeShippingThreshold
      ? 0
      : siteSettings.defaultDeliveryFee;

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code === clean && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promotional code.' };
    }
    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Code requires a minimum order of ${siteSettings.currencySymbol} ${found.minOrder}.`,
      };
    }
    setAppliedCoupon(found);
    showToast(`Promotional code "${found.code}" applied!`);
    return { success: true, message: 'Code applied successfully!' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo code removed.');
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your wishlist.');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to your wishlist.');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders
  const placeOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ENV-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
    };

    setOrders((prev) => [newOrder, ...prev]);
    firestoreService.saveOrder(newOrder).catch(console.warn);

    // decrement inventory
    orderData.items.forEach((orderedItem) => {
      setProducts((currentProducts) =>
        currentProducts.map((p) => {
          if (p.id === orderedItem.productId) {
            const updatedStock = Math.max(0, p.stock - orderedItem.quantity);
            const updatedProd = { ...p, stock: updatedStock };
            firestoreService.saveProduct(updatedProd).catch(console.warn);
            return updatedProd;
          }
          return p;
        })
      );
    });

    clearCart();
    showToast(`Order #${orderNumber} placed successfully!`);
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courierName?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            status,
            ...(trackingNumber ? { trackingNumber } : {}),
            ...(courierName ? { courierName } : {}),
          };
          firestoreService.saveOrder(updated).catch(console.warn);
          return updated;
        }
        return o;
      })
    );
    showToast(`Order status updated to ${status}.`);
  };

  const markOrderEmailSent = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            emailNotificationSent: true,
            emailSentAt: new Date().toISOString(),
          };
          firestoreService.saveOrder(updated).catch(console.warn);
          return updated;
        }
        return o;
      })
    );
  };

  const getOrderByIdOrPhone = (query: string): Order | undefined => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === q ||
        o.id.toLowerCase() === q ||
        o.customerPhone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
  };

  // Ingredients
  const addIngredient = (data: Omit<Ingredient, 'id'>) => {
    const newIng = { ...data, id: 'ing-' + Date.now() };
    setIngredients((prev) => [...prev, newIng]);
    firestoreService.saveIngredient(newIng).catch(console.warn);
    showToast(`Ingredient ${newIng.name} added.`);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          firestoreService.saveIngredient(updated).catch(console.warn);
          return updated;
        }
        return item;
      })
    );
    showToast('Ingredient updated.');
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
    firestoreService
      .deleteIngredient(id)
      .then(() => showToast('Ingredient deleted from database & catalog.'))
      .catch((err) => {
        console.warn('Ingredient database delete notice:', err);
        showToast('Ingredient deleted.');
      });
  };

  // Blog
  const addBlogPost = (data: Omit<BlogPost, 'id'>) => {
    const id = 'blog-' + Date.now();
    const newPost = sanitizeBlogPost({ ...data, id });
    setBlogPosts((prev) => [newPost, ...prev]);
    firestoreService.saveBlogPost(newPost).catch(console.warn);
    showToast(`Article "${newPost.title}" published.`);
  };

  const updateBlogPost = (id: string, updates: Partial<BlogPost>) => {
    setBlogPosts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = sanitizeBlogPost({ ...item, ...updates });
          firestoreService.saveBlogPost(updated).catch(console.warn);
          return updated;
        }
        return item;
      })
    );
    showToast('Article updated.');
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((item) => item.id !== id));
    firestoreService
      .deleteBlogPost(id)
      .then(() => showToast('Article deleted from database & journal.'))
      .catch((err) => {
        console.warn('Blog database delete notice:', err);
        showToast('Article deleted.');
      });
  };

  // Reviews
  const addReview = (data: Omit<Review, 'id' | 'date' | 'isApproved'>) => {
    const newRev: Review = {
      ...data,
      id: 'rev-' + Date.now(),
      date: 'Just now',
      isApproved: true, // auto approve in store with admin toggle
      featuredOnHome: data.featuredOnHome ?? true,
    };
    setReviews((prev) => [newRev, ...prev]);
    firestoreService.saveReview(newRev).catch(console.warn);
    showToast('Community voice added successfully!');
  };

  const updateReview = (id: string, updates: Partial<Review>) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          firestoreService.saveReview(updated).catch(console.warn);
          return updated;
        }
        return r;
      })
    );
    showToast('Community voice updated.');
  };

  const toggleReviewApproval = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, isApproved: !r.isApproved };
          firestoreService.saveReview(updated).catch(console.warn);
          return updated;
        }
        return r;
      })
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    firestoreService
      .deleteReview(id)
      .then(() => showToast('Review deleted from database.'))
      .catch((err) => {
        console.warn('Review database delete notice:', err);
        showToast('Community voice removed.');
      });
  };

  // Instagram Feed
  const addInstagramPost = (data: Omit<InstagramPost, 'id'>) => {
    const newPost: InstagramPost = { ...data, id: 'insta-' + Date.now() };
    setInstagramPosts((prev) => [newPost, ...prev]);
    firestoreService.saveInstagramPost(newPost).catch(console.warn);
    showToast('Instagram post added to live showcase.');
  };

  const addMultipleInstagramPosts = (postsData: Array<Omit<InstagramPost, 'id'>>) => {
    if (!postsData || postsData.length === 0) return;
    const now = Date.now();
    const newPosts: InstagramPost[] = postsData.map((data, idx) => ({
      ...data,
      id: `insta-${now}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setInstagramPosts((prev) => [...newPosts, ...prev]);
    Promise.all(newPosts.map((p) => firestoreService.saveInstagramPost(p))).catch(console.warn);
    showToast(`Successfully added ${newPosts.length} posts to Botanical Journey!`);
  };

  const updateInstagramPost = (id: string, updates: Partial<InstagramPost>) => {
    setInstagramPosts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          firestoreService.saveInstagramPost(updated).catch(console.warn);
          return updated;
        }
        return item;
      })
    );
    showToast('Botanical journey media updated.');
  };

  const deleteInstagramPost = (id: string) => {
    setInstagramPosts((prev) => prev.filter((p) => p.id !== id));
    firestoreService
      .deleteInstagramPost(id)
      .then(() => showToast('Instagram post removed from database.'))
      .catch((err) => {
        console.warn('Instagram database delete notice:', err);
        showToast('Instagram post removed.');
      });
  };

  // Coupons
  const addCoupon = (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newC: Coupon = { ...data, id: 'coup-' + Date.now(), usageCount: 0 };
    setCoupons((prev) => [newC, ...prev]);
    firestoreService.saveCoupon(newC).catch(console.warn);
    showToast(`Coupon ${newC.code} created.`);
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, isActive: !c.isActive };
          firestoreService.saveCoupon(updated).catch(console.warn);
          return updated;
        }
        return c;
      })
    );
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    firestoreService
      .deleteCoupon(id)
      .then(() => showToast('Coupon deleted from database.'))
      .catch((err) => {
        console.warn('Coupon database delete notice:', err);
        showToast('Coupon deleted.');
      });
  };

  // Hero & Settings
  const updateHeroConfig = (updates: Partial<HeroConfig>) => {
    setHeroConfig((prev) => {
      const next = { ...prev, ...updates };
      firestoreService.saveHeroConfig(next).catch(console.warn);
      return next;
    });
    showToast('Hero settings saved to cloud.');
  };

  const updateSiteSettings = (updates: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const next = sanitizeSiteSettings({ ...prev, ...updates });
      firestoreService.saveSiteSettings(next).catch(console.warn);
      return next;
    });

    // If promise image or quote was updated, synchronize philosophyConfig as well
    if (updates.ourPromiseImageUrl !== undefined || updates.ourPromiseQuote !== undefined) {
      setPhilosophyConfig((prev) => {
        const nextPhil = sanitizePhilosophyConfig({
          ...prev,
          ...(updates.ourPromiseImageUrl !== undefined ? { promiseImageUrl: updates.ourPromiseImageUrl } : {}),
          ...(updates.ourPromiseQuote !== undefined ? { promiseQuote: updates.ourPromiseQuote } : {}),
        });
        firestoreService.savePhilosophyConfig(nextPhil).catch(console.warn);
        return nextPhil;
      });
    }

    showToast('Store settings saved to cloud.');
  };

  // Philosophy CMS
  const updatePhilosophyConfig = (updates: Partial<PhilosophyConfig>) => {
    setPhilosophyConfig((prev) => {
      const next = sanitizePhilosophyConfig({ ...prev, ...updates });
      firestoreService.savePhilosophyConfig(next).catch(console.warn);
      return next;
    });

    // If promise image or quote was updated, synchronize siteSettings as well
    if (updates.promiseImageUrl !== undefined || updates.promiseQuote !== undefined) {
      setSiteSettings((prev) => {
        const nextSettings = sanitizeSiteSettings({
          ...prev,
          ...(updates.promiseImageUrl !== undefined ? { ourPromiseImageUrl: updates.promiseImageUrl } : {}),
          ...(updates.promiseQuote !== undefined ? { ourPromiseQuote: updates.promiseQuote } : {}),
        });
        firestoreService.saveSiteSettings(nextSettings).catch(console.warn);
        return nextSettings;
      });
    }

    showToast('Philosophy & Promise updated and saved to cloud.');
  };

  // Admin Auth
  const loginAdmin = (password: string) => {
    if (password === siteSettings.adminPasswordHash || password === 'envirvenaturals1313') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('envirve_admin_session', 'true');
      showToast('Welcome to Envirve Management Portal.');
      return true;
    }
    showToast('Access denied: Incorrect administrative password.');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('envirve_admin_session');
    showToast('Logged out of Admin Portal.');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        deliveryFee,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        placeOrder,
        updateOrderStatus,
        markOrderEmailSent,
        getOrderByIdOrPhone,
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
        heroConfig,
        updateHeroConfig,
        siteSettings,
        updateSiteSettings,
        philosophyConfig,
        updatePhilosophyConfig,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        selectedArticleId,
        setSelectedArticleId,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
