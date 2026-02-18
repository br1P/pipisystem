import { Component, inject, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Product } from '../../supabase.service';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-product-grid',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.css',
})
export class ProductGrid implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(Cart);
  private cdr = inject(ChangeDetectorRef);

  @Input() showCreateForm = false;
  @Input() editMode = false;
  @Output() formToggled = new EventEmitter<boolean>();
  @Output() productCreated = new EventEmitter<Product>();

  products: Product[] = [];
  loading = true;
  error = '';
  editingProductId: string | null = null;
  newProduct: Omit<Product, 'id'> = { name: '', price: 0, stock: 0 };

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const productsData = await this.supabaseService.getProducts().toPromise();
      this.products = productsData || [];
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error loading products:', error);
      this.error = `Error al cargar productos: ${error.message || error}`;
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  addToCart(product: Product) {
    this.cartService.addProduct(product);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newProduct = { name: '', price: 0, stock: 0 };
    }
  }

  isFormValid(): boolean {
    return this.newProduct.name.trim() !== '' && this.newProduct.price > 0 && this.newProduct.stock >= 0;
  }

  async createProduct() {
    if (!this.isFormValid()) return;

    try {
      const createdProduct = await this.supabaseService.createProduct(this.newProduct).toPromise();
      if (createdProduct) {
        this.products.push(createdProduct);
        this.newProduct = { name: '', price: 0, stock: 0 };
        this.formToggled.emit(false);
      }
    } catch (error: any) {
      this.error = 'Error al crear producto';
    }
  }

  startEdit(product: Product) {
    this.newProduct = { ...product };
    this.editingProductId = product.id;
    this.formToggled.emit(true);
  }

  async updateProduct() {
    if (!this.isFormValid() || !this.editingProductId) return;

    try {
      const updatedProduct = await this.supabaseService.updateProduct(this.editingProductId, this.newProduct).toPromise();
      if (updatedProduct) {
        const index = this.products.findIndex(p => p.id === this.editingProductId);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.cancelEdit();
      }
    } catch (error: any) {
      this.error = 'Error al actualizar producto';
    }
  }

  cancelEdit() {
    this.newProduct = { name: '', price: 0, stock: 0 };
    this.editingProductId = null;
    this.formToggled.emit(false);
  }

  async deleteProduct(productId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      await this.supabaseService.deleteProduct(productId).toPromise();
      this.products = this.products.filter(p => p.id !== productId);
      this.cdr.detectChanges();
    } catch (error: any) {
      this.error = 'Error al eliminar producto';
    }
  }
}
