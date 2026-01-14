import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { TicketFormComponent } from './components/ticket-form.component';
import { AdminBoardComponent } from './components/admin-board.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tickets', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tickets', component: TicketFormComponent },
  { 
    path: 'dashboard', 
    component: AdminBoardComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/tickets' }
];
