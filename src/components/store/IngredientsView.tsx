import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Ingredient, Product } from '../../types';
import { Sparkles, ArrowRight, X, Check } from 'lucide-react';

interface IngredientsViewProps {
  onSelectProduct: (product: Product) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({ onSelectProduct }) => {
  const { ingredients, products } = useStore();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const getProductsForIngredient = (ing: Ingredient) => {
    return products.filter((p) =>
      ing.featuredInProductIds.includes(p.id) ||
      p.ingredients.some((i) => i.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0]))
    );
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF5EC] text-[#2D5A27] text-[11px] font-sans tracking-[0.25em] uppercase font-semibold rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Sacred Botanical Formulations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B3218] mb-4 [text-wrap:balance]">
            Our Botanical Encyclopedia
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#566553] font-light leading-relaxed [text-wrap:balance]">
            Every herb, cold-pressed seed, and wild fruit in our apothecary is selected for its time-tested purity, bioactive potency, and harmony with skin and hair biology.
          </p>
        </div>

        {/* Botanical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ingredients.map((ing) => {
            const linkedProducts = getProductsForIngredient(ing);
            return (
              <div
                key={ing.id}
                onClick={() => setSelectedIngredient(ing)}
                className="group bg-white rounded-2xl border border-[#ECE7DA] hover:border-[#2D5A27] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[#F2EFE8] overflow-hidden">
                    <img
                      src={ing.image || '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg'}
                      alt={ing.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    <span className="absolute bottom-3 left-3 text-[11px] text-[#FAF8F5] tracking-wider uppercase font-sans font-medium">
                      {ing.origin}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-xl text-[#1B3218] group-hover:text-[#2D5A27] transition-colors mb-0.5">
                      {ing.name}
                    </h3>
                    <p className="font-serif italic text-xs text-[#6F7F6B] mb-3">
                      {ing.botanicalName}
                    </p>
                    <p className="text-xs text-[#52604F] leading-relaxed line-clamp-3 mb-4">
                      {ing.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#F2EEE4]">
                      {ing.benefits.slice(0, 2).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-[#344631]">
                          <Check className="w-3.5 h-3.5 text-[#2D5A27] flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F5] border-t border-[#ECE7DA] flex items-center justify-between text-xs text-[#2D5A27] font-semibold tracking-wider uppercase">
                  <span>{linkedProducts.length} Formulations</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Botanical</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ingredient Detail Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#ECE7DA] overflow-hidden flex flex-col my-8">
            <div className="relative aspect-[16/9] w-full bg-[#182C16]">
              <img
                src={selectedIngredient.image || '/src/assets/images/ingredient_botanical_banner_1790696499213.jpg'}
                alt={selectedIngredient.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedIngredient(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <span className="text-xs uppercase tracking-widest text-[#CDE6CB] block">
                  {selectedIngredient.origin}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                  {selectedIngredient.name}
                </h2>
                <span className="font-serif italic text-xs text-[#E1EEDE]">
                  {selectedIngredient.botanicalName}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-2">
                  Botanical Profile & Lore
                </h3>
                <p className="text-xs sm:text-sm text-[#4E5C4B] leading-relaxed">
                  {selectedIngredient.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3">
                  Documented Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedIngredient.benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-[#EDE8DC] text-xs text-[#283C25] flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[#2D5A27] flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulations Featuring this Ingredient */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3">
                  Envirve Formulations Infused With This Botanical
                </h3>
                <div className="space-y-3">
                  {getProductsForIngredient(selectedIngredient).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedIngredient(null);
                        onSelectProduct(prod);
                      }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EDE8DC] hover:border-[#2D5A27] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-lg bg-[#F5F2EB]"
                        />
                        <div>
                          <h4 className="font-serif text-sm text-[#1B3218] font-medium leading-tight">
                            {prod.name}
                          </h4>
                          <span className="text-[11px] text-[#717E6D]">
                            {prod.category} · {prod.volumeSize}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#2D5A27] flex items-center gap-1">
                        <span>View Ritual</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
