<?php
	require_once __DIR__ . '/functions.inc.php';
	require_once __DIR__ . '/db.inc.php';

	$__config = [
		'domain' => $_SERVER['SERVER_NAME'],
		'ip' => $_SERVER['SERVER_ADDR'],

		'database' => [
			'host' => 'localhost',
			'username' => 'username',
			'password' => 'password',
			'db' => 'ncrypt',
		],

		'paste' => [
			'secret' => '', // set this if you want unidentifiable alphaIds (not really secure)
			'attachments' => [
				'max_size' => ( 2 * 1024 * 1024 ), // 2MB largest file size (not used yet)
			],
		],

		'site' => [
			'url' => '/',
			'name' => 'NCrypt',
			'version' => 'v0.7.40',
			'source' => 'https://github.com/luggs-co/ncrypt',
			'contact' => 'mailto:contact@ncry.pt',
			'attachments' => [
				'enabled' => true,
			],
		],

		//'scripturl' => 'https://ncry.pt',
		'scripturl' => ( isset( $_SERVER['HTTPS'] ) ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'],
	];

	$year = gmdate('Y');

	$__config['site']['footer'] = <<<EOD
		$year ncry.pt
		<span class="small">&nbsp;&diams;&nbsp;</span>
		<a href="{$__config['site']['contact']}">Contact</a>
EOD;

	$__config['mime-types'] = [
		'Common Formats',
			[ 'text/plain'				, 'Plain Text' ],
			[ 'application/x-aspx'		, 'ASP.NET' ],
			[ 'text/x-bash'				, 'Bash' ],
			[ 'text/x-csrc'				, 'C' ],
			[ 'text/x-c++src'			, 'C++' ],
			[ 'text/x-csharp'			, 'C#' ],
			[ 'text/x-java'				, 'Java' ],
			[ 'text/css'				, 'CSS' ],
			[ 'htmlmixed'				, 'HTML mixed-mode' ],
			[ 'text/javascript'			, 'JavaScript' ],
			[ 'text/x-perl'				, 'Perl' ],
			[ 'application/x-httpd-php'	, 'PHP' ],
			[ 'text/x-python'			, 'Python' ],
			[ 'text/x-ruby'				, 'Ruby' ],
			[ 'text/x-plsql'			, 'SQL' ],
			[ 'application/xml'			, 'XML' ],
		'Other Formats',
			[ 'text/x-clojure'			, 'Clojure' ],
			[ 'text/x-coffeescript'		, 'CoffeeScript' ],
			[ 'text/x-diff'				, 'diff' ],
			[ 'text/x-eiffel'			, 'Eiffel' ],
			[ 'text/x-groovy'			, 'Groovy' ],
			[ 'text/x-haskell'			, 'Haskell' ],
			[ 'text/html'				, 'HTML embedded scripts' ],
			[ 'application/x-jsp'		, 'JavaServer Pages' ],
			[ 'application/json'		, 'JSON' ],
			[ 'jinja2'					, 'Jinja2' ],
			[ 'text/less'				, 'LESS' ],
			[ 'text/x-lua'				, 'Lua' ],
			[ 'text/x-markdown'			, 'Markdown' ],
			[ 'text/n-triples'			, 'NTriples' ],
			[ 'text/x-pascal'			, 'Pascal' ],
			[ 'text/x-rsc'				, 'R' ],
			[ 'text/x-rst'				, 'reStructuredText' ],
			[ 'text/x-rust'				, 'Rust' ],
			[ 'text/x-scheme'			, 'Scheme' ],
			[ 'text/x-stsrc'			, 'Smalltalk' ],
			[ 'application/sparql'		, 'SPARQL' ],
			[ 'text/x-stex'				, 'sTeX, LaTeX' ],
			[ 'text/x-tiddlywiki'		, 'Tiddlywiki' ],
			[ 'text/velocity'			, 'Velocity' ],
			[ 'text/x-verilog'			, 'Verilog' ],
			[ 'text/x-yaml'				, 'YAML' ],
	];

	$__config['code-themes'] = [
		"default",
		"3024-day",
		"3024-night",
		"ambiance",
		"base16-dark",
		"base16-light",
		"blackboard",
		"cobalt",
		"colorforth",
		"eclipse",
		"elegant",
		"erlang-dark",
		"lesser-dark",
		"liquibyte",
		"mbo",
		"mdn-like",
		"midnight",
		"monokai",
		"neat",
		"neo",
		"night",
		"paraiso-dark",
		"paraiso-light",
		"pastel-on-dark",
		"rubyblue",
		"solarized dark",
		"solarized light",
		"the-matrix",
		"tomorrow-night-bright",
		"tomorrow-night-eighties",
		"ttcn",
		"twilight",
		"vibrant-ink",
		"xq-dark",
		"xq-light",
		"zenburn",
	];

	$__config['bitcoin-addresses'] = [
		'1NCrypt1VFFWxa2ambbQqbeyaBfcjKQQKc',
		'1NCrypts6Jr31whfqEyhX9ChGGDfocv9mi',
		'1NCryptQxNy3M4ywT34DR3vvLw1YKwXzWT',
		'1NCryptq6jW9fAekLv1Dz8zKKd2K5S89S1',
		'1NCryptMEHo3bpXjC8sY211Meiw4j5CLs8',
		'1NCryptE8uh44NnYTErxPsE7mndt2Qt4Uu',
		'1NCryptE3MRaZsPU2ataHoQRknWQK6Ee9E',
		'1NCryptHxe6kikartjSvrU3DSxsb5AFXgX',
		'1NCryptPDkey2BRfuU72BmbAR7WysaKuSW',
		'1NCryptEqjsCrBcV77VuAhL8zj43Pvxogk',
		'1NCryptNq4dKQmgU1RUqBhvVy7NtXgbY4v',
		'1NCryptMjfzc7CmMe219NuAy5gw4C2n6mN',
		'1NCryptTtRXmrWh6qWC9ho8q4p7EXcaz8Q',
		'1NCrypt5zbxwBmyyvMrVZr4x4n2NBBPNr8',
	];

	if( file_exists( __DIR__ . '/config-local.inc.php' ) )
	{
		require_once __DIR__ . '/config-local.inc.php';
	}

	function get_config() { global $__config; return $__config; }