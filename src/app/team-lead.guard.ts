import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const teamLeadGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getRole() === 'TEAM_LEAD') {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
