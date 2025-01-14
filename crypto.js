'use strict'

const crypto = require('crypto-browserify');
const sha256 = require('sha256');
const merkle = require('merkle-tree-gen');
const node_cryptojs = require('node-cryptojs-aes');
const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1')
const CryptoJS = node_cryptojs.CryptoJS;
const JsonFormatter = node_cryptojs.JsonFormatter;
const Base58 = require("base-58");
const bech32 = require('bech32');



/**
 * Crypto Constructor
 */
function Crypto() {
  if (!(this instanceof Crypto)) { return new Crypto(); }
  return this;
}
module.exports = Crypto;




///////////////////////////////////
// BASIC CRYPTOGRAPHIC FUNCTIONS //
///////////////////////////////////

/**
 * Hashes a string 2x sha256 like bitcoin
 * @param {string} text
 * @returns {string} 2x sha256 hash
 */
Crypto.prototype.hash = function hash(text = "") {
  return sha256(sha256(text));
}



/**
 * Converts hex string to base58 string
 *
 * @param {string} t string to convert
 * @returns {string} converted string
 */
Crypto.prototype.toBase58 = function toBase58(t) {
  return Base58.encode(Buffer.from(t, 'hex'));
}




/**
 * Returns the public key associated with a private key
 * @param {string} privkey private key (hex)
 * @returns {string} public key (hex)
 */
Crypto.prototype.returnPublicKey = function returnPublicKey(privkey) {
  return this.compressPublicKey(secp256k1.publicKeyCreate(Buffer.from(privkey, 'hex'), false).toString('hex'));
}



/**
 * Generates a new keypair ensuring public key meets length requirements
 * @returns {Object} {publicKey: string, privateKey: Buffer}
 */
Crypto.prototype.generateKeyPair = function generateKeyPair() {
  let publicKey, privateKey;
  let pubKeyBase58;

  do {
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    publicKey = secp256k1.publicKeyCreate(privateKey, true);

    pubKeyBase58 = Base58.encode(publicKey);

    console.log("Base58 public key:", pubKeyBase58, "length:", pubKeyBase58.length);
    if (pubKeyBase58.length === 44) {
      break;
    }

  } while (true);

  // Return public key as base58 string and private key as buffer
  return [
    privateKey.toString('hex'),
    pubKeyBase58,
  ];
}

/**
 * Creates a keypair from an existing private key
 * @param {string} privateKeyHex - Private key in hex format
 * @returns {[string, string]} [publicKey, privateKey] both as strings
 */
Crypto.prototype.generateKeypairFromPrivateKey = function generateKeypairFromPrivateKey(privateKeyHex) {
  try {
      const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
      
      if (!secp256k1.privateKeyVerify(privateKeyBuffer)) {
          throw new Error("Invalid private key");
      }
      
      const publicKey = secp256k1.publicKeyCreate(privateKeyBuffer, true);
    
      const pubKeyBase58 = Base58.encode(publicKey);
      

      return [
        privateKeyHex,
          pubKeyBase58,
          
      ];
      
  } catch (error) {
      console.error('Error in generateKeypairFromPrivateKey:', error);
      throw error;
  }
}

/**
* Helper function to convert public key to base58 and verify length
* @param {Buffer|Uint8Array} publicKey 
* @returns {boolean}
*/
Crypto.prototype.verifyPublicKeyLength = function verifyPublicKeyLength(publicKey) {
  const base58Key = this.toBase58(publicKey.toString('hex'));
  return base58Key.length === 44;
}


Crypto.prototype.generateSeedFromPrivateKey = function (existingPrivateKey) {
  // Create a seed that will deterministically generate your key first
  let seed = Buffer.from(existingPrivateKey, 'hex');

  // Generate mnemonic from this seed
  const mnemonic = bip39.entropyToMnemonic(seed);

  return {
    mnemonic: mnemonic,
    seed: seed
  };
}


Crypto.prototype.getPrivateKeyFromSeed = function (mnemonic) {
  try {
    // Validate the mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }

    // Convert mnemonic back to entropy
    // This will give us back our original private key since we used it as entropy
    const entropy = bip39.mnemonicToEntropy(mnemonic);

    // Convert to Buffer/hex string as needed
    const privateKey = entropy;

    // Verify if this is a valid secp256k1 private key
    if (!secp256k1.privateKeyVerify(Buffer.from(privateKey, 'hex'))) {
      throw new Error('Generated private key is not valid for secp256k1');
    }

    return privateKey;
  } catch (error) {
    console.error('Error getting private key from seed:', error);
    throw error;
  }
}