import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart as CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);

  get cartItems() {
    return this.cartService.cartItems;
  }

  get total() {
    return this.cartService.getTotal();
  }

  removeProduct(productId: string) {
    this.cartService.removeProduct(productId);
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  clearCart() {
    this.cartService.clear();
  }
}
