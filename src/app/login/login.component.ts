import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  // captcha
  num1!: number;
  num2!: number;
  captchaAnswer!: number;
  userAnswer: number | null = null;

  loading = false;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router,
  ) {
    this.generateCaptcha();
  }

  /* =========================
     CAPTCHA
  ========================= */
  generateCaptcha() {
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
    this.captchaAnswer = this.num1 + this.num2;

    this.userAnswer = null;
  }

  login() {
    /* =========================
     1️⃣ EMPTY FIELD CHECK FIRST
  ========================= */
    if (!this.email || !this.password) {
      this.toast.show('Please enter email and password', 'info');
      return;
    }

    /* =========================
     2️⃣ CAPTCHA CHECK
  ========================= */
    if (this.userAnswer !== this.captchaAnswer) {
      this.toast.show('Captcha incorrect', 'error');
      this.generateCaptcha();
      return;
    }

    /* =========================
     3️⃣ API LOGIN
  ========================= */
    this.loading = true;

    this.api
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
next: (res: any) => {
  this.loading = false;

  this.toast.show('Login successful', 'success');

  // save role
localStorage.setItem('role', res.role.toUpperCase());

  /* =========================
     🔥 CONSOLE LOGS (ADD THIS)
  ========================= */
  console.log('========= LOGIN SUCCESS =========');
  console.log('Email:', this.email);
  console.log('Role:', res.role);
  console.log('Full Response:', res);
  console.log('================================');

  // role based routing
  if (res.role === 'Admin') {
    this.router.navigate(['/dashboard/admin/dashboard']);
  } else if (res.role === 'User') {
    this.router.navigate(['/dashboard/user']);
  } else if (res.role === 'Manager') {
    this.router.navigate(['/dashboard/manager']);
  }
},

        error: () => {
          this.loading = false;
          this.toast.show('Invalid credentials ❌', 'error');
          this.generateCaptcha();
        },
      });
  }
}
