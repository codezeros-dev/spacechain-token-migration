import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import Web3 from 'web3';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

import WalletConnect from '@walletconnect/client';
import QRCodeModal from "@walletconnect/qrcode-modal";

import { getChainData, sanitizeHex } from "./helpers/utils";
import { BehaviorSubject, Observable, throwError } from 'rxjs';

import WalletConnectProvider from "@walletconnect/web3-provider";
import { apiGetAccountNonce, apiGetGasPrices } from './helpers/api';
import { convertAmountToRawNumber, convertStringToHex } from './helpers/bignumber';



@Injectable({
  providedIn: 'root'
})
export class ApiWalletConnectService {

  private behave = new BehaviorSubject<Object>('');
  private onConnectBehave = new BehaviorSubject<Object>('');

  connector: any;

  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    const that = this;


    const provider = new WalletConnectProvider({
      infuraId: "5918063957ef4e8bae0348d54fa14ebb" // Required
    });

    if (provider) {
      if (provider.wc && provider.wc['_connected']) {
        console.log('-----------conne', provider.wc['_chainId'])
        const activeChain = provider.wc['_chainId'] ? getChainData(provider.wc['_chainId']).name : null;
        this.setBehaviorView({
          walletAddress: provider.wc['_accounts'][0],
          networkName: activeChain,
          connected: true,
          chainId: provider.wc['_chainId']
        })

        provider.on("open", (d) => {
          console.log("open", d);
        });


      } else {
        console.log('---------not--conne')

        this.setBehaviorView({
          walletAddress: '',
          networkName: '',
          connected: false,
          chainId: 0
        })

      }
    }
    console.log('---------------provider--------||', provider);

  }

  setBehaviorView(behave: object) {
    this.behave.next(behave);
  }

  /** Get Behavior for user registraion */
  getBehaviorView(): Observable<object> {
    return this.behave.asObservable();
  }

  setOnConnectBehaviorView(behave: object) {
    this.onConnectBehave.next(behave);
  }

  /** Get Behavior for user registraion */
  getOnConnectBehaviorView(): Observable<object> {
    return this.onConnectBehave.asObservable();
  }

  // -------------------------wallet Connect code
  public walletConnectInit = async () => {
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    this.connector = connector;
    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // this.state.web3 = new Web3("https://ropsten.infura.io/v3/5918063957ef4e8bae0348d54fa14ebb");

    // // subscribe to events
    await this.subscribeToEvents();
  }


  public subscribeToEvents = () => {
    
    if (!this.connector) {
      return;
    }

    this.connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`, payload);
      if (error) {
        throw error;
      }
    });

    this.connector.on("connect", (error, payload) => {

      const activeChain = this.connector.chainId ? getChainData(this.connector.chainId).name : null;
      const address = this.connector.accounts[0];

      if (error) {
        throw error;
      }
      this.setBehaviorView({
        walletAddress: address,
        networkName: activeChain,
        connected: true,
        chainId: this.connector.chainId
      })

      this.setOnConnectBehaviorView({
        connected: true
      })

      // this.onConnect(payload);
    });

    this.connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`, payload);
      this.killSession();
      if (error) {
        throw error;
      }
      this.setBehaviorView({
        walletAddress: '',
        networkName: '',
        connected: false,
        chainId: 0
      })
    });

    this.connector = this.connector;
  };



  async exportInstance1(networkName) {
    console.log('----------------------',networkName)
    let web3;
    if (networkName == 'Ropsten') {
      web3 = new Web3("https://ropsten.infura.io/v3/5918063957ef4e8bae0348d54fa14ebb");
    } else if (networkName == 'Mainnet') {
      web3 = new Web3("https://mainnet.infura.io/v3/5918063957ef4e8bae0348d54fa14ebb");
    }
    return await new web3.eth.Contract(environment.ABI1, environment.contractAddress1);
  }

  async exportInstance2(networkName) {
    let web3;
    if (networkName == 'Ropsten') {
      web3 = new Web3("https://ropsten.infura.io/v3/5918063957ef4e8bae0348d54fa14ebb");
    } else if (networkName == 'Mainnet') {
      web3 = new Web3("https://mainnet.infura.io/v3/5918063957ef4e8bae0348d54fa14ebb");
    }
    return await new web3.eth.Contract(environment.ABI2, environment.contractAddress2);
  }

  public getBalance1 = async (contractInstance, walletAddress) => {
    let temp = await contractInstance.methods.balanceOf(walletAddress).call({
      from: walletAddress
    });
    return await (temp / environment.divideValue);
    ;
  }

  public getBalance2 = async (contractInstance, walletAddress) => {
    let temp = await contractInstance.methods.balanceOf(walletAddress).call({
      from: walletAddress
    });
    return await (temp / environment.divideValue);
  }


  async tokenUpgrader(walletAddress, contractInstance2) {

    let uniqueAddress = await contractInstance2.methods.tokenUpgrader(walletAddress).call({
      from: walletAddress
    });
    if (uniqueAddress) {
      return uniqueAddress;
    } else {
      return 'err';
    }
  }


  async createUpgrader(contractInstance2, walletAdder, chainId) {


    const from = walletAdder;
    const to = environment.contractAddress2;
    const _nonce = await apiGetAccountNonce(walletAdder, chainId);
    const nonce = sanitizeHex(convertStringToHex(_nonce));
    const gasPrices = await apiGetGasPrices();
    const _gasPrice = 100;
    const gasPrice = sanitizeHex(convertStringToHex(convertAmountToRawNumber(_gasPrice, 9)));
    const _gasLimit = 30000;
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));
    const _value = 0;
    const value = sanitizeHex(convertStringToHex(_value));

    await this.walletConnectInit();
    let uniqueAddress = await contractInstance2.methods.createUpgrader().encodeABI();
    if (uniqueAddress) {

      // return uniqueAddress;
      let txnObject = {
        from: from,
        to: to,
        // gasPrice: gasPrice,
        // gas: gasLimit,
        // value: "0x0",
        // nonce: nonce,
        data: await uniqueAddress
      };
      console.log('-------uniqueAddress------', uniqueAddress)

      console.log('-------------', txnObject)

      // Send transaction
      if (this.connector) {
        return this.connector.sendTransaction(txnObject)
          .then((result) => {
            // Returns transaction id (hash)
            return result;
          })
          .catch((error) => {
            // Error returned when rejected
            return ;
          });
      } else {
        console.log('-------------else')
      }

    } else {
      return 'err';
    }
  }


  async transfer(uniqueAddress, balance, contractInstance1, walletAdder, chainId) {

    const from = walletAdder;
    const to = environment.contractAddress1;
    const _nonce = await apiGetAccountNonce(walletAdder, chainId);
    const nonce = sanitizeHex(convertStringToHex(_nonce));
    const gasPrices = await apiGetGasPrices();
    const _gasPrice = gasPrices.slow.price;
    const gasPrice = sanitizeHex(convertStringToHex(convertAmountToRawNumber(_gasPrice, 9)));
    const _gasLimit = 300000;
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));

    await this.walletConnectInit();

    //--------------------
    balance = convertAmountToRawNumber(balance);

    let receipt = await contractInstance1.methods.transfer(uniqueAddress, balance).encodeABI();

    if (receipt) {

      let txnObject = {
        from: from,
        to: to,
        gasPrice: gasPrice,
        gas: gasLimit,
        nonce: nonce,
        data: await receipt
      };

      if (this.connector) {
        return this.connector.sendTransaction(txnObject)
          .then((result) => {
            // Returns transaction id (hash)
            return result;
          })
          .catch((error) => {
            // Error returned when rejected
            return ;
          });
      } else {
        console.log('-------------else')
      }

    } else {
      return 'err';
    }

  }


  async migrateV1tokens(contractInstance2, walletAdder, chainId) {

    const from = walletAdder;
    const to = environment.contractAddress2;
    const _nonce = await apiGetAccountNonce(walletAdder, chainId);
    const nonce = sanitizeHex(convertStringToHex(_nonce));
    const gasPrices = await apiGetGasPrices();
    const _gasPrice = 21;
    const gasPrice = sanitizeHex(convertStringToHex(convertAmountToRawNumber(_gasPrice, 9)));
    const _gasLimit = 30000;
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));
    // const _value = 0;
    // const value = sanitizeHex(convertStringToHex(_value));

    await this.walletConnectInit();


    let receipt = await contractInstance2.methods.migrateV1tokens().encodeABI();

    if (receipt) {
      let txnObject = {
        from: from,
        to: to,
        // gasPrice: gasPrice,
        // gas: gasLimit,
        // value: "0x0",
        // nonce: nonce,
        data: await receipt
      };

      // return await receipt;

      return this.connector.sendTransaction(txnObject)
      .then((result) => {
        console.log('-------------if', result)
        // Returns transaction id (hash)
        return result;
      }).catch((error) => {
        // Error returned when rejected
        console.log('-------------if', error)
        return error;
      });

    } else {
      return 'err';
    }


  }


  public killSession = async () => {
      if (this.connector) {
        this.connector.killSession();
        this.connector = '';
    }
    this.router.navigateByUrl("/");
  };

}
