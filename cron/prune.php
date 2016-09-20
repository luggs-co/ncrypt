<?php

	require_once __DIR__ . '/../www/inc/config.inc.php';

	// cron setup
	// every hour should be sufficient, you are welcome to change how frequent

	// @hourly	/usr/bin/php5 -q /path/to/ncrypt/cron/prune.php
	// 0 * * * *	/usr/bin/php5 -q /path/to/ncrypt/cron/prune.php


	// delete all pastes that has expired
	$removed = db_prune();

	printf( "Expired pastes removed: %d\n", $removed );