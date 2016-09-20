<?php

	function db_backend_connection()
	{
		$conf = get_config();

		// connect to database
		$db = new mysqli( $conf['database']['host'], $conf['database']['username'], $conf['database']['password'], $conf['database']['db'] );

		if( mysqli_connect_error() )
		{
			die( 'Unable to connect to db node server' );
		}

		$db->query( 'SET NAMES utf8mb4;' );

		return $db;
	}

	function db_backend_prune($db)
	{
		// delete all pastes from database that have expired
		$sql = '
			DELETE FROM
				pastes
			WHERE
				ttl != -1 AND
				( UNIX_TIMESTAMP() - added ) > ttl
			';

		$stmt = $db->prepare($sql);
		$stmt->execute();

		return $db->affected_rows;
	}

	function db_backend_get($db, $id)
	{
		// grab paste from database
		$sql = '
			SELECT
				`id`, `added`, `ttl`, `password`, ( UNIX_TIMESTAMP() - added ) as age
			FROM
				pastes
			WHERE
				id = ?
			LIMIT
				1
			';

		$stmt = $db->prepare($sql);
		$stmt->bind_param('i', $id);
		$stmt->execute();

		$res = $stmt->get_result();

		return $res->fetch_array(MYSQLI_ASSOC);
	}

	function db_backend_read($db, $id)
	{
		// grab paste from database
		$sql = '
			SELECT
				`data`, `syntax`, `ttl`, `crypto`
			FROM
				pastes
			WHERE
				id = ?
			LIMIT
				1
			';

		$stmt = $db->prepare($sql);
		$stmt->bind_param('i', $id);
		$stmt->execute();

		$res = $stmt->get_result();

		return $res->fetch_array(MYSQLI_ASSOC);
	}

	function db_backend_add($db, $data, $syntax, $ttl, $password, $cipher)
	{
		$sql = '
			INSERT INTO
				pastes
			( `data`, `syntax`, `added`, `ttl`, `password`, `crypto` )
			VALUES
				( ?,  ?, UNIX_TIMESTAMP(), ?, ?, ? )
		';

		$stmt = $db->prepare($sql);
		$stmt->bind_param('ssiss', $data, $syntax, $ttl, $password, $cipher);
		$stmt->execute();
		$stmt->close();

		return $db->insert_id;
	}

	function db_backend_delete($db, $id)
	{
		$sql = '
			DELETE FROM
				pastes
			WHERE
				id = ?
		';

		$stmt = $db->prepare($sql);
		$stmt->bind_param( 'i', $id );
		$stmt->execute();
	}
