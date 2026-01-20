import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../stores/cartStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function Header() {
  const { user, isAdmin } = useAuth();
  const itemCount = useCartStore((state) => state.itemCount);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } else {
      toast.success('تم تسجيل الخروج بنجاح');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
            <div>
              <div className="text-xl font-bold text-primary-800">Kledje</div>
              <div className="text-xs text-primary-600">كليدچ</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-primary-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    لوحة التحكم
                  </Link>
                )}
                <Link
                  to="/account"
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <User className="w-6 h-6 text-primary-600" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <LogOut className="w-6 h-6 text-destructive" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
