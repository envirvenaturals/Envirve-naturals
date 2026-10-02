import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { PaymentMethod, Order } from '../../types';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle, Lock, Mail } from 'lucide-react';

interface CheckoutViewProps {
  onBackToShop: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onBackToShop,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    discountAmount,
    cartTotal,
    siteSettings,
    placeOrder,
    markOrderEmailSent,
    showToast,
  } = useStore();

  const { sendOrderNotification } = useGoogleAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [transactionRef, setTransactionRef] = useState('');
  const [copiedJazzCash, setCopiedJazzCash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-[#1E331A] mb-3">Your Basket is Empty</h2>
        <p className="text-xs text-[#6F7C6C] mb-6">
          Add natural botanicals to your ritual before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShop}
          className="px-6 py-3 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1C3B19] transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      }));

      const newOrder = placeOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        shippingAddress: address,
        city,
        postalCode: postalCode || '00000',
        items: orderItems,
        subtotal: cartSubtotal,
        deliveryFee,
        discountAmount,
        total: cartTotal,
        paymentMethod,
        paymentStatus: 'Pending',
        transactionRef: transactionRef.trim() || undefined,
        notes: notes || undefined,
        courierName: 'TCS Express Pakistan',
        trackingNumber: 'TCS-' + Math.floor(10000000 + Math.random() * 90000000),
      });

      // Automatically email the order details from the user's logged-in Gmail account to themselves
      sendOrderNotification(newOrder)
        .then((result) => {
          if (result.success) {
            markOrderEmailSent(newOrder.id);
          }
        })
        .catch((err) => {
          console.warn('Gmail order notification deferred:', err);
        });

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 600);
  };

  const cities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Other City',
  ];

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A5E46] hover:text-[#1F3D1C] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Continue Shopping</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Checkout Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE7DA] shadow-xs">
            <div className="flex items-center justify-between pb-6 border-b border-[#ECE7DA] mb-6">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#1B3218]">
                  Delivery & Checkout
                </h1>
                <p className="text-xs text-[#6F7C6C] mt-0.5">
                  Complete your details for dispatch across Pakistan.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#2D5A27] bg-[#EEF5EC] px-3 py-1.5 rounded-full font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure Checkout</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Contact */}
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3">
                  01. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fatima Tariq"
                      required
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                      Mobile Number (For Courier Rider) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      required
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                      Email Address (Optional for Tracking & Receipt)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fatima@example.com"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3">
                  02. Shipping Destination
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                      Complete Street Address (House / Plot / Building) *
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House 12, Street 4, Sector G-11, Islamabad"
                      required
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                      >
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 54000"
                        className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#4E5C4B] mb-1 font-medium">
                      Order Notes / Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Leave with security guard if not home"
                      className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3.5 py-2.5 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3">
                  03. Payment Preference
                </h2>
                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#2D5A27] bg-[#F4F9F2]'
                        : 'border-[#DDD7C8] bg-[#FAF9F5] hover:border-[#BDB5A4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 text-[#2D5A27] focus:ring-[#2D5A27]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1C3619]">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#2D5A27] font-semibold">
                          Pay upon delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-[#697767] mt-0.5">
                        Pay in cash to the TCS / courier rider when your botanical parcel arrives.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Advance Online Payment (JazzCash) */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'Advance Online Payment (JazzCash)'
                        ? 'border-[#2D5A27] bg-[#F4F9F2]'
                        : 'border-[#DDD7C8] bg-[#FAF9F5] hover:border-[#BDB5A4]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Advance Online Payment (JazzCash)'}
                      onChange={() => setPaymentMethod('Advance Online Payment (JazzCash)')}
                      className="mt-1 text-[#2D5A27] focus:ring-[#2D5A27]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1C3619]">
                          Advance Online Payment (JazzCash)
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#D92525] font-semibold">
                          Instant Bank / Mobile
                        </span>
                      </div>
                      <p className="text-[11px] text-[#697767] mt-0.5">
                        Transfer the order amount to our official JazzCash account.
                      </p>

                      {/* JazzCash Account Card & TID Input */}
                      {paymentMethod === 'Advance Online Payment (JazzCash)' && (
                        <div
                          className="mt-3 p-3.5 bg-white rounded-xl border border-[#D5E5D1] shadow-xs space-y-3 cursor-default"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DA]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                              <span className="font-semibold text-xs text-[#1C3619]">JazzCash Bank Account</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#2D5A27]">
                              Rs. {cartTotal.toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2.5 bg-[#FAF9F5] rounded-lg border border-[#EDE8DC]">
                              <span className="text-[10px] uppercase tracking-wider text-[#798877] block">Bank Name</span>
                              <span className="font-semibold text-[#1C3619] text-xs">JazzCash</span>
                            </div>

                            <div className="p-2.5 bg-[#FAF9F5] rounded-lg border border-[#EDE8DC]">
                              <span className="text-[10px] uppercase tracking-wider text-[#798877] block">Account Holder Name</span>
                              <span className="font-semibold text-[#1C3619] text-xs">MAARAJ REHMAN</span>
                            </div>

                            <div className="sm:col-span-2 p-2.5 bg-[#F2F8F0] rounded-lg border border-[#CDE5C7] flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-[#355F2E] block">Account / Mobile Number</span>
                                <span className="font-mono text-sm font-bold text-[#1C3619] tracking-wider">03143466726</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('03143466726');
                                  setCopiedJazzCash(true);
                                  showToast('JazzCash number copied: 03143466726');
                                  setTimeout(() => setCopiedJazzCash(false), 2000);
                                }}
                                className="px-3 py-1 bg-white border border-[#C5E1BD] hover:bg-[#EEF5EC] text-[#2D5A27] text-xs font-semibold rounded-md transition-colors"
                              >
                                {copiedJazzCash ? 'Copied ✓' : 'Copy Number'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#4E5C4B] mb-1">
                              JazzCash Transaction ID (TID) / Sender Number (Optional):
                            </label>
                            <input
                              type="text"
                              value={transactionRef}
                              onChange={(e) => setTransactionRef(e.target.value)}
                              placeholder="e.g. TID 1849204892 or 03XX-XXXXXXX"
                              className="w-full bg-[#FAF9F5] border border-[#DDD7C8] px-3 py-2 text-xs rounded-lg text-[#1B3218] focus:outline-none focus:border-[#2D5A27]"
                            />
                            <p className="text-[10px] text-[#717E6F] mt-1">
                              After sending, you may also share the transfer screenshot via WhatsApp to expedite parcel dispatch.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1F3E1B] hover:bg-[#2C5527] text-white text-xs tracking-[0.22em] uppercase font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Securing Your Order...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Place Order · {siteSettings.currencySymbol} {cartTotal}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECE7DA] shadow-xs space-y-6">
            <h2 className="font-serif text-xl text-[#1B3218] pb-3 border-b border-[#ECE7DA]">
              Order Summary ({cart.reduce((t, i) => t + i.quantity, 0)} Items)
            </h2>

            {/* Items scroll */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-[#F0ECE1]">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-md bg-[#F4F1EA] flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-serif text-xs font-medium text-[#1B3218] leading-snug">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-[#717E6D]">
                      Qty: {item.quantity} · {item.product.volumeSize}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[#183115]">
                    {siteSettings.currencySymbol} {item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-[#5D6B59] pt-4 border-t border-[#ECE7DA]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#21351E]">
                  {siteSettings.currencySymbol} {cartSubtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
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
                  <span>Promotional Discount</span>
                  <span className="font-mono tabular-nums font-semibold">
                    -{siteSettings.currencySymbol} {discountAmount}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-semibold text-[#183115] pt-3 border-t border-[#ECE7DA]">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-lg">
                  {siteSettings.currencySymbol} {cartTotal}
                </span>
              </div>
            </div>

            {/* Safe Promise */}
            <div className="p-4 bg-[#F8F6F0] rounded-xl text-xs text-[#63725F] space-y-2">
              <div className="flex items-center gap-2 text-[#2D5A27] font-medium">
                <Truck className="w-4 h-4" />
                <span>Estimated Delivery: 2–4 Business Days</span>
              </div>
              <div className="flex items-center gap-2 text-[#2D5A27] font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Damage-free guarantee & phone support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
