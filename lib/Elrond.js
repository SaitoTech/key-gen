const { ApiNetworkProvider, ProxyNetworkProvider, 
    Account, UserSigner, Address, UserWallet, Transaction, 
    TransactionComputer, UserSecretKey, Mnemonic  } = require("@multiversx/sdk-core");

class  Elrond{
    constructor(){

    }
    async getAddress(mnemonic_text) {
        try {
          let mnemonic = null;
          if (mnemonic_text == null) {
              mnemonic = Mnemonic.generate();            
          } else {
              mnemonic = Mnemonic.fromString(mnemonic_text);  
          }
  
          this.secretKey = mnemonic.deriveKey(0);
          const publicKey = this.secretKey.generatePublicKey();
          this.address_obj = publicKey.toAddress();
          this.mnemonic_text = mnemonic_text
          this.address = this.address_obj.toBech32();
          return this.address
          console.log(this);
        } catch (error) {
          console.error("Error creating EGLD address:", error);
          throw error;
        }
    }
  
  

    
}

module.exports = Elrond