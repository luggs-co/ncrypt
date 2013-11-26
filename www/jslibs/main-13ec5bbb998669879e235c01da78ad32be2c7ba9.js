/// uglifyjs options: -c -m

///#source 1 1 Blob.js/Blob.js
/* Blob.js
 * A Blob implementation.
 * 2013-06-20
 * 
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

if (!(typeof Blob === "function" || typeof Blob === "object") || typeof URL === "undefined")
if ((typeof Blob === "function" || typeof Blob === "object") && typeof webkitURL !== "undefined") self.URL = webkitURL;
else var Blob = (function (view) {
	"use strict";

	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || view.MSBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob
			
			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		if (!real_URL.createObjectURL) {
			URL = view.URL = {};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		return FakeBlobBuilder;
	}(view));

	return function Blob(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				builder.append(blobParts[i]);
			}
		}
		return builder.getBlob(type);
	};
}(self));

///#source 1 1 FileSaver.js/FileSaver.js
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2013-10-21
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  || (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  || (function(view) {
	"use strict";
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link =  !view.externalHost && "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
                        window.open(object_url, "_blank");
                    }
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				// FF for Android has a nasty garbage collection mechanism
				// that turns all objects that are not pure javascript into 'deadObject'
				// this means `doc` and `save_link` are unusable and need to be recreated
				// `view` is usable though:
				doc = view.document;
				save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a");
				save_link.href = object_url;
				save_link.download = name;
				var event = doc.createEvent("MouseEvents");
				event.initMouseEvent(
					"click", true, false, view, 0, 0, 0, 0, 0
					, false, false, false, false, 0, null
				);
				save_link.dispatchEvent(event);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(this.self || this.window || this.content));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== 'undefined') module.exports = saveAs;

///#source 1 1 core.js
/**
 * EZCrypt core code
 * 
 * @version: 0.4
 * @author: NovaKing (novaking@eztv.se)
 * 
 * General functions that get used within the website
 * 
 **/


$( function() {
	var worker, worker_pending, worker_next_id, worker_send, worker_has_entropy = false;
	var console = ('undefined' === typeof window.console) ? { } : window.console;
	if ('undefined' === typeof console.log) console.log = function(){};

	// data for fetched paste
	var paste = { data: '', cipher: '', syntax: '', key: false, highlight_options: { } };

	if (typeof Worker !== 'undefined' && typeof window.ezcrypt_worker === 'undefined') {
		worker = new Worker(window.ezcrypt_crypto_backend_url);
		worker_pending = {};
		worker_next_id = 0;
		worker.onmessage = function (event) {
			var data = event.data;
			if (!data.id) return;
			var obj = worker_pending[data.id];
			if (!obj) return;
			if (!data.hasOwnProperty('progress')) delete worker_pending[data.id];
			obj(data.result, data.error, data.progress);
		}
		window.ezcrypt_backend.randomKey(function (key) {
			worker.postMessage({id: 0, func: '_add_entropy', arguments: [key,128,'ezcrypt backend random'] });
		});
		worker_send = function (func, args, cb) {
			if (!worker_has_entropy) {
				var rnd;
				if (window.sjcl && window.sjcl.random) {
					rnd = window.sjcl.random.randomWords(16, 0);
					worker.postMessage({id: 0, func: '_add_entropy', arguments: [rnd,32,'sjcl.random'] });
				} else {
					rnd = (Math.random()*4294967296) ^ 0;
					worker.postMessage({id: 0, func: '_add_entropy', arguments: [rnd,1,'Math.random'] });
				}
			}
			var id = ++worker_next_id;
			worker_pending[id] = cb;
			worker.postMessage({id: id, func: func, arguments: args});
		}
	} else {
		worker_send = function (func, args, cb) {
			try {
				cb({ result: window.ezcrypt[func].apply(this, args) });
			} catch (e) {
				cb({ error: e });
			}
		}
	}

	var editor; // syntax highlighter

	var time_decryption = 0;
	var timer_decrypted = null; // created after decryption to measure editor coloring

	function TimeDiff() {
		var start = new Date();
		return {
			getDiff: function() {
				var end = new Date();
				return end.getTime() - start;
			}
		}
	}

	// break up the string every nth character
	function stringBreak( str, col )
	{
		var result = '';
		for( var i = 0; i < str.length; i++ )
		{
			result += str.charAt( i );
			if ( ( ( i + 1 ) % col == 0 ) && ( 0 < i ) )
			{
				result += "\n";
			}
		}
		return result;
	}

	// determine duration taken to render the syntax highlighter
	function onCodeChange( /* ed, obj */ )
	{
		if (null != timer_decrypted) {
			var coloring = timer_decrypted.getDiff();
			// display duration
			$( '#coloring' ).html( 'syntax: ' + coloring + 'ms,');

			// if we have hit this point it means we have finished, display total time taken
			var total = ( time_decryption + coloring );
			$( '#totaltime' ).html( 'total: ' + total + 'ms');
		}
	}

	function display_binary_hex(bytes, syntax, limit)
	{
		if (!limit) limit = 100*1024;
		var offprefix = bytes.length.toString(16).replace(/./g, '0')
		var BYTES_PER_LINE = 20;
		var lines = [], bline, offset = 0, line, i, j;
		lines.push('Binary file of type: ' + syntax + "\n");
		lines.push("\n");
		while (offset < bytes.length) {
			if (limit >= 0 && offset >= limit) {
				lines.push("\n");
				lines.push("too much data, stopping now\n");
				break;
			}
			bline = bytes.slice(offset, offset + BYTES_PER_LINE);
			line = (offprefix + offset.toString(16)).slice(-offprefix.length) + ':';
			offset += bline.length;
			for (i = 0; i < BYTES_PER_LINE; ) {
				line += ' ';
				for (j = 0; j < 4; ++j, ++i) {
					if (i < bline.length) {
						line += ('00' + bline[i].toString(16)).slice(-2) + ' ';
					} else {
						line += '   ';
					}
				}
			}
			line += '| ';
			// replace non printable characters (in unicode <= 0xff) with '.'; each byte is treated as a separate unicode codepoint
			line += String.fromCharCode.apply(String, bline).replace(/[\0-\x1F\x7F-\x9F\xAD]/g, '.')
			line += "\n";
			lines.push(line);
		}
		return lines.join('');
	}

	function set_new_syntax( syntax )
	{
		var s = $( '#new_syntax' );
		if (s.val() === syntax) return;
		s.val(syntax);
		if (s.val() === syntax) return;
		if ( $( '#new_syntax .header.unknown' ).length == 0 ) {
			s.append( $( '<option disabled="disabled" class="header unknown">- Unknown format -</option>' ) );
		}
		var o = $( '<option>' );
		o.prop( 'value', syntax ).text( syntax );
		o.html( '&nbsp;&nbsp;' + o.html() );
		s.append( o );
		o.prop( 'selected', true );
	}

	function decrypt_update()
	{
		$( '#decrypting' ).hide();

		var key = paste.key || window.location.hash.substring( 1 );
		var data = paste.data;
		var cipher = paste.cipher;
		if ('' == data) {
			$( '#askpassword' ).show();
			$( '#typepassword' ).focus();
			return false;
		}
		else {
			$( '#askpassword' ).hide();
		}
		if ('' == key) {
			$( '#insertkey' ).show();
			$( '#typekey' ).focus();
			return false;
		}
		else {
			$( '#insertkey' ).hide();
		}

		$( '#decrypting' ).show();
		// start timer and decrypt
		var t = new TimeDiff();
		window.ezcrypt.async_decrypt([key, data, cipher], function (output, error) {
			if (output) {
				// display duration
				time_decryption = t.getDiff();
				$( '#execute' ).html( 'decryption: ' + time_decryption + 'ms,');

				var blob;

				$( '#wrapholder' ).show();
				$( '#content_container' ).show();
				$( '#decrypting' ).hide();

				timer_decrypted = new TimeDiff();
				if ('string' === typeof output || output instanceof String) {
					try {
						var blob = new Blob([output], { type: syntax });
					} catch (e) {
						console.log("saveAs not working:");
						console.log(e);
					}

					editor.setOption( 'mode', paste.syntax );
					editor.setValue( output );

					$( '#showhex' ).hide();
					$( '#clone' ).show();
					// copy syntax if paste is a real paste, not the index example
					if ( $( '#clone' ).length ) set_new_syntax( paste.syntax );
				}
				else {
					try {
						var blob = new Blob([new Uint8Array(output)], { type: syntax });
					} catch (e) {
						console.log("saveAs not working:");
						console.log(e);
					}

					var syntax = paste.syntax;
					var hide_hex = false;
					try {
						if (blob && syntax.match(/^image\//)) {
							var img = $( '<img>' );
							$( '#alternate_content' ).append( img );
							hide_hex = true;
							var blob_r = new FileReader();
							blob_r.onload = function() { img[0].src = blob_r.result; };
							blob_r.readAsDataURL(blob);
						}
					} catch (e) {
						console.log("special binary handling failed:");
						console.log(e);
					}

					editor.setOption( 'mode', 'text/plain' );
					editor.setValue( display_binary_hex(output, syntax) );

					$( '#clone' ).hide();
					$( '#showhex' ).toggle(hide_hex);
					$( '#content_container').toggle(!hide_hex);
				}

				var p = paste.highlight_options || { };
				for (var k in p) {
					if ( p.hasOwnProperty( k ) ) {
						editor.setOption( k, p[k] );
					}
				}

				if (blob) {
					$( '#saveas' ).show().bind( 'click', function() {
						saveAs(blob);
					});
				}
				else {
					$( '#saveas' ).hide();
				}
			}
			else if (error) {
				$( '#decrypting' ).hide();
				alert(error);
			}
		})
	}

	// load paste data
	function requestData(initialLoad)
	{
		var password = '';
		var url = window.location.href;
		var hash = window.location.hash;
		var index_of_hash = url.indexOf( hash ) || url.length;
		var hashless_url = url.substr( 0, index_of_hash );

		if (!initialLoad) {
			password = 'p=' + window.ezcrypt_backend.sha( $( '#typepassword' ).val() );
		}
		$( '#decrypting' ).show();

		$.ajax( {
			url: hashless_url,
			type: 'POST',
			dataType: 'json',
			data: password,
			cache: false,
			success: function( json ) {
				// success, assign the data accordingly
				paste.data = json.data;
				paste.syntax = json.syntax;
				paste.cipher = json.cipher;

				decrypt_update();
			},
			error: function() {
				if (initialLoad) {
					// show dialogs
					decrypt_update();
				} else {
					alert( 'bad password!' );
				}
			}
		} );
	}

	var _encrypt_finished = [];
	var delayedEncryptionInProgress = null;
	var encryptionInProgress = 0; // 0: not in progress; 1: in progress; 2: in progress, but don't use result, restart instead
	var _encryptResult = false;

	function encrypt_finished(cb)
	{
		if (delayedEncryptionInProgress || !_encryptResult) {
			encrypt_update(cb);
		}
		else if (!encryptionInProgress) {
			cb.apply(this, _encryptResult);
		}
		else {
			if (cb) _encrypt_finished.push(cb);
		}
	}

	function encrypt_update(cb)
	{
		_encryptResult = false;

		/* remove delayed update timer */
		if (delayedEncryptionInProgress != null) {
			clearTimeout(delayedEncryptionInProgress);
			delayedEncryptionInProgress = null;
		}

		if (encryptionInProgress) {
			encryptionInProgress = 2;
			if (cb) _encrypt_finished.push(cb);
			return;
		}

		var key = $( '#new_key' ).val();
		var text = $( '#new_text' ).val();
		var cipher = $( '#new_cipher' ).val();
		$( '#new_result' ).html('');
		$( '#new_encrypttime' ).html('');

		if ('' == key || '' == text) return ''; /* don't do anything without key and text */

		// start timer and encrypt
		var t = new TimeDiff();
		window.ezcrypt.async_encrypt([key, text, cipher], function (result, error, progress) {
			if (!progress) {
				if (2 == encryptionInProgress) {
					/* restart */
					encryptionInProgress = 0;
					encrypt_update();
					return;
				}
				else {
					encryptionInProgress = 0;
				}
			}

			if (result) {
				result = stringBreak(result, 96);

				$( '#new_encrypttime' ).html( 'encryption: ' + t.getDiff() + 'ms');
				$( '#new_result' ).val(result);
			}

			var i, len, l = progress ? _encrypt_finished.slice() : _encrypt_finished.splice(0);
			_encryptResult = [result, error, progress];
			for (i = 0, len = l.length; i < len; ++i) {
				l[i].call(this, _encryptResult);
			}
		});
	}

	/* reset timer for delayed update */
	function encrypt_update_delayed()
	{
		if( delayedEncryptionInProgress != null ) { clearTimeout( delayedEncryptionInProgress ); delayedEncryptionInProgress = null; }
		delayedEncryptionInProgress = setTimeout( function() {
			delayedEncryptionInProgress = null;
			encrypt_update();
		}, 500 );
	}

	function submitFile()
	{
		var key = $( '#new_key' ).val();
		var cipher = $( '#new_cipher' ).val();
		var ttl = $( '#new_ttl' ).val();
		var file = $( '#upload_file' )[0].files[0];
		var syntax = file.type || 'application/octet-stream';

		var password = '';
		if( $( '#new_usepassword' ).is( ':checked' ) )
		{
			// if password is used, let's sha the password before we send it over
			password = window.ezcrypt_backend.sha( $( '#new_typepassword' ).val() );
		}

		var reader = new FileReader();
		reader.onload = function() {
			var bytes = new Uint8Array(reader.result);
			window.ezcrypt.async_encrypt([key, bytes, cipher, {binary:true}], function (data /*, error, progress */) {
				if (!data) return;

				// send submission to server
				$.ajax( {
					url: document.baseURI,
					type: 'POST',
					dataType: 'json',
					data: 'data=' + encodeURIComponent(data) + '&p=' + password + '&ttl=' + encodeURIComponent(ttl) + '&syn=' + encodeURIComponent(syntax) + '&cipher=' + encodeURIComponent(cipher),
					cache: false,
					success: function( json ) {
						if( ttl == -100 )
						{
							// special condition when it's a one-time only paste, we don't redirect the user as that would trigger the delete call
							// instead we simply mock the page and provide the url of the paste
							
						}
						else
						{
							var querypw = '';
							if (password != '') querypw = '?p=' + password;
							window.location = document.baseURI + 'p/' + json.id + querypw + '#' + key;
						}
					},
					error: function() {
						enableHover();
						alert( 'error submitting form' );
					}
				} );
			});
		};
		reader.readAsArrayBuffer(file);
	}

	function submitData()
	{
		if( $( '#new_text' ).val() == '' )
		{
			return false; // don't submit if blank form
		}

		var key = $( '#new_key' ).val();
		var cipher = $( '#new_cipher' ).val();
		var ttl = $( '#new_ttl' ).val();
		var syntax = $( '#new_syntax' ).val();

		var password = '';
		if( $( '#new_usepassword' ).is( ':checked' ) )
		{
			// if password is used, let's sha the password before we send it over
			password = window.ezcrypt_backend.sha( $( '#new_typepassword' ).val() );
		}

		encrypt_finished(function (data) {
			if (!data) return;

			// send submission to server
			$.ajax( {
				url: document.baseURI,
				type: 'POST',
				dataType: 'json',
				data: 'data=' + encodeURIComponent(data) + '&p=' + password + '&ttl=' + encodeURIComponent(ttl) + '&syn=' + encodeURIComponent(syntax) + '&cipher=' + encodeURIComponent(cipher),
				cache: false,
				success: function( json ) {
					if( ttl == -100 )
					{
						// special condition when it's a one-time only paste, we don't redirect the user as that would trigger the delete call
						// instead we simply mock the page and provide the url of the paste
						
					}
					else
					{
						var querypw = '';
						if (password != '') querypw = '?p=' + password;
						window.location = document.baseURI + 'p/' + json.id + querypw + '#' + key;
					}
				},
				error: function() {
					enableHover();
					alert( 'error submitting form' );
				}
			} );
		})
	}

	window.ezcrypt = {
		sha: window.ezcrypt_backend.sha,
		encrypt: window.ezcrypt_backend.encrypt,
		decrypt: window.ezcrypt_backend.decrypt,
		async_encrypt: worker_send.bind(this, 'encrypt'),
		async_decrypt: worker_send.bind(this, 'decrypt')
	};

	if( document.getElementById( 'content' ) )
	{
		// load up our editor
		editor = CodeMirror.fromTextArea( document.getElementById( 'content' ), {
			lineNumbers: true,
			matchBrackets: false,
			lineWrapping: false,
			readOnly: true,
			onChange: onCodeChange
		} );
	}

	/* wait until we have a key (may have to wait for some entropy from user inputs) */
	if ($( '#new_key' ).length) {
		$( '#upload' ).hide();
		$( '#upload' ).bind( 'click', function(e) {
			$( '#upload_file' ).click();
			e.preventDefault();
			return false;
		});

		window.ezcrypt_backend.randomKey(function (key) {
			$( '#new_key' ).val( key );
			var en = $('#en');
			en.bind( 'click', submitData );
			$( '#upload_file' ).bind( 'change', submitFile );
			en.removeAttr( 'disabled' );
			en.val( 'Submit' );
			if ('undefined' !== typeof FileReader) $( '#upload' ).show();

			var text = $( '#new_text' );
			if ('' != text.val()) encrypt_update_delayed();
			text.bind( 'textchange', encrypt_update_delayed );

			// support ctrl+enter to send paste
			text.live( 'keydown', function( e ) { if( e.keyCode == 13 && e.ctrlKey ) { en.click(); } } );

			// hover effect when moving mouse over submit button
			en.hover(
				function() {
					$( '#new_result' ).show();
					$( '#new_encrypttime' ).show();
				},
				function() {
					$( '#new_result' ).hide();
					$( '#new_encrypttime' ).hide();
				}
			);
		});
	}

	$( '#new_usepassword' ).change( function() { if( this.checked ) { $( '#new_typepassword' ).show(); } else { $( '#new_typepassword' ).hide(); } } );

	if ($( '#clone').length) {
		$( '#content_container' ).hide();

		/* want to show a paste */
		$( '#submitpassword' ).bind( 'click', function() { requestData(false); } );
		$( '#submitkey' ).bind( 'click', function() {
			paste.key = $( '#typekey' ).val();
			decrypt_update();
		});
		$( '#typepassword,#typekey' ).live( 'keydown', function( e ) { if( e.keyCode == 13 ) { $( this ).parent().find( 'input[type=button]' ).click(); } } );

		$( '#new' ).bind( 'click', function() { $( '#new_text' ).html( '' ); $( '#new_result' ).val( '' ); $( '#newpaste' ).slideDown(); } );
		$( '#clone' ).bind( 'click', function() {
			set_new_syntax( paste.syntax );
			$( '#new_text' ).html( editor.getValue() ).trigger( 'textchange' );
			$( '#newpaste' ).slideDown();
		} );

		$( '#tool-wrap' ).bind( 'click', function() {
			var checked = $( '#tool-wrap' ).is( ':checked' );
			$( '.tool-wrap' ).toggleClass('tool-wrap-on', checked);
			editor.setOption( 'lineWrapping', checked );
		} );
		$( '#tool-numbers' ).bind( 'click', function() {
			var checked = $( '#tool-numbers' ).is( ':checked' );
			$( '.tool-numbers' ).toggleClass( 'tool-numbers-on', checked );
			editor.setOption( 'lineNumbers', checked );
		} );
		$( '#tool-fullscreen' ).bind( 'click', function() {
			var checked = $( '#tool-fullscreen' ).is( ':checked' );
			$( '.tool-fullscreen' ).toggleClass( 'tool-fullscreen-on', checked );
			$( '#holder' ).css( 'width', checked ? '100%' : '' );
		} );

		$( '#showhex' ).bind( 'click', function() {
			$( '#content_container' ).toggle();
		})

		if (window.ezcrypt_paste) {
			paste = window.ezcrypt_paste;
			decrypt_update();
		}
		else {
			/* fetch paste */
			requestData(true);
		}
	}
	else if (window.ezcrypt_paste) {
		paste = window.ezcrypt_paste;
		decrypt_update();
	}

} );
