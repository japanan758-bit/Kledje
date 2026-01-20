import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/admin/products', icon: Package, label: 'المنتجات' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
    { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-primary-700">K</span>
            </div>
            <h1 className="text-2xl font-bold">Kledje</h1>
          </div>
          <p className="text-primary-200 text-sm mr-12">لوحة التحكم</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-800 transition-colors w-full mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
