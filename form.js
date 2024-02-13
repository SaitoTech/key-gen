const bip39 = require('bip39');
const crypto = require('crypto');
const elliptic = require('elliptic');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const Crypto = require('./crypto.js')
const qrcode = require('qrcode-generator');
const pbkdf2 = require('pbkdf2').pbkdf2Sync;
const unorm = require('unorm');


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


if (document.querySelector('#generate')){
  document.querySelector('#generate').addEventListener('click', function(e){
    e.preventDefault();

    let mnem = generateMnemonic();
    document.querySelector('#seed-output').innerText = mnem;
    
    let keyPair = generateKeyPairFromMnemonic(mnem);
    console.log("keypair: ", keyPair);

    document.querySelector('#privkey-output').innerText = keyPair.privateKey;
    makeqr(document.querySelector('#private-qr'), keyPair.privateKey);
    

    document.querySelector('#pubkey-output').innerText = keyPair.publicKey;
    makeqr(document.querySelector('#public-qr'), keyPair.publicKey);
  });
}

document.querySelector('#print').addEventListener('click', function(e){
    e.preventDefault();
    window.print();
});

document.querySelectorAll('.copy').forEach(function(icon, i){
   icon.addEventListener('click', function(e){
      e.preventDefault();
      let querySelector = e.currentTarget.getAttribute('data-clipboard-target');
      console.log('querySelector: ', querySelector);
      let value = document.querySelector(querySelector).innerText;
      console.log('value: ', value);
      navigator.clipboard.writeText(value);
      alert('Copied to clipboard');
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
//       var recPrivateKey = mnemonicToSeed32(text).toString('hex');
//       $('#privateKey-recovered').text(recPrivateKey)
//       makeqr($('#private-qr-recovered'), recPrivateKey);
//     } else {
//       $('#privateKey-recovered').text("Seed Invalid");
//       $('#private-qr-recovered').html("");
//     }
//   });
// })

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

  return pbkdf2(mnemonicBuffer, "", 2048, 32, 'sha512')
}

// function generatePrivateKeyFromMnemonic() {
//   let privateKey;
//   let mnem;
//   do { mnem = bip39.generateMnemonic() } while (!secp256k1.privateKeyVerify(mnemonicToSeed32(mnem), false));
//   privateKey = mnemonicToSeed32(mnem);
//   var pair = [privateKey.toString('hex'), mnem];
//   return pair;
// }