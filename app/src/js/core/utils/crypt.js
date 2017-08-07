var Forge = require('node-forge');
var pki = Forge.pki;
var rsa = pki.rsa;

module.exports = exports = {};

exports.encrypt = function(val, keyStr){
    var pem = this.derToPublicPem(keyStr);
    var key = pki.publicKeyFromPem(pem);
    var encrypted = key.encrypt(val);
    return Forge.util.encode64(encrypted);
}

exports.decrypt = function(encrypted, keyStr){
    var pem = this.derToPrivatePem(keyStr);
    var key = pki.privateKeyFromPem(pem);
    var decrypted = key.decrypt(new Buffer(encrypted, 'base64').toString('binary'));

    return decrypted
}

exports.getPublicKeyDer = function(keypair){
    var pem = pki.publicKeyToPem(keypair.publicKey);
    var der = pki.pemToDer(pem).getBytes();
    return Forge.util.encode64(der);
}

exports.getPrivateKeyDer = function(keypair){
    var pem = pki.privateKeyToPem(keypair.privateKey);
    var der = pki.pemToDer(pem).getBytes();
    return Forge.util.encode64(der);
}

exports.derToPublicPem = function(der) {
    return "-----BEGIN PUBLIC KEY-----" + der + "-----END PUBLIC KEY-----";
}

exports.derToPrivatePem = function(der) {
    return "-----BEGIN PRIVATE KEY-----" + der + "-----END PRIVATE KEY-----";
}


