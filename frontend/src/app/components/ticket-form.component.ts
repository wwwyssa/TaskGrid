import { Component, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, Ticket } from '../services/ticket.service';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 class="text-4xl font-bold text-center mb-2 text-gray-800">TaskGrid</h1>
        <p class="text-center text-gray-600 mb-8">Подача новой заявки</p>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- ФИО -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
              <input
                type="text"
                [(ngModel)]="formData.clientName"
                name="clientName"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ваше ФИО"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="formData.clientEmail"
                name="clientEmail"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ваш@email.com"
                required
              />
            </div>

            <!-- Телефон -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input
                type="tel"
                [(ngModel)]="formData.clientPhone"
                name="clientPhone"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
          </div>

          <!-- Описание проблемы -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание проблемы</label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Подробно опишите вашу проблему..."
              required
            ></textarea>
          </div>

          <!-- Кнопка отправки -->
          <div class="flex gap-4">
            <button
              type="submit"
              [disabled]="isLoading()"
              class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ isLoading() ? 'Отправка...' : 'Отправить заявку' }}
            </button>
          </div>
        </form>

        <!-- Сообщения -->
        <div *ngIf="successMessage()" class="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage() }}
        </div>

        <div *ngIf="errorMessage()" class="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage() }}
        </div>

        <!-- Информация -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-gray-700">
            <span class="font-semibold">ℹ️ Информация:</span> Ваша заявка будет автоматически назначена свободному сотруднику.
            Вы получите информацию о назначении на указанный email.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TicketFormComponent implements OnInit, OnDestroy {
  formData: Ticket = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: ''
  };

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private ticketService: TicketService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit() {
    // Listen for WebSocket notifications (optional)
    this.webSocketService.newTicketNotification.subscribe(ticket => {
      console.log('New ticket created:', ticket);
    });
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  onSubmit() {
    if (!this.formData.clientName || !this.formData.clientEmail || 
        !this.formData.clientPhone || !this.formData.description) {
      this.errorMessage.set('Заполните все поля');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.ticketService.createTicket(this.formData).subscribe({
      next: (response) => {
        this.successMessage.set('Заявка успешно создана! Номер заявки: #' + response.id);
        this.resetForm();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        this.errorMessage.set('Ошибка при создании заявки. Попробуйте позже.');
        this.isLoading.set(false);
      }
    });
  }

  private resetForm() {
    this.formData = {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: ''
    };
  }
}
