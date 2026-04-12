import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries/productQueries';
import ProductCard from '../components/product/ProductCard';
import { Product, ProductSortBy } from '../types';

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;

  const [sortBy, setSortBy] = useState<ProductSortBy>(ProductSortBy.POPULARITY);
  const [page, setPage] = useState(0);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: { search, categoryId: category, sortBy, page, size: 12, minPrice, maxPrice },
    },
  });

  const products: Product[] = data?.products?.content ?? [];
  const totalPages: number = data?.products?.totalPages ?? 0;

  return (
    <div className="flex gap-6">
      {/* Sidebar Filters */}
      <aside className="w-60 flex-shrink-0 hidden md:block">
        <div className="bg-white rounded-xl shadow p-4 sticky top-4 space-y-6">
          <h2 className="font-bold text-gray-800 text-lg">Filters</h2>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => setMinPrice(e.target.value ? +e.target.value : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? +e.target.value : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value={ProductSortBy.POPULARITY}>Best Match</option>
              <option value={ProductSortBy.PRICE_ASC}>Price: Low to High</option>
              <option value={ProductSortBy.PRICE_DESC}>Price: High to Low</option>
              <option value={ProductSortBy.RATING}>Top Rated</option>
              <option value={ProductSortBy.NEWEST}>Newest</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {search ? `Results for "${search}"` : category || 'All Products'}
          </h1>
          {data?.products && (
            <p className="text-sm text-gray-500">{data.products.totalElements} items</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error.message}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded border disabled:opacity-50 hover:bg-gray-100"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-4 py-2 rounded border ${i === page ? 'bg-emerald-700 text-white border-emerald-700' : 'hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 rounded border disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
