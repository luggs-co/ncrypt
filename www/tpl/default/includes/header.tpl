<!DOCTYPE html>
<html lang="en">
	<head>
		<title><?=$meta_title?></title>
		<base href="<?=htmlentities( $site_url );?>" />
		<meta name="description" content="<?=htmlentities( $site_name );?> - The original safer way to encrypt your pastes online!" />
		<meta name="keywords" content="ncrypt, ezcrypt, encryption, pastebin, paste, secure, aes, crypto" />
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<?php if( !isset($norobots) || $norobots !== false ) { ?><meta name="robots" content="noarchive" />
		<meta name="googlebot" content="nosnippet" />
		<meta name="googlebot" content="noarchive" />
		<?php } ?><meta http-equiv="cache-control" content="no-cache" />
		<meta http-equiv="pragma" content="no-cache" />
		<?php $this->incl('includes/css.tpl'); ?>
		<link rel="shortcut icon" href="favicon.ico" />

		<!--[if gte IE 9]>
		<style type="text/css">
			.gradient { filter: none !important; }
		</style>
		<![endif]-->

		<?php $this->incl('includes/javascripts.tpl'); ?>
	</head>
	<body>
		<div id="overlay">
			<div id="popup">
				<a href="#" class="close"></a>
				<div class="success">Paste created successfully!</div>
				<div style="height: 10px;"></div>
				<input type="text" readonly="readonly" value="" id="burn-url" class="url" onclick="$( this ).select();" onfocus="$( this ).select();" />
				<div style="height: 5px;"></div>
				Please note that the above URL can only be used once, as it will be deleted after being displayed.
			</div>
			<div id="upload-paste">
				<progress id="upload-progress" max="100" value="0"></progress>
				<div id="upload-stats"></div>
			</div>
		</div>
		<div id="holder">
			<div id="header" class="gradient">
				<a href="<?=$site_url?>"><?=htmlentities( $site_name );?></a> <span class="small"><?=htmlentities( $site_version );?></span> - Giving you the power to encrypt your information
			</div>
			<div id="menu">
				<a href="<?=$site_url?>">Home</a>
				<span class="small">&nbsp;</span>
				<a href="<?=$site_url?>about">About</a>
				<span class="small">&nbsp;</span>
				<a href="<?=$site_contact?>">Contact</a>
				<span class="small">&nbsp;</span>
				<a href="<?=$site_url?>ncrypt">Ruby CLI script</a>
				<span class="small">&nbsp;</span>
				<a href="<?=$site_source?>" target="_blank">Sourcecode</a>
				<span class="small">&nbsp;</span>
				<div style="position: absolute; right: 0px; top: 10px;"><a href="bitcoin:<?=$bitcoin_address;?>"><img src="img/bitcoin-button.png" alt="Donate to NCrypt" title="Donate to <?=htmlentities( $site_name );?>" border="0" width="89" height="20" /></a></div>
			</div>
			<div id="main">
