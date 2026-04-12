import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useApolloClient } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { REGISTER } from '../graphql/mutations/authMutations';
import { ADD_TO_CART } from '../graphql/mutations/cartMutations';
import { loginSuccess } from '../store/slices/authSlice';
import { clearGuestCart } from '../store/slices/guestCartSlice';
import { RootState } from '../store';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const client = useApolloClient();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const guestItems = useSelector((s: RootState) => s.guestCart.items);

  const [addToCart] = useMutation(ADD_TO_CART);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const [registerUser, { loading }] = useMutation(REGISTER, {
    onCompleted: async (data) => {
      const { token, refreshToken, user } = data.register;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess({ user, token }));

      // Merge guest cart — only clear after all succeed
      const itemsToMerge = [...guestItems];
      if (itemsToMerge.length > 0) {
        let merged = 0;
        for (const { product, quantity } of itemsToMerge) {
          try {
            await addToCart({ variables: { userId: user.id, productId: product.id, quantity } });
            merged++;
          } catch (e) {
            console.error('Failed to merge cart item:', e);
          }
        }
        if (merged > 0) dispatch(clearGuestCart());
        toast.success(`Account created! ${merged} cart item${merged !== 1 ? 's' : ''} saved to your account.`);
      } else {
        toast.success('Account created successfully!');
      }

      await client.resetStore();
      navigate(redirect, { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (values: RegisterForm) => {
    registerUser({ variables: { input: values } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-700 mb-1">
            <span className="text-orange-500">S</span>uperMarketStore
          </h1>
          <p className="text-gray-500 text-sm">Create your account</p>
          {guestItems.length > 0 && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 text-sm text-emerald-700">
              🛒 {guestItems.length} item{guestItems.length > 1 ? 's' : ''} waiting in your cart
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                {...register('firstName', { required: 'Required' })}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                {...register('lastName', { required: 'Required' })}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Required' })}
              className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
              className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-full transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-emerald-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
