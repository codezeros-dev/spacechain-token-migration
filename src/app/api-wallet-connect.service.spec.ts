import { TestBed } from '@angular/core/testing';

import { ApiWalletConnectService } from './api-wallet-connect.service';

describe('ApiWalletConnectService', () => {
  let service: ApiWalletConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiWalletConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
