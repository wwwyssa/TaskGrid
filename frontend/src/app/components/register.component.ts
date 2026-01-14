import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-2 text-gray-800">TaskGrid</h1>
        <p class="text-center text-gray-600 mb-8">Регистрация сотрудника</p>
        
        <form (ngSubmit)="onRegister()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ваше ФИО"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите email"
              required
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
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Начало смены</label>
              <input
                type="time"
                [(ngModel)]="workStartTime"
                name="workStartTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Конец смены</label>
              <input
                type="time"
                [(ngModel)]="workEndTime"
                name="workEndTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {{ isLoading() ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <p class="text-gray-600">Уже есть аккаунт? 
            <a routerLink="/login" class="text-blue-500 hover:underline">Войти</a>
          </p>
        </div>

        <div *ngIf="error()" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error() }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  workStartTime = '09:00';
  workEndTime = '18:00';
  isLoading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.name || !this.email || !this.password || !this.workStartTime || !this.workEndTime) {
      this.error.set('Заполните все поля');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      workStartTime: this.workStartTime,
      workEndTime: this.workEndTime
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Ошибка при регистрации');
        this.isLoading.set(false);
      }
    });
  }
}
