/* jshint latedef:nofunc */
//http://nodejs.org/api/crypto.html#crypto_crypto_createsign_algorithm

module.exports = function() {
  var fs = require('fs'), childProcess = require("child_process"), crypto = require("crypto");

  this.generateCrxFile = function(zipFileName, outputFileName, pemFileName, onDone) {
    var pem, privateKey;
    console.info(" * zipFileName: " + zipFileName);
    console.info(" * outputFileName: " + outputFileName);
    console.info(" * pemFileName: " + pemFileName);
    pem = fs.readFileSync(pemFileName);
    privateKey = pem.toString('ascii').trim();

    console.info('---- before generateSignature');
    generateSignature(privateKey, zipFileName, function(signatureBuffer, error) {
      if (error) {
        onDone(error);
        return ;
      }
      console.info('---- before generatePublicKey');
      generatePublicKey(privateKey, function(publicKey, error) {
        if (error) {
          onDone(error);
          return ;
        }
        console.info('---- before generatePackage');
        generatePackage(signatureBuffer, publicKey, zipFileName, outputFileName, onDone);
      });
    });
  };

    function toHexaString(thing) {
      var result = '',i;
      for (i = 0; i < thing.length; i++) {
        result = result + thing[i].toString(16) + ',';
      }
      return result;
    }

    function removePEMHeaderAndFooter(pem) {
      var result, lines = pem.split('\n');
      lines = lines.slice(1, lines.length-1);
      lines.forEach(function(part, index, theArray) {
        theArray[index] = part.trim();
      });
      result = lines.join('');
      return result;
    }

    /**
     * @param privateKey - pem encoded private key (e.g. base64 encoded + begin/end private key lines)
     * @param cb - the function must accept one parametner - public key cb(publicKey);
     */
    function generatePublicKey(privateKey, cb) {
      var publicKeyChunks = [], rsa, spawn, errorChunks = [], onError, onPublicKeyChunk;

      onError = function(error) {
        errorChunks.push(new Buffer(error));
      };

      onPublicKeyChunk = function(chunk) {
        publicKeyChunks.push(chunk);
      };

      spawn = childProcess.spawn;
      rsa = spawn("openssl", ["rsa", "-pubout", "-outform", "DER"]);

      rsa.on("exit", function(code, signal){
        if (code!==0) {
          var wasError = Buffer.concat(errorChunks).toString('ascii');
          console.error('openssl error code: ' + code + ' stderr: ' + wasError);
          if (cb) {
            cb.call(this, null, wasError);
          }
        } else {
          var publicKey = Buffer.concat(publicKeyChunks);
          if (cb) {
            cb.call(this, publicKey, null);
          }
        }
      });
      rsa.on("error", onError);
      rsa.stderr.on("data", onError);
      rsa.stdout.on("data", onPublicKeyChunk);
      rsa.stdin.end(privateKey);
    }

    function generatePackage(signature, publicKey, zipFileName, outputFileName, doneCallback) {
      var zipStream, outStream, keyLength = publicKey.length, sigLength = signature.length,
        length = 16, crx;

      //console.log("signature" + toHexaString(signature));
      crx = new Buffer(length);
      crx.write("Cr24" + (new Array(13)).join("\x00"), "binary");
      crx[4] = 2;
      crx.writeUInt32LE(keyLength, 8);
      crx.writeUInt32LE(sigLength, 12);

      zipStream = fs.createReadStream(zipFileName, {
        flags: "r",
        encoding: null,
        fd: null,
        mode: 0666,
        bufferSize: 64*1024
      });
      zipStream.on('error', function(err) {
        console.log('Can not read ' + zipFileName);
        throw err;
      });

      outStream = fs.createWriteStream(outputFileName, {
        flags: "w",
        encoding: null,
        mode: 0666
      });

      outStream.on('error', function(err) {
        console.log('Can not write into ' + outputFileName);
        throw err;
      });

      var onDone = function() {
        outStream.end(null, null, function() {
          if (doneCallback) {
            doneCallback.call(this);
          }
        });
      };
      zipStream.on("end", onDone);

      outStream.write(crx, function() {
        outStream.write(publicKey, null, function() {
          outStream.write(signature, null, function() {
            zipStream.pipe(outStream);
          });
        });
      });
    }

    /**
     *
     * @param privateKey
     * @param zipFileName
     * @param callback - must accept one parametner - binary buffer with generated signature
     */
    function generateSignature(privateKey, zipFileName, callback) {
      var signObj, inStream, onDone, onError, errorChunks = [];

      onDone = function() {
        try {
          var signatureBuffer = signObj.sign(privateKey);
          if (callback){
            callback.call(this, signatureBuffer);
          }
        } catch (ex) {
          onError(ex);
          var wasError = Buffer.concat(errorChunks).toString('ascii');
          console.error('error while signing: ' + wasError);
          if (callback){
            callback.call(this, null, wasError);
          }
        }
      };

      onError = function(error) {
        errorChunks.push(new Buffer(error));
      };

      inStream = fs.createReadStream(zipFileName, {
        flags: "r",
        encoding: null,
        fd: null,
        mode: 0666,
        bufferSize: 64*1024
      });
      inStream.on("end", onDone);
      inStream.on("error", onError);
      signObj = crypto.createSign("sha1");
      //this will call the onDone method
      inStream.pipe(signObj);
    }

};