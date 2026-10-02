import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

export const WishlistView: React.FC<{ onSelectProduct: (p: Product) => void }> = ({
  onSelectProduct,
}) => {
  const { wishlist, products, setActiveView } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActiveView('shop')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A5E46] hover:text-[#1F3D1C] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Continue Exploring</span>
        </button>

        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="w-12 h-12 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1B3218] mb-2">
            Your Saved Rituals
          </h1>
          <p className="text-xs text-[#6B7968]">
            {wishlistedProducts.length} botanical formulations bookmarked for your self-care.
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#ECE7DA] p-8 max-w-md mx-auto">
            <p className="font-serif text-lg text-[#1C3619] mb-2">Your wishlist is empty</p>
            <p className="text-xs text-[#7B8877] mb-6">
              Click the heart icon on any shampoo, oil, or soap to save it for later.
            </p>
            <button
              onClick={() => setActiveView('shop')}
              className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1C3B19] transition-colors"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
