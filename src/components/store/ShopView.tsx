import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface ShopViewProps {
  onSelectProduct: (p: Product) => void;
  initialCategory?: ProductCategory | null;
}

export const ShopView: React.FC<ShopViewProps> = ({
  onSelectProduct,
  initialCategory = null,
}) => {
  const { products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'all'
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [searchFilter, setSearchFilter] = useState('');

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Botanicals' },
    { id: 'Herbal Shampoos', label: 'Herbal Shampoos' },
    { id: 'Hair Care', label: 'Hair Care' },
    { id: 'Herbal Oils', label: 'Herbal Scalp Oils' },
    { id: 'Skin Care', label: 'Artisan Skin Care' },
    { id: 'Natural Conditioners', label: 'Conditioners' },
    { id: 'Organic Personal Care', label: 'Body Polishes & Care' },
  ];

  const filteredProducts = products
    .filter((p) => p.isPublished)
    .filter((p) => (selectedCategory === 'all' ? true : p.category === selectedCategory))
    .filter((p) =>
      searchFilter.trim()
        ? p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          p.shortDesc.toLowerCase().includes(searchFilter.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Collection Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF5EC] text-[#2D5A27] text-[11px] font-sans tracking-[0.25em] uppercase font-semibold rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Pure Botanical Apothecary</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B3218] mb-3">
            The Complete Collection
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D5A] font-light leading-relaxed">
            Formulations crafted with sacred herbal essences, cold-pressed therapeutic oils, and raw plant saponins.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#EAE4D7] mb-8">
          {/* Categories Pill/Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-[#2D5A27] text-white font-medium shadow-xs'
                    : 'bg-white border border-[#DDD7C8] text-[#41523E] hover:border-[#2D5A27] hover:text-[#1B3218]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by keyword..."
              className="bg-white border border-[#DDD7C8] px-3 py-1.5 text-xs rounded-lg text-[#1C3619] placeholder-[#8C9889] focus:outline-none focus:border-[#2D5A27]"
            />

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6D7B69]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#DDD7C8] text-xs text-[#20361C] py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-[#2D5A27]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-[#6B7968]">
            <p className="font-serif text-xl text-[#1B3218] mb-2">No matching products found</p>
            <p className="text-xs mb-6">Try selecting another botanical category or clear your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchFilter('');
              }}
              className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs uppercase tracking-widest font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
