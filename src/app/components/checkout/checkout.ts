import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Cart } from '../../services/cart';
import { SupabaseService } from '../../supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private cartService = inject(Cart);
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  isProcessing = false;
  errorMessage = '';
  showSuccessModal = false;

  // Payment Modal State
  showPaymentModal = false;
  selectedPaymentMethod: 'cash' | 'transfer' | null = null;
  amountPaid: number | null = null;

  get cartItems() {
    return this.cartService.cartItems;
  }

  get total() {
    return this.cartService.getTotal();
  }

  get change(): number {
    if (this.amountPaid === null) return 0;
    return Math.max(0, this.amountPaid - this.total);
  }

  get canConfirmCashPayment(): boolean {
    return (this.amountPaid ?? 0) >= this.total;
  }

  finalizarCompra() {
    if (this.cartItems.length === 0) {
      this.errorMessage = 'El carrito está vacío';
      return;
    }

    this.errorMessage = '';
    this.showPaymentModal = true;
    this.selectedPaymentMethod = null;
    this.amountPaid = null;
  }

  selectPaymentMethod(method: 'cash' | 'transfer') {
    this.selectedPaymentMethod = method;
    if (method === 'transfer') {
      this.processSale();
    }
  }

  closePaymentModal() {
    if (!this.isProcessing) {
      this.showPaymentModal = false;
      this.selectedPaymentMethod = null;
      this.amountPaid = null;
    }
  }

  processSale() {
    this.isProcessing = true;
    this.errorMessage = '';

    console.log('Starting sale process...', this.cartItems);

    this.supabaseService.createSale(this.cartItems).subscribe({
      next: (result) => {
        console.log('Sale completed successfully:', result);
        this.isProcessing = false;
        this.showPaymentModal = false; // Close payment modal
        this.showSuccessModal = true;
        console.log('Success modal shown');
        this.cdr.detectChanges(); // Force change detection

        // Clear cart in next change detection cycle
        setTimeout(() => {
          this.cartService.clear();
          console.log('Cart cleared');
        }, 0);

        // Auto-hide modal after 3 seconds
        setTimeout(() => {
          this.showSuccessModal = false;
          console.log('Success modal hidden');
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error: any) => {
        console.error('Sale failed:', error);
        this.isProcessing = false;
        this.errorMessage = error.message || 'Error al procesar la venta';
        // Reset selection so user can try again
        this.selectedPaymentMethod = null;
      }
    });
  }
}
