import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({ currentImageUrl, onImageSelect, onImageRemove }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('JPG, PNG, WebP 형식만 업로드 가능합니다');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('5MB 이하의 파일만 업로드 가능합니다');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentImageUrl;

  return (
    <div data-testid="image-uploader">
      <label className="block text-sm font-medium text-gray-700 mb-1">이미지</label>

      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt="메뉴 이미지 미리보기"
            className="h-24 w-24 rounded-lg object-cover border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
            aria-label="이미지 제거"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          data-testid="image-upload-button"
        >
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">이미지 업로드 (JPG, PNG, WebP, 5MB 이하)</span>
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
