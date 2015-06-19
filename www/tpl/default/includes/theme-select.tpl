<select id="theme-select">
						<?php
							function theme_types($theme) {
								$matched = false;

								$config = get_config();
								foreach ($config['code-themes'] as $mt) {
									$sel = '';
									if (!$matched && $mt == $theme) {
										$matched = true;
										$sel = ' selected';
									}
									echo '<option'.$sel.'>'.$mt.'</option>';
								}
								
								if (!$matched) {
									echo '<option disabled="disabled" class="header unknown">- Unknown format -</option>';
									echo '<option selected>&nbsp;&nbsp;'.htmlentities($theme).'</option>';
								}
							}

							theme_types(isset($theme) ? $theme : 'base16-dark');
						?>

					</select>
