import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary-700">K</span>
              </div>
              <h3 className="text-2xl font-bold">Kledje</h3>
            </div>
            <p className="text-primary-100 leading-relaxed text-lg">
              علامة مصرية متخصصة في منتجات العناية بالبشرة والشعر.
              منتجات طبيعية وبسيطة وفعالة، مخصّصة للاستخدام اليومي.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-primary-100 hover:text-white transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-primary-100 hover:text-white transition-colors">
                  سلة الشراء
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-primary-100 hover:text-white transition-colors">
                  حسابي
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-100">
                <Phone className="w-5 h-5" />
                <span>01XXXXXXXXX</span>
              </li>
              <li className="flex items-center gap-2 text-primary-100">
                <Mail className="w-5 h-5" />
                <span>info@kledje.store</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-primary-700 rounded-full hover:bg-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-700 rounded-full hover:bg-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-100">
          <p>© {new Date().getFullYear()} Kledje. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
