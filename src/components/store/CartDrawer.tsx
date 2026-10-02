import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    cartTotal,
    siteSettings,
    setActiveView,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const threshold = siteSettings.freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, threshold - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / threshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleProceed = () => {
    setIsCartOpen(false);
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F5] shadow-2xl flex flex-col border-l border-[#E5E0D5]">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E2D5] flex items-center justify-between bg-white">
            <div>
              <h2 className="font-serif text-xl font-medium text-[#1A3117]">
                Your Ritual Basket
              </h2>
              <span className="text-xs text-[#717E6D]">
                {cart.reduce((tot, i) => tot + i.quantity, 0)} items selected
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#4E594A] hover:text-black transition-colors"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Bar */}
          <div className="bg-[#F2EFE8] px-5 py-3 border-b border-[#E8E2D5]">
            <div className="flex items-center justify-between text-xs text-[#2F442C] mb-1.5 font-medium">
              <span>
                {amountToFreeShipping > 0 ? (
                  <>
                    Add <span className="font-mono font-bold text-[#1C3A19]">{siteSettings.currencySymbol} {amountToFreeShipping}</span> for Complimentary Shipping
                  </>
                ) : (
                  <span className="text-[#205A20] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    You unlocked Complimentary Shipping!
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-[#63725F]">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#DCD6C7] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2D5A27] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#6D7769]">
                <div className="w-16 h-16 rounded-full bg-[#EAE5D8] flex items-center justify-center mb-4 text-[#2D5A27]">
                  <Tag className="w-7 h-7 stroke-1" />
                </div>
                <h3 className="font-serif text-lg text-[#1C3619] mb-1">
                  Your basket is empty
                </h3>
                <p className="text-xs max-w-xs mb-6 text-[#7E8879]">
                  Explore our herbal infusions, botanical shampoos, and pure organic oils.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveView('shop');
                  }}
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[#20441C] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-white rounded-lg border border-[#EDE8DC] shadow-xs"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-18 h-18 object-cover rounded bg-[#F5F2EB] flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-medium text-[#1B3218] leading-tight">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-[#717E6D]">
                          {item.product.volumeSize}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#96A093] hover:text-[#B93838] transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#DDD7C8] rounded bg-[#FAF9F5]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-[#485644] hover:text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono tabular-nums text-[#21381E] font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-[#485644] hover:text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#183115]">
                        {siteSettings.currencySymbol} {item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E8E2D5] space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#F0F6EE] border border-[#C6DFBF] rounded text-xs">
                  <div className="flex items-center gap-1.5 text-[#24541F]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo: <strong>{appliedCoupon.code}</strong></span>
                    <span className="text-[#557751]">
                      (-{siteSettings.currencySymbol} {discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#8E3B3B] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-2 text-xs text-[#20361D] uppercase tracking-wider rounded focus:outline-none focus:border-[#2D5A27]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2D5A27] text-white text-xs font-medium uppercase tracking-wider rounded hover:bg-[#1E4219] transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-[#A63737]">{couponError}</p>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5E6B5A] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#21351E]">
                    {siteSettings.currencySymbol} {cartSubtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery (Pakistan)</span>
                  <span className="font-mono tabular-nums text-[#21351E]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#2D5A27] font-semibold">Complimentary</span>
                    ) : (
                      `${siteSettings.currencySymbol} ${deliveryFee}`
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2D5A27]">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums font-semibold">
                      -{siteSettings.currencySymbol} {discountAmount}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-semibold text-[#183115] pt-2 border-t border-[#ECE7DA]">
                  <span>Total</span>
                  <span className="font-mono tabular-nums text-base">
                    {siteSettings.currencySymbol} {cartTotal}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleProceed}
                className="w-full py-3.5 bg-[#1F3E1B] hover:bg-[#2B5226] text-white text-xs tracking-[0.2em] uppercase font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-[10px] text-center text-[#849180]">
                Cash on Delivery Available · Guaranteed Natural Formulations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
