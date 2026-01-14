import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface Ticket {
  id?: number;
  clientName: string;
  description: string;
  clientEmail: string;
  clientPhone: string;
  status?: string;
  scheduledTime?: string;
  createdAt?: string;
  employeeId?: number;
  employeeName?: string;
}

export interface TicketDTO {
  id: number;
  clientName: string;
  description: string;
  clientEmail: string;
  clientPhone: string;
  status: string;
  scheduledTime: string;
  createdAt: string;
  employeeId: number | null;
  employeeName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';
  
  tickets = signal<TicketDTO[]>([]);
  selectedTicket = signal<TicketDTO | null>(null);
  
  private ticketsSubject = new BehaviorSubject<TicketDTO[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createTicket(ticket: Ticket): Observable<TicketDTO> {
    return this.http.post<TicketDTO>(this.apiUrl, ticket);
  }

  getAllTickets(): Observable<TicketDTO[]> {
    return this.http.get<TicketDTO[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getTicketsByEmployee(employeeId: number): Observable<TicketDTO[]> {
    return this.http.get<TicketDTO[]>(`${this.apiUrl}/employee/${employeeId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getTicket(id: number): Observable<TicketDTO> {
    return this.http.get<TicketDTO>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getPendingTickets(): Observable<TicketDTO[]> {
    return this.http.get<TicketDTO[]>(`${this.apiUrl}/pending`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateTicketStatus(id: number, status: string): Observable<TicketDTO> {
    return this.http.put<TicketDTO>(
      `${this.apiUrl}/${id}/status`,
      {},
      {
        params: { status },
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
