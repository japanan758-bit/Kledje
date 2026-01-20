import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCartWithItems, clearCart } from '../lib/cartService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../stores/cartStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const setItemCount = useCartStore((state) => state.setItemCount);

  const [formData, setFormData] = useState({
    customer_name: user?.username || '',
    customer_phone: user?.phone || '',
    customer_address: '',
    notes: '',
  });

  const { data: cart, isLoading: loadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => getCartWithItems(user?.id || null),
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cart || cart.items.length === 0) {
        throw new Error('السلة فارغة');
      }

      const total = cart.items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          total_amount: total,
          notes: formData.notes,
          status: 'new',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name_ar || '',
        product_price: item.product?.price || 0,
        quantity: item.quantity,
        subtotal: (item.product?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart(user?.id || null);
      setItemCount(0);

      return order;
    },
    onSuccess: () => {
      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
      navigate('/order-success');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب');
    },
  });

  if (loadingCart) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const total = cart.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_phone || !formData.customer_address) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    createOrderMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-800 mb-8">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">معلومات التوصيل</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    الاسم الكامل *
                  </label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    رقم الهاتف *
                  </label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    العنوان الكامل *
                  </label>
                  <Textarea
                    value={formData.customer_address}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_address: e.target.value })
                    }
                    placeholder="المحافظة، المدينة، الشارع، رقم المبنى"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="أي ملاحظات إضافية"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full h-12 text-lg font-bold"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      جاري إرسال الطلب...
                    </>
                  ) : (
                    'تأكيد الطلب'
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-primary-50 rounded-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-primary-800">
                          {product.name_ar}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {product.price} ج.م
                        </p>
                      </div>
                      <p className="font-bold text-primary-800">
                        {(product.price * item.quantity).toFixed(2)} ج.م
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-primary-200 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-primary-800">المجموع:</span>
                  <span className="text-3xl font-bold text-accent-600">
                    {total.toFixed(2)} ج.م
                  </span>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-2">
                  <p className="flex items-center gap-2 text-sm text-primary-700">
                    <span className="text-primary-500">✓</span>
                    الدفع عند الاستلام
                  </p>
                  <p className="flex items-center gap-2 text-sm text-primary-700">
                    <span className="text-primary-500">✓</span>
                    التوصيل لجميع أنحاء مصر
                  </p>
                  <p className="flex items-center gap-2 text-sm text-primary-700">
                    <span className="text-primary-500">✓</span>
                    سنتواصل معك لتأكيد الطلب
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
