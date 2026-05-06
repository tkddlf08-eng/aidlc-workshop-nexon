interface DateFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateChange: (from: string, to: string) => void;
}

export default function DateFilter({ dateFrom, dateTo, onDateChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-3" data-testid="date-filter">
      <div>
        <label htmlFor="date-from" className="block text-xs text-gray-500 mb-1">시작일</label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateChange(e.target.value, dateTo)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          data-testid="date-filter-from"
        />
      </div>
      <span className="text-gray-400 mt-5">~</span>
      <div>
        <label htmlFor="date-to" className="block text-xs text-gray-500 mb-1">종료일</label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateChange(dateFrom, e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          data-testid="date-filter-to"
        />
      </div>
    </div>
  );
}
