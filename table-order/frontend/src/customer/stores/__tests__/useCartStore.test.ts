import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../useCartStore';
import type { Menu } from '@shared/api/types';

const mockMenu: Menu = {
  id: 'menu-1',
  category_id: 'cat-1',
  name: '불고기 정식',
  price: 12000,
  description: '맛있는 불고기',
  image_url: null,
  sort_order: 1,
  is_available: true,
};

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item to cart', () => {
    useCartStore.getState().addItem(mockMenu);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].menuId).toBe('menu-1');
    expect(items[0].quantity).toBe(1);
  });

  it('should increase quantity when adding existing item', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().addItem(mockMenu);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().removeItem('menu-1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should update quantity', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().updateQuantity('menu-1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('should remove item when quantity is 0', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().updateQuantity('menu-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('should calculate total price', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().updateQuantity('menu-1', 3);
    expect(useCartStore.getState().getTotalPrice()).toBe(36000);
  });

  it('should calculate total items', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().addItem({ ...mockMenu, id: 'menu-2', name: '김치찌개', price: 9000 });
    expect(useCartStore.getState().getTotalItems()).toBe(2);
  });

  it('should clear cart', () => {
    useCartStore.getState().addItem(mockMenu);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
