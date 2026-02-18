import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, Sale, CartItem } from '../../supabase.service';

@Component({
  selector: 'app-sales-history',
  imports: [CommonModule],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.css',
})
export class SalesHistory implements OnInit, OnDestroy {
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  private refreshInterval: any;

  sales: Sale[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.loadSalesHistory();
    // Auto-refresh every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshSalesHistory();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadSalesHistory() {
    this.loading = true;
    this.error = '';
    this.supabaseService.getSalesHistory().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar el historial de ventas';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading sales history:', err);
      }
    });
  }

  refreshSalesHistory() {
    this.loadSalesHistory();
  }

  getTotalItems(sale: Sale): number {
    return sale.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-AR');
  }
}
