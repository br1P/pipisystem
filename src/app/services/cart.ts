import { Injectable } from '@angular/core';
import { Product, CartItem } from '../supabase.service';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private cart: CartItem[] = [];

  get cartItems(): CartItem[] {
    return this.cart;
  }

  addProduct(product: Product): void {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  removeProduct(productId: string): void {
    this.cart = this.cart.filter(item => item.product.id !== productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cart.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeProduct(productId);
      }
    }
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  clear(): void {
    this.cart = [];
  }
}
