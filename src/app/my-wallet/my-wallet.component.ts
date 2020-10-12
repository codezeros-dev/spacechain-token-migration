import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { ApiWalletConnectService } from '../api-wallet-connect.service';

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

  wallet: any = '';
  id: any;
  chainId: any;
  constructor(private router: Router,
    private _route: ActivatedRoute,
    private apiWalletService: ApiWalletConnectService,
    private apiService: ApiService,
    private toaster: ToastrService,) {
    this.id = this._route.snapshot.params['id'];
    if (this.id && this.id != undefined) {
      let idArray = ['1', '2'];

      if (!idArray.includes(this.id)) {
        this.router.navigate(['/']);
      } else {
        if (this.id == 1) {
          this.wallet = 'Metamask';
          this.userAccount = this.apiService.export();

          if (this.userAccount != undefined && this.userAccount || (this.userAccount.length)) {

          } else {
            this.router.navigate(['/']);
          }
        }
        else {
          this.wallet = 'WalletConnect';
        }
      }
    }
  }

  async ngOnInit() {

    if (this.wallet == 'Metamask') {
      this.userAccount = await this.apiService.export();

      this.contractInstance1 = await this.apiService.exportInstance1();
      this.contractInstance2 = await this.apiService.exportInstance2();
      console.log(this.userAccount)
      if (this.userAccount) {

        await this.balanceOf1(this.userAccount, this.contractInstance1);
        await this.balanceOf2(this.userAccount, this.contractInstance2);
        await this.checkProcess(this.userAccount, this.contractInstance1, this.contractInstance2)
      }
    } else {
      this.apiWalletService.getBehaviorView().subscribe(async (data) => {
        if (data && data != undefined) {
          if (data['connected']) {

            this.userAccount = data['walletAddress']
            this.chainId = data['chainId'];
            this.contractInstance1 = await this.apiWalletService.exportInstance1(data['networkName']);
            this.contractInstance2 = await this.apiWalletService.exportInstance2(data['networkName']);

            this.balanceOfWallet1(this.contractInstance1, data['walletAddress']);
            this.balanceOfWallet2(this.contractInstance2, data['walletAddress']);
            this.checkProcessWallet(this.userAccount, this.contractInstance1, this.contractInstance2)
          } else {
            this.router.navigate(['/']);
          }
        }
      })
    }
  }

  async balanceOf1(walletAddress, contractInstance) {
    await this.apiService.getBalance1(walletAddress, contractInstance).then((data: any) => {
      if (data) {
        console.log('11', data);
        this.balance1 = (data).toFixed(2);
      }
    })
  }

  async balanceOf2(walletAddress, contractInstance) {
    await this.apiService.getBalance2(walletAddress, contractInstance).then((data: any) => {

      if (data) {
        this.balance2 = (data).toFixed(2);
        // Math.round(data * 100) / 100
      }
    })
  }

  //for start=------------ walletConnect
  balanceOfWallet1(contractInstance, walletAddress) {
    this.apiWalletService.getBalance1(contractInstance, walletAddress).then((data) => {
      if (data) {
        this.balance1 = (data).toFixed(2);
      }
    })
  }
  balanceOfWallet2(contractInstance, walletAddress) {
    this.apiWalletService.getBalance2(contractInstance, walletAddress).then((data) => {
      if (data) {
        this.balance2 = (data).toFixed(2);
      }
    })
  }

  async checkProcessWallet(walletAddress, contractInstance1, contractInstance2) {
    this.getWalletTokenUpgrader(walletAddress, contractInstance2)
  }

  async getWalletTokenUpgrader(walletAddress, contractInstance2) {

    await this.apiWalletService.tokenUpgrader(walletAddress, contractInstance2).then(async (data) => {
      console.log('--------------da', data)
      if (data && data == '0x0000000000000000000000000000000000000000') {
        this.show = 'step1';
        // Math.round(data * 100) / 100
      } else if (data) {
        this.uniqueAddress = data;

        await this.apiWalletService.getBalance1(this.contractInstance1, this.uniqueAddress).then(async (data1) => {
          if (data1 && data1 > 0) {

            await this.apiWalletService.getBalance2(this.contractInstance2, this.userAccount).then((data2) => {
              if (data2 && data2 > 0) {
              } else {
                this.show = 'step3';
                // this.show = 'step2'
              }

            })

          } else {
            this.show = 'step2'
          }

        });
      }

    })

  }


  //end----------- walletConnect

  async checkProcess(walletAddress, contractInstance1, contractInstance2) {

    await this.getTokenUpgrader(walletAddress, contractInstance2);
  }

  async getTokenUpgrader(walletAddress, contractInstance2) {
    await this.apiService.tokenUpgrader(walletAddress, contractInstance2).then(async (data) => {
      if (data && data == '0x0000000000000000000000000000000000000000') {
        this.show = 'step1';
        // Math.round(data * 100) / 100
      } else if (data) {
        this.uniqueAddress = data;

        await this.apiService.getBalance1(this.uniqueAddress, this.contractInstance1).then(async (data1) => {
          if (data1 && data1 > 0) {

            await this.apiService.getBalance2(this.userAccount, this.contractInstance2).then((data2) => {
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
      if (data && data > 0) {
        this.show = 'step3';
      }

    })
  }


  //click event  1
  async createUpgrader() {

    if (this.id && this.id == '1') {
      await this.apiService.createUpgrader(this.contractInstance2, this.userAccount).then((data) => {

        if (data) {
          this.uniqueAddress = data;
          this.show = 'step2';
        }

      })
    } else {
      await this.apiWalletService.createUpgrader(this.contractInstance2, this.userAccount, this.chainId).then((data) => {

        if (data && data != null && data != undefined) {
          this.uniqueAddress = data;
          this.show = 'step2';
        }
      }).catch((er) => {
      })
    }

  }

  //click event  2
  async sendSpcToVault() {
    console.log('-------------------------',this.id)
    if (this.id && this.id == '1') {
      console.log('--------------------------------1--',)
      await this.apiService.getBalance1(this.uniqueAddress, this.contractInstance1).then(async (data) => {
        if (data && data > 0) {

        } else {
          console.log('--------------------------------2--',)

          this.transfer(this.uniqueAddress, this.balance1, this.contractInstance1);
        }

      })
    } else {
      await this.apiWalletService.getBalance1(this.contractInstance1, this.uniqueAddress).then(async (data) => {
        if (data && data > 0) {

        } else {
          this.transferWallet(this.uniqueAddress, this.balance1, this.contractInstance1, this.chainId);
        }

      })
    }
  }

  // for  chrome extenstion
  async transfer(uniqueAddress, balance1, contractInstance1) {
    console.log('--------------------------------3-',)

    await this.apiService.transfer(uniqueAddress, balance1, contractInstance1, this.userAccount).then((data) => {
      if (data) {
        console.log('--------------------------------5-',data)
        this.show = 'step3';
      }

    }).catch((er) => {

    })
  }

  // for mobile wallet Connect
  async transferWallet(uniqueAddress, balance1, contractInstance1, chainId) {
    await this.apiWalletService.transfer(uniqueAddress, balance1, contractInstance1, this.userAccount, chainId).then((data) => {
      if (data) {
        this.show = 'step3';
      }
    });
  }

  //click event 3
  async migrateV1tokens() {
    $('#please_wait').modal('show');

    if (this.id && this.id == '1') {
      await this.apiService.migrateV1tokens(this.contractInstance2, this.userAccount).then((data) => {
        if (data) {
          $('#please_wait').modal('hide');
          this.show = 'step4';

        }
      }).catch((er) => {
        if (er && er.code) {
          this.toaster.error(er.message);
          $('#please_wait').modal('hide');
        }
        this.toaster.error();
      })
    } else {
      await this.apiWalletService.migrateV1tokens(this.contractInstance2, this.userAccount, this.chainId).then((data) => {
        if (data && data != null && data != undefined) {
          $('#please_wait').modal('hide');
          this.show = 'step4';
        }
      }).catch((er) => {
        if (er && er.code) {
          this.toaster.error(er.message);
          $('#please_wait').modal('hide');
        }
        this.toaster.error();
      })

    }

  }

}


