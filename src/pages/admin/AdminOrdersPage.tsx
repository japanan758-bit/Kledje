import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { OrderWithItems } from '../../types';
import { toast } from 'sonner';
import { Loader2, Package, Phone, MapPin, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const statusOptions = [
  { value: 'new', label: 'جديد', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'shipping', label: 'قيد الشحن', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-800' },
];

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم تحديث حالة الطلب');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الحالة');
    },
  });

  const filteredOrders = orders?.filter((order) =>
    filterStatus === 'all' ? true : order.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary-800">الطلبات</h1>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = statusOptions.find((s) => s.value === order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-primary-800">
                        {order.customer_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig?.color}`}
                      >
                        {statusConfig?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>{order.items.length} منتجات</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{order.customer_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 flex items-start gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{order.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left mr-4">
                    <p className="text-3xl font-bold text-accent-600 mb-2">
                      {Number(order.total_amount).toFixed(2)} ج.م
                    </p>
                    <Select
                      value={order.status}
                      onValueChange={(status) =>
                        updateStatusMutation.mutate({ orderId: order.id, status })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-bold text-primary-800 mb-3">المنتجات:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-primary-800">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {Number(item.product_price).toFixed(2)} ج.م
                          </p>
                        </div>
                        <p className="font-bold text-primary-800">
                          {Number(item.subtotal).toFixed(2)} ج.م
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            {filterStatus === 'all'
              ? 'لا توجد طلبات حتى الآن'
              : `لا توجد طلبات ${statusOptions.find((s) => s.value === filterStatus)?.label}`}
          </p>
        </div>
      )}
    </div>
  );
}
