import { TxType } from "./types";
import {Utils} from "./utils";

class Unisat_provider {
    // channel = new BroadcastChannel("");
    private _waitingMap = new Map<
        number,
        {
            data: any;
            resolve: (arg: any) => any;
            reject: (arg: any) => any;
        }
    >();
    private _eventCallback: { [key: string]: Function[] } = {};

    constructor() {
        // this.channel.postMessage()
    }

    _request = async (data: { method: string, params?: any }) => {
        const id = Utils.genId();
        return new Promise((resolve, reject) => {
            this._waitingMap.set(id, {
                data,
                resolve,
                reject
            });
            // this.channel.postMessage({ id, data
            this.sendRequest({ id, ...data })
        })
    }

    sendRequest = (data: { id: number, method: string, params?: any }) => {
        // @ts-ignore
        if (window.bitcoin.postMessage) {
            // @ts-ignore
            window.bitcoin.postMessage(data);
        } else {
            throw new Error('not implemented')
        }
    }

    sendResponse = (id: number, result: string) => {
        const cb = this._waitingMap.get(id);
        if (cb) {
            try {
                const json = JSON.parse(result);
                cb.resolve(json);
            }   catch {
                cb.resolve(result);
            }
            this._waitingMap.delete(id);
        } else {
            console.log('no callback found for id', id)
        }
    }

    sendError = (id: number, error: string) => {
        const cb = this._waitingMap.get(id);
        if (cb) {
            cb.reject(error);
            this._waitingMap.delete(id);
        } else {
            console.log('no callback found for id', id)
        }
    }

    sendAccountChangeEvent = (accounts: string) => {
        accounts = JSON.parse(accounts);
        this._eventCallback['accountsChanged'].forEach(cb => cb(accounts));
    }

    sendNetworkChangeEvent = (network: string) => {
        this._eventCallback['networkChanged'].forEach(cb => cb(network));
    }

    // public methods
    requestAccounts = async () => {
        return this._request({
            method: 'requestAccounts'
        });
    };

    getNetwork = async () => {
        return this._request({
            method: 'getNetwork'
        });
    };

    switchNetwork = async (network: string) => {
        return this._request({
            method: 'switchNetwork',
            params: {
                network
            }
        });
    };

    getAccounts = async () => {
        return this._request({
            method: 'getAccounts'
        });
    };

    getPublicKey = async () => {
        return this._request({
            method: 'getPublicKey'
        });
    };

    getBalance = async () => {
        return this._request({
            method: 'getBalance'
        });
    };

    getInscriptions = async (cursor = 0, size = 20) => {
        return this._request({
            method: 'getInscriptions',
            params: {
                cursor,
                size
            }
        });
    };

    signMessage = async (text: string, type: string) => {
        return this._request({
            method: 'signMessage',
            params: {
                text,
                type
            }
        });
    };

    signData = async (data: string, type: string) => {
        return this._request({
            method: 'signData',
            params: {
                data,
                type
            }
        });
    };

    sendBitcoin = async (toAddress: string, satoshis: number, options?: { feeRate: number; memo?: string }) => {
        return this._request({
            method: 'sendBitcoin',
            params: {
                toAddress,
                satoshis,
                feeRate: options?.feeRate,
                memo: options?.memo,
                type: TxType.SEND_BITCOIN
            }
        });
    };

    sendInscription = async (toAddress: string, inscriptionId: string, options?: { feeRate: number }) => {
        return this._request({
            method: 'sendInscription',
            params: {
                toAddress,
                inscriptionId,
                feeRate: options?.feeRate,
                type: TxType.SEND_ORDINALS_INSCRIPTION
            }
        });
    };

    // signTx = async (rawtx: string) => {
    //   return this._request({
    //     method: 'signTx',
    //     params: {
    //       rawtx
    //     }
    //   });
    // };

    /**
     * push transaction
     */
    pushTx = async (rawtx: string) => {
        return this._request({
            method: 'pushTx',
            params: {
                rawtx
            }
        });
    };

    signPsbt = async (psbtHex: string, options?: any) => {
        return this._request({
            method: 'signPsbt',
            params: {
                psbtHex,
                type: TxType.SIGN_TX,
                options
            }
        });
    };

    signPsbts = async (psbtHexs: string[], options?: any[]) => {
        return this._request({
            method: 'multiSignPsbt',
            params: {
                psbtHexs,
                options
            }
        });
    };

    pushPsbt = async (psbtHex: string) => {
        return this._request({
            method: 'pushPsbt',
            params: {
                psbtHex
            }
        });
    };

    inscribeTransfer = async (ticker: string, amount: string) => {
        return this._request({
            method: 'inscribeTransfer',
            params: {
                ticker,
                amount
            }
        });
    };

    getVersion = async () => {
        return this._request({
            method: 'getVersion'
        });
    };

    isAtomicalsEnabled = async () => {
        return this._request({
            method: 'isAtomicalsEnabled'
        });
    };

    getBitcoinUtxos = async (cursor = 0, size = 20) => {
        return this._request({
            method: 'getBitcoinUtxos',
            params: {
                cursor,
                size
            }
        });
    };

    on = (event: string, cb: Function) => {
        if (!this._eventCallback[event]) {
            this._eventCallback[event] = [];
        }
        this._eventCallback[event].push(cb);
    }

    removeListener = (event: string, cb: Function) => {
        this._eventCallback[event] = this._eventCallback[event].filter(c => c !== cb);
    }
}

export default Unisat_provider;
