import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ProductWithImages } from '../../types';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Eye, EyeOff, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithImages | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    description_ar: '',
    price: '',
    price_before_discount: '',
    is_active: true,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*)
        `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithImages[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name_ar: data.name_ar,
          description_ar: data.description_ar,
          price: parseFloat(data.price),
          price_before_discount: data.price_before_discount
            ? parseFloat(data.price_before_discount)
            : null,
          is_active: data.is_active,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Add images
      const validImages = data.images.filter((url: string) => url.trim());
      if (validImages.length > 0) {
        const imageRecords = validImages.map((url: string, index: number) => ({
          product_id: product.id,
          image_url: url,
          sort_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم إضافة المنتج بنجاح');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة المنتج');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name_ar: data.name_ar,
          description_ar: data.description_ar,
          price: parseFloat(data.price),
          price_before_discount: data.price_before_discount
            ? parseFloat(data.price_before_discount)
            : null,
          is_active: data.is_active,
        })
        .eq('id', data.id);

      if (productError) throw productError;

      // Delete old images
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', data.id);

      if (deleteError) throw deleteError;

      // Add new images
      const validImages = data.images.filter((url: string) => url.trim());
      if (validImages.length > 0) {
        const imageRecords = validImages.map((url: string, index: number) => ({
          product_id: data.id,
          image_url: url,
          sort_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم تحديث المنتج بنجاح');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث المنتج');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف المنتج');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تم تحديث حالة المنتج');
    },
  });

  const handleOpenDialog = (product?: ProductWithImages) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name_ar: product.name_ar,
        description_ar: product.description_ar || '',
        price: product.price.toString(),
        price_before_discount: product.price_before_discount?.toString() || '',
        is_active: product.is_active,
      });
      setImageUrls(
        product.images.length > 0
          ? product.images.map((img) => img.image_url)
          : ['']
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name_ar: '',
        description_ar: '',
        price: '',
        price_before_discount: '',
        is_active: true,
      });
      setImageUrls(['']);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      images: imageUrls,
      id: editingProduct?.id,
    };

    if (editingProduct) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

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
        <h1 className="text-3xl font-bold text-primary-800">المنتجات</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-5 h-5 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">اسم المنتج *</label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  placeholder="مثال: كريم ترطيب طبيعي"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">الوصف</label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ar: e.target.value })
                  }
                  placeholder="وصف المنتج..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">السعر (ج.م) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="100.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">السعر قبل الخصم (ج.م)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_before_discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_before_discount: e.target.value,
                      })
                    }
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">صور المنتج</label>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {imageUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeImageField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageField}
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  إضافة صورة
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600"
                />
                <label htmlFor="is_active" className="font-medium">
                  منتج مفعل (ظاهر للعملاء)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  ) : null}
                  {editingProduct ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.images[0] ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name_ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    لا توجد صورة
                  </div>
                )}
                <button
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: product.id,
                      is_active: product.is_active,
                    })
                  }
                  className={`absolute top-2 left-2 p-2 rounded-full ${
                    product.is_active ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}
                >
                  {product.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-primary-800 mb-2">
                  {product.name_ar}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold text-accent-600">
                    {product.price} ج.م
                  </span>
                  {product.price_before_discount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.price_before_discount} ج.م
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(product)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground mb-4">لا توجد منتجات حتى الآن</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-5 h-5 ml-2" />
            إضافة أول منتج
          </Button>
        </div>
      )}
    </div>
  );
}
