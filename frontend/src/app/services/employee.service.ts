import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Employee {
  id: number;
  name: string;
  email: string;
  workStartTime: string;
  workEndTime: string;
  activeTicketsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';
  
  employees = signal<Employee[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
