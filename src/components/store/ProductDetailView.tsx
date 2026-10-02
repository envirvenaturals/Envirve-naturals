import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  Heart,
  Plus,
  Minus,
  Star,
  ShieldCheck,
  Truck,
  Leaf,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onProceedToCheckout: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onSelectProduct,
  onProceedToCheckout,
}) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    siteSettings,
    products,
    reviews,
    addReview,
    showToast,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>('ingredients');

  React.useEffect(() => {
    setSelectedImage(product.images[0] || '');
    setQuantity(1);
  }, [product.id, product.images]);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isWishlisted = isInWishlist(product.id);

  const productReviews = reviews.filter(
    (r) => r.productId === product.id && r.isApproved
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onProceedToCheckout();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please fill in your name and review.');
      return;
    }
    addReview({
      productId: product.id,
      productName: product.name,
      authorName: reviewName,
      rating: reviewRating,
      comment: reviewComment,
      verifiedPurchase: true,
    });
    setReviewName('');
    setReviewComment('');
    setShowReviewForm(false);
  };

  // Pairs with complementary products
  const complementaryProducts = products
    .filter((p) => p.id !== product.id && (product.pairsWith?.includes(p.id) || p.category === product.category))
    .slice(0, 3);

  const toggleAccordion = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A5E46] hover:text-[#1F3D1C] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Collection</span>
        </button>

        {/* Main Grid: Gallery Left, Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-16 border-b border-[#ECE7DC]">
          {/* Gallery Column (lg: 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-square sm:aspect-[4/3] w-full bg-[#F3EFE7] rounded-2xl overflow-hidden border border-[#E8E2D5] shadow-xs flex items-center justify-center">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-[#1C3619] text-white text-[10px] tracking-[0.2em] uppercase font-semibold px-3 py-1 rounded">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails if multiple */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img
                        ? 'border-[#2D5A27] shadow-sm'
                        : 'border-[#E2DDCF] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Botanical Trust Callout */}
            <div className="p-4 bg-white rounded-xl border border-[#ECE7DA] mt-4 flex items-center gap-4 text-xs text-[#52634E]">
              <div className="w-10 h-10 rounded-full bg-[#EEF5EC] text-[#2D5A27] flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <p>
                <strong>Handcrafted Botanical Freshness:</strong> Every batch is slowly infused in small batches using responsibly sourced local botanicals and therapeutic-grade herbal essences.
              </p>
            </div>
          </div>

          {/* Purchase Module Column (lg: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#6F7C6C] mb-2 font-sans">
                <span className="uppercase tracking-[0.2em] font-medium text-[#2D5A27]">
                  {product.category}
                </span>
                <span className="font-mono text-[11px]">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1B3218] leading-tight font-normal mb-3">
                {product.name}
              </h1>

              {/* Volume Size */}
              <p className="text-xs text-[#6E7B6C] tracking-wide mb-3">
                Size: <strong className="text-[#2C3B29]">{product.volumeSize}</strong>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-[#D99A26]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-current'
                          : 'text-[#D99A26]/40'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-medium text-[#293826]">
                  {product.rating} / 5.0
                </span>
                <span className="text-xs text-[#7B8877]">
                  ({productReviews.length || product.reviewsCount} customer reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-mono tabular-nums text-3xl font-semibold text-[#183115]">
                  {siteSettings.currencySymbol} {product.price}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="font-mono text-base text-[#929E8E] line-through">
                    {siteSettings.currencySymbol} {product.compareAtPrice}
                  </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-[#2D5A27] bg-[#EEF5EC] px-2 py-0.5 rounded font-medium">
                    Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-sm text-[#4E5B4B] leading-relaxed mb-6 font-light">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs mb-6">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[#246124] font-medium">
                    <CheckCircle className="w-4 h-4" />
                    In Stock · Hand-bottled & Ready to Ship
                  </span>
                ) : (
                  <span className="text-[#A43B3B] font-medium">
                    Currently being brewed in fresh batch (Restocking soon)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#DDD7C8] rounded-lg bg-white px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-[#435240] hover:text-black transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-mono font-medium text-sm text-[#1B3218]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-[#435240] hover:text-black transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-[#1C3619] hover:bg-[#284E24] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Ritual Basket</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border rounded-lg transition-colors ${
                    isWishlisted
                      ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                      : 'border-[#DDD7C8] text-[#41523E] hover:text-[#2D5A27] hover:border-[#2D5A27] bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 bg-transparent hover:bg-[#FAF9F5] text-[#1C3619] border border-[#1C3619] text-xs uppercase tracking-[0.2em] font-semibold rounded-lg transition-colors"
              >
                Instant Checkout
              </button>
            </div>

            {/* Delivery Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#ECE7DC] text-xs text-[#52634E]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2D5A27]" />
                <span>Complimentary over Rs 2,500</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>Cash on Delivery across Pakistan</span>
              </div>
            </div>

            {/* Accordion Information Sections */}
            <div className="border-t border-[#ECE7DC] pt-4 divide-y divide-[#ECE7DC]">
              {/* Ingredients Accordion */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('ingredients')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-medium text-[#1E331A]"
                >
                  <span>Botanical Ingredients</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSection === 'ingredients' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'ingredients' && (
                  <div className="pt-3 text-xs text-[#556352] leading-relaxed">
                    <p className="mb-2">
                      Full composition: {product.ingredients.join(', ')}.
                    </p>
                    <p className="text-[11px] text-[#71826E]">
                      Free from sulfates, parabens, phthalates, synthetic colorants, and mineral oils. 100% vegetarian & cruelty-free.
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits Accordion */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('benefits')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-medium text-[#1E331A]"
                >
                  <span>Key Benefits & Ritual</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSection === 'benefits' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'benefits' && (
                  <div className="pt-3 text-xs text-[#556352] space-y-2">
                    <ul className="list-disc pl-4 space-y-1">
                      {product.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    <p className="pt-1">
                      <strong>Suitable for:</strong> {product.suitableFor}
                    </p>
                  </div>
                )}
              </div>

              {/* How to Use */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('howToUse')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-medium text-[#1E331A]"
                >
                  <span>How to Apply (The Ritual)</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSection === 'howToUse' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'howToUse' && (
                  <div className="pt-3 text-xs text-[#556352] leading-relaxed">
                    {product.howToUse}
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-medium text-[#1E331A]"
                >
                  <span>Shipping & Delivery Policy</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSection === 'shipping' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSection === 'shipping' && (
                  <div className="pt-3 text-xs text-[#556352] leading-relaxed space-y-1">
                    <p>Standard delivery arrives in 2–4 business days nationwide.</p>
                    <p>Delivery fee: Rs 350 (Complimentary for orders above Rs 2,500).</p>
                    <p>Cash on Delivery (COD) accepted at doorstep.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="py-16 border-b border-[#ECE7DC]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase text-[#2D5A27] font-medium block mb-1">
                Authentic Experiences
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B3218]">
                Customer Reviews
              </h2>
            </div>
            <button
              onClick={() => setShowReviewForm((v) => !v)}
              className="px-6 py-2.5 bg-white border border-[#2D5A27] text-[#2D5A27] hover:bg-[#EEF5EC] text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors self-start md:self-auto"
            >
              {showReviewForm ? 'Close Form' : 'Write a Review'}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="bg-white p-6 rounded-xl border border-[#E2DDCF] max-w-xl mb-10 shadow-xs space-y-4"
            >
              <h3 className="font-serif text-lg text-[#1C3619]">Share your experience</h3>
              <div>
                <label className="block text-xs font-medium text-[#465442] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Sana M."
                  className="w-full bg-[#FAF9F5] border border-[#D5CDBD] p-2.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#465442] mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#D99A26]"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-current' : 'text-[#DDD7C8]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#465442] mb-1">
                  Your Review
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us how this botanical affected your hair or skin..."
                  className="w-full bg-[#FAF9F5] border border-[#D5CDBD] p-2.5 text-xs rounded text-[#1C3619] focus:outline-none focus:border-[#2D5A27]"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-[#1E4119] transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productReviews.length === 0 ? (
              <p className="text-xs text-[#7B8877] italic col-span-full">
                Be the first to leave a review for this natural formulation.
              </p>
            ) : (
              productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white rounded-xl border border-[#EDE8DC] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex text-[#D99A26]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#869483] font-mono">
                        {rev.date}
                      </span>
                    </div>
                    <p className="text-xs text-[#4F5B4D] leading-relaxed mb-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#2D5A27] font-medium pt-2 border-t border-[#F2EEE4]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{rev.authorName}</span>
                    <span className="text-[#899786] font-normal">· Verified User</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pairs Well With Section */}
        {complementaryProducts.length > 0 && (
          <div className="pt-16">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-medium block mb-1">
                Complete Your Ritual
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B3218]">
                Pairs Beautifully With
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {complementaryProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className="p-4 bg-white rounded-xl border border-[#ECE7DC] hover:border-[#2D5A27] cursor-pointer transition-all flex gap-4 items-center group"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#F5F2EA] flex-shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#637560] block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-sm text-[#1B3218] group-hover:text-[#2D5A27] transition-colors leading-tight mb-1 font-medium">
                      {item.name}
                    </h4>
                    <span className="font-mono tabular-nums text-xs font-semibold text-[#183115]">
                      {siteSettings.currencySymbol} {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
