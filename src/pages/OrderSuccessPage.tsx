import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function OrderSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-primary-800 mb-4">
            تم استلام طلبك بنجاح!
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            شكراً لك على ثقتك في Kledje
          </p>
        </div>

        <div className="bg-primary-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-800 mb-4">ما الخطوة التالية؟</h2>
          <ul className="space-y-3 text-right text-lg text-primary-700">
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-1">1.</span>
              <span>سيتم مراجعة طلبك وتأكيده</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-1">2.</span>
              <span>سنتواصل معك على رقم الهاتف المسجل</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-1">3.</span>
              <span>سيتم شحن طلبك في أقرب وقت</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-500 mt-1">4.</span>
              <span>الدفع عند الاستلام</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/')} size="lg">
            العودة للصفحة الرئيسية
          </Button>
          <Button onClick={() => navigate('/account')} variant="outline" size="lg">
            عرض طلباتي
          </Button>
        </div>
      </div>
    </div>
  );
}
