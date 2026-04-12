import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GET_CART } from '../graphql/queries/cartQueries';
import { CREATE_ORDER } from '../graphql/mutations/orderMutations';
import { RootState } from '../store';
import { PaymentMethod } from '../types';

interface CheckoutForm {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { user } = useSelector((s: RootState) => s.auth);
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<CheckoutForm>({
    defaultValues: { country: 'US', paymentMethod: PaymentMethod.CREDIT_CARD },
  });

  const paymentMethod = watch('paymentMethod');
  const isCard = paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.DEBIT_CARD;

  const { data, loading: cartLoading } = useQuery(GET_CART, {
    variables: { userId: user?.id },
    fetchPolicy: 'network-only',
  });

  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    onCompleted: async (data) => {
      toast.success(`Order #${data.createOrder.orderNumber} placed!`);
      await client.resetStore();
      navigate(`/orders/${data.createOrder.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const cart = data?.cart;

  const handleShippingNext = async () => {
    const valid = await trigger(['street', 'city', 'state', 'zipCode', 'country']);
    if (valid) setStep('payment');
  };

  const handlePaymentNext = async () => {
    if (isCard) {
      const valid = await trigger(['cardNumber', 'cardExpiry', 'cardCvv']);
      if (!valid) return;
    }
    setStep('review');
  };

  const onSubmit = (values: CheckoutForm) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!user?.id) {
      toast.error('Please sign in to place an order');
      return;
    }
    const address = {
      street: values.street,
      city: values.city,
      state: values.state,
      zipCode: values.zipCode,
      country: values.country,
    };
    createOrder({
      variables: {
        input: {
          userId: user.id,
          cartId: cart.id,
          shippingAddress: address,
          billingAddress: address,
          paymentMethod: values.paymentMethod,
        },
      },
    });
  };

  if (cartLoading) return <div className="text-center py-20 animate-pulse">Loading your cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
        <p className="text-gray-500 mb-6">Add items before checking out</p>
        <Link to="/products" className="bg-emerald-700 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {(['shipping', 'payment', 'review'] as const).map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step === s ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-emerald-700 text-white' : 'bg-gray-200'}`}>{i + 1}</span>
              <span className="capitalize hidden sm:inline">{s}</span>
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-3" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Step 1: Shipping */}
            {step === 'shipping' && (
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="font-bold text-lg">Shipping Address</h2>
                <div>
                  <input
                    {...register('street', { required: 'Street address is required' })}
                    placeholder="Street Address"
                    className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.street ? 'border-red-400' : ''}`}
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('city', { required: 'City is required' })}
                      placeholder="City"
                      className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.city ? 'border-red-400' : ''}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('state', { required: 'State is required' })}
                      placeholder="State"
                      className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.state ? 'border-red-400' : ''}`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('zipCode', {
                        required: 'ZIP code is required',
                        pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Enter a valid ZIP code' },
                      })}
                      placeholder="ZIP Code"
                      className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.zipCode ? 'border-red-400' : ''}`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('country', { required: 'Country is required' })}
                      placeholder="Country"
                      className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.country ? 'border-red-400' : ''}`}
                    />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleShippingNext}
                  className="w-full bg-emerald-700 text-white font-bold py-3 rounded-full hover:bg-emerald-800"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="font-bold text-lg">Payment Method</h2>
                <select
                  {...register('paymentMethod')}
                  className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
                  <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
                  <option value={PaymentMethod.PAYPAL}>PayPal</option>
                  <option value={PaymentMethod.WALMART_PAY}>Store Pay</option>
                </select>

                {isCard && (
                  <>
                    <div>
                      <input
                        {...register('cardNumber', {
                          required: 'Card number is required',
                          pattern: { value: /^\d{16}$/, message: 'Enter a valid 16-digit card number' },
                        })}
                        placeholder="Card Number (16 digits)"
                        maxLength={16}
                        className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.cardNumber ? 'border-red-400' : ''}`}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          {...register('cardExpiry', {
                            required: 'Expiry is required',
                            pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Use MM/YY format' },
                          })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.cardExpiry ? 'border-red-400' : ''}`}
                        />
                        {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry.message}</p>}
                      </div>
                      <div>
                        <input
                          {...register('cardCvv', {
                            required: 'CVV is required',
                            pattern: { value: /^\d{3,4}$/, message: 'Enter 3 or 4 digit CVV' },
                          })}
                          placeholder="CVV"
                          maxLength={4}
                          type="password"
                          className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 ${errors.cardCvv ? 'border-red-400' : ''}`}
                        />
                        {errors.cardCvv && <p className="text-red-500 text-xs mt-1">{errors.cardCvv.message}</p>}
                      </div>
                    </div>
                  </>
                )}

                {!isCard && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                    You will be redirected to complete payment after placing your order.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-full hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePaymentNext}
                    className="flex-1 bg-emerald-700 text-white font-bold py-3 rounded-full hover:bg-emerald-800"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h2 className="font-bold text-lg">Review & Place Order</h2>
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">Shipping to:</p>
                  <p>{getValues('street')}</p>
                  <p>{getValues('city')}, {getValues('state')} {getValues('zipCode')}, {getValues('country')}</p>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-800 mb-1">Payment:</p>
                  <p>{getValues('paymentMethod').replace(/_/g, ' ')}</p>
                  {isCard && <p>Card ending ···· {getValues('cardNumber')?.slice(-4)}</p>}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Items ({cart?.itemCount}):</p>
                  {cart?.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                      <span>${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-full hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-400 text-white font-bold py-3 rounded-full transition-colors"
                  >
                    {loading ? 'Placing Order...' : `Place Order — $${cart?.total?.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-xl shadow p-5 h-fit sticky top-4">
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {cart?.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate max-w-[140px]">{item.product?.name} ×{item.quantity}</span>
                  <span>${item.totalPrice?.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>${cart?.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">FREE</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${cart?.tax?.toFixed(2)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-emerald-700">${cart?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
