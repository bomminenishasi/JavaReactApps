import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { Product } from '../../types';
import { ADD_TO_CART } from '../../graphql/mutations/cartMutations';
import { RootState } from '../../store';
import { addGuestItem } from '../../store/slices/guestCartSlice';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);

  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
    onCompleted: () => toast.success(`${product.name} added to cart!`),
    onError: (err) => toast.error(err.message),
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      addToCart({ variables: { userId: user.id, productId: product.id, quantity: 1 } });
    } else {
      dispatch(addGuestItem({ product, quantity: 1 }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-3.5 w-3.5 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-emerald-800">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 text-white py-2 rounded-full text-sm font-medium transition-colors"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
