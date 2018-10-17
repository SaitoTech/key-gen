const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const Crypto = require('./crypto.js')
const crypto = Crypto();
const qrcode = require('qrcode-generator');
const bip39 = require('bip39');


/////////////////
// Create Keys //
/////////////////
$(() => {
  $('#generate').bind('click', function () {
    var keyMnemPair = generatePrivateKeyFromMnemonic();
    console.log(keyMnemPair);
    //const privateKey = crypto.generateKeys()
    const seed = keyMnemPair[1];
    $('#seed-output').text(seed);
    const privateKey = keyMnemPair[0];
    $('#privkey-output').text(privateKey)
    makeqr($('#private-qr'), privateKey);
    const publicKey = crypto.returnPublicKey(privateKey);
    $('#pubkey-output').text(publicKey)
    makeqr($('#public-qr'), publicKey);

  })

  $('#text-input').focus() // focus input box

  //////////////////
  // Recover Keys //
  //////////////////

  $('#seed-input').bind('input propertychange', function () {
    const text = this.value;
    console.log(text);
    if (text.trim().split(/\s+/g).length == 12) {
      var recPrivateKey = bip39.mnemonicToSeed(text).toString('hex');
      $('#privateKey-recovered').text(recPrivateKey)
      makeqr($('#private-qr-recovered'), recPrivateKey);
    } else {
      $('#privateKey-recovered').text("Seed Invalid");
      $('#private-qr-recovered').html("");
    }
  });
})

function makeqr(obj, data) {
  var typeNumber = 0;
  var errorCorrectionLevel = 'H';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(data);
  qr.make();
  obj.html("");
  obj.append(qr.createImgTag(5, 0, data));
}

function generatePrivateKeyFromMnemonic() {
  let privateKey;
  let mnem;
  do { mnem = bip39.generateMnemonic(128, randomBytes, "KOREAN_WORDLIST") } while (!secp256k1.privateKeyVerify(bip39.mnemonicToSeed(mnem), false));
  //mnem = bip39.generateMnemonic();
  privateKey = bip39.mnemonicToSeed(mnem);
  var pair = [privateKey.toString('hex'), mnem];
  console.log(pair);
  return pair;
}

