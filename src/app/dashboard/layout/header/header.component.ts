import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
   role: string = '';

  ngOnInit() {
    const storedRole = localStorage.getItem('role');
    this.role = storedRole ? storedRole.replace(/_/g, ' ') : '';
  }

}
