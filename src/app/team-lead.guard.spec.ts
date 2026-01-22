import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { teamLeadGuard } from './team-lead.guard';

describe('teamLeadGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => teamLeadGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
