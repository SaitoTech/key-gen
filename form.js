const crypto = require('crypto');
const elliptic = require('elliptic');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const Crypto = require('./crypto.js')
const qrcode = require('qrcode-generator');
const pbkdf2 = require('pbkdf2').pbkdf2Sync;
const unorm = require('unorm');
const Base58 = require("base-58");
const bip32 = require('bip32');
const bip39 = require('bip39');
const Elrond = require('./lib/Elrond.js');


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
let elrondClass = new Elrond()



if (document.querySelector('#generate')) {
  document.querySelector('#generate').addEventListener('click', async function (e) {
    e.preventDefault();

    const [privateKey, publicKey] = cryptoClass.generateKeyPair();
    console.log(privateKey, publicKey)

    let res = cryptoClass.generateSeedFromPrivateKey(privateKey);


    document.querySelector('#seed-output').innerText = res.mnemonic;

    document.querySelector('#privkey-output').innerText = privateKey;


    document.querySelector('#pubkey-output').innerText = publicKey;

    let elrondAddress = await elrondClass.getAddress(res.mnemonic)


    document.querySelector('#elrond-output').innerText = elrondAddress;
    makeqr(document.querySelector('#public-qr'), publicKey);
    makeqr(document.querySelector('#elrond-qr'), elrondAddress);



  });
}




function convertPrivateKeyToSeed(privateKey) {
  const result = cryptoClass.generateSeedFromPrivateKey(privateKey);
  console.log(result);
  return {
    mnemonic: result.mnemonic,
    seed: result.seed.toString('hex'),
    privateKey: result.seed.slice(0, 32).toString('hex')
  };
}


document.querySelector('#convert-btn').addEventListener('click', async function (e) {
  e.preventDefault();
  const privateKey = document.querySelector('#privkey-input').value;

  const result = convertPrivateKeyToSeed(privateKey);

  document.querySelector('#seed-generated').innerText = result.mnemonic;
  document.querySelector('#seed-generated').innerText = result.mnemonic;
  
  let keypair = cryptoClass.generateKeypairFromPrivateKey(privateKey);
  let pubKey = keypair[1]

  // generate elrond address
  let elrond_obj = new Elrond()
  let elrond_address = await elrond_obj.getAddress(result.mnemonic);

  document.querySelector('#elrond-generated').innerText = elrond_address;
  document.querySelector('#elrond-generated').innerText = elrond_address;
  document.querySelector('#key-generated').innerText = pubKey;
  makeqr(document.querySelector('#elrond-qr-generated'), elrond_address);
  makeqr(document.querySelector('#key-qr-generated'), pubKey);


});

// document.querySelector('#print').addEventListener('click', function(e){
//     e.preventDefault();
//     window.print();
// });

const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text).then(function () {
      alert("Copied to clipboard");
    });
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

document.querySelectorAll('.copy').forEach(function (icon, i) {
  icon.addEventListener('click', function (e) {
    e.preventDefault();
    let querySelector = e.currentTarget.getAttribute('data-clipboard-target');
    console.log('querySelector: ', querySelector);
    let value = document.querySelector(querySelector).innerText;
    console.log('value: ', value);
    copyContent(value);
  });
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


document.querySelector('#seed-input').addEventListener('keyup', async function (e) {
  let mnemonic = e.currentTarget.value;
  if (mnemonic.trim().split(/\s+/g).length == 24) {
    const privateKey = cryptoClass.getPrivateKeyFromSeed(mnemonic);
    let [_, pubKey] = cryptoClass.generateKeypairFromPrivateKey(privateKey);

    let elrond = new Elrond()
    const elrondAddress = await elrond.getAddress(mnemonic);

    document.querySelector('#privateKey-recovered').innerText = privateKey;
    document.querySelector('#key-recovered').innerText = pubKey
    document.querySelector('#elrond-recovered').innerText = elrondAddress
    makeqr(document.querySelector('#key-qr-recovered'), pubKey);
    makeqr(document.querySelector('#elrond-qr-recovered'), elrondAddress);
  } else {
    document.querySelector('#privateKey-recovered').innerText = "Seed Invalid";
    document.querySelector('#elrond-recovered').innerText = "";
    document.querySelector('#key-recovered').innerText = "";
    document.querySelector('#key-qr-recovered').innerHTML = "";
    document.querySelector('#elrond-qr-recovered').innerHTML = "";
  }




});

document.querySelectorAll('.tab').forEach(function (icon, i) {
  icon.addEventListener('click', function (e) {
    e.preventDefault();

    document.querySelector('#keys').classList.toggle('active');
    document.querySelector('#retrieve').classList.toggle('active');

    document.querySelector('#keys-btn').classList.toggle('active');
    document.querySelector('#retrieve-btn').classList.toggle('active');

  });
});

