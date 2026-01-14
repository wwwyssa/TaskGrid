import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  employeeId: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  workStartTime: string;
  workEndTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  isAuthenticated = signal(false);
  currentUser = signal<AuthResponse | null>(null);
  token = signal<string | null>(null);
  
  private authSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  private checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.token.set(response.token);
        this.currentUser.set(response);
        this.isAuthenticated.set(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        this.authSubject.next(true);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.token.set(response.token);
        this.currentUser.set(response);
        this.isAuthenticated.set(true);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        this.authSubject.next(true);
      })
    );
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authSubject.next(false);
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return this.token() || localStorage.getItem('token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
