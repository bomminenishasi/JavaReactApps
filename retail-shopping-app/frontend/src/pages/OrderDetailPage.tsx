import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_ID } from '../graphql/queries/orderQueries';

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery(GET_ORDER_BY_ID, { variables: { id } });

  if (loading) return <div className="text-center py-20 animate-pulse">Loading order...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Failed to load order.</div>;

  const order = data?.order;
  if (!order) return (
    <div className="text-center py-20">
      <p className="text-red-500 text-lg">Order not found.</p>
      <Link to="/orders" className="mt-4 inline-block text-emerald-700 hover:underline">Back to Orders</Link>
    </div>
  );

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-emerald-700 hover:underline text-sm">← My Orders</Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {order.status?.replace(/_/g, ' ')}
            </span>
            {order.createdAt && (
              <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-center min-w-[480px]">
              {STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= stepIndex ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-1 text-center w-16 text-gray-500 leading-tight">
                      {step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? 'bg-emerald-700' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {order.estimatedDelivery && (
          <p className="text-sm text-green-600 mb-4">
            Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
          </p>
        )}

        {/* Items */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-800">Items</h2>
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <div>
                <p className="font-medium text-gray-800">{item.productName}</p>
                <p className="text-gray-500">SKU: {item.sku} × {item.quantity}</p>
              </div>
              <span className="font-medium">${item.totalPrice?.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="text-green-600">FREE</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${order.tax?.toFixed(2)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600"><span>Savings</span><span>-${order.discount?.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-emerald-700">${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-3">Shipping Address</h2>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.street && <>{order.shippingAddress.street}<br /></>}
            {order.shippingAddress.city && order.shippingAddress.state && (
              <>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br /></>
            )}
            {order.shippingAddress.country}
          </p>
        </div>
      )}

      {/* Payment */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold mb-3">Payment</h2>
        <p className="text-sm text-gray-600">
          {order.paymentStatus?.replace(/_/g, ' ')} · {order.paymentStatus === 'CAPTURED' ? 'Paid' : order.paymentStatus}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailPage;
