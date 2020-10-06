import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import Web3 from 'web3';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

declare let window: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    const that = this;
    if (window.ethereum) {
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.on('accountsChanged', function (networkId) {
        if (networkId) {

        }
      })

      window.ethereum.autoRefreshOnNetworkChange = true;
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // commented for future use

    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

  }

  getNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {
      if (window.ethereum.chainId == "0x1") {
        return environment.main;
      }
      if (window.ethereum.chainId == "0x3") {
        return environment.rops;
      }
      if (window.ethereum.chainId == "0x4") {
        return environment.rinkeby;
      }
      if (window.ethereum.chainId == "0x5") {
        return environment.Goerli;
      }
      if (window.ethereum.chainId == "0x2a") {
        return environment.Kovan;
      }
    }
  }

  connect() {
    if (window.ethereum) {
      // commented for future use
      return new Promise((resolve, reject) => {

        let temp = window.ethereum.enable();
        if (temp) {
          resolve(temp)
        } else {
          reject('err');
        }

      })
    }
  }


  async exportInstance1() {
    return await window.web3.eth.contract(environment.ABI1).at(environment.contractAddress1);
  }

  async exportInstance2() {
    return await window.web3.eth.contract(environment.ABI2).at(environment.contractAddress2);
  }


  async export() {

    return new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((error, result) => {

        // just 1 min jo
        if (error != null) {
          alert("Error retrieving accounts.");
          resolve([]);
        }
        if (result == undefined || result.length == 0) {
          alert("No account found! Make sure the Ethereum client is configured properly.");
          resolve([]);
        } else {

          let account = result[0];
          window.web3.eth.defaultAccount = account;
          resolve(account)
        }
      })
    })
  }

  getSelectedAddress() {
    if (window.ethereum && window.ethereum.selectedAddress) {
      return window.ethereum.selectedAddress;
    }
  }


  getBalance1(userWalletAccount, contractInstance) {
    return new Promise((resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      contractInstance.balanceOf(userWalletAccount, function (err, tokenBalance) {
        if (err && err != null) {
          console.log('Please connect with metamask');
          reject(err);
        }
        resolve(tokenBalance / environment.divideValue);
      });
    });

  }

  getBalance2(userWalletAccount, contractInstance) {
    return new Promise((resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      contractInstance.balanceOf(userWalletAccount, function (err, tokenBalance) {

        if (err && err != null) {
          console.log('Please connect with metamask');
          reject(err);
        }
        resolve(tokenBalance / environment.divideValue);
      });
    });

  }


  tokenUpgrader(userWalletAccount, contractInstance2) {
    return new Promise((resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      contractInstance2.tokenUpgrader(userWalletAccount, function (err, uniqueAddress) {

        if (err && err != null) {
          reject(err);
        }
        resolve(uniqueAddress);
      });
    });

  }


  createUpgrader(contractInstance2) {
    return new Promise((resolve, reject) => {

      contractInstance2.createUpgrader(function (err, uniqueAddress) {

        if (err && err != null) {
          reject(err);
        }
        resolve(uniqueAddress);
      });
    })
  }


  transfer(uniqueAddress, balance, contractInstance1) {
    return new Promise((resolve, reject) => {
      balance = balance * 1e18;
      contractInstance1.transfer(uniqueAddress, balance, function (err, data) {

        if (err && err != null) {
          reject(err);
        }
        resolve(data);
      });
    })
  }


  migrateV1tokens(contractInstance2){
    
    return new Promise((resolve, reject) => {
      contractInstance2.migrateV1tokens(function (err, data) {
        if (err && err != null) {
          reject(err);
        }
        resolve(data);
      });
    })
  }

}
