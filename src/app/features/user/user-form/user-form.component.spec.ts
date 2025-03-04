import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { ApiService } from '../../../core/api.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { provideRouter } from '@angular/router';
import {Sector} from '../../../models/sector.model';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getSectors', 'getLoggedInUser', 'updateUser']);

    await TestBed.configureTestingModule({
      imports: [
        UserFormComponent,
        ReactiveFormsModule,
        FaIconComponent
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;

    apiService.getSectors.and.returnValue(of([]));
    apiService.getLoggedInUser.and.returnValue(of({ name: '', sectorIds: [], agreedToTerms: false }));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.userForm.value).toEqual({
      name: '',
      sectorIds: [],
      agreedToTerms: false
    });
  });

  it('should fetch and set sectors on init', () => {
    const mockSectors = [
      { id: 1, name: 'Manufacturing', subSectors: [] },
      { id: 2, name: 'IT Services', subSectors: [] }
    ];

    apiService.getSectors.and.returnValue(of(mockSectors));
    component.ngOnInit();

    expect(apiService.getSectors).toHaveBeenCalled();
    expect(component.sectors.length).toBe(2);
    expect(component.sectors[0].name).toBe('Manufacturing');
  });

  it('should fetch user data and prefill the form', () => {
    const mockUser = {
      name: 'John Doe',
      sectorIds: [1, 2],
      agreedToTerms: true
    };

    apiService.getLoggedInUser.and.returnValue(of(mockUser));
    component.ngOnInit();

    expect(apiService.getLoggedInUser).toHaveBeenCalled();
    expect(component.userForm.value.name).toBe('John Doe');
    expect(component.selectedSectorIds.has(1)).toBeTrue();
    expect(component.selectedSectorIds.has(2)).toBeTrue();
    expect(component.userForm.value.agreedToTerms).toBeTruthy();
  });

  it('should call updateUser when form is submitted', fakeAsync(() => {
    component.userForm.setValue({
      name: 'John Doe',
      sectorIds: [1, 2],
      agreedToTerms: true
    });

    apiService.updateUser.and.returnValue(of({}));

    component.updateUser();
    tick();

    expect(apiService.updateUser).toHaveBeenCalledWith({
      name: 'John Doe',
      sectorIds: [1, 2],
      agreedToTerms: true
    });
  }));

  it('should toggle agreedToTerms checkbox', () => {
    expect(component.userForm.value.agreedToTerms).toBeFalse();

    component.toggleAgreeToTerms();
    expect(component.userForm.value.agreedToTerms).toBeTrue();

    component.toggleAgreeToTerms();
    expect(component.userForm.value.agreedToTerms).toBeFalse();
  });

  it('should select and deselect sectors properly', () => {
    const sector: Sector = {
      id: 1,
      name: 'Manufacturing',
      selected: false,
      selectable: true,
      subSectors: []
    };

    component.toggleSelect(sector);
    expect(sector.selected).toBeTrue();
    expect(component.selectedSectorIds.has(1)).toBeTrue();

    component.toggleSelect(sector);
    expect(sector.selected).toBeFalse();
    expect(component.selectedSectorIds.has(1)).toBeFalse();
  });
});
