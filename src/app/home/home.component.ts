import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';

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
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toaster: ToastrService,) {

  }

  ngOnInit() {
  }


  async checkConnectedWallet() {
    this.userAccount = await this.apiService.export();

    if (this.userAccount != undefined && this.userAccount && (this.userAccount.length)) {
      this.toaster.info('Already wallet Connected');
      this.router.navigate(['/Mywallet'])
    } else {
      $('#wallet_provider').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
      });
      
    }
  }
}
