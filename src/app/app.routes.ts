import { Routes } from '@angular/router';
import { PosPage } from './pages/pos-page/pos-page';

export const routes: Routes = [
  { path: '', component: PosPage },
  { path: '**', redirectTo: '' }
];
