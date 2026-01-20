import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Loader2, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      ]);

      const totalRevenue = ordersRes.data?.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      ) || 0;

      return {
        productsCount: productsRes.count || 0,
        ordersCount: ordersRes.data?.length || 0,
        totalRevenue,
        usersCount: usersRes.count || 0,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'إجمالي المنتجات',
      value: stats?.productsCount || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'إجمالي الطلبات',
      value: stats?.ordersCount || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      label: 'إجمالي المبيعات',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} ج.م`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      label: 'عدد المستخدمين',
      value: stats?.usersCount || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-800 mb-8">لوحة التحكم</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-800">أحدث الطلبات</h2>
          <Link
            to="/admin/orders"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            عرض الكل ←
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-primary-800">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-accent-600">
                    {Number(order.total_amount).toFixed(2)} ج.م
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">لا توجد طلبات حتى الآن</p>
        )}
      </div>
    </div>
  );
}
