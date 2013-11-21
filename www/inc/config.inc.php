<?php

	require_once dirname( __FILE__ ) . '/functions.inc.php';
	require_once dirname( __FILE__ ) . '/db.inc.php';

	$__config = array( 
		'domain' => $_SERVER['SERVER_NAME'],
		'ip' => $_SERVER['SERVER_ADDR'],
	
		'database' => array(
			'host' => 'localhost',
			'username' => 'username',
			'password' => 'password',
			'db' => 'ezcrypt',
		),
		
		'paste' => array(
			'secret' => '', // set this if you want unidentifiable alphaIds (not really secure)
		),

		'site' => array(
			'url' => '/',
			'source' => 'https://github.com/novaking/ezcrypt',
			'contact' => 'mailto:contact@ezcrypt.it',
		),

		'scripturl' => 'https://ezcrypt.it',
		// 'scripturl' => ( isset( $_SERVER['HTTPS'] ) ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'],
	);
	$year = gmdate('Y');
	$__config['site']['footer'] = <<<EOD
		$year EZCrypt.it
		<span class="small">&nbsp;&diams;&nbsp;</span>
		<a href="mailto:contact@ezcrypt.it">Contact</a>
EOD;

	$__config['mime-types'] = array(
		"Common Formats",
			array("text/plain"              , "Plain Text"),
			array("application/x-aspx"      , "ASP.NET"),
			array("text/x-bash"             , "Bash"),
			array("text/x-csrc"             , "C"),
			array("text/x-c++src"           , "C++"),
			array("text/x-csharp"           , "C#"),
			array("text/x-java"             , "Java"),
			array("text/css"                , "CSS"),
			array("htmlmixed"               , "HTML mixed-mode"),
			array("text/javascript"         , "JavaScript"),
			array("text/x-perl"             , "Perl"),
			array("application/x-httpd-php" , "PHP"),
			array("text/x-python"           , "Python"),
			array("text/x-ruby"             , "Ruby"),
			array("text/x-plsql"            , "SQL"),
			array("application/xml"         , "XML"),
		"Other Formats",
			array("text/x-clojure"          , "Clojure"),
			array("text/x-coffeescript"     , "CoffeeScript"),
			array("text/x-diff"             , "diff"),
			array("text/x-groovy"           , "Groovy"),
			array("text/x-haskell"          , "Haskell"),
			array("text/html"               , "HTML embedded scripts"),
			array("application/x-jsp"       , "JavaServer Pages"),
			array("application/json"        , "JSON"),
			array("jinja2"                  , "Jinja2"),
			array("text/less"               , "LESS"),
			array("text/x-lua"              , "Lua"),
			array("text/x-markdown"         , "Markdown"),
			array("text/n-triples"          , "NTriples"),
			array("text/x-pascal"           , "Pascal"),
			array("text/x-rsc"              , "R"),
			array("text/x-rst"              , "reStructuredText"),
			array("text/x-rust"             , "Rust"),
			array("text/x-scheme"           , "Scheme"),
			array("text/x-stsrc"            , "Smalltalk"),
			array("application/sparql"      , "SPARQL"),
			array("text/x-stex"             , "sTeX, LaTeX"),
			array("text/x-tiddlywiki"       , "Tiddlywiki"),
			array("text/velocity"           , "Velocity"),
			array("text/x-verilog"          , "Verilog"),
			array("text/x-yaml"             , "YAML"),
	);

	if (file_exists(dirname( __FILE__ ) . '/config-local.inc.php'))
	{
		require_once dirname( __FILE__ ) . '/config-local.inc.php';
	}

	function get_config() { global $__config; return $__config; }
