import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.apiService.isLoggedIn().pipe(
      map(isAuthenticated => isAuthenticated ? true : this.router.parseUrl('/login'))
    );
  }
}
