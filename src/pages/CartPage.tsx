import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCartWithItems, updateCartItemQuantity, removeFromCart } from '../lib/cartService';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../stores/cartStore';
import { toast } from 'sonner';
import { Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';

export function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setItemCount = useCartStore((state) => state.setItemCount);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => getCartWithItems(user?.id || null),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(user?.id || null, itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('تم تحديث الكمية');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء التحديث');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeFromCart(user?.id || null, itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      
      // Recalculate count
      const updatedCart = await getCartWithItems(user?.id || null);
      const count = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
      
      toast.success('تم حذف المنتج من السلة');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-800 mb-4">
            سلة التسوق فارغة
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            لم تقم بإضافة أي منتجات بعد
          </p>
          <Button onClick={() => navigate('/')} size="lg">
            تصفح المنتجات
          </Button>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-800 mb-8">سلة التسوق</h1>

        <div className="space-y-4 mb-8">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4"
              >
                {/* Image */}
                <img
                  src={mainImage}
                  alt={product.name_ar}
                  className="w-24 h-24 rounded-lg object-cover"
                />

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-primary-800 mb-2">
                    {product.name_ar}
                  </h3>
                  <p className="text-accent-600 font-bold text-xl mb-3">
                    {product.price} ج.م
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="w-8 h-8 bg-secondary text-primary-600 rounded-lg font-bold hover:bg-primary-100 transition-colors disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-primary-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      disabled={updateMutation.isPending}
                      className="w-8 h-8 bg-secondary text-primary-600 rounded-lg font-bold hover:bg-primary-100 transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="text-lg font-bold text-primary-800">
                    {(product.price * item.quantity).toFixed(2)} ج.م
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-primary-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-primary-700">عدد المنتجات:</span>
            <span className="text-lg font-bold text-primary-800">
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-primary-200">
            <span className="text-2xl font-bold text-primary-800">المجموع:</span>
            <span className="text-3xl font-bold text-accent-600">
              {total.toFixed(2)} ج.م
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={() => navigate('/checkout')}
          size="lg"
          className="w-full h-14 text-lg font-bold"
        >
          إتمام الطلب
        </Button>
      </div>
    </div>
  );
}
