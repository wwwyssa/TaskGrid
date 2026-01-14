import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService, TicketDTO } from '../services/ticket.service';
import { EmployeeService, Employee } from '../services/employee.service';
import { WebSocketService } from '../services/websocket.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';

interface TimeSlot {
  hour: number;
  startTime: string;
  endTime: string;
}

interface BoardCell {
  ticket: TicketDTO | null;
  isBooked: boolean;
}

@Component({
  selector: 'app-admin-board',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Панель управления заявками</h1>
            <p class="text-sm text-gray-600 mt-1">
              <span class="font-medium">Аккаунт:</span> {{ currentUser()?.name }} ({{ currentUser()?.email }})
            </p>
          </div>
          <button
            (click)="onLogout()"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Выход
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Statistics -->
        <div class="grid grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <p class="text-gray-600 text-sm">В расписании</p>
            <p class="text-3xl font-bold text-blue-600">{{ scheduledTickets() }}</p>
            <p class="text-xs text-gray-500 mt-1">Всего: {{ totalTickets() }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <p class="text-gray-600 text-sm">В процессе</p>
            <p class="text-3xl font-bold text-yellow-600">{{ inProgressTickets() }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <p class="text-gray-600 text-sm">Завершено</p>
            <p class="text-3xl font-bold text-green-600">{{ completedTickets() }}</p>
          </div>
        </div>

        <!-- Schedule Grid -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <!-- Header with Employees -->
              <thead class="bg-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th class="px-4 py-4 text-left font-semibold text-gray-700 bg-gray-100 sticky left-0 w-24">
                    Время
                  </th>
                  <th
                    *ngFor="let employee of employees()"
                    class="px-4 py-4 text-left font-semibold text-gray-700 min-w-max"
                  >
                    <div>{{ employee.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ employee.workStartTime }} - {{ employee.workEndTime }}
                    </div>
                    <div class="text-xs text-blue-600 font-semibold">
                      Активных: {{ employee.activeTicketsCount }}
                    </div>
                  </th>
                </tr>
              </thead>

              <!-- Body with Time Slots -->
              <tbody>
                <tr *ngFor="let slot of timeSlots()" class="border-b border-gray-200 hover:bg-gray-50">
                  <!-- Time Column -->
                  <td class="px-4 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">
                    {{ slot.startTime }}
                  </td>

                  <!-- Employee Columns -->
                  <td
                    *ngFor="let employee of employees()"
                    class="px-4 py-4 min-w-max border-l border-gray-200"
                  >
                    <div class="h-24 flex items-center justify-center">
                      <div
                        *ngIf="getTicketForSlot(employee.id, slot.hour) as ticket"
                        [class]="getTicketColorClass(ticket.status)"
                        class="w-full text-white rounded-lg p-3 cursor-pointer transition"
                        (click)="showTicketDetails(ticket)"
                      >
                        <div class="font-semibold text-sm">
                          {{ ticket.clientName }}
                        </div>
                        <div class="text-xs opacity-90">
                          {{ getStatusText(ticket.status) }}
                        </div>
                      </div>
                      <div *ngIf="!getTicketForSlot(employee.id, slot.hour)" class="text-gray-300 text-sm">
                        —
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Ticket Details Modal -->
        <div
          *ngIf="selectedTicket()"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          (click)="selectedTicket.set(null)"
        >
          <div
            class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            (click)="$event.stopPropagation()"
          >
            <h2 class="text-2xl font-bold mb-4">Заявка #{{ selectedTicket()?.id }}</h2>

            <div class="space-y-3 mb-6">
              <div>
                <p class="text-sm text-gray-600">Клиент</p>
                <p class="font-semibold">{{ selectedTicket()?.clientName }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="font-semibold">{{ selectedTicket()?.clientEmail }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Телефон</p>
                <p class="font-semibold">{{ selectedTicket()?.clientPhone }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Описание</p>
                <p class="font-semibold">{{ selectedTicket()?.description }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Статус</p>
                <p class="font-semibold">{{ selectedTicket()?.status }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Сотрудник</p>
                <p class="font-semibold">{{ selectedTicket()?.employeeName || 'Не назначен' }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">Запланировано</p>
                <p class="font-semibold">{{ selectedTicket()?.scheduledTime | date: 'dd.MM.yyyy HH:mm' }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                *ngIf="canEditTicket() && selectedTicket()?.status === 'ASSIGNED'"
                (click)="updateStatus('IN_PROGRESS')"
                class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                В процессе
              </button>
              <button
                *ngIf="canEditTicket() && selectedTicket()?.status === 'IN_PROGRESS'"
                (click)="updateStatus('COMPLETED')"
                class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Завершить
              </button>
              <button
                (click)="selectedTicket.set(null)"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Закрыть
              </button>
            </div>
            <p *ngIf="!canEditTicket() && selectedTicket()?.status !== 'COMPLETED'" class="mt-3 text-sm text-red-600 text-center">
              Вы можете изменять только свои заявки
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminBoardComponent implements OnInit, OnDestroy {
  employees = signal<Employee[]>([]);
  tickets = signal<TicketDTO[]>([]);
  currentUser = signal(this.authService.currentUser());
  timeSlots = signal<TimeSlot[]>([]);
  selectedTicket = signal<TicketDTO | null>(null);
  webSocketConnected = signal(false);

  totalTickets = signal(0);
  inProgressTickets = signal(0);
  completedTickets = signal(0);
  scheduledTickets = signal(0);

  constructor(
    private employeeService: EmployeeService,
    private ticketService: TicketService,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeTimeSlots();
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadTickets();
    this.setupWebSocketListeners();
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

  private initializeTimeSlots() {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push({
        hour,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    this.timeSlots.set(slots);
  }

  private loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  private loadTickets() {
    this.ticketService.getAllTickets().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
      }
    });
  }

  private setupWebSocketListeners() {
    this.webSocketConnected.set(this.webSocketService.isConnectedSignal()());

    this.webSocketService.newTicketNotification.subscribe(() => {
      console.log('New ticket received via WebSocket');
      this.loadTickets();
      this.loadEmployees();
    });

    this.webSocketService.boardUpdateNotification.subscribe(() => {
      console.log('Board update received');
      this.loadTickets();
      this.loadEmployees();
    });

    this.webSocketService.statusUpdateNotification.subscribe(() => {
      console.log('Status update received');
      this.loadTickets();
      this.loadEmployees();
    });
  }

  private updateStatistics() {
    const ticketsList = this.tickets();
    this.totalTickets.set(ticketsList.length);
    this.inProgressTickets.set(ticketsList.filter(t => t.status === 'IN_PROGRESS').length);
    this.completedTickets.set(ticketsList.filter(t => t.status === 'COMPLETED').length);
    this.scheduledTickets.set(
      ticketsList.filter(t => !!t.employeeId && !!t.scheduledTime).length
    );
  }

  getTicketForSlot(employeeId: number, hour: number): TicketDTO | null {
    const tickets = this.tickets().filter(ticket => {
      if (!ticket.employeeId || ticket.employeeId !== employeeId) return false;
      if (!ticket.scheduledTime) return false;

      const ticketHour = new Date(ticket.scheduledTime).getHours();
      return ticketHour === hour;
    });

    return tickets.length > 0 ? tickets[0] : null;
  }

  showTicketDetails(ticket: TicketDTO) {
    this.selectedTicket.set(ticket);
  }

  updateStatus(newStatus: string) {
    if (!this.selectedTicket()) return;

    this.ticketService.updateTicketStatus(this.selectedTicket()!.id, newStatus).subscribe({
      next: () => {
        this.loadTickets();
        this.selectedTicket.set(null);
      },
      error: (error) => {
        console.error('Error updating ticket status:', error);
      }
    });
  }

  getTicketColorClass(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'ASSIGNED':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'IN_PROGRESS':
        return 'bg-green-500 hover:bg-green-600';
      case 'COMPLETED':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'ASSIGNED':
        return 'Назначена';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'COMPLETED':
        return 'Завершена';
      default:
        return status;
    }
  }

  canEditTicket(): boolean {
    const ticket = this.selectedTicket();
    const user = this.currentUser();
    
    if (!ticket || !user) return false;
    
    return ticket.employeeId === user.employeeId;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
