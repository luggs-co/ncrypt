<?php

	$__db = null;

	function db_connection()
	{
		global $__db;

		if( $__db !== null ) return $__db;

		$conf = get_config();

		if (empty($conf['database']['type']) || 'mysql' == $conf['database']['type'])
		{
			require_once __DIR__ . '/db-mysql.inc.php';
		}
		else if ('pgsql' == $conf['database']['type'])
		{
			require_once __DIR__ . '/db-pgsql.inc.php';
		}

		$__db = db_backend_connection();

		return $__db;
	}

	function db_prune()
	{
		$db = db_connection();

		return db_backend_prune( $db );
	}

	// returns assoc array (id,added,ttl,password) with additional entry age => time() - added
	// doesn't need to include data,syntax,crypto
	function db_get($id)
	{
		$db = db_connection();

		return db_backend_get($db, (int) $id);
	}

	// returns actual data: data,syntax,crypto and ttl
	function db_read($id)
	{
		$db = db_connection();

		return db_backend_read($db, (int) $id);
	}

	function db_add($data, $syntax, $ttl, $password, $cipher)
	{
		$db = db_connection();

		return db_backend_add($db, $data, $syntax, $ttl, $password, $cipher);
	}

	function db_delete($id)
	{
		$db = db_connection();

		return db_backend_delete($db, intval($id));
	}
