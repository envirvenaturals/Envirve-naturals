import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Plus, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, toggleWishlist, isInWishlist, siteSettings } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#ECE7DC] hover:border-[#D5CDBD] hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center">
        <img
          src={product.images[0] || '/src/assets/images/product_herbal_shampoo_1790696462766.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badge: unobtrusive single-text marker */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#1C3619]/90 text-white text-[10px] tracking-[0.2em] font-sans font-semibold uppercase px-2.5 py-1 rounded">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? 'bg-[#2D5A27] text-white shadow-sm'
              : 'bg-white/80 text-[#384236] hover:bg-white hover:text-[#2D5A27]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Button on Hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-4 bg-[#1C3619] hover:bg-[#284C24] text-white text-xs uppercase tracking-[0.18em] font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Ritual</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Category & Volume (unboxed metadata) */}
          <div className="flex items-center justify-between text-xs text-[#6F776C] mb-1.5 font-sans">
            <span className="uppercase tracking-[0.16em] text-[11px] font-medium text-[#50634D]">
              {product.category}
            </span>
            <span className="text-[11px]">{product.volumeSize}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base sm:text-lg font-medium text-[#1E2E1C] group-hover:text-[#2D5A27] transition-colors leading-snug line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          {/* Short Descriptor */}
          <p className="text-xs text-[#6B7268] line-clamp-2 leading-relaxed mb-3">
            {product.shortDesc}
          </p>
        </div>

        {/* Rating & Pricing Row */}
        <div className="pt-2 border-t border-[#F2EEE4] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-[#D99A26]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-mono font-medium text-[#384236]">
              {product.rating}
            </span>
            <span className="text-[11px] text-[#869183]">
              ({product.reviewsCount})
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#9DA799] line-through font-mono">
                {siteSettings.currencySymbol} {product.compareAtPrice}
              </span>
            )}
            <span className="font-mono tabular-nums text-sm sm:text-base font-semibold text-[#183115]">
              {siteSettings.currencySymbol} {product.price}
            </span>
          </div>
        </div>

        {/* Mobile Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="mt-3 w-full py-2 bg-[#F3EFE7] hover:bg-[#EAE4D7] text-[#223B1E] text-xs uppercase tracking-wider font-semibold rounded sm:hidden flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>
      </div>
    </div>
  );
};
