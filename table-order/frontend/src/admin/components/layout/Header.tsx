import { useAdminAuthStore } from '@/admin/stores/useAdminAuthStore';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const admin = useAdminAuthStore((state) => state.admin);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {admin && (
        <span className="text-sm text-gray-500">{admin.username}</span>
      )}
    </header>
  );
}
