import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {
  }

  isLoggedIn(): Observable<boolean> {
    return this.getLoggedInUser().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  getLoggedInUser(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/user`, {withCredentials: true}).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }

  updateUser(user: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/user`, user, {withCredentials: true}).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }

  getSectors(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/sectors`, {withCredentials: true}).pipe(
      catchError(error => {
        return of([]);
      })
    );
  }
}
