const bip39 = require('bip39');
const crypto = require('crypto');
const elliptic = require('elliptic');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const Crypto = require('./crypto.js')
const qrcode = require('qrcode-generator');
const pbkdf2 = require('pbkdf2').pbkdf2Sync;
const unorm = require('unorm');
const Base58 = require("base-58");


////////////
// Render //
////////////
// $(document).ready(function () {
//   var container = document.querySelector('.tab-container')
//   tabs(container);
//   new ClipboardJS('.copy');
// });

/////////////////
// Create Keys //
/////////////////
let cryptoClass = new Crypto();

if (document.querySelector('#generate')){
  document.querySelector('#generate').addEventListener('click', function(e){
    e.preventDefault();

    let mnem = generateMnemonic();
    document.querySelector('#seed-output').innerText = mnem;

    let keyPair = generateKeyPair(mnem);
    console.log("keypair: ", keyPair);

    document.querySelector('#privkey-output').innerText = keyPair.privateKey;
    makeqr(document.querySelector('#private-qr'), keyPair.privateKey);
    
    document.querySelector('#pubkey-output').innerText = keyPair.publicKey;
    makeqr(document.querySelector('#public-qr'), keyPair.publicKey);


    var recPrivateKey = mnemonicToSeed32(mnem).toString('hex');
    console.log('recPrivateKey', recPrivateKey);

  });
}


function generateKeyPair(mnemonic){

  console.log('mnemonic', mnemonic);

  const msg = randomBytes(32);
 // console.log('msg: ', msg);

  // Derive a seed from the mnemonic phrase
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  console.log('seed: ', seed);

  // generate privKey
  let privKey;
  let mnem;
  do {
    //privKey = randomBytes(32);
    privKey = seed.slice(0, 32);
//    mnem = bip39.generateMnemonic();

  } while (!secp256k1.privateKeyVerify(privKey))

  console.log('privKey: ', privKey);
  console.log('compressed privKey: ', (privKey).toString("hex"));

  // get the public key in a compressed format
  const pubKey = secp256k1.publicKeyCreate(privKey);

  console.log('pubKey: ', pubKey);
  console.log('compressed pubKey: ', cryptoClass.toBase58(pubKey));

  // sign the message
  const sigObj = secp256k1.ecdsaSign(msg, privKey);

  // verify the signature
  console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey));
  // => true

  return {
    privateKey: (privKey).toString("hex"),
    publicKey: cryptoClass.toBase58(pubKey),
  };

}


document.querySelector('#print').addEventListener('click', function(e){
    e.preventDefault();
    window.print();
});

const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text).then(function() {
      alert("Copied to clipboard");
    });
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

document.querySelectorAll('.copy').forEach(function(icon, i){
   icon.addEventListener('click', function(e){
      e.preventDefault();
      let querySelector = e.currentTarget.getAttribute('data-clipboard-target');
      console.log('querySelector: ', querySelector);
      let value = document.querySelector(querySelector).innerText;
      console.log('value: ', value);
      copyContent(value);
  });
});

// $(() => {
  
//   $('#text-input').focus() // focus input box

//   //////////////////
//   // Recover Keys //
//   //////////////////

//   $('#seed-input').bind('input propertychange', function () {
//     const text = this.value;
//     if (text.trim().split(/\s+/g).length == 12) {
      // var recPrivateKey = mnemonicToSeed32(text).toString('hex');
      // $('#privateKey-recovered').text(recPrivateKey)
//       makeqr($('#private-qr-recovered'), recPrivateKey);
//     } else {
//       $('#privateKey-recovered').text("Seed Invalid");
//       $('#private-qr-recovered').html("");
//     }
//   });
// })


document.querySelectorAll('.tab').forEach(function(icon, i){
   icon.addEventListener('click', function(e){
      e.preventDefault();

      document.querySelector('#keys').classList.toggle('active');
      document.querySelector('#retrieve').classList.toggle('active');

      document.querySelector('#keys-btn').classList.toggle('active');
      document.querySelector('#retrieve-btn').classList.toggle('active');
      
  });
});

document.querySelector('#seed-input').addEventListener('keyup', function(e){
      e.preventDefault();
      let value = e.currentTarget.value;
      if (value.trim().split(/\s+/g).length == 12) {
        const seed = bip39.mnemonicToSeedSync(value);
        let privKey;
        do {
          privKey = seed.slice(0, 32);
        } while (!secp256k1.privateKeyVerify(privKey))
        
        let recPrivateKey = (privKey).toString("hex");

       document.querySelector('#privateKey-recovered').innerText = recPrivateKey;
       makeqr(document.querySelector('#private-qr-recovered'), recPrivateKey);
      } else {
        document.querySelector('#privateKey-recovered').innerText = "Seed Invalid";
        document.querySelector('#private-qr-recovered').innerHTML = "";
      }
});

function makeqr(obj, data) {
  var typeNumber = 0;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(data);
  qr.make();
  obj.innerHTML = "";
  let qrImg = qr.createImgTag(5, 0, data);
  console.log("makeqr: ", qrImg);
  obj.innerHTML = qrImg;
}

function generateKeyPairFromMnemonic(mnemonic) {
  // Derive a seed from the mnemonic phrase
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Create an elliptic curve key pair
  const ec = new elliptic.ec('secp256k1');
  const keyPair = ec.genKeyPair({
    entropy: seed.slice(0, 32), // Take the first 32 bytes of the seed for entropy
  });

  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex'),
  };
}

function generateMnemonic(){
  let mnem;
  do { mnem = bip39.generateMnemonic() } while (!secp256k1.privateKeyVerify(mnemonicToSeed32(mnem), false));
  return mnem;
}


// function to mimic btc bip 39's mnemonicToSeed function but removing password and salt functions.
function mnemonicToSeed32 (mnemonic) {
  var mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');

  return pbkdf2(mnemonicBuffer, "", 1024, 32, 'sha512')
}

function generatePrivateKeyFromMnemonic() {
  let privateKey;
  let mnem;
  do { mnem = bip39.generateMnemonic() } while (!secp256k1.privateKeyVerify(mnemonicToSeed32(mnem), false));
  privateKey = mnemonicToSeed32(mnem);
  var pair = [privateKey.toString('hex'), mnem];
  return pair;
}