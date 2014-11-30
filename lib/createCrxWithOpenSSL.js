/* jshint latedef:nofunc */
//http://nodejs.org/api/crypto.html#crypto_crypto_createsign_algorithm
//expected public key (p1): 21811304098396955093476276475851680289902128178489310780048306283127745420858178342264588828397773991051359115815803168418001260092272009537616882702475081150433933049448736111657064854557509901036573355734266974880314861925913913086756840190822114814023273167195233867957478212998587036638304021554375351782679168666217644210415683720620334501579300443712736172273255726260243038004422995294265919921347644923392373173475908575649394422594109092430814318597799403029484965043796575540200832693324758859021490655345616882635810428183104497854348708091101228287501292621474794398930691987697449888116070082783242927491
//expected public key (p2): 65537

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
    generateSignature(privateKey, zipFileName, function(signatureBuffer) {
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
        length = 16 + keyLength + sigLength, crx;

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
        if (doneCallback) {
          doneCallback.call(this);
        }
      };
      zipStream.on("end", onDone);

      outStream.write(crx, function() {
        outStream.write(publicKey, function() {
          outStream.write(signature, function() {
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
      var signObj, inStream, onDone, onError;

      onDone = function() {
        var signatureBuffer = signObj.sign(privateKey);
        if (callback){
          callback.call(this, signatureBuffer);
        }
      };

      onError = function(error) {
        console.info('error in stream: ' + error);
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
      signObj.on("error", onError);
      //this will call the onDone method
      inStream.pipe(signObj);
    }

};