export type ProductCategory = 
  | 'Herbal Shampoos'
  | 'Hair Care'
  | 'Skin Care'
  | 'Herbal Oils'
  | 'Natural Conditioners'
  | 'Organic Personal Care'
  | 'Herbal Wellness';

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'LIMITED' | 'SALE' | '';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "200ml", "500ml", "Standard Bar"
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  shortDesc: string;
  description: string;
  images: string[];
  badge?: ProductBadge;
  rating: number;
  reviewsCount: number;
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  volumeSize: string; // e.g. "250 ml / 8.4 fl oz"
  ingredients: string[]; // key ingredient names
  benefits: string[];
  howToUse: string;
  suitableFor: string;
  pairsWith?: string[]; // IDs of complementary products
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD' | 'Advance Online Payment (JazzCash)' | 'Bank Transfer' | 'Card';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ENV-9281"
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
    volumeSize?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  transactionRef?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  emailNotificationSent?: boolean;
  emailSentAt?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  botanicalName: string;
  origin: string;
  image: string;
  description: string;
  benefits: string[];
  featuredInProductIds: string[];
}

export interface JournalImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  imageCaption?: string;
  additionalImages?: JournalImage[];
  isPublished: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
  featuredOnHome?: boolean;
}

export interface InstagramPost {
  id: string;
  mediaType?: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  caption: string;
  likes: number;
  url: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
}

export interface HeroConfig {
  videoUrl: string;
  useVideo: boolean;
  fallbackImageUrl: string;
  heading: string;
  subheading: string;
  slogan: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  overlayOpacity: number; // 0 to 100
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface SiteSettings {
  brandName: string;
  slogan: string;
  logoImageUrl?: string;
  ourPromiseImageUrl?: string; // remote background image for Our Promise section
  ourPromiseQuote?: string; // customizable quote for Our Promise
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  defaultDeliveryFee: number;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookUrl: string;
  adminPasswordHash: string; // for gatekeeping admin
}

export interface PhilosophyPillar {
  id: string;
  icon: 'Sprout' | 'HeartHandshake' | 'Shield' | 'Sparkles';
  title: string;
  desc: string;
}

export interface PhilosophyConfig {
  // Story Intro
  introKicker: string;
  introHeading: string;
  introQuote: string;
  introParagraph: string;

  // Craftsmanship & Imagery
  craftSectionTag: string;
  craftHeading: string;
  craftParagraph1: string;
  craftParagraph2: string;
  craftImageUrl: string;
  craftButtonText: string;

  // 4 Core Standards / Pillars & Our Promise
  promiseImageUrl?: string; // Promise Picture displayed under why philosophy picture / core standards
  promiseQuote?: string; // Promise Quote under why philosophy picture
  pillarsSectionTag: string;
  pillarsHeading: string;
  pillars: PhilosophyPillar[];

  // Ethical Commitment Callout
  ethicalKicker: string;
  ethicalHeading: string;
  ethicalDescription: string;
}
