import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">TaskGrid</h1>
        
        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {{ isLoading() ? 'Вход...' : 'Войти' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <p class="text-gray-600">Нет аккаунта? 
            <a routerLink="/register" class="text-blue-500 hover:underline">Зарегистрироваться</a>
          </p>
        </div>

        <div class="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
          <p class="font-semibold mb-2">Тестовые учётные данные:</p>
          <p>Email: <code class="text-xs bg-gray-200 px-2 py-1">ivan&#64;example.com</code></p>
          <p>Пароль: <code class="text-xs bg-gray-200 px-2 py-1">password123</code></p>
        </div>

        <div *ngIf="error()" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error() }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Заполните все поля');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set('Неверный email или пароль');
        this.isLoading.set(false);
      }
    });
  }
}
