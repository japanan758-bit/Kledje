import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProductWithImages } from '../types';
import { addToCart, getCartItemCount } from '../lib/cartService';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../stores/cartStore';
import { toast } from 'sonner';
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const setItemCount = useCartStore((state) => state.setItemCount);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductWithImages;
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
      await addToCart(user?.id || null, product.id, quantity);
      
      // Update cart count
      const count = await getCartItemCount(user?.id || null);
      setItemCount(count);

      toast.success('تمت الإضافة إلى السلة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الإضافة للسلة');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-muted-foreground">المنتج غير موجود</p>
      </div>
    );
  }

  const images = product.images.length > 0 
    ? product.images 
    : [{ id: '1', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop', product_id: product.id, sort_order: 0, created_at: '' }];

  const hasDiscount = product.price_before_discount && product.price_before_discount > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price_before_discount! - product.price) / product.price_before_discount!) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
              <img
                src={images[currentImageIndex].image_url}
                alt={product.name_ar}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                  -{discountPercent}%
                </div>
              )}
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-primary-600" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-primary-600" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index 
                        ? 'border-primary-500' 
                        : 'border-transparent hover:border-primary-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name_ar} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold text-primary-800 mb-4">
              {product.name_ar}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-accent-600">
                {product.price} ج.م
              </span>
              {hasDiscount && (
                <span className="text-2xl text-muted-foreground line-through">
                  {product.price_before_discount} ج.م
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_ar && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary-800 mb-3">الوصف</h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description_ar}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-primary-800 mb-3">
                الكمية
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-secondary text-primary-600 rounded-lg font-bold text-xl hover:bg-primary-100 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-primary-800 w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-secondary text-primary-600 rounded-lg font-bold text-xl hover:bg-primary-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button
                onClick={handleBuyNow}
                disabled={isAdding}
                className="flex-1 h-14 text-lg font-bold"
              >
                اشتري الآن
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                variant="outline"
                className="flex-1 h-14 text-lg font-bold border-2"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <ShoppingCart className="w-5 h-5 ml-2" />
                )}
                أضف للسلة
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-primary-50 rounded-xl">
              <ul className="space-y-3 text-primary-700">
                <li className="flex items-center gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>الدفع عند الاستلام</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>التوصيل لجميع أنحاء مصر</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-500">✓</span>
                  <span>منتج أصلي 100%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
