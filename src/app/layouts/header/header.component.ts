import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';

declare let window: any;


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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toaster: ToastrService,) {
    this.getConnection();
  }

  async ngOnInit(){
      // await this.apiService.getBehaviorView().subscribe((data)=>{
      //   if(data){
      //     console.log('-------------------------------data',data)
      //   //  window.location.reload();
      //   }
      // })
  }


  async getConnection() {
    this.userAccount = await this.apiService.export();
    if (this.userAccount != undefined && this.userAccount && (this.userAccount.length)) {
      this.login = true;
      this.getNetworkName();
      this.getSelectedAddress();
    } else {
      this.login = false;
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
      this.router.navigate(["/Mywallet"]);

    }).catch((er) => {

      if (er && er.code) {
        this.toaster.error(er.message);
      }
    })
  }


}
