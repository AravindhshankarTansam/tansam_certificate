import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
    private toast: ToastService   // ⭐ added toast
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

  /* =========================
     LOGIN
  ========================= */
  login() {

    /* captcha check */
    if (this.userAnswer !== this.captchaAnswer) {
      this.toast.show('Captcha incorrect ❌', 'error');
      this.generateCaptcha();
      return;
    }

    this.loading = true;

    this.api.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (res: any) => {

        this.loading = false;

        if (res.role === 'Admin') {

          this.toast.show('Login successful ✅', 'success');

          // small delay so user sees toast
          setTimeout(() => {
            window.location.href = 'https://tansam.org';
          }, 800);
        }
      },

      error: () => {
        this.loading = false;
        this.toast.show('Invalid credentials ❌', 'error');
        this.generateCaptcha();
      }
    });
  }
}
