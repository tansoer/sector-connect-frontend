import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: { username: string; password: string; name: string }): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/register`, userData);
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap((response: any) => {
        localStorage.setItem('userId', response.userId.toString());
      })
    );
  }

  logout(): void {
    this.http.post(`${this.BASE_URL}/logout`, {}, { withCredentials: true }).subscribe();
    localStorage.removeItem('userId');
  }
}
