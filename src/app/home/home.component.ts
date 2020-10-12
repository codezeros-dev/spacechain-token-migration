import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { ApiWalletConnectService } from '../api-wallet-connect.service';

declare const $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userAccount: any;

  constructor(
    private router: Router,
    private apiWalletService: ApiWalletConnectService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toaster: ToastrService,) {

  }

  ngOnInit() {
  }

  // TODO
  async checkConnectedWallet() {
    this.userAccount = await this.apiService.export();

    if (this.userAccount != undefined && this.userAccount && (this.userAccount.length)) {
      this.toaster.info('Already wallet Connected');
      this.router.navigate(['/Mywallet/1'])
    } else {

      this.apiWalletService.getBehaviorView().subscribe((data) => {
        if (data && data != undefined) {
          if (data['connected']) {
          this.userAccount =  data['walletAddress']
          this.router.navigate(['/Mywallet/2'])

          }else{
              $('#wallet_provider').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
              });
          }
        }
        else{
          $('#wallet_provider').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
          });
        }
      })
      
    }
  }
}
