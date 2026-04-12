import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { GET_ORDERS } from '../graphql/queries/orderQueries';
import { RootState } from '../store';
import { Order, OrderStatus } from '../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700',
  [OrderStatus.PROCESSING]: 'bg-indigo-100 text-indigo-700',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-700',
  [OrderStatus.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-700',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-700',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700',
  [OrderStatus.RETURNED]: 'bg-gray-100 text-gray-700',
};

const OrdersPage: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { data, loading, error } = useQuery(GET_ORDERS, {
    variables: { userId: user?.id },
    fetchPolicy: 'network-only',
    skip: !user?.id,
  });

  if (loading) return <div className="text-center py-20 animate-pulse">Loading orders...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Failed to load orders.</div>;

  const orders: Order[] = data?.orders ?? [];

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📦</p>
        <p className="text-2xl font-semibold mb-2">No orders yet</p>
        <p className="text-gray-500 mb-6">Once you place an order, it will appear here.</p>
        <Link to="/products" className="bg-emerald-700 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-800">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="block">
            <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-gray-800">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.createdAt
                      ? `Placed ${new Date(order.createdAt).toLocaleDateString()}`
                      : 'Date unavailable'}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">{order.items?.length ?? 0} item(s)</span>
                <span className="font-bold text-emerald-700">${order.total?.toFixed(2)}</span>
              </div>
              {order.estimatedDelivery && (
                <p className="text-xs text-green-600 mt-1">
                  Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
