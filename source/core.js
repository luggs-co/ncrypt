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
			text.bind( 'keydown', function( e ) { if( e.keyCode == 13 && e.ctrlKey ) { en.click(); } } );

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
		$( '#typepassword,#typekey' ).bind( 'keydown', function( e ) { if( e.keyCode == 13 ) { $( this ).parent().find( 'input[type=button]' ).click(); } } );

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