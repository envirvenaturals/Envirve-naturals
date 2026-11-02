import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Plus, Star, Sprout } from 'lucide-react';

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

  const singlePic = product.images && product.images[0] ? product.images[0].trim() : '';

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#ECE7DC] hover:border-[#D5CDBD] hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Stage (Strictly single uploaded picture or minimal botanical emblem) */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center">
        {singlePic ? (
          <img
            src={singlePic}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2EFE8] text-[#2D5A27]/70 p-4 text-center">
            <Sprout className="w-8 h-8 mb-1.5 stroke-1 text-[#2D5A27]" />
            <span className="font-serif text-xs font-medium text-[#1E381A] line-clamp-1">{product.name}</span>
            <span className="text-[10px] text-[#6F7C6C] uppercase tracking-widest mt-0.5">Envirve Naturals</span>
          </div>
        )}

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
      <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Category & Volume (unboxed metadata) */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#6F776C] mb-1 font-sans">
            <span className="uppercase tracking-[0.16em] font-medium text-[#50634D] truncate mr-1">
              {product.category}
            </span>
            <span className="text-[10px] sm:text-[11px] whitespace-nowrap">{product.volumeSize}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm sm:text-base md:text-lg font-medium text-[#1E2E1C] group-hover:text-[#2D5A27] transition-colors leading-snug line-clamp-1 mb-1 sm:mb-1.5">
            {product.name}
          </h3>

          {/* Short Descriptor (hidden on compact mobile 2-col to keep cards neat) */}
          <p className="hidden sm:block text-xs text-[#6B7268] line-clamp-2 leading-relaxed mb-3">
            {product.shortDesc}
          </p>
        </div>

        {/* Rating & Pricing Row */}
        <div className="pt-2 border-t border-[#F2EEE4] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center text-[#D99A26]">
              <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-medium text-[#384236]">
              {product.rating}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#869183]">
              ({product.reviewsCount})
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-[#9DA799] line-through font-mono">
                {siteSettings.currencySymbol} {product.compareAtPrice}
              </span>
            )}
            <span className="font-mono tabular-nums text-xs sm:text-base font-semibold text-[#183115]">
              {siteSettings.currencySymbol} {product.price}
            </span>
          </div>
        </div>

        {/* Mobile Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="mt-2.5 w-full py-1.5 bg-[#F3EFE7] active:bg-[#2D5A27] active:text-white text-[#223B1E] text-[11px] uppercase tracking-wider font-semibold rounded sm:hidden flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>
      </div>
    </div>
  );
};
