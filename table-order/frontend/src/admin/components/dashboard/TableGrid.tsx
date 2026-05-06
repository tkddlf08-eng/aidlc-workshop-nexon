import TableCard from './TableCard';
import EmptyState from '@/shared/components/EmptyState';
import { useOrderStore } from '@/admin/stores/useOrderStore';

export default function TableGrid() {
  const tables = useOrderStore((state) => state.tables);

  if (tables.length === 0) {
    return <EmptyState title="등록된 테이블이 없습니다" description="테이블을 먼저 설정해주세요" />;
  }

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
      data-testid="table-grid"
    >
      {tables.map((table) => (
        <TableCard key={table.table_id} table={table} />
      ))}
    </div>
  );
}
