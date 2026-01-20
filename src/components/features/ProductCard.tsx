import { Link } from 'react-router-dom';
import { ProductWithImages } from '../types';

interface ProductCardProps {
  product: ProductWithImages;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]?.image_url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop';
  const hasDiscount = product.price_before_discount && product.price_before_discount > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price_before_discount! - product.price) / product.price_before_discount!) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-300 hover:scale-105"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={mainImage}
          alt={product.name_ar}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-primary-800 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {product.name_ar}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent-600">
            {product.price} ج.م
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price_before_discount} ج.م
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
