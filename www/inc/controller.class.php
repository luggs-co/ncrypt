<?php

	require_once dirname( __FILE__ ) . '/config.inc.php';
	require_once dirname( __FILE__ ) . '/templates.class.php';

	class Controller
	{
		var $template;

		function __construct()
		{
			$this->template = new Template();
			$this->template->assign( 'meta_title', 'EZCrypt' );

			if( isset( $_GET['raw'] ) )
			{
				$this->template->format( 'raw' );
			}
			elseif( 'POST' == $_SERVER['REQUEST_METHOD'] || isset( $_GET['json'] ) )
			{
				$this->template->format( 'json' );
			}

			// detect what device is viewing the page
			// require_once dirname( __FILE__ ) . '/mobile.class.php';
			// $detect = new Mobile();

			//if( $detect->isMobile() )
			//	$template->theme( 'mobile' );
			//elseif( $detect->isTablet() )
			//	$template->theme( 'tablet' );
		}

		function show( $id, $password )
		{
			$template = $this->template;

			// This may be required if a user is dealing with a file that is so large that is takes more than 30 seconds
			set_time_limit( 0 );

			require_once dirname( __FILE__ ) . '/paste.class.php';

			$pastes = new Paste();

			$paste = $pastes->get( $id );

			// detect if any errors came through
			switch( $paste )
			{
			case EZCRYPT_DOES_NOT_EXIST:
			case EZCRYPT_HAS_EXPIRED:
			case EZCRYPT_MISSING_DATA:
				$template->assign( 'meta_title', 'EZCrypt - Paste does not exist' );
				$template->render( 404, 'nonexistant.tpl' );
				return;
				break;
			}

			// validate paste, check if password has been set
			$validated = $pastes->validate_password( $paste, $password );

			switch( $validated )
			{
			case EZCRYPT_PASSWORD_FAILED:
				// incorrect, give the json response an error
			case EZCRYPT_PASSWORD_REQUIRED:
				// prompt user for password

				$template->assign( 'meta_title', 'EZCrypt - Paste requires password' );
				$template->render( 403, 'paste.tpl' );
				break;

			case EZCRYPT_PASSWORD_SUCCESS:
				// correct, send user the required data
			case EZCRYPT_NO_PASSWORD:
				// no password, show paste

				if ( 'html' !== $template->format() ) {
					$output = $pastes->read( $paste );
				} else {
					// read paste via javascript to make basic page loading faster
					$output = array();
				}

				$template->assign( 'meta_title', 'EZCrypt - Paste' );
				$template->render( 200, 'paste.tpl', $output );
				break;

			default:
				throw new Exception( 'Internal error' );
				break;
			}
		}

		function index()
		{
			$template = $this->template;

			require_once dirname( __FILE__ ) . '/paste.class.php';

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

			require_once dirname( __FILE__ ) . '/paste.class.php';

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
			$template = $this->template;
			$template->assign( 'meta_title', 'EZCrypt - About' );

			// About Page
			$template->render( 200, 'about.tpl' );
		}

		function ezcrypt_script()
		{
			header( 'Content-Type: text/plain; charset=utf-8' );
			header( 'Content-Disposition: inline; filename=ezcrypt' );

			$conf = get_config();

			$default_url = 'https://ezcrypt.it'; // the url used in the script file
			echo str_replace( $default_url, $conf['scripturl'], file_get_contents( dirname( __FILE__ ) . '/ezcrypt.rb' ) );
		}
	}
