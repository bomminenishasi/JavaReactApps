import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries/productQueries';
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types';

const HERO_CATEGORIES = [
  { name: 'Electronics', icon: '📱', color: 'bg-blue-100' },
  { name: 'Grocery', icon: '🛒', color: 'bg-green-100' },
  { name: 'Clothing', icon: '👗', color: 'bg-pink-100' },
  { name: 'Home & Garden', icon: '🏡', color: 'bg-yellow-100' },
  { name: 'Sports', icon: '⚽', color: 'bg-orange-100' },
  { name: 'Toys', icon: '🧸', color: 'bg-purple-100' },
];

const HomePage: React.FC = () => {
  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: { filter: { page: 0, size: 8 } },
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-10 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-2">
            Summer Sale — Up to 50% off
          </p>
          <h1 className="text-4xl font-bold mb-4">Save More, Live Better</h1>
          <p className="text-emerald-200 mb-6">Free 2-day delivery on millions of items</p>
          <Link
            to="/products"
            className="bg-orange-400 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-500 transition-colors"
          >
            Shop Now
          </Link>
        </div>
        <div className="text-8xl">🛍️</div>
      </div>

      {/* Category Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {HERO_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`${cat.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Today's Top Deals</h2>
          <Link to="/products" className="text-emerald-700 hover:underline text-sm font-medium">
            See all deals →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data?.products?.content?.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value Prop Banners */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🚚', title: 'Free Delivery', sub: 'On orders over $35' },
          { icon: '↩️', title: 'Easy Returns', sub: 'Free 90-day returns' },
          { icon: '🔒', title: 'Secure Checkout', sub: 'SSL encrypted payments' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-6 flex items-center gap-4 shadow">
            <span className="text-4xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
