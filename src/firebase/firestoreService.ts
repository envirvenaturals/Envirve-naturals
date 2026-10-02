import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import {
  Product,
  Order,
  Review,
  Ingredient,
  BlogPost,
  Coupon,
  HeroConfig,
  SiteSettings,
  InstagramPost,
  PhilosophyConfig,
} from '../types';

// Seed helper: Seeds initial data to Firestore if collection is empty
export async function seedInitialFirestoreData(defaults: {
  products: Product[];
  ingredients: Ingredient[];
  blogPosts: BlogPost[];
  reviews: Review[];
  coupons: Coupon[];
  heroConfig: HeroConfig;
  siteSettings: SiteSettings;
  instagramPosts: InstagramPost[];
  philosophyConfig: PhilosophyConfig;
}) {
  try {
    // If client has already initialized or seeded once, NEVER re-seed deleted items!
    if (localStorage.getItem('envirve_db_initialized') === 'true') {
      return;
    }

    const seedDocRef = doc(db, '_system', 'seed_status');
    const seedSnap = await getDoc(seedDocRef);
    if (seedSnap.exists() && seedSnap.data()?.seeded) {
      localStorage.setItem('envirve_db_initialized', 'true');
      return;
    }

    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      for (const prod of defaults.products) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    const heroDoc = doc(db, 'heroConfig', 'main');
    const heroSnap = await getDoc(heroDoc);
    if (!heroSnap.exists()) {
      await setDoc(heroDoc, defaults.heroConfig);
    }

    const settingsDoc = doc(db, 'settings', 'main');
    const settingsSnap = await getDoc(settingsDoc);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDoc, defaults.siteSettings);
    }

    const philDoc = doc(db, 'settings', 'philosophy');
    const philSnap = await getDoc(philDoc);
    if (!philSnap.exists()) {
      await setDoc(philDoc, defaults.philosophyConfig);
    }

    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    if (reviewsSnap.empty) {
      for (const rev of defaults.reviews) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }

    const instaSnap = await getDocs(collection(db, 'instagramPosts'));
    if (instaSnap.empty) {
      for (const post of defaults.instagramPosts) {
        await setDoc(doc(db, 'instagramPosts', post.id), post);
      }
    }

    const ingSnap = await getDocs(collection(db, 'ingredients'));
    if (ingSnap.empty) {
      for (const ing of defaults.ingredients) {
        await setDoc(doc(db, 'ingredients', ing.id), ing);
      }
    }

    const blogSnap = await getDocs(collection(db, 'blogPosts'));
    if (blogSnap.empty) {
      for (const post of defaults.blogPosts) {
        await setDoc(doc(db, 'blogPosts', post.id), post);
      }
    }

    const couponSnap = await getDocs(collection(db, 'coupons'));
    if (couponSnap.empty) {
      for (const c of defaults.coupons) {
        await setDoc(doc(db, 'coupons', c.id), c);
      }
    }

    await setDoc(seedDocRef, { seeded: true, timestamp: new Date().toISOString() });
    localStorage.setItem('envirve_db_initialized', 'true');
  } catch (err) {
    console.warn('Firestore initial seeding deferred or offline:', err);
  }
}

// Helper to strip undefined values so Firestore setDoc never throws Unsupported field value: undefined
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Firestore operations
export const firestoreService = {
  // Products
  async saveProduct(product: Product) {
    try {
      const cleaned = cleanFirestoreData(product);
      await setDoc(doc(db, 'products', product.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveProduct notice:', err);
    }
  },
  async deleteProduct(productId: string) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.warn('Firestore deleteProduct notice:', err);
    }
  },

  // Orders
  async saveOrder(order: Order) {
    try {
      const cleaned = cleanFirestoreData(order);
      await setDoc(doc(db, 'orders', order.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveOrder notice:', err);
    }
  },
  async updateOrderStatus(orderId: string, updates: Partial<Order>) {
    try {
      const cleaned = cleanFirestoreData(updates);
      await updateDoc(doc(db, 'orders', orderId), cleaned);
    } catch (err) {
      console.warn('Firestore updateOrderStatus notice:', err);
    }
  },

  // Reviews
  async saveReview(review: Review) {
    try {
      const cleaned = cleanFirestoreData(review);
      await setDoc(doc(db, 'reviews', review.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveReview notice:', err);
    }
  },
  async deleteReview(reviewId: string) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.warn('Firestore deleteReview notice:', err);
    }
  },

  // Hero & Settings
  async saveHeroConfig(hero: HeroConfig) {
    try {
      const cleaned = cleanFirestoreData(hero);
      await setDoc(doc(db, 'heroConfig', 'main'), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveHeroConfig notice:', err);
    }
  },
  async saveSiteSettings(settings: SiteSettings) {
    try {
      const cleaned = cleanFirestoreData(settings);
      await setDoc(doc(db, 'settings', 'main'), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSiteSettings notice:', err);
    }
  },

  // Ingredients
  async saveIngredient(ing: Ingredient) {
    try {
      const cleaned = cleanFirestoreData(ing);
      await setDoc(doc(db, 'ingredients', ing.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveIngredient notice:', err);
    }
  },
  async deleteIngredient(ingId: string) {
    try {
      await deleteDoc(doc(db, 'ingredients', ingId));
    } catch (err) {
      console.warn('Firestore deleteIngredient notice:', err);
    }
  },

  // Blog
  async saveBlogPost(post: BlogPost) {
    try {
      const cleaned = cleanFirestoreData(post);
      await setDoc(doc(db, 'blogPosts', post.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveBlogPost notice:', err);
    }
  },
  async deleteBlogPost(postId: string) {
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
    } catch (err) {
      console.warn('Firestore deleteBlogPost notice:', err);
    }
  },

  // Coupons
  async saveCoupon(coupon: Coupon) {
    try {
      const cleaned = cleanFirestoreData(coupon);
      await setDoc(doc(db, 'coupons', coupon.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCoupon notice:', err);
    }
  },
  async deleteCoupon(couponId: string) {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch (err) {
      console.warn('Firestore deleteCoupon notice:', err);
    }
  },

  // Instagram
  async saveInstagramPost(post: InstagramPost) {
    try {
      const cleaned = cleanFirestoreData(post);
      await setDoc(doc(db, 'instagramPosts', post.id), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveInstagramPost notice:', err);
    }
  },
  async deleteInstagramPost(postId: string) {
    try {
      await deleteDoc(doc(db, 'instagramPosts', postId));
    } catch (err) {
      console.warn('Firestore deleteInstagramPost notice:', err);
    }
  },

  // Philosophy CMS
  async savePhilosophyConfig(config: PhilosophyConfig) {
    try {
      const cleaned = cleanFirestoreData(config);
      await setDoc(doc(db, 'settings', 'philosophy'), cleaned, { merge: true });
    } catch (err) {
      console.warn('Firestore savePhilosophyConfig notice:', err);
    }
  },
};
