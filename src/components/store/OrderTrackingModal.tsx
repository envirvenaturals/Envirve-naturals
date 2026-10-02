import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { X, Search, CheckCircle2, Clock, Truck, Package, MapPin } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  prefillOrderNumber,
}) => {
  const { getOrderByIdOrPhone, siteSettings } = useStore();
  const [query, setQuery] = useState(prefillOrderNumber || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    return prefillOrderNumber ? getOrderByIdOrPhone(prefillOrderNumber) || null : null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(prefillOrderNumber));

  React.useEffect(() => {
    if (prefillOrderNumber) {
      setQuery(prefillOrderNumber);
      const found = getOrderByIdOrPhone(prefillOrderNumber);
      setSearchedOrder(found || null);
      setHasSearched(true);
    }
  }, [prefillOrderNumber, isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = getOrderByIdOrPhone(query.trim());
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const statusSteps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Confirmed', label: 'Order Confirmed', desc: 'Order received & verified by Envirve team' },
    { status: 'Processing', label: 'Formulation / Brewing', desc: 'Fresh botanicals inspected and bottled' },
    { status: 'Packed', label: 'Eco-Packed', desc: 'Carefully wrapped with biodegradable protection' },
    { status: 'Shipped', label: 'Shipped via Courier', desc: 'Handed over to courier with tracking' },
    { status: 'Delivered', label: 'Delivered', desc: 'Parcel safely handed over to you' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 0;
      case 'Processing':
        return 1;
      case 'Packed':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#ECE7DA] overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-6 bg-white border-b border-[#ECE7DA] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#2D5A27] font-semibold block mb-0.5">
              Live Fulfillment
            </span>
            <h2 className="font-serif text-2xl text-[#1B3218]">
              Track Your Botanical Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4E5C4A] hover:text-black transition-colors rounded-full"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Query Input */}
        <div className="p-6 bg-[#F5F2EB] border-b border-[#ECE7DA]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C9889] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order # (e.g. ENV-9482) or Phone Number"
                className="w-full bg-white border border-[#DDD7C8] pl-10 pr-4 py-2.5 text-xs text-[#1C3619] rounded-lg focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#1C3B19] transition-colors whitespace-nowrap"
            >
              Track
            </button>
          </form>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-[#71826F]">
            <span>Try demo:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ENV-9482');
                const f = getOrderByIdOrPhone('ENV-9482');
                setSearchedOrder(f || null);
                setHasSearched(true);
              }}
              className="underline hover:text-[#2D5A27]"
            >
              ENV-9482
            </button>
            <span>or</span>
            <button
              type="button"
              onClick={() => {
                setQuery('ENV-9483');
                const f = getOrderByIdOrPhone('ENV-9483');
                setSearchedOrder(f || null);
                setHasSearched(true);
              }}
              className="underline hover:text-[#2D5A27]"
            >
              ENV-9483
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
          {hasSearched && !searchedOrder ? (
            <div className="text-center py-10 text-[#6B7867]">
              <Package className="w-12 h-12 stroke-1 mx-auto text-[#9EA99B] mb-2" />
              <h3 className="font-serif text-lg text-[#1C3619] mb-1">
                No matching order located
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                Please double check the order number or mobile number entered during checkout.
              </p>
            </div>
          ) : searchedOrder ? (
            <div className="space-y-6">
              {/* Order Info Bar */}
              <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-xl border border-[#ECE7DA] gap-4">
                <div>
                  <span className="text-[11px] text-[#7E8B7B] block">Order Identifier</span>
                  <span className="font-mono text-base font-bold text-[#1B3218]">
                    {searchedOrder.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7E8B7B] block">Date Placed</span>
                  <span className="font-mono text-xs text-[#2A3B27]">
                    {searchedOrder.date}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7E8B7B] block">Total Amount</span>
                  <span className="font-mono text-sm font-semibold text-[#1B3218]">
                    {siteSettings.currencySymbol} {searchedOrder.total}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7E8B7B] block">Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-[#EEF5EC] text-[#2D5A27]">
                    {searchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Courier Tracking Info if Shipped */}
              {searchedOrder.trackingNumber && (
                <div className="p-4 bg-[#EDF6EB] rounded-xl border border-[#C5E1BE] flex items-center justify-between text-xs text-[#214F1D]">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-[#2D5A27]" />
                    <div>
                      <span className="font-semibold block">
                        Courier: {searchedOrder.courierName || 'TCS Express'}
                      </span>
                      <span className="font-mono text-[11px] text-[#3D6E37]">
                        Tracking ID: {searchedOrder.trackingNumber}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#2D5A27]">
                    In Transit
                  </span>
                </div>
              )}

              {/* Step Progress Timeline */}
              <div className="p-6 bg-white rounded-xl border border-[#ECE7DA]">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-6">
                  Fulfillment Timeline
                </h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2DDD0]">
                  {statusSteps.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;
                    return (
                      <div key={step.status} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-[#2D5A27] text-white'
                              : 'bg-[#DDD7C9] text-white'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3 h-3 text-[#7B8877]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`text-xs font-semibold ${
                              isCurrent ? 'text-[#2D5A27]' : isDone ? 'text-[#1C3619]' : 'text-[#8E9B8B]'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-[#717E6F] mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-4 bg-white rounded-xl border border-[#ECE7DA] text-xs text-[#52604F] flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2D5A27] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-[#1B3218]">
                    Delivering to {searchedOrder.customerName}
                  </span>
                  <p className="text-[11px] text-[#697767] mt-0.5">
                    {searchedOrder.shippingAddress}, {searchedOrder.city} ({searchedOrder.postalCode})
                  </p>
                  <p className="text-[11px] text-[#697767]">Phone: {searchedOrder.customerPhone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-[#6B7867]">
              <Search className="w-10 h-10 stroke-1 mx-auto text-[#9EA99B] mb-2" />
              <p className="text-xs">
                Enter your order ID above to trace parcel dispatch, carrier notes, and arrival timeframe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
