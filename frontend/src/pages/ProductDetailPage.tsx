import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { StarIcon, ShoppingCartIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { GET_PRODUCT_BY_ID } from '../graphql/queries/productQueries';
import { ADD_TO_CART } from '../graphql/mutations/cartMutations';
import { RootState } from '../store';
import { addGuestItem } from '../store/slices/guestCartSlice';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, { variables: { id } });

  const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
    onCompleted: () => toast.success(`Added ${quantity} item(s) to cart!`),
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="text-center py-20 animate-pulse">Loading product...</div>;
  if (error || !data?.product) {
    return <div className="text-center py-20 text-red-500">Product not found</div>;
  }

  const product = data.product;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (user) {
      addToCart({ variables: { userId: user.id, productId: product.id, quantity } });
    } else {
      dispatch(addGuestItem({ product, quantity }));
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square border rounded-xl overflow-hidden mb-4 bg-gray-50">
            <img
              src={product.images?.[selectedImage] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 ${i === selectedImage ? 'border-emerald-700' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <nav className="text-sm text-gray-500">
            <Link to="/products" className="hover:text-emerald-700">Products</Link>
            {' / '}
            <Link to={`/products?category=${encodeURIComponent(product.category?.name || '')}`} className="hover:text-emerald-700">
              {product.category?.name}
            </Link>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">
            Brand: <span className="font-medium">{product.brand}</span> · SKU: {product.sku}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} className={`h-5 w-5 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-emerald-700 text-sm font-medium">{product.rating?.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-emerald-800">${product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`inline-flex items-center gap-2 text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.inStock ? `In Stock (${product.stockQuantity} left)` : 'Out of Stock'}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Quantity & Add to Cart */}
          {product.inStock && (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-lg"
                >−</button>
                <span className="px-5 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-lg"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-full transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Delivery info */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TruckIcon className="h-5 w-5 text-emerald-600" />
              <span>Free 2-day delivery on orders over $35</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ArrowPathIcon className="h-5 w-5 text-emerald-600" />
              <span>Free 90-day returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
