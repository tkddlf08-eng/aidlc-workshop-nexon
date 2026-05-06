interface BadgeProps {
  count?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  label?: string;
}

const variantStyles = {
  primary: 'bg-primary-600 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
  gray: 'bg-gray-400 text-white',
};

export function Badge({ count, variant = 'primary', label }: BadgeProps) {
  const text = label || (count !== undefined ? String(count) : '');
  if (!text) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5 rounded-full
        text-xs font-bold
        ${variantStyles[variant]}
      `}
      data-testid="badge"
    >
      {text}
    </span>
  );
}
