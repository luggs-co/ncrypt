<?php

	require_once __DIR__ . '/config.inc.php';
	require_once __DIR__ . '/templates.class.php';

	class Controller
	{
		var $template;

		function __construct()
		{
			$conf = get_config();
			$this->template = new Template();
			$this->template->assign( 'meta_title', $conf['site']['name'] );
			$this->template->assign( 'bitcoin_address', $conf['bitcoin-addresses'][mt_rand( 0, count( $conf['bitcoin-addresses'] ) - 1 )] );

			if( isset( $_GET['raw'] ) )
			{
				$this->template->format( 'raw' );
			}
			elseif( 'POST' == $_SERVER['REQUEST_METHOD'] || isset( $_GET['json'] ) )
			{
				$this->template->format( 'json' );
			}

			// detect what device is viewing the page
			// require_once __DIR__ . '/mobile.class.php';
			// $detect = new Mobile();

			//if( $detect->isMobile() )
			//	$template->theme( 'mobile' );
			//elseif( $detect->isTablet() )
			//	$template->theme( 'tablet' );
		}

		function show( $id, $password )
		{
			$conf = get_config();
			$template = $this->template;
			if( !empty( $_COOKIE['theme'] ) ) $template->assign( 'theme', $_COOKIE['theme'] );
			//print_r( $_COOKIE );

			// This may be required if a user is dealing with a file that is so large that is takes more than 30 seconds
			set_time_limit( 0 );

			require_once __DIR__ . '/paste.class.php';

			$pastes = new Paste();

			$paste = $pastes->get( $id );

			// detect if any errors came through
			switch( $paste )
			{
				case NCRYPT_DOES_NOT_EXIST:
				case NCRYPT_HAS_EXPIRED:
				case NCRYPT_MISSING_DATA:
					$template->assign( 'meta_title', $conf['site']['name'] . ' - Paste does not exist' );
					$template->render( 404, 'nonexistant.tpl' );
					return;
			}

			// validate paste, check if password has been set
			$validated = $pastes->validate_password( $paste, $password );

			switch( $validated )
			{
				case NCRYPT_PASSWORD_FAILED:
					// incorrect, give the json response an error
				case NCRYPT_PASSWORD_REQUIRED:
					// prompt user for password

					$template->assign( 'meta_title', $conf['site']['name'] . ' - Paste requires password' );
					$template->render( 403, 'paste.tpl' );
					break;

				case NCRYPT_PASSWORD_SUCCESS:
					// correct, send user the required data
				case NCRYPT_NO_PASSWORD:
					// no password, show paste

					if ( 'html' !== $template->format() ) {
						$output = $pastes->read( $paste );
					} else {
						// read paste via javascript to make basic page loading faster
						$output = array();
					}

					$template->assign( 'meta_title', $conf['site']['name'] . ' - Paste' );
					$template->render( 200, 'paste.tpl', $output );
					break;

				default:
					throw new Exception( 'Internal error' );
			}
		}

		function index()
		{
			$template = $this->template;

			require_once __DIR__ . '/paste.class.php';

			// new paste
			$template->assign( 'norobots', false );
			$template->render( 200, 'index.tpl' );
		}

		/* only works with JSON format */
		function post( $data, $syntax, $ttl, $password, $cipher )
		{
			$template = $this->template;

			// This may be required if a user is dealing with a file that is so large that it takes more than 30 seconds
			set_time_limit( 0 );

			require_once __DIR__ . '/paste.class.php';

			$pastes = new Paste();

			// new post submission
			$paste = $pastes->add( $data, $syntax, $ttl, $password, $cipher );

			// return our new ID to the user
			$output = array(
				'id' => alphaID( $paste, false ),
			);

			$template->render( 200, null, $output );
		}

		function about()
		{
			$conf = get_config();
			$template = $this->template;
			$template->assign( 'meta_title', $conf['site']['name'] . ' - About' );

			// About Page
			$template->render( 200, 'about.tpl' );
		}

		function ncrypt_script()
		{
			header( 'Content-Type: text/plain; charset=utf-8' );
			header( 'Content-Disposition: inline; filename=ncrypt' );

			$conf = get_config();

			$default_url = 'https://ncry.pt'; // the url used in the script file
			echo str_replace( $default_url, $conf['scripturl'], file_get_contents( __DIR__ . '/ncrypt.rb' ) );
		}
	}
