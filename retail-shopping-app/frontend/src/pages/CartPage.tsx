import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { GET_CART } from '../graphql/queries/cartQueries';
import { UPDATE_CART_ITEM, REMOVE_FROM_CART } from '../graphql/mutations/cartMutations';
import { RootState } from '../store';
import { updateGuestItem, removeGuestItem } from '../store/slices/guestCartSlice';

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const guestItems = useSelector((s: RootState) => s.guestCart.items);

  const { data, loading } = useQuery(GET_CART, {
    variables: { userId: user?.id },
    skip: !user,
    fetchPolicy: 'network-only',
  });

  const [updateItem] = useMutation(UPDATE_CART_ITEM, {
    onError: (e) => toast.error(e.message),
  });

  const [removeItem] = useMutation(REMOVE_FROM_CART, {
    onCompleted: () => toast.success('Item removed'),
    onError: (e) => toast.error(e.message),
    refetchQueries: [{ query: GET_CART, variables: { userId: user?.id } }],
  });

  // ── GUEST CART ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    const subtotal = guestItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const itemCount = guestItems.reduce((s, i) => s + i.quantity, 0);

    if (guestItems.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
          <p className="text-gray-500 mb-6">Browse products and add items to get started</p>
          <Link to="/products" className="bg-emerald-700 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-800">
            Start Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>

          {guestItems.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-4 flex gap-4">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                className="w-24 h-24 object-contain border rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-medium text-gray-800 hover:text-emerald-700 line-clamp-2">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                <p className="text-emerald-700 font-bold mt-2">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button
                      onClick={() => dispatch(updateGuestItem({ productId: product.id, quantity: quantity - 1 }))}
                      disabled={quantity <= 1}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1 font-medium">{quantity}</span>
                    <button
                      onClick={() => dispatch(updateGuestItem({ productId: product.id, quantity: quantity + 1 }))}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeGuestItem(product.id))}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${(product.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-emerald-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Sign in to checkout */}
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-center">
              <p className="text-gray-700 mb-3">Sign in to complete your purchase. Your cart will be saved.</p>
              <button
                onClick={() => navigate('/login?redirect=/checkout')}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-full transition-colors"
              >
                Sign In to Checkout
              </button>
              <button
                onClick={() => navigate('/register?redirect=/checkout')}
                className="w-full mt-2 border border-emerald-700 text-emerald-700 font-bold py-2.5 rounded-full hover:bg-emerald-50 transition-colors"
              >
                Create Account
              </button>
            </div>

            <Link
              to="/products"
              className="mt-3 w-full block text-center text-emerald-700 hover:underline text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED CART ───────────────────────────────────────────────────────
  if (loading) return <div className="text-center py-20 animate-pulse">Loading cart...</div>;

  const cart = data?.cart;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
        <p className="text-gray-500 mb-6">Add items to get started</p>
        <Link to="/products" className="bg-emerald-700 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
        </h1>

        {cart.items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex gap-4">
            <img
              src={item.product?.images?.[0] || '/placeholder.png'}
              alt={item.product?.name}
              className="w-24 h-24 object-contain border rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 line-clamp-2">{item.product?.name}</h3>
              <p className="text-emerald-700 font-bold mt-2">${item.unitPrice.toFixed(2)}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button
                    onClick={() => updateItem({ variables: { cartItemId: item.id, quantity: item.quantity - 1 } })}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-1 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItem({ variables: { cartItemId: item.id, quantity: item.quantity + 1 } })}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem({ variables: { cartItemId: item.id } })}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">${item.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow p-6 sticky top-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Savings</span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-emerald-700">${cart.total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 w-full block text-center bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-full transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/products"
            className="mt-3 w-full block text-center text-emerald-700 hover:underline text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
