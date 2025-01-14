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



if (document.querySelector('#generate')){
  document.querySelector('#generate').addEventListener('click',async function(e){
    e.preventDefault();

    const [privateKey, publicKey] = cryptoClass.generateKeyPair();
    console.log(privateKey, publicKey)

    let res = cryptoClass.generateSeedFromPrivateKey(privateKey);
    
    
    document.querySelector('#seed-output').innerText = res.mnemonic;

    document.querySelector('#privkey-output').innerText = privateKey;
    makeqr(document.querySelector('#private-qr'), privateKey);
    
    document.querySelector('#pubkey-output').innerText = publicKey;

    let elrondAddress = await elrondClass.getAddress(res.mnemonic)
    document.querySelector('#elrond-output').innerText = elrondAddress;
    // makeqr(document.querySelector('#public-qr'),  publicKey);
    // var recPrivateKey = mnemonicToSeed32(mnem).toString('hex');
    // console.log('recPrivateKey', recPrivateKey);


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


document.querySelector('#convert-btn').addEventListener('click', async function(e) {
  e.preventDefault();
  const privateKey = document.querySelector('#privkey-input').value;
  
  const result = convertPrivateKeyToSeed(privateKey);

  console.log(result)
  
  document.querySelector('#seed-generated').innerText = result.mnemonic;

  // generate elrond address
  let elrond_obj = new Elrond()
 let address =  await elrond_obj.getAddress(result.mnemonic);

    console.log(address)
    document.querySelector('#elrond-recovered').innerText = address;
    makeqr(document.querySelector('#elrond-qr-recovered'), address);


  document.querySelector('#elrond-generated').innerText = address;
  
  // document.querySelector('#seed-hex-output').innerText = result.seed;
  
  // Optionally verify
  console.log('Original private key:', privateKey);
  console.log('Generated private key:', result.privateKey);
});

// document.querySelector('#print').addEventListener('click', function(e){
//     e.preventDefault();
//     window.print();
// });

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




document.querySelectorAll('.tab').forEach(function(icon, i){
   icon.addEventListener('click', function(e){
      e.preventDefault();

      document.querySelector('#keys').classList.toggle('active');
      document.querySelector('#retrieve').classList.toggle('active');

      document.querySelector('#keys-btn').classList.toggle('active');
      document.querySelector('#retrieve-btn').classList.toggle('active');
      
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



document.querySelector('#seed-input').addEventListener('keyup', async function(e){
  let mnemonic = e.currentTarget.value;
  console.log(mnemonic)
  if (mnemonic.trim().split(/\s+/g).length == 24) {
    const key = cryptoClass.getPrivateKeyFromSeed(mnemonic); 
 
    let recPrivateKey = (key).toString("hex");
      document.querySelector('#privateKey-recovered').innerText = key;
      makeqr(document.querySelector('#private-qr-recovered'), recPrivateKey);

      // Generate and display Elrond address
      let elrond = new Elrond()
      const elrondAddress = await elrond.getAddress(mnemonic);
      console.log(elrondAddress)
      document.querySelector('#elrond-recovered').innerText = elrondAddress;
      makeqr(document.querySelector('#elrond-qr-recovered'), elrondAddress);
  } else {
      document.querySelector('#privateKey-recovered').innerText = "Seed Invalid";
      document.querySelector('#private-qr-recovered').innerHTML = "";
      document.querySelector('#elrond-recovered').innerText = "";
      document.querySelector('#elrond-qr-recovered').innerHTML = "";
  }


 

});
