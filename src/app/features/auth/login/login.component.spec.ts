import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/api.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['isLoggedIn']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ApiService, useValue: apiSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router);

    apiService.isLoggedIn.and.returnValue(of(true));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty fields', () => {
    expect(component.loginForm.value).toEqual({ username: '', password: '' });
  });

  it('should disable the login button if form is invalid', () => {
    const loginButton = fixture.nativeElement.querySelector('button');
    expect(loginButton.disabled).toBeTrue();
  });

  it('should enable the login button when form is valid', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password123' });
    fixture.detectChanges();

    const loginButton = fixture.nativeElement.querySelector('button');
    expect(loginButton.disabled).toBeFalse();
  });

  it('should call AuthService login on form submit', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password123' });
    authService.login.and.returnValue(of({ userId: 1 }));

    component.login();
    expect(authService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
  });

  it('should navigate to /user-form on successful login', fakeAsync(() => {
    component.loginForm.setValue({ username: 'testuser', password: 'password123' });
    authService.login.and.returnValue(of({ userId: 1 }));
    apiService.isLoggedIn.and.returnValue(of(true));

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.login();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/user-form']);
  }));

  it('should display an error message on failed login', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'wrongpassword' });
    authService.login.and.returnValue(throwError(() => new Error('Invalid username or password')));

    component.login();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent).toContain('Invalid username or password');
  });
});
