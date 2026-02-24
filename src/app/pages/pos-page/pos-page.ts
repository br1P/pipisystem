import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductGrid } from '../../components/product-grid/product-grid';
import { Cart } from '../../components/cart/cart';
import { Checkout } from '../../components/checkout/checkout';
import { SalesHistory } from '../../components/sales-history/sales-history';
import { SupabaseService } from '../../supabase.service';
import { Cart as CartService } from '../../services/cart';

@Component({
  selector: 'app-pos-page',
  imports: [CommonModule, FormsModule, ProductGrid, Cart, Checkout, SalesHistory],
  templateUrl: './pos-page.html',
  styleUrl: './pos-page.css',
})
export class PosPage implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private revenueInterval: any;
  private cartSub!: Subscription;
  private animationTimeout: any;

  showCreateForm = false;
  editMode = false;
  showCart = false;
  showSalesHistory = false;
  menuOpen = false;
  dailyRevenue = 0;
  cartAnimating = false;
  searchTerm = '';

  ngOnInit() {
    this.loadDailyRevenue();
    this.revenueInterval = setInterval(() => this.loadDailyRevenue(), 30000);

    this.cartSub = this.cartService.productAdded$.subscribe(() => {
      // Reset and re-trigger so rapid clicks each fire a fresh animation
      this.cartAnimating = false;
      this.cdr.detectChanges();
      clearTimeout(this.animationTimeout);
      setTimeout(() => {
        this.cartAnimating = true;
        this.cdr.detectChanges();
        this.animationTimeout = setTimeout(() => {
          this.cartAnimating = false;
          this.cdr.detectChanges();
        }, 600);
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.revenueInterval) clearInterval(this.revenueInterval);
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    this.cartSub?.unsubscribe();
  }

  loadDailyRevenue() {
    this.supabaseService.getSalesHistory().subscribe({
      next: (sales) => {
        this.dailyRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

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

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }
}
