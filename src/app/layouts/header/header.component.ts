import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { ApiWalletConnectService } from 'src/app/api-wallet-connect.service';

declare let window: any;
declare const $: any;


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  login: Boolean = false;
  networkName: any = '';
  userAccount: any;
  walletAddress: any = '';


  wallet: any = '';
  id: any;

  constructor(
    private router: Router,
    private _route: ActivatedRoute,
    private apiService: ApiService,
    private apiWalletService: ApiWalletConnectService,
    private toaster: ToastrService,) {

    // this.id = this._route.snapshot.params['id'];
    // if (this.id && this.id != undefined) {
    //   let idArray = ['1', '2'];

    //   if (!idArray.includes(this.id)) {
    //     this.router.navigate(['/']);
    //   } else {
    //     if (this.id == 1) {
    //       this.wallet = 'Metamask';
    this.getConnection();
    // }
    // else {
    //   this.wallet = 'WalletConnect';
    // }
    // }
    // }


  }

  async ngOnInit() {
  
  }


  async getConnection() {
    this.userAccount = await this.apiService.export();
    if (this.userAccount != undefined && this.userAccount && (this.userAccount.length)) {
      this.login = true;
      this.getNetworkName();
      this.getSelectedAddress();
    } else {

      this.apiWalletService.getBehaviorView().subscribe((data) => {
        if (data && data != undefined) {

          if (data['connected'] && data['connected'] == true) {
            this.login = true;
            this.networkName = data['networkName'];
            this.walletAddress = data['walletAddress'];
          } else {
            $('#wallet_provider').modal('hide');
            this.login = false;
          }

        } else {
          this.login = false;
        }
      })

    }

  }

  async getNetworkName() {
    this.networkName = await this.apiService.getNetworkName();
  }

  async getSelectedAddress() {
    this.walletAddress = await this.apiService.getSelectedAddress();

  }


  connectToMetaMask() {

    this.apiService.connect().then((data) => {
      this.login = true;
      this.getNetworkName();
      this.getSelectedAddress();
      this.toaster.success('User Connected Successfully');
      this.router.navigate(["/Mywallet/1"]);

    }).catch((er) => {

      if (er && er.code) {
        this.toaster.error(er.message);
      }
    })
  }

  connectToWalletConnect() {
    this.apiWalletService.walletConnectInit();

    this.apiWalletService.getOnConnectBehaviorView().subscribe((data) => {
      if (data && data != undefined) {
        if (data['connected']) {
          $('#wallet_provider').modal('hide');
          this.router.navigate(['/Mywallet/2'])
        } else {
          $('#wallet_provider').modal('hide');

        }
      }
    })
  }

}
