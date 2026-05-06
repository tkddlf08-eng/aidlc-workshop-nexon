import { useState, useEffect, FormEvent } from 'react';
import Modal from '@/shared/components/Modal';
import Button from '@/shared/components/Button';
import ImageUploader from './ImageUploader';
import { useMenuStore, type DisplayMenu } from '@/admin/stores/useMenuStore';
import { useUIStore } from '@/admin/stores/useUIStore';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DisplayMenu;
}

export default function MenuFormModal({ isOpen, onClose, initialData }: MenuFormModalProps) {
  const { categories, createMenu, updateMenu } = useMenuStore();
  const { showToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
  });
  const [image, setImage] = useState<File | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: String(initialData.price),
        description: initialData.description || '',
        categoryId: String(initialData.categoryId),
      });
    } else {
      setFormData({ name: '', price: '', description: '', categoryId: '' });
    }
    setImage(undefined);
    setErrors({});
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '메뉴명을 입력해주세요';
    if (formData.name.length > 50) newErrors.name = '50자 이내로 입력해주세요';
    if (!formData.price) newErrors.price = '가격을 입력해주세요';
    if (Number(formData.price) < 0) newErrors.price = '0 이상의 숫자를 입력해주세요';
    if (!formData.categoryId) newErrors.categoryId = '카테고리를 선택해주세요';
    if (formData.description.length > 200) newErrors.description = '200자 이내로 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId,
        image,
      };

      if (isEditing) {
        await updateMenu(initialData!.id, data);
        showToast('success', '메뉴가 수정되었습니다');
      } else {
        await createMenu(data);
        showToast('success', '메뉴가 등록되었습니다');
      }
      onClose();
    } catch {
      showToast('error', isEditing ? '메뉴 수정에 실패했습니다' : '메뉴 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? '메뉴 수정' : '메뉴 등록'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="menu-form">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메뉴명 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="메뉴명을 입력하세요"
            data-testid="menu-form-name-input"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">가격 *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="0"
            min="0"
            data-testid="menu-form-price-input"
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            data-testid="menu-form-category-select"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            rows={3}
            placeholder="메뉴 설명 (선택)"
            data-testid="menu-form-description-input"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <ImageUploader
          currentImageUrl={initialData?.imageUrl || undefined}
          onImageSelect={setImage}
          onImageRemove={() => setImage(undefined)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" isLoading={isSubmitting} data-testid="menu-form-submit-button">
            {isEditing ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
