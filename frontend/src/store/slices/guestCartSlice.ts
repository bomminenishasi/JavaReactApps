import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

export interface GuestCartItem {
  product: Product;
  quantity: number;
}

interface GuestCartState {
  items: GuestCartItem[];
}

const loadFromStorage = (): GuestCartItem[] => {
  try {
    const raw = localStorage.getItem('guestCart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items: GuestCartItem[]) => {
  localStorage.setItem('guestCart', JSON.stringify(items));
};

const initialState: GuestCartState = {
  items: loadFromStorage(),
};

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    addGuestItem(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const existing = state.items.find(i => i.product.id === action.payload.product.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push({ product: action.payload.product, quantity: action.payload.quantity });
      }
      saveToStorage(state.items);
    },
    updateGuestItem(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find(i => i.product.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.product.id !== action.payload.productId);
        }
      }
      saveToStorage(state.items);
    },
    removeGuestItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.product.id !== action.payload);
      saveToStorage(state.items);
    },
    clearGuestCart(state) {
      state.items = [];
      localStorage.removeItem('guestCart');
    },
  },
});

export const { addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart } = guestCartSlice.actions;
export default guestCartSlice.reducer;
