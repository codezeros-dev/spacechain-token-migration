import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';

declare const $: any;


@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.css']
})
export class MyWalletComponent implements OnInit {

  show: any = 'step1';

  contractInstance1: any;
  contractInstance2: any;
  userAccount: any;

  balance1: any = 0;
  balance2: any = 0;
  holdedBalance: any = 0;

  uniqueAddress: any;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toaster: ToastrService,) { }

  async ngOnInit() {

    this.userAccount = await this.apiService.export();
    this.contractInstance1 = await this.apiService.exportInstance1();
    this.contractInstance2 = await this.apiService.exportInstance2();

    console.log('---------------------1', this.userAccount)
    console.log('---------------------11', this.contractInstance1)
    console.log('---------------------22', this.contractInstance2)

    if (this.userAccount) {

      await this.balanceOf1(this.userAccount, this.contractInstance1);
      await this.balanceOf2(this.userAccount, this.contractInstance2);
      await this.checkProcess(this.userAccount, this.contractInstance1, this.contractInstance2)
    }
  }

  async balanceOf1(walletAddress, contractInstance) {
    await this.apiService.getBalance1(walletAddress, contractInstance).then((data: any) => {
      if (data) {
        console.log(data);
        this.balance1 = (data).toFixed(2);
      }
    })
  }

  async balanceOf2(walletAddress, contractInstance) {
    await this.apiService.getBalance2(walletAddress, contractInstance).then((data: any) => {
      console.log('-----------2balance-------',data)

      if (data) {
        console.log('-----------2balance-------',data)
        this.balance2 = (data).toFixed(2);
        // Math.round(data * 100) / 100
      }
    })
  }

  async checkProcess(walletAddress, contractInstance1, contractInstance2) {

    await this.getTokenUpgrader(walletAddress, contractInstance2);
  }

  async getTokenUpgrader(walletAddress, contractInstance2) {
    await this.apiService.tokenUpgrader(walletAddress, contractInstance2).then(async (data) => {
      if (data && data == '0x0000000000000000000000000000000000000000') {
        this.show = 'step1';
        // Math.round(data * 100) / 100
      } else if (data) {
        console.log('------------1', data);
        this.uniqueAddress = data;

        await this.apiService.getBalance1(this.uniqueAddress, this.contractInstance1).then(async (data1) => {
          console.log('------------2', data1)
          if (data1 && data1 > 0) {

            await this.apiService.getBalance2(this.userAccount, this.contractInstance2).then((data2) => {
                console.log('------------3 ', data2)
              if (data2 && data2 > 0) {
              } else {
                this.show = 'step3';
                // this.show = 'step2'
              }

            })

          } else {
            this.show = 'step2'
          }

        })
      }

    })
  }



  async getHoldedBalance(uniqueAddress, contractInstance1) {
    await this.apiService.getBalance1(uniqueAddress, contractInstance1).then((data) => {
      console.log('------------getHoldedBalance', data)
      if (data && data > 0) {
        this.show = 'step3';
      }

    })
  }


  //click event  1
  async createUpgrader() {
    await this.apiService.createUpgrader(this.contractInstance2).then((data) => {
      if (data) {
        console.log('------------uniqueA', data);
        this.uniqueAddress = data;
        this.show = 'step2';
      }

    })
  }

  //click event  2
  async sendSpcToVault() {
    await this.apiService.getBalance1(this.uniqueAddress, this.contractInstance1).then(async (data) => {
      console.log('------------getHoldedBalance', data)
      if (data && data > 0) {
        // await this.apiService.getBalance2(this.userAccount, this.contractInstance2).then((data2) => {

        //   if (data2 && data2 > 0) {
        //     this.show = 'step3';
        //   } else {
        //     this.show = 'step2'
        //   }

        // })
      } else {
        this.transfer(this.uniqueAddress, this.balance1, this.contractInstance1);
      }

    })
  }


  async transfer(uniqueAddress, balance1, contractInstance1) {
    await this.apiService.transfer(uniqueAddress, balance1, contractInstance1).then((data) => {
      console.log('------------transfer', data)
      if (data) {
        this.show = 'step3';
      }

    })
  }



  //click event 3
  async migrateV1tokens() {

    await this.apiService.migrateV1tokens(this.contractInstance2).then((data) => {
      console.log('------------migrateV1tokens', data)
      if (data) {
        this.show = 'step4';
        // this.transfer(this.uniqueAddress, this.balance1, this.contractInstance1);
      }
    }).catch((er) => {
      if (er && er.code) {

        this.toaster.error(er.message);
        // $('#please_wait').modal('show');
      }

      this.toaster.error()
      console.log('--------------er')
    })

  }

}


