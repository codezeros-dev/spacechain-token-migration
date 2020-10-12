import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import Web3 from 'web3';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

import WalletConnect from '@walletconnect/client';
import QRCodeModal from "@walletconnect/qrcode-modal";

import { getChainData, sanitizeHex } from "./helpers/utils";
import { convertAmountToRawNumber } from './helpers/bignumber';

declare let window: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  connector: any;
  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    const that = this;

    if (window.ethereum) {
      window.web3 = new Web3(window.web3.currentProvider);

      window.ethereum.autoRefreshOnNetworkChange = true;
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // commented for future use

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
    return await new window.web3.eth.Contract(environment.ABI1, environment.contractAddress1);
  }

  async exportInstance2() {
    return await new window.web3.eth.Contract(environment.ABI2, environment.contractAddress2);
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
          // alert("No account found! Make sure the Ethereum client is configured properly.");
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
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let temp = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });
      if (temp) {
        resolve(temp / environment.divideValue);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }
    });

  }

  getBalance2(userWalletAccount, contractInstance) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }

      let temp = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });
      if (temp) {
        resolve(temp / environment.divideValue);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }

    });

  }


  tokenUpgrader(userWalletAccount, contractInstance2) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let uniqueAddress = await contractInstance2.methods.tokenUpgrader(userWalletAccount).call({
        from: userWalletAccount
      });
      if (uniqueAddress) {
        resolve(uniqueAddress);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }

    });

  }


  createUpgrader(contractInstance2, walletAdder) {
    return new Promise(async (resolve, reject) => {

      let uniqueAddress = await contractInstance2.methods.createUpgrader().call({
        from: walletAdder
      });
      if (uniqueAddress) {
        resolve(uniqueAddress);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }
    })
  }


  transfer(uniqueAddress, balance, contractInstance1, walletAdder) {
    return new Promise(async (resolve, reject) => {
      balance = await convertAmountToRawNumber(balance);
      console.log('--------------------------------3-',balance)

      let receipt = await contractInstance1.methods.transfer(uniqueAddress, balance).call({
        from: walletAdder
      });

      if (receipt) {
        resolve(receipt);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }

    })
  }


  migrateV1tokens(contractInstance2, walletAdder) {

    return new Promise(async (resolve, reject) => {

      let receipt = await contractInstance2.methods.migrateV1tokens().call({
        from: walletAdder
      });

      if (receipt) {
        resolve(receipt);
      } else {
        console.log('Please connect with metamask');
        reject('err');
      }

    })
  }
}
