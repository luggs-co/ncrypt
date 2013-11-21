/** @fileOverview Javascript MD5 implementation.
 *
 * Based on the implementation in RFC 1321, and on the SJCL
 * SHA-1 implementation.
 *
 * @author Brandon Smith
 */

/**
 * Context for a MD5 operation in progress.
 * @constructor
 * @class MD5, 128 bits.
 */
sjcl.hash.md5 = function (hash) {
  if (!this._T[0]) { this._precompute(); }
  if (hash) {
    this._h = hash._h.slice(0);
    this._buffer = hash._buffer.slice(0);
    this._length = hash._length;
  } else {
    this.reset();
  }
};

/**
 * Hash a string or an array of words.
 * @static
 * @param {bitArray|String} data the data to hash.
 * @return {bitArray} The hash value, an array of 5 big-endian words.
 */
sjcl.hash.md5.hash = function (data) {
  return (new sjcl.hash.md5()).update(data).finalize();
};

sjcl.hash.md5.prototype = {
  /**
   * The hash's block size, in bits.
   * @constant
   */
  blockSize: 512,
   
  /**
   * Reset the hash state.
   * @return this
   */
  reset:function () {
    this._h = this._init.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  },
  
  /**
   * Input several words to the hash.
   * @param {bitArray|String} data the data to hash.
   * @return this
   */
  update: function (data) {
    if (typeof data === "string") {
      data = sjcl.codec.utf8String.toBits(data);
    }
    var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data),
        ol = this._length,
        nl = this._length = ol + sjcl.bitArray.bitLength(data);
    for (i = this.blockSize+ol & -this.blockSize; i <= nl;
         i+= this.blockSize) {
      this._block(b.splice(0,16), true);
    }
    return this;
  },
  
  /**
   * Complete hashing and output the hash value.
   * @return {bitArray} The hash value, an array of 4 big-endian words.
   */
  finalize:function () {
    var i, b = this._buffer, h = this._h;

    // Round out and push the buffer
    b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1,1)]);
    // Round out the buffer to a multiple of 16 words, less the 2 length words.
    for (i = b.length + 2; i & 15; i++) {
      b.push(0);
    }

    // append the length
    b.push(this._length | 0);
    b.push((this._length / 0x100000000)|0);

    while (b.length) {
      // b.length is passed to avoid swapping and reswapping length bytes
      this._block(b.splice(0,16), b.length);
    }

    this.reset();
    this._BS(h, 4);
    return h;
  },

  /**
   * The MD5 initialization vector.
   * @private
   */
  _init:[0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476],

  /**
   * Byte swap
   * @private
   */
  _BS:function(w, n) {
    var i, x;
    for (i=0; i<n; i++) {
      x = w[i];
      w[i] = (x>>>24) | (x>>8&0xff00) | ((x&0xff00)<<8) | ((x&0xff)<<24);
    }
  },
  
  /* Will be precomputed */
  _T:[],
  /*
   * 0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
   * 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
   * 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
   * 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
   * 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
   * 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
   * 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
   * 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
   * 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
   * 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
   * 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
   * 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
   * 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
   * 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
   * 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
   * 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
   * @private
   */
  _precompute:function() {
    var i;
    for (i=0; i<64; i++) {
      this._T[i] = ((0xffffffff+1) * Math.abs(Math.sin(i+1)))|0;
    }
  },

  /**
   * Perform one cycle of MD5.
   * @param {bitArray} words one block of words.
   * @private
   */
  _block:function (words, notlast) {  
    var i, a, b, c, d,
    w = words.slice(0),
    h = this._h,
    T = this._T;

    a = h[0]; b = h[1]; c = h[2]; d = h[3];

    this._BS(w, notlast?16:14);
    for (i=0; i<64; i++) {
      var f, x, s, t;
      if (i < 32) {
        if (i < 16) {
          f = (b & c) | ((~b) & d);
          x = i;
          s = [7, 12, 17, 22];
        } else {
          f = (d & b) | ((~d) & c);
          x = (5 * i + 1) % 16;
          s = [5, 9, 14, 20];
        }
      } else {
        if (i < 48) {
          f = b ^ c ^ d;
          x = (3 * i + 5) % 16;
          s = [4, 11, 16, 23];
        } else {
          f = c ^ (b | (~d));
          x = (7 * i) % 16;
          s = [6, 10, 15, 21];
        }
      }
      t = a + f + w[x] + T[i];
      a = d;
      d = c;
      c = b;
      b = (((t << s[i%4]) | (t >>> 32-s[i%4])) + b)|0;
    }

    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
  }
};
