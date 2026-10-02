import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { GoogleAuthProviderContext } from './context/GoogleAuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/store/HomeView';
import { ShopView } from './components/store/ShopView';
import { ProductDetailView } from './components/store/ProductDetailView';
import { IngredientsView } from './components/store/IngredientsView';
import { JournalView } from './components/store/JournalView';
import { AboutView } from './components/store/AboutView';
import { WishlistView } from './components/store/WishlistView';
import { CheckoutView } from './components/store/CheckoutView';
import { CartDrawer } from './components/store/CartDrawer';
import { SearchModal } from './components/store/SearchModal';
import { OrderTrackingModal } from './components/store/OrderTrackingModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Order } from './types';
import {
  CheckCircle,
  Truck,
  PackageCheck,
  Home,
  Store,
  ShoppingBag,
  Heart,
  ShieldCheck,
} from 'lucide-react';

const StoreAppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedProductId,
    setSelectedProductId,
    products,
    cart,
    wishlist,
    setIsCartOpen,
    toastMessage,
    siteSettings,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string | undefined>(undefined);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setSuccessOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#242724] relative selection:bg-[#2D5A27] selection:text-white pb-16 sm:pb-0">
      {/* Dynamic Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E3B1B] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#3A6B36] flex items-center gap-3 text-xs font-medium animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-[#8CD184] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* If in Admin view, render full admin dashboard directly */}
      {activeView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          {/* Main Storefront Header */}
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenTracking={() => setIsTrackingOpen(true)}
          />

          {/* Main Storefront Page View */}
          <main className="flex-1">
            {activeView === 'home' && (
              <HomeView onSelectProduct={handleSelectProduct} />
            )}

            {activeView === 'shop' && (
              <ShopView onSelectProduct={handleSelectProduct} />
            )}

            {activeView === 'product' && selectedProduct && (
              <ProductDetailView
                product={selectedProduct}
                onBack={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectProduct={handleSelectProduct}
                onProceedToCheckout={() => {
                  setActiveView('checkout');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeView === 'ingredients' && (
              <IngredientsView onSelectProduct={handleSelectProduct} />
            )}

            {activeView === 'journal' && <JournalView />}

            {activeView === 'about' && <AboutView />}

            {activeView === 'wishlist' && (
              <WishlistView onSelectProduct={handleSelectProduct} />
            )}

            {activeView === 'checkout' && (
              <CheckoutView
                onBackToShop={() => {
                  setActiveView('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOrderSuccess={handleOrderSuccess}
              />
            )}
          </main>

          {/* Storefront Footer */}
          <Footer onOpenTracking={() => setIsTrackingOpen(true)} />

          {/* Slide-out Cart Drawer */}
          <CartDrawer
            onCheckout={() => {
              setActiveView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Search Modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectProduct={handleSelectProduct}
            onSelectIngredient={() => {
              setIsSearchOpen(false);
              setActiveView('ingredients');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectPost={() => {
              setIsSearchOpen(false);
              setActiveView('journal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Live Order Tracking Modal */}
          <OrderTrackingModal
            isOpen={isTrackingOpen}
            onClose={() => {
              setIsTrackingOpen(false);
              setTrackingOrderNumber(undefined);
            }}
            prefillOrderNumber={trackingOrderNumber}
          />

          {/* Order Placement Success Modal */}
          {successOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-[#DDD7C8] shadow-2xl text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#EDF6EB] text-[#2D5A27] flex items-center justify-center mx-auto">
                  <PackageCheck className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#2D5A27] font-semibold block mb-1">
                    Order Received
                  </span>
                  <h3 className="font-serif text-2xl text-[#1B3218]">
                    Thank you, {successOrder.customerName}!
                  </h3>
                  <p className="text-xs text-[#5D6B5B] mt-1">
                    Your order is confirmed and currently being prepared in our fresh botanical dispensary.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EDE8DC] text-xs text-left space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#758373]">Order Number:</span>
                    <span className="font-bold text-[#1B3218]">{successOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#758373]">Payment:</span>
                    <span className="text-[#1B3218]">{successOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#758373]">Total Due:</span>
                    <span className="font-bold text-[#1B3218]">
                      {siteSettings.currencySymbol} {successOrder.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#758373]">Destination:</span>
                    <span className="text-[#1B3218]">{successOrder.city}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      const ordNum = successOrder.orderNumber;
                      setSuccessOrder(null);
                      setTrackingOrderNumber(ordNum);
                      setIsTrackingOpen(true);
                    }}
                    className="flex-1 py-3 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order Progress</span>
                  </button>
                  <button
                    onClick={() => {
                      setSuccessOrder(null);
                      setActiveView('shop');
                    }}
                    className="py-3 px-5 border border-[#DDD7C8] hover:bg-[#FAF9F5] text-xs font-semibold rounded-xl text-[#2F412C] transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Luxury Mobile Bottom Sticky Navigation Bar */}
          <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/96 backdrop-blur-md border-t border-[#E8E2D5] px-2 py-2 flex items-center justify-around shadow-lg">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
                activeView === 'home' ? 'text-[#2D5A27] font-semibold' : 'text-[#647461]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] tracking-wider uppercase font-sans">Home</span>
            </button>

            <button
              onClick={() => {
                setActiveView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
                activeView === 'shop' ? 'text-[#2D5A27] font-semibold' : 'text-[#647461]'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="text-[10px] tracking-wider uppercase font-sans">Shop</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center gap-0.5 p-1 text-[#2D5A27]"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#2D5A27] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider uppercase font-sans font-bold">Basket</span>
            </button>

            <button
              onClick={() => {
                setActiveView('wishlist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
                activeView === 'wishlist' ? 'text-[#2D5A27] font-semibold' : 'text-[#647461]'
              }`}
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#2D5A27]" />
              )}
              <span className="text-[10px] tracking-wider uppercase font-sans">Saved</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <GoogleAuthProviderContext>
        <StoreAppContent />
      </GoogleAuthProviderContext>
    </StoreProvider>
  );
}
