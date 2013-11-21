
(function() {
#INCLUDE sjcl/core/sjcl.js
#INCLUDE sjcl/core/aes.js
#INCLUDE sjcl/core/cbc.js
#INCLUDE sjcl/core/bitArray.js
#INCLUDE sjcl/core/codecBase64.js
#INCLUDE sjcl/core/codecBytes.js
#INCLUDE sjcl/core/codecHex.js
#INCLUDE sjcl/core/codecString.js
#INCLUDE sjcl/core/hmac.js
#INCLUDE sjcl/core/pbkdf2.js
#INCLUDE sjcl_md5.js
#INCLUDE sjcl/core/sha1.js
#INCLUDE sjcl/core/sha256.js
#INCLUDE sjcl/core/random.js

sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

	function aes_256_ofb_derive_key(key, iv) {
		return sjcl.misc.pbkdf2(key, iv, 1, 256, function (password) { return new sjcl.misc.hmac(password, sjcl.hash.sha1); });
	}

	/* en- and decrypt */
	function ofb(prp, data, iv) {
		if (sjcl.bitArray.bitLength(iv) !== 128) {
			throw new sjcl.exception.invalid("ofb iv must be 128 bits");
		}
		var i,
				w = sjcl.bitArray,
				bl = w.bitLength(data),
				bp = 0,
				output = data.slice(); /* duplicate */

		for (i=0; bp <= bl; i+=4, bp+=128) {
			iv = prp.encrypt(iv);
			output[i] ^= iv[0];
			output[i+1] ^= iv[1];
			output[i+2] ^= iv[2];
			output[i+3] ^= iv[3];
		}
		/* clamp output */
		output.splice((bl+31) >> 5);
		bl = bl % 32;
		if (bl > 0) {
			output[output.length-1] = w.partial(bl, output[output.length-1] & 0x80000000 >> (bl-1), 1);
		}

		return output;
	}

	function aes_256_ofb_decrypt(key, block) {
		var data = sjcl.codec.base64.toBits(block);
		var iv = data.splice(0, 4); /* extract 4 32-bit ints = 128 bits */
		var aes = new sjcl.cipher.aes(aes_256_ofb_derive_key(key, iv));
		return sjcl.codec.utf8String.fromBits(ofb(aes, data, iv));
	}

	function aes_256_ofb_encrypt(key, block) {
		var data = sjcl.codec.utf8String.toBits(block);
		var iv = sjcl.random.randomWords(4, 0); /* should have enough entropy after we got the key */
		var aes = new sjcl.cipher.aes(aes_256_ofb_derive_key(key, iv));
		var cipher = ofb(aes, data, iv);
		cipher.splice(0,0,iv[0],iv[1],iv[2],iv[3]);
		return sjcl.codec.base64.fromBits(cipher);
	}

	// returns [aes key, iv]
	function aes_128_cbc_key_derive(key, salt) {
		var t = sjcl.bitArray.concat(sjcl.codec.utf8String.toBits(key), salt);
		var md5 = sjcl.hash.md5.hash; // returns 4*32 = 128 bits
		var m1 = md5(t);
		var m2 = md5(sjcl.bitArray.concat(m1, t));
		// var m3 = md5(sjcl.bitArray.concat(m2, t));
		return [m1, m2];
	}

	function aes_128_cbc_decrypt(key, block) {
		var data = sjcl.codec.base64.toBits(block);
		var magic = data.splice(0, 2);
		if (sjcl.codec.utf8String.fromBits(magic) !== "Salted__") throw "AES-128-CBC: unexpected input, missing 'Salted__' prefix";
		var salt = data.splice(0, 2);
		var kiv = aes_128_cbc_key_derive(key, salt);
		var aes = new sjcl.cipher.aes(kiv[0]);
		return sjcl.codec.utf8String.fromBits(sjcl.mode.cbc.decrypt(aes, data, kiv[1], [])).slice(0, -1); // drop trailing \n
	}

	function aes_128_cbc_encrypt(key, block) {
		var data = sjcl.codec.utf8String.toBits(block + "\n");
		var magic = sjcl.codec.utf8String.toBits("Salted__");
		var salt = sjcl.random.randomWords(2, 0); /* should have enough entropy after we got the key */
		var kiv = aes_128_cbc_key_derive(key, salt);
		var aes = new sjcl.cipher.aes(kiv[0]);
		var cipher = sjcl.mode.cbc.encrypt(aes, data, kiv[1], []);
		return sjcl.codec.base64.fromBits(magic.concat(salt, cipher));
	}

	var b = {
		decrypt: function(key, block, cipher) {
			switch (cipher) {
			case 'AES-256-OFB':
				return aes_256_ofb_decrypt(key, block);
				break;
			case 'AES-128-CBC':
				return aes_128_cbc_decrypt(key, block);
				break;
			default:
				throw ('cipher "' + cipher + '" not supported');
			}
		},

		encrypt: function(key, block, cipher) {
			switch (cipher) {
			case 'AES-256-OFB':
				return aes_256_ofb_encrypt(key, block);
				break;
			case 'AES-128-CBC':
				return aes_128_cbc_encrypt(key, block);
				break;
			default:
				throw ('cipher "' + cipher + '" not supported');
			}
		},

		sha: function(text) {
			return sjcl.codec.hex.fromBits(sjcl.hash.sha1.hash(text));
		},

		randomKey: function(callback) {
			var col_started = false;
			if (!sjcl.random.isReady()) {
				if (!sjcl.random._collectorsStarted) {
					sjcl.random.startCollectors();
					col_started = true;
				}
				setTimeout(function () {
					b.randomKey(callback);
					if (col_started) sjcl.random.stopCollectors();
				}, 200);
				return;
			}
			var key = sjcl.codec.base64url.fromBits(sjcl.random.randomWords(8));
			callback(key);
		},
	};

	if (!window.crypto_backends) window.crypto_backends = {};
	window.crypto_backends['sjcl'] = b;
	if (!window.ezcrypt_backend) window.ezcrypt_backend = b;
}) ();
