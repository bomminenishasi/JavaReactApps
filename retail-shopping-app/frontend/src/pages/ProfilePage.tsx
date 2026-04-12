import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Account</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-700 text-white flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Email', value: user.email },
            { label: 'Phone', value: user.phone || 'Not set' },
            { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
            { label: 'Account Type', value: user.role ?? 'CUSTOMER' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
              <p className="font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/orders" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow text-center">
          <p className="text-3xl mb-2">📦</p>
          <p className="font-semibold">My Orders</p>
          <p className="text-xs text-gray-400 mt-1">View order history</p>
        </Link>
        <Link to="/cart" className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow text-center">
          <p className="text-3xl mb-2">🛒</p>
          <p className="font-semibold">My Cart</p>
          <p className="text-xs text-gray-400 mt-1">View current cart</p>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
