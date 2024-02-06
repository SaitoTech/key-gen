const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const Crypto = require('./crypto.js')
const crypto = Crypto();
const qrcode = require('qrcode-generator');
const bip39 = require('bip39');
const tabs = require('tabs');
const pbkdf2 = require('pbkdf2').pbkdf2Sync
const unorm = require('unorm')


////////////
// Render //
////////////
$(document).ready(function () {
  var container = document.querySelector('.tab-container')
  tabs(container);
  new ClipboardJS('.copy');
});

/////////////////
// Create Keys //
/////////////////

$(() => {
    $('#generate').bind('click', function () {
    var keyMnemPair = generatePrivateKeyFromMnemonic();
    const seed = keyMnemPair[1];
    $('#seed-output').text(seed);
    const privateKey = keyMnemPair[0];
    $('#privkey-output').text(privateKey)
    makeqr($('#private-qr'), privateKey);
    const publicKey = crypto.returnPublicKey(privateKey);
    $('#pubkey-output').text(publicKey)
    makeqr($('#public-qr'), publicKey);
  })

  $('#print').bind('click', function() {
    //printJS('keys', 'html');
    window.print();
  })

  $('#text-input').focus() // focus input box

  //////////////////
  // Recover Keys //
  //////////////////

  $('#seed-input').bind('input propertychange', function () {
    const text = this.value;
    if (text.trim().split(/\s+/g).length == 12) {
      var recPrivateKey = mnemonicToSeed32(text).toString('hex');
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
  do { mnem = bip39.generateMnemonic() } while (!secp256k1.privateKeyVerify(mnemonicToSeed32(mnem), false));
  privateKey = mnemonicToSeed32(mnem);
  var pair = [privateKey.toString('hex'), mnem];
  return pair;
}

// function to mimic btc bip 39's mnemonicToSeed function but removing password and salt functions.
function mnemonicToSeed32 (mnemonic) {
  var mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8');

  return pbkdf2(mnemonicBuffer, "", 2048, 32, 'sha512')
}