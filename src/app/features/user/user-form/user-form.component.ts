import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { faChevronRight, faChevronDown, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Sector } from '../../../models/sector.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FaIconComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;
  faCheckSquare = faCheckSquare;
  faSquare = faSquare;
  userForm: FormGroup;
  sectors: Sector[] = [];
  selectedSectorIds: Set<number> = new Set();

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      sectorIds: [[], Validators.required],
      agreedToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.loadSectors();
  }

  loadSectors(): void {
    this.apiService.getSectors().subscribe(sectors => {
      this.sectors = this.buildSectorTree(sectors);
      this.loadUserData();
    });
  }

  loadUserData(): void {
    this.apiService.getLoggedInUser().subscribe(user => {
      this.userForm.patchValue({
        name: user.name,
        sectorIds: user.sectorIds,
        agreedToTerms: user.agreedToTerms
      });

      this.selectedSectorIds = new Set(user.sectorIds);

      this.markSelectedSectors(this.sectors, this.selectedSectorIds);
    });
  }

  markSelectedSectors(sectors: Sector[], selectedIds: Set<number>): boolean {
    let hasSelectedSubSector = false;

    sectors.forEach(sector => {
      sector.selected = selectedIds.has(sector.id);
      if (sector.subSectors?.length) {
        sector.expanded = this.markSelectedSectors(sector.subSectors, selectedIds);
        hasSelectedSubSector ||= sector.expanded;
      }
      hasSelectedSubSector ||= sector.selected;
    });

    return hasSelectedSubSector;
  }

  buildSectorTree(sectors: Sector[]): Sector[] {
    return sectors.map(sector => ({
      ...sector,
      expanded: false,
      selected: this.selectedSectorIds.has(sector.id),
      subSectors: sector.subSectors ? this.buildSectorTree(sector.subSectors) : []
    }));
  }

  get isNameEmpty(): boolean {
    return !this.userForm.get('name')?.value?.trim();
  }

  toggleSelect(sector: Sector, isParentSelected: boolean = false): void {
    const newState = isParentSelected ? true : !sector.selected;
    sector.selected = newState;

    if (newState) {
      this.selectedSectorIds.add(sector.id);
    } else {
      this.selectedSectorIds.delete(sector.id);
    }

    if (sector.subSectors) {
      sector.subSectors.forEach(subSector => this.toggleSelect(subSector, newState));
    }

    this.userForm.patchValue({ sectorIds: Array.from(this.selectedSectorIds) });
  }

  toggleAgreeToTerms(): void {
    const currentValue = this.userForm.get('agreedToTerms')?.value;
    this.userForm.patchValue({ agreedToTerms: !currentValue });
  }

  updateUser(): void {
    if (this.userForm.valid) {
      this.apiService.updateUser(this.userForm.value).subscribe(response => {
        console.log('User saved:', response);
      });
    }
  }
}
