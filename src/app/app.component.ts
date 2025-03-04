import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButton],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      console.log("User logged out and redirected to login.");
    }).catch(err => console.error("Logout failed:", err));
  }
}
