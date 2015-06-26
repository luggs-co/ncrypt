<?php

	define( 'NCRYPT_MISSING_DATA', -1 );
	define( 'NCRYPT_DOES_NOT_EXIST', 1 );
	define( 'NCRYPT_HAS_EXPIRED', 2 );

	define( 'NCRYPT_NO_PASSWORD', 10 );
	define( 'NCRYPT_PASSWORD_SUCCESS', 11 );
	define( 'NCRYPT_PASSWORD_FAILED', 12 );
	define( 'NCRYPT_PASSWORD_REQUIRED', 13 );

	/**
	 * Basic PHP based paste system
	 *
	 * Allows getting and adding of pastes.
	 * Can check to see if a paste has expired, and prunes accordingly.
	 * Validates against password if one exists
	 *
	 * @author NovaKing
	 * @version 0.4
	 **/
	class Paste
	{
		private $id;

		function get( $id )
		{
			$id = alphaID( $id, true );

			if (false !== ( $paste = db_get( $id ) ))
			{
				// check to see if this paste has expired
				$expired = $this->has_expired( $paste );
				if( $expired === false ) return $paste;

				return $expired;
			}

			return NCRYPT_DOES_NOT_EXIST;
		}

		function read( $paste_meta )
		{
			if (false !== ( $paste = db_read( $paste_meta['id'] ) ))
			{
				switch ($paste['crypto']) {
					case 'PIDCRYPT':
						$cipher = 'AES-128-CBC';
						break;
					case 'CRYPTO_JS':
						$cipher = 'AES-256-OFB';
						break;
					default:
						$cipher = $paste['crypto'];
				}

				if ( -100 == $paste['ttl'] )
				{
					// one-time only paste, delete it now
					db_delete( $paste_meta['id'] );
				}

				return array(
					'data' => $paste['data'],
					'syntax' => $paste['syntax'],
					'cipher' => $cipher,
				);
			}
		}

		function add( $data, $syntax, $ttl, $password, $cipher )
		{
			if( !empty( $password ) )
			{
				// create a salt that ensures crypt creates an md5 hash
				$base64_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
				$salt = '$5$';
				for( $i = 0; $i < 16; $i++ ) $salt .= $base64_alphabet[rand( 0, 63 )];
				$salt .= '$';
				$password = crypt( $password, $salt );
			}

			// submit new paste to server
			return db_add( $data, $syntax, $ttl, $password, $cipher );
		}

		function validate_password( $paste, $password )
		{
			// if we haven't gotten a paste yet.
			if( empty( $paste ) ) return NCRYPT_MISSING_DATA;

			if( !empty( $paste['password'] ) )
			{
				if (empty($password))
				{
					// prompt user for password
					return NCRYPT_PASSWORD_REQUIRED;
				}

				if( strlen( $paste['password'] ) == 40 && '$' != $paste['password'][0] )
				{
					// old style, salted with id
					$password = sha1( $paste['id'] . $password );
				}
				else
				{
					// crypted
					$password = crypt( $password, $paste['password'] );
				}

				if( 0 == strcmp( $password, $paste['password'] ) )
				{
					// correct, send user the required data
					return NCRYPT_PASSWORD_SUCCESS;
				}

				// incorrect, give the json response an error
				return NCRYPT_PASSWORD_FAILED;
			}

			return NCRYPT_NO_PASSWORD;
		}

		function has_expired( $paste )
		{
			// if we haven't gotten a paste yet.
			if( empty( $paste ) ) return NCRYPT_MISSING_DATA;

			// determine if the paste has expired.
			// if ttl is set to -1 that means it a perm paste
			// if ttl is set to -100 that means this is a one-time only paste
			// otherwise test to see if the ttl duration has been met
			if ( -100 == $paste['ttl'] )
			{
				// one-time only paste, delete on read (not now)
				return false;
			}
			else if( $paste['ttl'] != -1 && $paste['age'] > $paste['ttl'] )
			{
				// this paste is flagged as expired, time to clean up
				db_delete( $paste['id'] );
				return NCRYPT_HAS_EXPIRED;
			}

			return false;
		}
	}