import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with empty fields', () => {
    expect(component.registerForm.value).toEqual({ name: '', username: '', password: '' });
  });

  it('should disable the register button if form is invalid', () => {
    const registerButton = fixture.nativeElement.querySelector('button');
    expect(registerButton.disabled).toBeTrue();
  });

  it('should enable the register button when form is valid', () => {
    component.registerForm.setValue({ name: 'John Doe', username: 'johndoe', password: 'password123' });
    fixture.detectChanges();

    const registerButton = fixture.nativeElement.querySelector('button');
    expect(registerButton.disabled).toBeFalse();
  });

  it('should call AuthService register on form submit', () => {
    component.registerForm.setValue({ name: 'John Doe', username: 'johndoe', password: 'password123' });
    authService.register.and.returnValue(of(void 0));

    component.register();
    expect(authService.register).toHaveBeenCalledWith({ name: 'John Doe', username: 'johndoe', password: 'password123' });
  });

  it('should navigate to /login on successful registration', fakeAsync(() => {
    component.registerForm.setValue({ name: 'John Doe', username: 'johndoe', password: 'password123' });
    authService.register.and.returnValue(of(void 0));

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.register();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should display an error message if username already exists', () => {
    component.registerForm.setValue({ name: 'John Doe', username: 'johndoe', password: 'password123' });
    authService.register.and.returnValue(throwError(() => ({ status: 400, error: 'Username already exists' })));

    component.register();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent).toContain('Username is already taken. Please choose another.');
  });

  it('should display a generic error message for unknown registration failures', () => {
    component.registerForm.setValue({ name: 'John Doe', username: 'johndoe', password: 'password123' });
    authService.register.and.returnValue(throwError(() => new Error('Unknown error')));

    component.register();
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage.textContent).toContain('Registration failed. Try again.');
  });
});
