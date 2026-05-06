import { SetupForm } from '@customer/components/SetupForm';

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8">테이블 설정</h1>
        <SetupForm />
      </div>
    </div>
  );
}
