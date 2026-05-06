interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function QuantityControl({ quantity, onIncrease, onDecrease }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-2" data-testid="quantity-control">
      <button
        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold min-w-touch min-h-touch"
        onClick={onDecrease}
        data-testid="quantity-decrease"
      >
        −
      </button>
      <span className="w-8 text-center font-medium" data-testid="quantity-value">
        {quantity}
      </span>
      <button
        className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-bold min-w-touch min-h-touch"
        onClick={onIncrease}
        data-testid="quantity-increase"
      >
        +
      </button>
    </div>
  );
}
