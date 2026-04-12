import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useApolloClient } from '@apollo/client';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearGuestCart } from '../../store/slices/guestCartSlice';
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const authCartCount = useSelector((s: RootState) => s.cart.cart?.itemCount ?? 0);
  const guestCartCount = useSelector((s: RootState) =>
    s.guestCart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)
  );
  const cartItemCount = isAuthenticated ? authCartCount : guestCartCount;
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearGuestCart());
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    await client.clearStore();
    navigate('/');
  };

  return (
    <header className="bg-emerald-700 text-white shadow-md">
      {/* Top bar */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 text-2xl font-bold tracking-tight">
            <span className="text-orange-400">S</span>uperMarketStore
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full rounded-full overflow-hidden border-2 border-orange-400">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything at SuperMarketStore online and in store"
                className="flex-1 px-4 py-2 text-gray-800 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-orange-400 px-4 py-2 hover:bg-orange-500 transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-emerald-800" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-1 text-sm hover:text-orange-400">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.firstName}</span>
                </Link>
                <Link to="/orders" className="text-sm hover:text-orange-400">My Orders</Link>
                <button onClick={handleLogout} className="text-sm hover:text-orange-400">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 text-sm">
                <Link to="/login" className="hover:text-orange-400">Sign In</Link>
                <Link to="/register" className="hover:text-orange-400">Create Account</Link>
              </div>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-1 hover:text-orange-400">
              <ShoppingCartIcon className="h-7 w-7" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-400 text-emerald-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
              <span className="hidden md:inline text-sm">Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="flex rounded-full overflow-hidden border-2 border-orange-400">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SuperMarketStore"
              className="flex-1 px-4 py-2 text-gray-800 outline-none text-sm"
            />
            <button type="submit" className="bg-orange-400 px-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-emerald-800" />
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-emerald-600 pt-3 space-y-2 text-sm">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-1 hover:text-orange-400" onClick={() => setMobileOpen(false)}>
                  My Account ({user?.firstName})
                </Link>
                <Link to="/orders" className="block py-1 hover:text-orange-400" onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>
                <button onClick={handleLogout} className="block py-1 hover:text-orange-400 text-left w-full">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-1 hover:text-orange-400" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="block py-1 hover:text-orange-400" onClick={() => setMobileOpen(false)}>Create Account</Link>
              </>
            )}
            <div className="border-t border-emerald-600 pt-2">
              {['Electronics', 'Grocery', 'Clothing', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Auto'].map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="block py-1 hover:text-orange-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category nav */}
      <nav className="bg-emerald-800 hidden md:block">
        <div className="container mx-auto px-4 max-w-7xl flex gap-6 py-2 text-sm overflow-x-auto">
          {['Electronics', 'Grocery', 'Clothing', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Auto'].map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="whitespace-nowrap hover:text-orange-400 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
