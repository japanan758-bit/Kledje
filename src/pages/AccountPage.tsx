import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { OrderWithItems } from '../types';
import { Loader2, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
  new: { label: 'جديد', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'قيد التجهيز', icon: Package, color: 'text-yellow-600 bg-yellow-50' },
  shipping: { label: 'قيد الشحن', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'تم التسليم', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export function AccountPage() {
  const { user, loading } = useAuth();

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-4">حسابي</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الاسم</p>
              <p className="text-lg font-bold text-primary-800">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
              <p className="text-lg font-bold text-primary-800">{user.phone || '-'}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary-800 mb-6">طلباتي</h2>

        {loadingOrders ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(order.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-lg font-bold text-primary-800">
                        {order.total_amount.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-bold">{config.label}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-bold text-primary-800 mb-2">المنتجات:</p>
                    <ul className="space-y-2">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="font-bold text-primary-800">
                            {item.subtotal.toFixed(2)} ج.م
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">لا توجد طلبات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}
