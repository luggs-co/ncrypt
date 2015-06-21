<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<title><?=$meta_title?></title>
		<base href="<?=$site_url?>" />
		<meta name="description" content="<?=$site_name;?> - The original safer way to encrypt your pastes online!" />
		<meta name="keywords" content="ncrypt, ezcrypt, encryption, pastebin, paste, secure, aes, crypto" />
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<?if( !isset($norobots) || $norobots !== false ) {?><meta name="robots" content="noarchive" />
		<meta name="googlebot" content="nosnippet" />
		<meta name="googlebot" content="noarchive" />
		<?}?><meta http-equiv="cache-control" content="no-cache" />
		<meta http-equiv="pragma" content="no-cache" />
		<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<?php $this->incl('includes/css.tpl'); ?>
		<link rel="shortcut icon" href="favicon.ico" />
		<?php $this->incl('includes/javascripts.tpl'); ?>
	</head>
	<body>
		<div id="holder">
			<div id="header" class="gradient">
				<?=$site_name;?> <span class="small">v0.736</span>
				<div style="position: absolute; right: 0px; top: 10px;"><a href="bitcoin:<?=$bitcoin_address;?>"><img src="img/bitcoin-button.png" alt="Donate to NCrypt" title="Donate to NCrypt" border="0" width="89" height="20" /></a></div>
			</div>
			<nav>
				<a href="<?=$site_url?>">Home</a>
				<a href="<?=$site_url?>about">About</a>
				<a href="<?=$site_contact?>">Contact</a>
			</nav>
			<div id="main">
