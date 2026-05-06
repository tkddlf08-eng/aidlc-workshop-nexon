import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuthStore } from '@customer/stores/useCustomerAuthStore';
import { Button } from '@shared/components/Button';
import { InputField } from '@shared/components/InputField';

export function SetupForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useCustomerAuthStore();

  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ storeId, tableNumber, password });
      navigate('/', { replace: true });
    } catch {
      // Error is handled by store
    }
  };

  const isValid = storeId.trim() && tableNumber.trim() && password.trim();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="setup-form">
      <InputField
        label="매장 식별자"
        value={storeId}
        onChange={(e) => setStoreId(e.target.value)}
        placeholder="매장 ID를 입력하세요"
        required
      />
      <InputField
        label="테이블 번호"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="테이블 번호를 입력하세요"
        required
      />
      <InputField
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호를 입력하세요"
        required
      />
      {error && <p className="text-sm text-red-500" data-testid="setup-error">{error}</p>}
      <Button
        type="submit"
        disabled={!isValid}
        isLoading={isLoading}
        size="lg"
        className="mt-2"
        data-testid="setup-submit-button"
      >
        설정 완료
      </Button>
    </form>
  );
}
