import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  role: string = '';
  lab: string = '';
  name: string = '';
  showDropdown = false;

  ngOnInit() {
    const storedRole = localStorage.getItem('role');
    const storedLab = localStorage.getItem('lab_name');
    const storedName = localStorage.getItem('name');

    this.role = storedRole ? storedRole.replace(/_/g, ' ').toLowerCase() : '';
    this.lab = storedLab ? storedLab : '';
    this.name = storedName ? storedName : '';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // close dropdown if clicked outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!event.target.closest('.profile-wrapper')) {
      this.showDropdown = false;
    }
  }

  logout() {
  localStorage.clear();
}

}
