/**
 * EZCrypt core code
 * 
 * @version: 0.4
 * @author: NovaKing (novaking@eztv.se)
 * @version: 0.4-1
 * @author: Stefan Bühler
 * 
 * General functions that get used within the website
 * 
 **/


$( function() {
	var editor; // syntax highlighter
	var encryptionInProgress = null; // used as flag state to determine if encryption is in mid-progress

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

	function decrypt_update()
	{
		$( '.cm-s-default' ).parent().hide();
		$( '#decrypting' ).hide();

		var key = window.location.hash.substring( 1 );
		var data = $( '#data' ).val();
		var cipher = $( '#cipher' ).val();
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
		var output = window.ezcrypt_backend.decrypt( key, data, cipher );
		// display duration
		time_decryption = t.getDiff();
		$( '#execute' ).html( 'decryption: ' + time_decryption + 'ms,');

		$( '#wrapholder' ).show();
		$( '.cm-s-default' ).parent().show();
		$( '#decrypting' ).hide();

		timer_decrypted = new TimeDiff();
		editor.setOption( 'mode', $( '#syntax' ).val() );
		editor.setValue( output );
	}

	// when a password is assigned to a paste
	// the page doesn't get the encrypted data until your supply the correct password
	// this function handles the ajax calling to validate the password and return the data
	function requestData()
	{
		var password = window.ezcrypt_backend.sha( $( '#typepassword' ).val() );
		var url = window.location.href;
		var hash = window.location.hash;
		var index_of_hash = url.indexOf( hash ) || url.length;
		var hashless_url = url.substr( 0, index_of_hash );

		$.ajax( {
			url: hashless_url,
			type: 'POST',
			dataType: 'json',
			data: 'p=' + password,
			cache: false,
			success: function( json ) {
				// success, assign the data accordingly
				$( '#data' ).val( json.data );
				$( '#syntax' ).val( json.syntax );
				$( '#cipher' ).val( json.cipher );

				decrypt_update();
			},
			error: function() {
				alert( 'bad password!' );
			}
		} );
	}

	function encrypt_update()
	{
		/* remove delayed update timer */
		if (encryptionInProgress != null) {
			clearTimeout(encryptionInProgress);
			encryptionInProgress = null;
		}

		var key = $( '#new_key' ).val();
		var text = $( '#new_text' ).val();
		var cipher = $( '#new_cipher' ).val();
		$( '#new_result' ).html('');
		$( '#new_encrypttime' ).html('');

		if ('' == key || '' == text) return ''; /* don't do anything without key and text */

		// start timer and encrypt
		var t = new TimeDiff();
		var encrypt = stringBreak( window.ezcrypt_backend.encrypt( key, text, cipher ), 96 );
		$( '#new_encrypttime' ).html( 'encryption: ' + t.getDiff() + 'ms');
		$( '#new_result' ).val(encrypt);

		return encrypt;
	}

	/* reset timer for delayed update */
	function encrypt_update_delayed()
	{
		if( encryptionInProgress != null ) { clearTimeout( encryptionInProgress ); encryptionInProgress = null; }
		encryptionInProgress = setTimeout( function() {
			encryptionInProgress = null;
			encrypt_update();
		}, 500 );
	}

	function submitData()
	{
		if( $( '#new_text' ).val() == '' )
		{
			return false; // don't submit if blank form
		}

		var key = $( '#new_key' ).val();
		var cipher = $( '#new_cipher' ).val();

		/* update encrypted text now if either update is pending or no result available */
		if( encryptionInProgress != null || $( '#new_result' ).val() == '' )
		{
			encrypt_update();
		}

		$( '#en' ).unbind( 'mouseenter mouseleave' );
		$( '#new_result' ).show();
		$( '#new_encrypttime' ).show();

		var data = $( '#new_result' ).val();
		var password = '';
		if( $( '#new_usepassword' ).is( ':checked' ) )
		{
			// if password is used, let's sha the password before we send it over
			password = window.ezcrypt_backend.sha( $( '#new_typepassword' ).val() );
		}

		var ttl = $( '#new_ttl' ).val();
		var syntax = $( '#new_syntax' ).val();
		// if syntax is empty, try hidden element incase of clone feature
		if( typeof( syntax ) == 'undefined' ) { syntax = $( '#syntax' ).val(); }

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
	}


	if( document.getElementById( 'content' ) )
	{
		// load up our editor
		window.editor = editor = CodeMirror.fromTextArea( document.getElementById( 'content' ), {
			lineNumbers: true,
			matchBrackets: false,
			lineWrapping: false,
			readOnly: true,
			onChange: onCodeChange
		} );
		
		editor.setOption( 'mode', $( '#new_syntax' ).val() );
		editor.focus();
	}

	/* wait until we have a key (may have to wait for some entropy from user inputs) */
	window.ezcrypt_backend.randomKey(function (key) {
		$( '#new_key' ).val( key );
		var en = $('#en');
		en.bind( 'click', submitData );
		en.removeAttr( 'disabled' );
		en.val( 'Submit' );

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

	$( '#new_usepassword' ).change( function() { if( this.checked ) { $( '#new_typepassword' ).show(); } else { $( '#new_typepassword' ).hide(); } } );


	if ($( '#askpassword').length) {
		/* want to show a paste */
		$( '#submitpassword' ).bind( 'click', requestData );
		$( '#submitkey' ).bind( 'click', function() {
			window.location = window.location + '#' + $( '#typekey' ).val();
			decrypt_update();
		});
		$( '#typepassword,#typekey' ).live( 'keydown', function( e ) { if( e.keyCode == 13 ) { $( this ).parent().find( 'input[type=button]' ).click(); } } );

		$( '#new' ).bind( 'click', function() { $( '#new_text' ).html( '' ); $( '#new_result' ).val( '' ); $( '#newpaste' ).slideDown(); } );
		$( '#clone' ).bind( 'click', function() { $( '#new_text' ).html( editor.getValue() ).trigger( 'textchange' ); $( '#newpaste' ).slideDown(); } );

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

		/* start first try to decrypt it and show dialogs that may be needed */
		decrypt_update();
	}

	window.ezcrypt = {
		sha: window.ezcrypt_backend.sha,
		encrypt: window.ezcrypt_backend.encrypt,
		decrypt: window.ezcrypt_backend.decrypt,
		editor: editor
	}
} );
