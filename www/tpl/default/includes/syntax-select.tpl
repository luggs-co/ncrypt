			Formatting:
				<select name="new_syntax" id="new_syntax">
<?php
	function mime_types($syntax) {
		$matched = false;

		$config = get_config();
		foreach ($config['mime-types'] as $mt) {
			$sel = '';
			if (is_array($mt)) {
				if (!$matched && $mt[0] == $syntax) {
					$matched = true;
					$sel = ' selected';
				}
				echo '					<option value="'.$mt[0].'"'.$sel.'>&nbsp;&nbsp;'.$mt[1].'</option>'."\n";
			} else {
				echo '					<option disabled="disabled" class="header">- '.$mt.' -</option>'."\n";
			}
		}
		if (!$matched) {
			echo '					<option disabled="disabled" class="header unknown">- Unknown format -</option>'."\n";
			echo '					<option value="'.htmlentities($syntax).'" selected>&nbsp;&nbsp;'.htmlentities($syntax).'</option>'."\n";
		}
	}

	mime_types(isset($syntax) ? $syntax : 'text/plain');
?>
				</select>
