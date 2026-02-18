import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../enviroments/enviroment';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id?: number;
  items: CartItem[];
  total: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  getProducts(): Observable<Product[]> {
    return from(this.supabase.from('products').select('*')).pipe(map(res => res.data as Product[]));
  }

  createSale(cart: CartItem[]): Observable<any> {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartForRpc = cart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
    return from(this.supabase.rpc('process_sale', { cart_items: cartForRpc, total })).pipe(map(res => res.data));
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return from(this.supabase.from('products').insert(product).select().single()).pipe(map(res => res.data as Product));
  }

  updateProduct(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return from(this.supabase.from('products').update(product).eq('id', id).select().single()).pipe(map(res => res.data as Product));
  }

  deleteProduct(id: string): Observable<any> {
    return from(this.supabase.from('products').delete().eq('id', id)).pipe(map(res => res.data));
  }

  getSalesHistory(): Observable<Sale[]> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return from(this.supabase.from('sales').select('*').gte('created_at', since).order('created_at', { ascending: false })).pipe(
      map(res => {
        const sales = res.data as any[];
        return sales.map(sale => ({
          ...sale,
          items: sale.items.map((item: any) => ({
            product: { id: item.productId, name: '', price: 0, stock: 0 }, // Placeholder, will be populated
            quantity: item.quantity
          }))
        }));
      }),
      switchMap(sales => {
        const productIds = new Set<string>();
        sales.forEach(sale => {
          sale.items.forEach((item: any) => {
            productIds.add(item.product.id);
          });
        });

        if (productIds.size === 0) {
          return from(Promise.resolve(sales));
        }

        // Fetch all products in one query
        return from(this.supabase.from('products').select('*').in('id', Array.from(productIds))).pipe(
          map(productsRes => {
            const productsMap = new Map((productsRes.data || []).map((p: any) => [p.id, p]));

            // Populate product data
            return sales.map(sale => ({
              ...sale,
              items: sale.items.map((item: any) => ({
                ...item,
                product: productsMap.get(item.product.id) || { id: item.product.id, name: 'Producto no encontrado', price: 0, stock: 0 }
              }))
            }));
          })
        );
      })
    );
  }
}
