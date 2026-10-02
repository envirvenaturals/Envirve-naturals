import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Ingredient, BlogPost } from '../../types';
import { Search, X, ArrowRight, Tag, BookOpen, Sparkles } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onSelectIngredient: (i: Ingredient) => void;
  onSelectPost: (post: BlogPost) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectIngredient,
  onSelectPost,
}) => {
  const { products, ingredients, blogPosts, siteSettings } = useStore();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'ingredients' | 'journal'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q))
      )
    : [];

  const matchedIngredients = q
    ? ingredients.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.botanicalName.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      )
    : [];

  const matchedPosts = q
    ? blogPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-[#FAF9F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#ECE7DA] overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#ECE7DA] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#869683]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search herbal shampoos, oils, amla, rosemary, articles..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1C3619] placeholder-[#8A9687] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8A9687] hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-[#50634D] hover:text-[#1B3218] px-2 py-1"
          >
            Esc
          </button>
        </div>

        {/* Filter Tabs if query */}
        {q && (
          <div className="bg-[#F2EEE4] px-5 py-2.5 flex items-center gap-2 border-b border-[#E5E0D4] overflow-x-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-[#2D5A27] text-white font-medium'
                  : 'text-[#485644] hover:text-black'
              }`}
            >
              All Results ({matchedProducts.length + matchedIngredients.length + matchedPosts.length})
            </button>
            <button
              onClick={() => setFilterType('products')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'products'
                  ? 'bg-[#2D5A27] text-white font-medium'
                  : 'text-[#485644] hover:text-black'
              }`}
            >
              Products ({matchedProducts.length})
            </button>
            <button
              onClick={() => setFilterType('ingredients')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'ingredients'
                  ? 'bg-[#2D5A27] text-white font-medium'
                  : 'text-[#485644] hover:text-black'
              }`}
            >
              Ingredients ({matchedIngredients.length})
            </button>
            <button
              onClick={() => setFilterType('journal')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === 'journal'
                  ? 'bg-[#2D5A27] text-white font-medium'
                  : 'text-[#485644] hover:text-black'
              }`}
            >
              Journal ({matchedPosts.length})
            </button>
          </div>
        )}

        {/* Results Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {!q ? (
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2D5A27] block">
                Popular Inquiries
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Hair Balance Shampoo',
                  'Rosemary Hair Oil',
                  'Beetroot Soap',
                  'Amla & Reetha',
                  'Conditioner',
                  'Dry Scalp Ritual',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 bg-white border border-[#DDD7C8] hover:border-[#2D5A27] text-xs text-[#283C25] rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : matchedProducts.length === 0 &&
            matchedIngredients.length === 0 &&
            matchedPosts.length === 0 ? (
            <div className="text-center py-10 text-[#6B7968]">
              <p className="font-serif text-lg text-[#1C3619] mb-1">
                No botanicals found for "{query}"
              </p>
              <p className="text-xs">
                Try searching for general keywords like "shampoo", "rosemary", "oil", or "soap".
              </p>
            </div>
          ) : (
            <>
              {/* Products Match */}
              {(filterType === 'all' || filterType === 'products') &&
                matchedProducts.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Formulations ({matchedProducts.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {matchedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onClose();
                            onSelectProduct(prod);
                          }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EDE8DC] hover:border-[#2D5A27] cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-12 h-12 object-cover rounded-lg bg-[#F5F2EB]"
                            />
                            <div>
                              <h4 className="font-serif text-sm text-[#1B3218] group-hover:text-[#2D5A27] font-medium leading-tight">
                                {prod.name}
                              </h4>
                              <span className="text-[11px] text-[#717E6D]">
                                {prod.category} · {prod.volumeSize}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-semibold text-[#183115]">
                              {siteSettings.currencySymbol} {prod.price}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#8C9889] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Ingredients Match */}
              {(filterType === 'all' || filterType === 'ingredients') &&
                matchedIngredients.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Botanical Ingredients ({matchedIngredients.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {matchedIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          onClick={() => {
                            onClose();
                            onSelectIngredient(ing);
                          }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EDE8DC] hover:border-[#2D5A27] cursor-pointer transition-colors group"
                        >
                          <div>
                            <h4 className="font-serif text-sm text-[#1B3218] font-medium leading-tight">
                              {ing.name}
                            </h4>
                            <span className="font-serif italic text-[11px] text-[#717E6D]">
                              {ing.botanicalName} · {ing.origin}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#8C9889] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Journal Match */}
              {(filterType === 'all' || filterType === 'journal') &&
                matchedPosts.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#2D5A27] mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Journal & Ritual Articles ({matchedPosts.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {matchedPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            onClose();
                            onSelectPost(post);
                          }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EDE8DC] hover:border-[#2D5A27] cursor-pointer transition-colors group"
                        >
                          <div>
                            <h4 className="font-serif text-sm text-[#1B3218] font-medium leading-tight">
                              {post.title}
                            </h4>
                            <span className="text-[11px] text-[#717E6D]">
                              {post.category} · {post.readTime}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#8C9889] group-hover:translate-x-1 group-hover:text-[#2D5A27] transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
