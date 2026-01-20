import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { SiteSetting } from '../../types';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});

  const { isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value || '';
      });
      setSettings(settingsMap);

      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (settingsToUpdate: Record<string, string>) => {
      const updates = Object.entries(settingsToUpdate).map(([key, value]) => ({
        key,
        value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('key', update.key);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء الحفظ');
    },
  });

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: 'معلومات المتجر',
      fields: [
        { key: 'site_name', label: 'اسم المتجر', type: 'text' },
        { key: 'site_logo_url', label: 'رابط الشعار', type: 'text' },
        { key: 'contact_phone', label: 'رقم الهاتف', type: 'tel' },
        { key: 'contact_email', label: 'البريد الإلكتروني', type: 'email' },
      ],
    },
    {
      title: 'الألوان',
      fields: [
        { key: 'primary_color', label: 'اللون الأساسي', type: 'color' },
        { key: 'secondary_color', label: 'اللون الثانوي', type: 'color' },
        { key: 'accent_color', label: 'لون التمييز', type: 'color' },
      ],
    },
    {
      title: 'نصوص الصفحة الرئيسية',
      fields: [
        { key: 'hero_title', label: 'عنوان الصفحة الرئيسية', type: 'text' },
        { key: 'hero_subtitle', label: 'نص فرعي', type: 'textarea' },
        { key: 'about_text', label: 'نبذة عن المتجر', type: 'textarea' },
      ],
    },
    {
      title: 'رسائل النظام',
      fields: [
        {
          key: 'order_confirmation_message',
          label: 'رسالة تأكيد الطلب',
          type: 'textarea',
        },
      ],
    },
    {
      title: 'الخطوط',
      fields: [{ key: 'font_family', label: 'الخط المستخدم', type: 'text' }],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-800 mb-8">إعدادات المتجر</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-primary-800 mb-6">{section.title}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={settings[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      rows={3}
                    />
                  ) : field.type === 'color' ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={settings[field.key] || '#000000'}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-20 h-12"
                      />
                      <Input
                        type="text"
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <Input
                      type={field.type}
                      value={settings[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            size="lg"
            className="min-w-40"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
