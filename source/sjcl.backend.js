
var global = typeof window !== "undefined" && window !== null ? window : this;

(function() {
	var window = global;

	var console = ('undefined' === typeof global.console) ? { } : global.console;
	if ('undefined' === typeof console.log) console.log = function(){};

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
#INCLUDE sjcl-md5/sjcl-md5.js
#INCLUDE sjcl/core/sha1.js
#INCLUDE sjcl/core/sha256.js
#INCLUDE sjcl/core/random.js

sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

	if (typeof global.sjcl === 'undefined') global.sjcl = sjcl;

	var bitArray = sjcl.bitArray;

	function encode_input(block, options) {
		var binary = options && options.binary;
		if (binary) return sjcl.codec.bytes.toBits(block);
		return sjcl.codec.utf8String.toBits(block);
	}

	function decode_output(block, options) {
		var binary = options && options.binary;
		if (!binary) {
			try {
				return sjcl.codec.utf8String.fromBits(block);
			} catch (e) {
				console.log("Couldn't decode to UTF-8, trying binary instead:");
				console.log(e);
			}
		}
		return sjcl.codec.bytes.fromBits(block);
	}

	/****************
	 * AES-256-OFB  *
	 ****************/

	function aes_256_ofb_derive_key(key, iv) {
		return sjcl.misc.pbkdf2(key, iv, 1, 256, function (password) { return new sjcl.misc.hmac(password, sjcl.hash.sha1); });
	}

	/* en- and decrypt. modifies data. */
	function ofb(prp, data, iv) {
		if (bitArray.bitLength(iv) !== 128) {
			throw new sjcl.exception.invalid("ofb iv must be 128 bits");
		}
		var i,
			bl = bitArray.bitLength(data),
			bp = 0,
			output = data; // .slice(); // duplicate if data shouldn't get modified

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
			output[output.length-1] = bitArray.partial(bl, output[output.length-1] & 0x80000000 >> (bl-1), 1);
		}

		return output;
	}

	// modifies block
	function aes_256_ofb_decrypt(key, block) {
		var iv = block.splice(0, 4); /* extract 4 32-bit ints = 128 bits */
		var aes = new sjcl.cipher.aes(aes_256_ofb_derive_key(key, iv));
		return ofb(aes, block, iv);
	}

	// modifies block
	function aes_256_ofb_encrypt(key, block) {
		var iv = sjcl.random.randomWords(4, 0); /* should have enough entropy after we got the key */
		var aes = new sjcl.cipher.aes(aes_256_ofb_derive_key(key, iv));
		var cipher = ofb(aes, block, iv);
		cipher.splice(0,0,iv[0],iv[1],iv[2],iv[3]);
		return cipher;
	}

	/****************
	 * AES-128-CBC  *
	 ****************/

	// returns [aes key, iv]
	function aes_128_cbc_key_derive(key, salt) {
		var t = bitArray.concat(sjcl.codec.utf8String.toBits(key), salt);
		var md5 = sjcl.hash.md5.hash; // returns 4*32 = 128 bits
		var m1 = md5(t);
		var m2 = md5(m1.concat(t));
		// var m3 = md5(m2.concat(t));
		return [m1, m2];
	}

	// modifies block
	function aes_128_cbc_decrypt(key, block) {
		var magic = block.splice(0, 2);
		if (sjcl.codec.utf8String.fromBits(magic) !== "Salted__") throw "AES-128-CBC: unexpected input, missing 'Salted__' prefix";
		var salt = block.splice(0, 2);
		var kiv = aes_128_cbc_key_derive(key, salt);
		var aes = new sjcl.cipher.aes(kiv[0]);
		return sjcl.mode.cbc.decrypt(aes, block, kiv[1], []);
	}

	// modifies block
	function aes_128_cbc_encrypt(key, block) {
		var magic = sjcl.codec.utf8String.toBits("Salted__");
		var salt = sjcl.random.randomWords(2, 0); /* should have enough entropy after we got the key */
		var kiv = aes_128_cbc_key_derive(key, salt);
		var aes = new sjcl.cipher.aes(kiv[0]);
		var cipher = sjcl.mode.cbc.encrypt(aes, block, kiv[1], []);
		return magic.concat(salt, cipher);
	}



	var b = {
		decrypt: function(key, block, cipher, options) {
			block = sjcl.codec.base64.toBits(block);
			switch (cipher) {
				case 'AES-256-OFB':
					return decode_output(aes_256_ofb_decrypt(key, block), options);
					break;
				case 'AES-128-CBC':
					return decode_output(aes_128_cbc_decrypt(key, block), options).slice(0, -1); // slice removes trailing newline
					break;
				default:
					throw ('cipher "' + cipher + '" not supported');
			}
		},

		encrypt: function(key, block, cipher, options) {
			switch (cipher) {
			case 'AES-256-OFB':
				block = aes_256_ofb_encrypt(key, encode_input(block, options));
				break;
			case 'AES-128-CBC':
				var trailing_nl = sjcl.codec.bytes.toBits([0x0a]);
				block = aes_128_cbc_encrypt(key, bitArray.concat(encode_input(block, options), trailing_nl));
				break;
			default:
				throw ('cipher "' + cipher + '" not supported');
			}
			return sjcl.codec.base64.fromBits(block);
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

		_add_entropy: function(rnd, entropy, source) {
			sjcl.random.addEntropy(rnd, entropy, source);
		}
	};

	if ('undefined' === typeof global.crypto_backends) global.crypto_backends = {};
	global.crypto_backends['sjcl'] = b;
	if ('undefined' === typeof global.ncrypt_backend) global.ncrypt_backend = b;
}) ();

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
	self.onmessage = function (event) {
		var data = event.data;
		try {
			self.postMessage({id: data.id, func: data.func, result: global.ncrypt_backend[data.func].apply(this, data.arguments) });
		} catch (e) {
			console.log("exception in crypto worker:")
			console.log(e);
			self.postMessage({id: data.id, func: data.func, error: e.toString() });
		}
	}
}
