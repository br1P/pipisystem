import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pos-app');

  // Inject Supabase service to demonstrate integration
  private supabaseService = inject(SupabaseService);

  constructor() {
    // Example: Log Supabase client to verify it's initialized
    console.log('Supabase client initialized:', !!this.supabaseService.client);
  }
}
