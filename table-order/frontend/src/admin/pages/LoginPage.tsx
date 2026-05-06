import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';
import Button from '@/shared/components/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAdminAuthStore();

  const [formData, setFormData] = useState({
    storeId: '',
    username: '',
    password: '',
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({
        store_code: formData.storeId,
        username: formData.username,
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch {
      // 에러는 store에서 관리
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">테이블오더</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
          data-testid="login-form"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
              매장 식별자
            </label>
            <input
              id="storeId"
              type="text"
              value={formData.storeId}
              onChange={(e) => setFormData((prev) => ({ ...prev, storeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="매장 ID를 입력하세요"
              required
              data-testid="login-store-id-input"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="사용자명을 입력하세요"
              required
              data-testid="login-username-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
              data-testid="login-password-input"
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            data-testid="login-submit-button"
          >
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}
