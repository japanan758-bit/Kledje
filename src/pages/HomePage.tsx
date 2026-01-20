import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProductWithImages } from '../types';
import { ProductCard } from '../components/features/ProductCard';
import { Loader2 } from 'lucide-react';

export function HomePage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithImages[];
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100/30 py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center md:text-right">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-800 mb-6 leading-tight">
                  منتجات عناية
                  <br />
                  <span className="text-primary-600">طبيعية</span>
                </h1>
                <p className="text-xl md:text-2xl text-primary-700 mb-8 leading-relaxed">
                  للبشرة والشعر
                </p>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  منتجات مصرية طبيعية وبسيطة وفعالة،
                  <br />
                  مخصّصة للاستخدام اليومي بأسعار مناسبة
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a
                    href="#products"
                    className="px-10 py-4 bg-primary-700 text-white rounded-full font-bold text-lg hover:bg-primary-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                  >
                    تصفح المنتجات
                  </a>
                </div>
              </div>

              {/* Logo Feature */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 md:w-80 md:h-80 bg-gradient-to-br from-primary-700 to-primary-900 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-9xl md:text-[160px] font-bold text-white">K</span>
                  </div>
                  {/* Decorative rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary-300 opacity-20 scale-110 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-primary-400 opacity-30 scale-125"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-300 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group text-center p-8 rounded-2xl hover:bg-primary-50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🌿</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">طبيعية 100%</h3>
              <p className="text-muted-foreground text-lg">مكونات طبيعية آمنة وفعالة</p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-primary-50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🇪🇬</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">صنع في مصر</h3>
              <p className="text-muted-foreground text-lg">منتجات محلية بجودة عالمية</p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-primary-50 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-3">أسعار مناسبة</h3>
              <p className="text-muted-foreground text-lg">جودة عالية بأسعار في المتناول</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-800 mb-4">منتجاتنا</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشف مجموعة متنوعة من منتجات العناية بالبشرة والشعر
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌿</div>
              <p className="text-xl text-muted-foreground">قريباً.. منتجات جديدة في الطريق</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-700 to-primary-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ابدأ رحلة العناية بنفسك اليوم
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            منتجات طبيعية فعالة بأسعار مناسبة
            <br />
            التوصيل لجميع أنحاء مصر
          </p>
          <a
            href="#products"
            className="inline-block px-12 py-5 bg-white text-primary-700 rounded-full font-bold text-xl hover:bg-primary-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 duration-300"
          >
            اطلب الآن
          </a>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-48 -translate-x-48"></div>
      </section>
    </div>
  );
}
