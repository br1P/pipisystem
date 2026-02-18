import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGrid } from '../../components/product-grid/product-grid';
import { Cart } from '../../components/cart/cart';
import { Checkout } from '../../components/checkout/checkout';
import { SalesHistory } from '../../components/sales-history/sales-history';

@Component({
  selector: 'app-pos-page',
  imports: [CommonModule, ProductGrid, Cart, Checkout, SalesHistory],
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage {
  showCreateForm = false;
  editMode = false;
  showCart = false;
  showSalesHistory = false;
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }

  closeCart() {
    this.showCart = false;
  }

  toggleSalesHistory() {
    this.showSalesHistory = !this.showSalesHistory;
  }

  closeSalesHistory() {
    this.showSalesHistory = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    if (this.showCart) {
      this.closeCart();
    }
    if (this.showSalesHistory) {
      this.closeSalesHistory();
    }
  }
}
