import { LoadingSpinner } from './LoadingSpinner';

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm">로딩 중...</p>
    </div>
  );
}
